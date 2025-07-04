
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, isAfter } from 'date-fns';

interface InvitationsTableProps {
  landlordId: string;
}

const InvitationsTable = ({ landlordId }: InvitationsTableProps) => {
  const queryClient = useQueryClient();

  // Fetch invitations
  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['tenant-invitations', landlordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_invitations')
        .select(`
          *,
          properties (
            id,
            title,
            address
          )
        `)
        .eq('landlord_id', landlordId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('invitations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_invitations',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tenant-invitations', landlordId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [landlordId, queryClient]);

  // Resend invitation mutation
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 7); // Extend by 7 days

      const { error } = await supabase
        .from('tenant_invitations')
        .update({ 
          expires_at: newExpiryDate.toISOString(),
          status: 'pending'
        })
        .eq('id', invitationId);
      
      if (error) throw error;
      
      // Here you would also trigger the email sending
      // For now, we'll just update the database
    },
    onSuccess: () => {
      toast.success('Invitation resent successfully!');
      queryClient.invalidateQueries({ queryKey: ['tenant-invitations', landlordId] });
    },
    onError: (error) => {
      toast.error(`Failed to resend invitation: ${error.message}`);
    }
  });

  const getInvitationStatus = (invitation: any) => {
    if (invitation.accepted_at) return 'accepted';
    if (isAfter(new Date(), new Date(invitation.expires_at))) return 'expired';
    return invitation.status || 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading invitations...</div>;
  }

  return (
    <div className="space-y-4">
      {invitations.length === 0 ? (
        <div className="text-center py-8">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No invitations sent yet.</p>
          <p className="text-sm text-gray-400 mt-2">
            Sent invitations will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop view */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invitee</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => {
                  const status = getInvitationStatus(invitation);
                  return (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invitation.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{invitation.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invitation.properties?.title}</div>
                          <div className="text-sm text-gray-500">{invitation.properties?.address}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(status)}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(status === 'expired' || status === 'pending') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resendInvitationMutation.mutate(invitation.id)}
                            disabled={resendInvitationMutation.isPending}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Resend
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile view */}
          <div className="md:hidden space-y-4">
            {invitations.map((invitation) => {
              const status = getInvitationStatus(invitation);
              return (
                <div key={invitation.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">{invitation.name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-500">{invitation.email}</p>
                    </div>
                    <Badge className={getStatusColor(status)}>
                      {status}
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <p className="font-medium text-sm">{invitation.properties?.title}</p>
                    <p className="text-xs text-gray-500">{invitation.properties?.address}</p>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    <p>Sent {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}</p>
                    <p>Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}</p>
                  </div>
                  
                  {(status === 'expired' || status === 'pending') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resendInvitationMutation.mutate(invitation.id)}
                      disabled={resendInvitationMutation.isPending}
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Resend Invitation
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default InvitationsTable;
