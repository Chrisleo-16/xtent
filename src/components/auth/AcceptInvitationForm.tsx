
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type InvitationDetails = {
  invitation: Tables<'tenant_invitations'>;
  property: Tables<'properties'>;
};

const fetchInvitationDetails = async (token: string): Promise<InvitationDetails> => {
  const { data: invitationData, error: invitationError } = await supabase
    .from('tenant_invitations')
    .select('*')
    .eq('token', token)
    .single();

  if (invitationError || !invitationData) {
    throw new Error('Invitation not found.');
  }

  if (invitationData.status !== 'pending') {
    throw new Error('This invitation has already been used or expired.');
  }

  if (new Date(invitationData.expires_at) < new Date()) {
    throw new Error('This invitation has expired.');
  }

  const { data: propertyData, error: propertyError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', invitationData.property_id)
    .single();

  if (propertyError || !propertyData) {
    throw new Error('Could not load property details for this invitation.');
  }

  return { invitation: invitationData, property: propertyData };
};

const acceptInvitationSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const AcceptInvitationForm = ({ token }: { token: string }) => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ['invitationDetails', token],
    queryFn: () => fetchInvitationDetails(token),
    retry: false,
  });

  const form = useForm<z.infer<typeof acceptInvitationSchema>>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  useEffect(() => {
    if (data?.invitation.name) {
      form.setValue('name', data.invitation.name);
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof acceptInvitationSchema>) => {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('accept-invitation', {
        body: {
          token,
          name: values.name,
          password: values.password,
        },
      });

      if (functionError) throw functionError;
      if (functionData.error) throw new Error(functionData.error);

      return functionData;
    },
    onSuccess: (data) => {
      toast.success("Account created successfully!", {
        description: "Welcome to XTENT. You can now access your dashboard.",
      });

      // If we have a login URL, redirect there, otherwise go to tenant dashboard
      if (data.loginUrl) {
        window.location.href = data.loginUrl;
      } else {
        // Manual login might be needed
        toast.info("Please login with your credentials", {
          description: "Your account was created but you may need to login manually.",
        });
        navigate('/auth');
      }
    },
    onError: (err: Error) => {
      toast.error("Failed to accept invitation", {
        description: err.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof acceptInvitationSchema>) => {
    mutation.mutate(values);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="mt-4 text-gray-600">Loading Invitation...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Invitation Error</AlertTitle>
            <AlertDescription>
                {error.message} Please contact your landlord or <a href="/auth" className="underline font-bold">login/signup manually</a>.
            </AlertDescription>
        </Alert>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accept Invitation</CardTitle>
        <CardDescription>
          Create your XTENT account to manage your tenancy for <strong>{data.property.title}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
                <Label>Email</Label>
                <Input value={data.invitation.email} disabled />
            </div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account & Accept
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AcceptInvitationForm;
