
import React from 'react';
import ResponsiveSidebarLayout from '@/components/ResponsiveSidebarLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, CheckCircle, Clock, DollarSign, MapPin, Phone, Settings, Star, Users, Wrench } from 'lucide-react';

const VendorDashboard = () => {
  // Mock data for vendor dashboard
  const vendorStats = {
    activeJobs: 12,
    completedJobs: 248,
    totalEarnings: 485000,
    rating: 4.8,
    responseTime: '2 hours'
  };

  const recentJobs = [
    {
      id: 1,
      title: 'Plumbing Repair - Kitchen Sink',
      property: 'Greenfield Apartments',
      location: 'Westlands, Nairobi',
      priority: 'high',
      status: 'in_progress',
      scheduledDate: '2024-01-15',
      payment: 8500
    },
    {
      id: 2,
      title: 'AC Maintenance - Unit 4B',
      property: 'Riverside Towers',
      location: 'Kilimani, Nairobi',
      priority: 'medium',
      status: 'scheduled',
      scheduledDate: '2024-01-16',
      payment: 12000
    },
    {
      id: 3,
      title: 'Electrical Wiring - New Installation',
      property: 'Parkview Residences',
      location: 'Karen, Nairobi',
      priority: 'low',
      status: 'completed',
      scheduledDate: '2024-01-12',
      payment: 25000
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'scheduled': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <ResponsiveSidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-800">Vendor Dashboard</h1>
            <p className="text-gray-600">
              Manage your maintenance jobs and track your performance
            </p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Settings className="h-4 w-4 mr-2" />
            Profile Settings
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{vendorStats.activeJobs}</div>
              <p className="text-xs text-gray-600">Currently working on</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{vendorStats.completedJobs}</div>
              <p className="text-xs text-gray-600">Total completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                KES {vendorStats.totalEarnings.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{vendorStats.rating}</div>
              <p className="text-xs text-gray-600">Average rating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{vendorStats.responseTime}</div>
              <p className="text-xs text-gray-600">Average response</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Recent Jobs
                </CardTitle>
                <CardDescription>
                  Your latest maintenance assignments and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-600">{job.property}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getPriorityColor(job.priority)} border-0`}>
                            {job.priority}
                          </Badge>
                          <Badge className={`${getStatusColor(job.status)} border-0`}>
                            {job.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            {new Date(job.scheduledDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="font-semibold text-green-600">
                          KES {job.payment.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {job.status === 'scheduled' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Start Job
                          </Button>
                        )}
                        {job.status === 'in_progress' && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Mark Complete
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>My Schedule</CardTitle>
                <CardDescription>View and manage your upcoming appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Schedule view coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings & Payments</CardTitle>
                <CardDescription>Track your income and payment history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Earnings details coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Profile</CardTitle>
                <CardDescription>Manage your professional profile and skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Profile management coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveSidebarLayout>
  );
};

export default VendorDashboard;
