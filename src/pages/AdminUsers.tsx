
import { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, Search, Filter, MoreVertical, Shield, 
  Ban, CheckCircle, User, Mail, Phone, Calendar
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type UserRole = 'admin' | 'landlord' | 'tenant' | 'caretaker' | 'vendor';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers', roleFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      let filtered = data || [];
      if (searchTerm) {
        filtered = filtered.filter(user =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      return filtered;
    }
  });

  // Update user role
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: UserRole }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      toast.error(`Error updating user role: ${error.message}`);
    }
  });

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      landlord: 'bg-green-100 text-green-700',
      tenant: 'bg-blue-100 text-blue-700',
      caretaker: 'bg-orange-100 text-orange-700',
      vendor: 'bg-purple-100 text-purple-700'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getVerificationBadge = (status: string) => {
    const config = {
      unverified: { label: 'Unverified', color: 'bg-gray-100 text-gray-700' },
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
      verified: { label: 'Verified', color: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' }
    };
    
    const { label, color } = config[status as keyof typeof config] || config.unverified;
    
    return (
      <Badge className={`${color} border-0`}>
        {label}
      </Badge>
    );
  };

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
                    <Users className="h-8 w-8 text-green-600" />
                    User Management
                  </h1>
                  <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {users.length} Total Users
                </Badge>
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
                    <Select value={roleFilter} onValueChange={(value: 'all' | UserRole) => setRoleFilter(value)}>
                      <SelectTrigger className="w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="landlord">Landlord</SelectItem>
                        <SelectItem value="tenant">Tenant</SelectItem>
                        <SelectItem value="caretaker">Caretaker</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Users Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">Loading users...</div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No users found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Verification</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{user.name || 'N/A'}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${getRoleBadgeColor(user.role)} border-0 capitalize`}>
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {getVerificationBadge(user.verification_status)}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-3 w-3 text-gray-400" />
                                    <span className="text-gray-600">{user.email}</span>
                                  </div>
                                  {user.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Phone className="h-3 w-3 text-gray-400" />
                                      <span className="text-gray-600">{user.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  {new Date(user.created_at).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem 
                                      onClick={() => updateUserRoleMutation.mutate({ userId: user.id, newRole: 'admin' })}
                                      disabled={user.role === 'admin'}
                                    >
                                      <Shield className="h-4 w-4 mr-2" />
                                      Make Admin
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => updateUserRoleMutation.mutate({ userId: user.id, newRole: 'landlord' })}
                                      disabled={user.role === 'landlord'}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Make Landlord
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => updateUserRoleMutation.mutate({ userId: user.id, newRole: 'tenant' })}
                                      disabled={user.role === 'tenant'}
                                    >
                                      <User className="h-4 w-4 mr-2" />
                                      Make Tenant
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
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

export default AdminUsers;
