
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Building,
  Calendar,
  MapPin,
  Users,
  Phone,
  Award,
  Zap,
  Star,
  Shield,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MobileNavigation from '@/components/MobileNavigation';
import XtentLogo from '@/components/XtentLogo';
import CaretakerStats from '@/components/caretaker/CaretakerStats';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useCaretakerData } from '@/hooks/useCaretakerData';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CaretakerDashboard = () => {
  const navigate = useNavigate();
  const { 
    properties, 
    applications, 
    maintenanceRequests, 
    isLoading,
    acceptApplication,
    rejectApplication 
  } = useCaretakerData();

  const { data: calendarEvents } = useCalendarEvents();

  // Filter today's appointments from calendar events
  const todaysAppointments = calendarEvents?.filter(event => {
    const eventDate = new Date(event.start_date);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  }) || [];

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'high': { color: 'bg-gradient-to-r from-red-500 to-red-600 text-white', icon: AlertTriangle },
      'medium': { color: 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white', icon: Clock },
      'low': { color: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white', icon: CheckCircle }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} px-3 py-1 rounded-full shadow-lg border-0 flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {priority}
      </Badge>
    );
  };

  const handleAcceptApplication = async (applicationId: string) => {
    await acceptApplication(applicationId);
  };

  const handleRejectApplication = async (applicationId: string) => {
    await rejectApplication(applicationId);
  };

  const handleChatClick = () => {
    navigate('/chat');
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-orange-50/20 to-yellow-50/20">
          <AppSidebar role="caretaker" />
          <SidebarInset>
            <div className="p-4">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-orange-50/20 to-yellow-50/20">
        <AppSidebar role="caretaker" />
        
        <SidebarInset>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <SidebarTrigger />
              <NotificationBell variant="header" />
            </div>
            
            {/* Premium Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 p-6 md:p-8 mb-6 rounded-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
              
              {/* Floating Decoration Elements */}
              <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <XtentLogo size="lg" showTagline={true} variant="dark" />
                  <div className="hidden md:flex items-center gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                      <div className="flex items-center gap-2 text-white">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-medium">Property Guardian</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-white space-y-2">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                    Caretaker Command Center
                  </h1>
                  <p className="text-xl md:text-2xl font-light text-orange-100 max-w-2xl">
                    Manage your assigned properties and maintenance tasks efficiently
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-orange-100 text-sm">Professional Property Care</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 -mt-8 relative z-20">
              {/* Enhanced Stats Cards */}
              <CaretakerStats 
                properties={properties}
                applications={applications}
                maintenanceRequests={maintenanceRequests}
              />

              {/* Today's Schedule - Using Real Data from Calendar Events */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/20 hover:shadow-2xl transition-all duration-300 mb-6 mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    Today's Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todaysAppointments.length > 0 ? (
                      todaysAppointments.map((appointment, index) => (
                        <motion.div 
                          key={appointment.id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300 hover:border-blue-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm font-bold rounded-lg px-3 py-2 min-w-[80px] text-center shadow-lg">
                                {new Date(appointment.start_date).toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{appointment.title}</p>
                                <p className="text-sm text-gray-600">{appointment.description}</p>
                                {appointment.priority && (
                                  <div className="mt-1">
                                    {getPriorityBadge(appointment.priority)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 group-hover:shadow-md transition-all duration-300">
                              View Details
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No appointments scheduled for today</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* High Priority Tasks - Using Real Data */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-red-50/20 hover:shadow-2xl transition-all duration-300 mb-6">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold">
                      <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      High Priority Tasks
                    </CardTitle>
                    <Button size="sm" className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View All Tasks
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {maintenanceRequests
                      .filter(req => req.priority === 'high' && req.status === 'pending')
                      .slice(0, 3)
                      .map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-red-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{task.title}</h4>
                              {getPriorityBadge(task.priority)}
                            </div>
                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {task.property_title} - {task.tenant_name}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Submitted: {new Date(task.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                              Assign Vendor
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg">
                              Accept
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {maintenanceRequests.filter(req => req.priority === 'high' && req.status === 'pending').length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-gray-500">No high priority tasks at the moment</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions - Premium Grid with Chat */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/20 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 h-14 text-white shadow-lg border-0 font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                      <Wrench className="h-5 w-5 mr-3" />
                      View All Requests
                    </Button>
                    <Button 
                      onClick={handleChatClick}
                      className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 h-14 text-white shadow-lg border-0 font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <MessageSquare className="h-5 w-5 mr-3" />
                      Chat with Users
                    </Button>
                    <Button variant="outline" className="h-14 border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                      <CheckCircle className="h-5 w-5 mr-3" />
                      Submit Report
                    </Button>
                    <Button variant="outline" className="h-14 border-orange-200 text-orange-700 hover:bg-orange-50 font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                      <Phone className="h-5 w-5 mr-3" />
                      Contact Manager
                    </Button>
                    <Button variant="outline" className="h-14 border-green-200 text-green-700 hover:bg-green-50 font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                      <Calendar className="h-5 w-5 mr-3" />
                      Schedule Maintenance
                    </Button>
                    <Button variant="outline" className="h-14 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                      <Users className="h-5 w-5 mr-3" />
                      Vendor Directory
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
      
      <MobileNavigation role="caretaker" />
    </SidebarProvider>
  );
};

export default CaretakerDashboard;
