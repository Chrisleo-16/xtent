
import { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, Search, Filter, Eye, CheckCircle, XCircle, 
  Clock, FileText, Download, User, Building, AlertCircle, UserCheck
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

const AdminVerifications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VerificationStatus>('all');
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch all users with their verification status
  const { data: verifications = [], isLoading } = useQuery({
    queryKey: ['adminVerifications', statusFilter, searchTerm],
    queryFn: async () => {
      console.log('Fetching verification data...');
      
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('verification_status', statusFilter);
      }
      
      const { data: profilesData, error: profilesError } = await query;
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      console.log('Profiles data:', profilesData);
      
      // Fetch verification documents separately
      const { data: documentsData, error: documentsError } = await supabase
        .from('verification_documents')
        .select('*');
      
      if (documentsError) {
        console.error('Error fetching verification documents:', documentsError);
        throw documentsError;
      }
      
      console.log('Documents data:', documentsData);
      
      // Combine the data
      const combinedData = profilesData?.map(profile => ({
        ...profile,
        verification_documents: documentsData?.filter(doc => doc.user_id === profile.id) || []
      })) || [];
      
      console.log('Combined data:', combinedData);
      
      let filtered = combinedData;
      if (searchTerm) {
        filtered = filtered.filter(profile =>
          profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          profile.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      return filtered;
    }
  });

  // Update verification status
  const updateVerificationMutation = useMutation({
    mutationFn: async ({ userId, status, reason }: { userId: string, status: VerificationStatus, reason?: string }) => {
      const updateData: any = { verification_status: status };
      if (reason && status === 'rejected') {
        updateData.rejection_reason = reason;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVerifications'] });
      toast.success('Verification status updated successfully');
      setSelectedVerification(null);
    },
    onError: (error) => {
      toast.error(`Error updating verification: ${error.message}`);
    }
  });

  // Bulk approve all pending verifications
  const bulkApproveVerificationsMutation = useMutation({
    mutationFn: async () => {
      const pendingUsers = verifications.filter(user => user.verification_status === 'pending');
      
      const { error } = await supabase
        .from('profiles')
        .update({ verification_status: 'verified' })
        .in('id', pendingUsers.map(user => user.id));
      
      if (error) throw error;
      
      return pendingUsers.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['adminVerifications'] });
      toast.success(`Successfully verified ${count} pending users`);
    },
    onError: (error) => {
      toast.error(`Error bulk verifying users: ${error.message}`);
    }
  });

  const handleApprove = (userId: string) => {
    updateVerificationMutation.mutate({ userId, status: 'verified' });
  };

  const handleReject = (userId: string, reason: string) => {
    updateVerificationMutation.mutate({ userId, status: 'rejected', reason });
  };

  const handleBulkApprove = () => {
    const pendingCount = verifications.filter(user => user.verification_status === 'pending').length;
    if (pendingCount === 0) {
      toast.info('No pending verifications to approve');
      return;
    }
    
    if (confirm(`Are you sure you want to verify all ${pendingCount} pending users?`)) {
      bulkApproveVerificationsMutation.mutate();
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      unverified: { variant: 'outline', icon: AlertCircle, color: 'text-gray-600' },
      pending: { variant: 'secondary', icon: Clock, color: 'text-yellow-600' },
      verified: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      rejected: { variant: 'destructive', icon: XCircle, color: 'text-red-600' }
    };
    
    const { variant, icon: Icon, color } = config[status as keyof typeof config] || config.unverified;
    
    return (
      <Badge variant={variant as any} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getVerificationStats = () => {
    const stats = verifications.reduce((acc, verification) => {
      acc[verification.verification_status] = (acc[verification.verification_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: verifications.length,
      unverified: stats.unverified || 0,
      pending: stats.pending || 0,
      verified: stats.verified || 0,
      rejected: stats.rejected || 0
    };
  };

  const stats = getVerificationStats();

  console.log('Current verification stats:', stats);
  console.log('Total verifications loaded:', verifications.length);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar role="admin" />
        
        <SidebarInset>
          <div className="p-4 md:p-6">
            <SidebarTrigger className="mb-4" />
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="h-8 w-8 text-green-600" />
                    Verification Management
                  </h1>
                  <p className="text-gray-600 mt-1">Review and manage all user verification requests</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {stats.total} Total Users
                  </Badge>
                  {stats.pending > 0 && (
                    <Button 
                      onClick={handleBulkApprove} 
                      disabled={bulkApproveVerificationsMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Verify All Pending ({stats.pending})
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                      <p className="text-sm text-gray-600">Total Users</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">{stats.unverified}</p>
                      <p className="text-sm text-gray-600">Unverified</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
                      <p className="text-sm text-gray-600">Verified</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                      <p className="text-sm text-gray-600">Rejected</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filters & Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={(value: 'all' | VerificationStatus) => setStatusFilter(value)}>
                      <SelectTrigger className="w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="unverified">Unverified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Requests Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Users & Verification Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">Loading verification data...</div>
                  ) : verifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No users found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Documents</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {verifications.map((verification) => (
                            <TableRow key={verification.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{verification.name || 'N/A'}</p>
                                    <p className="text-sm text-gray-500">{verification.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {verification.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(verification.verification_status)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">
                                    {verification.verification_documents?.length || 0} docs
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-gray-500">
                                  {new Date(verification.created_at).toLocaleDateString()}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setSelectedVerification(verification)}
                                      >
                                        <Eye className="h-4 w-4 mr-1" />
                                        Review
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>User Verification Review</DialogTitle>
                                      </DialogHeader>
                                      {selectedVerification && (
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <label className="text-sm font-medium">Name</label>
                                              <p className="text-sm text-gray-600">{selectedVerification.name || 'N/A'}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium">Email</label>
                                              <p className="text-sm text-gray-600">{selectedVerification.email}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium">Role</label>
                                              <p className="text-sm text-gray-600 capitalize">{selectedVerification.role}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium">Status</label>
                                              <div className="mt-1">
                                                {getStatusBadge(selectedVerification.verification_status)}
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {selectedVerification.rejection_reason && (
                                            <div>
                                              <label className="text-sm font-medium">Rejection Reason</label>
                                              <p className="text-sm text-red-600 mt-1">{selectedVerification.rejection_reason}</p>
                                            </div>
                                          )}
                                          
                                          <div>
                                            <label className="text-sm font-medium">Documents</label>
                                            <div className="mt-2 space-y-2">
                                              {selectedVerification.verification_documents?.length > 0 ? (
                                                selectedVerification.verification_documents.map((doc: any) => (
                                                  <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                                                    <span className="text-sm capitalize">{doc.document_type.replace('_', ' ')}</span>
                                                    <Button variant="ghost" size="sm">
                                                      <Download className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                ))
                                              ) : (
                                                <p className="text-sm text-gray-500">No documents uploaded</p>
                                              )}
                                            </div>
                                          </div>
                                          
                                          {selectedVerification.verification_status === 'pending' && (
                                            <div className="flex gap-2 pt-4">
                                              <Button 
                                                onClick={() => handleApprove(selectedVerification.id)}
                                                className="bg-green-600 hover:bg-green-700"
                                              >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Approve
                                              </Button>
                                              <Button 
                                                onClick={() => handleReject(selectedVerification.id, 'Documents do not meet requirements')}
                                                variant="destructive"
                                              >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Reject
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminVerifications;
