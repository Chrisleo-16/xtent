
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Shield,
  Database,
  FileText,
  Activity,
  Loader2
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MobileNavigation from '@/components/MobileNavigation';
import NotificationBell from '@/components/notifications/NotificationBell';
import XtentLogo from '@/components/XtentLogo';
import { motion } from 'framer-motion';
import { useAdminDashboardStats } from '@/hooks/useAdminDashboardStats';
import { useRealtimeAdminStats } from '@/hooks/useRealtimeAdminStats';

const AdminDashboard = () => {
  const { data: dashboardStats, isLoading, error } = useAdminDashboardStats();
  useRealtimeAdminStats(); // Set up real-time subscriptions

  const stats = [
    { 
      title: 'Total Users', 
      value: dashboardStats?.totalUsers || 0, 
      icon: Users, 
      color: 'bg-blue-500', 
      change: '+12%' 
    },
    { 
      title: 'Active Properties', 
      value: dashboardStats?.activeProperties || 0, 
      icon: Building, 
      color: 'bg-green-500', 
      change: '+8%' 
    },
    { 
      title: 'Pending Verifications', 
      value: dashboardStats?.pendingVerifications || 0, 
      icon: AlertTriangle, 
      color: 'bg-orange-500', 
      change: '+5%' 
    },
    { 
      title: 'System Health', 
      value: `${dashboardStats?.systemHealth || 0}%`, 
      icon: CheckCircle, 
      color: 'bg-emerald-500', 
      change: '0%' 
    },
  ];

  const quickActions = [
    { title: 'User Management', icon: Users, path: '/admin/users', color: 'bg-blue-500 hover:bg-blue-600' },
    { title: 'Verifications', icon: Shield, path: '/admin/verifications', color: 'bg-orange-500 hover:bg-orange-600' },
    { title: 'System Logs', icon: Database, path: '/admin/logs', color: 'bg-purple-500 hover:bg-purple-600' },
    { title: 'Reports', icon: FileText, path: '/admin/reports', color: 'bg-green-500 hover:bg-green-600' },
  ];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 mb-2">Dashboard Error</h2>
          <p className="text-red-700">Failed to load dashboard data. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-red-50/20 to-orange-50/20">
        <AppSidebar role="admin" />
        
        <SidebarInset>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <SidebarTrigger />
              <NotificationBell variant="header" />
            </div>
            
            {/* Premium Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-orange-600 p-6 md:p-8 mb-6 rounded-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
              
              <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <XtentLogo size="lg" showTagline={true} variant="dark" />
                  <div className="hidden md:flex items-center gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                      <div className="flex items-center gap-2 text-white">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-medium">System Administrator</span>
                        {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-white space-y-2">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                    Admin Control Center
                  </h1>
                  <p className="text-xl md:text-2xl font-light text-red-100 max-w-2xl">
                    Monitor, manage, and maintain the XTENT platform
                  </p>
                  {isLoading && (
                    <p className="text-red-200 text-sm">Loading real-time data...</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 -mt-8 relative z-20">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                              </div>
                              <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                            </div>
                            <div className={`${stat.color} p-3 rounded-xl shadow-lg`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/20 hover:shadow-2xl transition-all duration-300 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                      <motion.div
                        key={action.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button
                          className={`${action.color} h-20 w-full text-white shadow-lg border-0 font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex-col gap-2`}
                          onClick={() => window.location.href = action.path}
                        >
                          <action.icon className="h-6 w-6" />
                          {action.title}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/20 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    Recent System Activities
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl animate-pulse">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      dashboardStats?.recentActivities.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.message}</p>
                            <p className="text-sm text-gray-500">{activity.time}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
      
      <MobileNavigation role="admin" />
    </SidebarProvider>
  );
};

export default AdminDashboard;
