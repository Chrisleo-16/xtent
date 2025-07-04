
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useTenantInvitations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Create invitation
  const createInvitation = useMutation({
    mutationFn: async ({ 
      propertyId, 
      email, 
      phone, 
      message 
    }: { 
      propertyId: string; 
      email: string; 
      phone?: string; 
      message?: string; 
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      // Generate a unique token for the invitation
      const token = crypto.randomUUID();

      const { data, error } = await supabase
        .from('tenant_invitations')
        .insert({
          property_id: propertyId,
          landlord_id: user.id,
          email,
          expires_at: expiresAt.toISOString(),
          status: 'pending',
          invitation_type: 'tenant',
          token
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-invitations'] });
      toast.success(`Invitation sent to ${data.email}`);
    },
    onError: (error) => {
      toast.error(`Failed to send invitation: ${error.message}`);
    }
  });

  // Get invitation by token
  const getInvitationByToken = async (token: string) => {
    const { data, error } = await supabase
      .from('tenant_invitations')
      .select(`
        *,
        properties(id, title, address, monthly_rent, bedrooms, bathrooms)
      `)
      .eq('token', token)
      .single();

    if (error) throw error;
    return data;
  };

  // Redeem invitation
  const redeemInvitation = useMutation({
    mutationFn: async ({ token, userId }: { token: string; userId: string }) => {
      const { data, error } = await supabase
        .from('tenant_invitations')
        .update({ 
          status: 'accepted',
          accepted_by_user_id: userId,
          accepted_at: new Date().toISOString()
        })
        .eq('token', token)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-invitations'] });
      toast.success('Invitation accepted! Application submitted.');
    }
  });

  return {
    createInvitation,
    getInvitationByToken,
    redeemInvitation
  };
};
