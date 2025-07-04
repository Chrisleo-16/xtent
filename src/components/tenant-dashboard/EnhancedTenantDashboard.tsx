
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOptimizedTenantDashboard } from '@/hooks/useOptimizedTenantDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  DollarSign,
  Wrench,
  Calendar,
  CreditCard,
  MessageSquare,
  Bell,
  Globe,
  Phone,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const EnhancedTenantDashboard = () => {
  const { user } = useAuth();
  const { data, isLoading } = useOptimizedTenantDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMpesaPayment = () => {
    toast.success('M-PESA payment integration will be implemented here');
  };

  const handleMaintenanceRequest = () => {
    toast.info('Redirecting to maintenance request form...');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const lease = data?.lease;
  const property = lease?.property;
  const upcomingPayment = data?.upcomingPayments?.[0];
  const recentPayment = data?.recentPayments?.[0];
  const openMaintenanceCount = data?.maintenanceRequests?.filter(r => r.status === 'pending').length || 0;
  const recentMessages = data?.communications?.slice(0, 3) || [];
  const unreadNotifications = data?.notifications?.filter(n => !n.is_read).length || 0;

  // Safe user name extraction
  const getUserName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Tenant';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-64 lg:block">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome back, {getUserName()}! 👋
                </h1>
                <p className="text-sm text-gray-600">
                  {property ? `${property.title}` : 'Your tenant dashboard'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Globe className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Next Rent Due */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Next Rent Due
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingPayment ? (
                  <>
                    <div className="text-2xl font-bold text-green-900">
                      KES {upcomingPayment.amount.toLocaleString()}
                    </div>
                    <p className="text-sm text-green-700">
                      Due: {new Date(upcomingPayment.due_date).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <div className="text-2xl font-bold text-green-900">No dues</div>
                )}
              </CardContent>
            </Card>

            {/* Last Payment */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Last Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentPayment ? (
                  <>
                    <div className="text-2xl font-bold text-blue-900">
                      KES {recentPayment.amount.toLocaleString()}
                    </div>
                    <p className="text-sm text-blue-700">
                      {new Date(recentPayment.paid_date || recentPayment.due_date).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <div className="text-2xl font-bold text-blue-900">No payments</div>
                )}
              </CardContent>
            </Card>

            {/* Maintenance Requests */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Open Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">{openMaintenanceCount}</div>
                <p className="text-sm text-orange-700">Maintenance issues</p>
              </CardContent>
            </Card>

            {/* Current Lease */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Current Lease
                </CardTitle>
              </CardHeader>
              <CardContent>
                {property ? (
                  <>
                    <div className="text-lg font-bold text-purple-900">{property.title}</div>
                    <p className="text-sm text-purple-700">Active lease</p>
                  </>
                ) : (
                  <div className="text-lg font-bold text-purple-900">No active lease</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Widget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Quick Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingPayment ? (
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Amount Due</p>
                      <p className="text-2xl font-bold">KES {upcomingPayment.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Due: {new Date(upcomingPayment.due_date).toLocaleDateString()}</p>
                    </div>
                    <Button
                      onClick={handleMpesaPayment}
                      className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Pay with M-PESA
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No pending payments</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Maintenance & Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleMaintenanceRequest}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Wrench className="h-4 w-4" />
                  Submit Maintenance Request
                </Button>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Recent Messages</h4>
                  {recentMessages.length > 0 ? (
                    recentMessages.map((message) => (
                      <div key={message.id} className="text-sm p-2 bg-gray-50 rounded">
                        <p className="truncate">{message.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No recent messages</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

// Sidebar Component
const SidebarContent = ({ onClose }: { onClose?: () => void }) => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: DollarSign, label: 'Billing', active: false },
    { icon: Wrench, label: 'Maintenance', active: false },
    { icon: MessageSquare, label: 'Messages', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <div className="h-full bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Home className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">XTENT</span>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">THE BEST OF LIVING</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  item.active
                    ? 'bg-green-100 text-green-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default EnhancedTenantDashboard;
