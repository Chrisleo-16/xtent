
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, Search, Filter, Send, TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MobileNavigation from '@/components/MobileNavigation';
import { useLandlordPayments } from '@/hooks/useLandlordPayments';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

const Billing = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { data: payments = [], isLoading, error } = useLandlordPayments();
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.property_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'paid') return matchesSearch && payment.status === 'paid';
    if (filter === 'unpaid') return matchesSearch && payment.status === 'pending';
    if (filter === 'overdue') return matchesSearch && payment.status === 'overdue';
    
    return matchesSearch;
  });

  const totalDue = payments.reduce((sum, payment) => 
    payment.status !== 'paid' ? sum + payment.amount : sum, 0
  );
  
  const totalCollected = payments.reduce((sum, payment) => 
    payment.status === 'paid' ? sum + payment.amount : sum, 0
  );

  const overdueCount = payments.filter(p => p.status === 'overdue').length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const handleSendReminder = (tenantName: string, tenantEmail: string) => {
    // TODO: Implement actual reminder functionality with Supabase edge function
    toast({
      title: "Reminder Sent",
      description: `Payment reminder sent to ${tenantName} (${tenantEmail})`,
    });
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar role="landlord" />
          <SidebarInset>
            <div className="p-4">
              <SidebarTrigger className="mb-4" />
              <div className="space-y-6">
                <Skeleton className="h-20 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </SidebarInset>
        </div>
        <MobileNavigation role="landlord" />
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar role="landlord" />
          <SidebarInset>
            <div className="p-4">
              <SidebarTrigger className="mb-4" />
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Payments</h2>
                  <p className="text-gray-600">Failed to load payment data. Please try again later.</p>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
        <MobileNavigation role="landlord" />
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar role="landlord" />
        <SidebarInset>
          <div className="p-4">
            <SidebarTrigger className="mb-4" />
            
            {/* Header */}
            <div className="bg-white shadow-sm border-b p-4 md:p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Receipt className="h-7 w-7 text-green-600" />
                    Billing & Rent Collection
                  </h1>
                  <p className="text-gray-600 mt-1">Monitor rent payments and collection status</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Total Collected</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalCollected)}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm">Total Due</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalDue)}</p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-red-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Overdue</p>
                        <p className="text-2xl font-bold">{overdueCount}</p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Pending</p>
                        <p className="text-2xl font-bold">{pendingCount}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters & Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by tenant name, property, or unit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Payments</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="unpaid">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Payments Table/List */}
              <Card>
                <CardHeader>
                  <CardTitle>Rent Payments ({filteredPayments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tenant</TableHead>
                          <TableHead>Property</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.tenant_name}</TableCell>
                            <TableCell>{payment.property_title}</TableCell>
                            <TableCell>{payment.unit}</TableCell>
                            <TableCell>{new Date(payment.due_date).toLocaleDateString()}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell>
                              {(payment.status === 'pending' || payment.status === 'overdue') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendReminder(payment.tenant_name, payment.tenant_email)}
                                  className="flex items-center gap-1"
                                >
                                  <Send className="h-3 w-3" />
                                  Send Reminder
                                </Button>
                              )}
                              {payment.status === 'paid' && payment.transaction_reference && (
                                <span className="text-xs text-gray-500">
                                  Ref: {payment.transaction_reference}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {filteredPayments.map((payment) => (
                      <Card key={payment.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{payment.tenant_name}</h3>
                              <p className="text-sm text-gray-600">{payment.property_title}</p>
                              <p className="text-sm text-gray-600">{payment.unit}</p>
                            </div>
                            {getStatusBadge(payment.status)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                            <div>
                              <span className="text-gray-500">Due Date:</span>
                              <p className="font-medium">{new Date(payment.due_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Amount:</span>
                              <p className="font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
                            </div>
                          </div>

                          {(payment.status === 'pending' || payment.status === 'overdue') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendReminder(payment.tenant_name, payment.tenant_email)}
                              className="w-full flex items-center justify-center gap-2"
                            >
                              <Send className="h-3 w-3" />
                              Send Reminder
                            </Button>
                          )}

                          {payment.status === 'paid' && payment.transaction_reference && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                              <span className="text-green-700">Transaction Ref: {payment.transaction_reference}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredPayments.length === 0 && (
                    <div className="text-center py-8">
                      <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No payments found matching your criteria.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
      <MobileNavigation role="landlord" />
    </SidebarProvider>
  );
};

export default Billing;
