
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Mail, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';

type InvitationWithProperty = Tables<'tenant_invitations'> & {
    properties: { title: string } | null;
};

const fetchInvitations = async (landlordId: string): Promise<InvitationWithProperty[]> => {
    const { data, error } = await supabase
        .from('tenant_invitations')
        .select(`
            *,
            properties!inner(title, landlord_id)
        `)
        .eq('landlord_id', landlordId)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) throw new Error(error.message);
    return data as InvitationWithProperty[];
};

const InvitationList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const { data: invitations, isLoading, error } = useQuery({
        queryKey: ['tenantInvitations', user?.id],
        queryFn: () => fetchInvitations(user!.id),
        enabled: !!user,
    });

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: string } = {
            pending: 'bg-yellow-100 text-yellow-800',
            accepted: 'bg-green-100 text-green-800',
            expired: 'bg-red-100 text-red-800',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-red-600 flex items-center gap-2 p-2">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm">Error fetching invitations</p>
                </div>
            );
        }

        if (!invitations || invitations.length === 0) {
            return <p className="text-gray-500 text-center py-6 text-sm">No invitations found.</p>;
        }

        return (
            <>
                <ScrollArea className="h-64">
                    <div className="space-y-2 pr-4">
                        {invitations.map((invitation) => (
                            <div key={invitation.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{invitation.name || invitation.email}</p>
                                    <p className="text-xs text-gray-600 truncate">
                                        {invitation.properties?.title || 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                                <Badge className={`${getStatusBadge(invitation.status)} text-xs px-2 py-1`}>
                                    {invitation.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="mt-3">
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full" 
                        onClick={() => navigate('/tenants')}
                    >
                        View All Invitations
                    </Button>
                </div>
            </>
        );
    };

    return (
        <Card className="shadow-md h-fit">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                    Tenant Invitations
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {renderContent()}
            </CardContent>
        </Card>
    );
};

export default InvitationList;
