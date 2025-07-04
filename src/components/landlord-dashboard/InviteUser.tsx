import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'sonner';
import { Building, PlusCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CreativeActionButton } from '../ui/creative-action-button';
import { Button } from '@/components/ui/button';

const inviteSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  property_id: z.string().uuid({ message: 'Please select a property.' }),
  invitation_type: z.enum(['tenant', 'caretaker']),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const fetchProperties = async (landlordId: string) => {
  const { data, error } = await supabase
    .from('properties')
    .select('id, title')
    .eq('landlord_id', landlordId);
  if (error) throw new Error(error.message);
  return data;
};

const sendInvitation = async (
    { name, email, property_id, landlord_id, invitation_type }: InviteFormValues & { landlord_id: string }
) => {
  const token = crypto.randomUUID();
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now

  const { data, error } = await supabase
    .from('tenant_invitations')
    .insert([
      {
        name,
        email,
        property_id,
        landlord_id,
        token,
        expires_at,
        status: 'pending',
        invitation_type,
      },
    ])
    .select();

  if (error) {
    if (error.code === '23505') {
        throw new Error('A unique invitation could not be generated. Please try again.');
    }
    throw new Error(error.message);
  }
  
  // Note: Email sending is now handled in the mutation's onSuccess callback.
  console.log('Invitation created in DB:', data);
  
  return data;
};

const InviteUser = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: properties, isLoading: isLoadingProperties } = useQuery({
    queryKey: ['landlordProperties', user?.id],
    queryFn: () => fetchProperties(user!.id),
    enabled: !!user && open,
  });

  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      name: '',
      email: '',
      property_id: '',
      invitation_type: 'tenant',
    },
  });

  const mutation = useMutation({
      mutationFn: sendInvitation,
      onSuccess: async (data) => {
          toast.success('Invitation created in database!');
          
          if (!data || data.length === 0) {
            toast.error("Could not retrieve invitation details to send email.");
            return;
          }
          const invitation = data[0];
          const property = properties?.find(p => p.id === invitation.property_id);
          
          if (!property) {
              toast.error("Could not find property details to send email.");
              return;
          }

          const invitationLink = `${window.location.origin}/auth?invitationToken=${invitation.token}`;

          try {
            toast.info("Sending invitation email...");
            const { error: functionError } = await supabase.functions.invoke('send-invitation-email', {
              body: {
                tenantEmail: invitation.email,
                tenantName: invitation.name,
                propertyTitle: property.title,
                invitationLink: invitationLink,
              },
            });
    
            if (functionError) {
              throw functionError;
            }
    
            toast.success('Invitation email sent successfully!');
          } catch (error: any) {
            console.error('Failed to send invitation email:', error);
            
            let userFriendlyMessage = "There was a problem sending the invitation email.";

            try {
                // Supabase function errors (non-2xx responses) have a context object.
                if (error.context && typeof error.context.json === 'function') {
                    const errorBody = await error.context.json();
                    if (errorBody.error) {
                        const { name, message } = errorBody.error;
                        if (name === 'validation_error') {
                            userFriendlyMessage = "Could not send email. This may be due to an unverified sender email address. Please contact support or verify your domain with the email provider.";
                        } else {
                            userFriendlyMessage = `Email service error: ${message}`;
                        }
                    }
                } else if (error.message) {
                    userFriendlyMessage = error.message;
                }
            } catch (parseError) {
                console.error("Could not parse function error response:", parseError);
                if (error.message) {
                    userFriendlyMessage = error.message;
                }
            }

            toast.error(`Invitation saved, but failed to send email. ${userFriendlyMessage}`);
          }
          
          queryClient.invalidateQueries({ queryKey: ['tenantInvitations'] });
          setOpen(false);
          form.reset();
      },
      onError: (error) => {
          toast.error(`Failed to create invitation: ${error.message}`);
      }
  });

  const onSubmit = (values: z.infer<typeof inviteSchema>) => {
    if (!user) return;
    mutation.mutate({ 
        ...values,
        landlord_id: user.id 
    });
  };
  
  const hasProperties = !isLoadingProperties && properties && properties.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CreativeActionButton icon={PlusCircle} label="Invite User" variant="primary" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Send an invitation to a tenant or caretaker to join and manage their role.
          </DialogDescription>
        </DialogHeader>

        {!isLoadingProperties && !hasProperties && (
            <Alert>
                <Building className="h-4 w-4" />
                <AlertTitle>First, Add a Property</AlertTitle>
                <AlertDescription>
                    You need to create a property before you can invite tenants.
                    <Link to="/landlord/add-property" onClick={() => setOpen(false)} className="font-bold text-green-600 hover:underline ml-1">
                        Create a new property.
                    </Link>
                </AlertDescription>
            </Alert>
        )}

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>User Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} disabled={!hasProperties} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>User Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="user@example.com" {...field} disabled={!hasProperties} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="property_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Property</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!hasProperties}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a property to assign" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {properties?.map((property: Pick<Tables<'properties'>, 'id' | 'title'>) => (
                                        <SelectItem key={property.id} value={property.id}>
                                            {property.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="invitation_type"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel>Invite as</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex items-center space-x-4"
                                    disabled={!hasProperties}
                                >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="tenant" id="r1" />
                                        </FormControl>
                                        <FormLabel htmlFor="r1" className="font-normal">
                                            Tenant
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="caretaker" id="r2" />
                                        </FormControl>
                                        <FormLabel htmlFor="r2" className="font-normal">
                                            Caretaker
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <Button type="submit" disabled={mutation.isPending || !hasProperties} className="w-full bg-green-600 hover:bg-green-700">
                    {mutation.isPending ? 'Sending...' : 'Send Invitation'}
                </Button>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUser;
