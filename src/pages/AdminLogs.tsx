
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
  Database, Search, Filter, AlertTriangle, Info, 
  CheckCircle, XCircle, Clock, RefreshCw
} from 'lucide-react';

const AdminLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  // Mock system logs data
  const logs = [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'User login successful',
      details: 'User yegonalvin20@gmail.com logged in successfully',
      source: 'auth',
      user_id: '06fb87f3-aa0a-49b3-a784-0bc006bc8c65'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      level: 'warning',
      message: 'High memory usage detected',
      details: 'System memory usage at 85%',
      source: 'system',
      user_id: null
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      level: 'error',
      message: 'Database connection timeout',
      details: 'Failed to connect to database after 30 seconds',
      source: 'database',
      user_id: null
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 900000).toISOString(),
      level: 'info',
      message: 'Property created',
      details: 'New property "Modern Apartment" added by landlord',
      source: 'properties',
      user_id: 'baa4765b-3306-4c3b-a007-1ae4156f5f89'
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      level: 'info',
      message: 'Payment processed',
      details: 'Rent payment of KES 25,000 processed successfully',
      source: 'payments',
      user_id: 'cab4e514-a55c-4074-9cec-41ff0103f7b3'
    }
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    
    return matchesSearch && matchesLevel;
  });

  const getLevelBadge = (level: string) => {
    const config = {
      info: { icon: Info, color: 'bg-blue-100 text-blue-700' },
      warning: { icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-700' },
      error: { icon: XCircle, color: 'bg-red-100 text-red-700' },
      success: { icon: CheckCircle, color: 'bg-green-100 text-green-700' }
    };
    
    const { icon: Icon, color } = config[level as keyof typeof config] || config.info;
    
    return (
      <Badge className={`${color} border-0 flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {level.toUpperCase()}
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    const colors = {
      auth: 'bg-purple-100 text-purple-700',
      system: 'bg-gray-100 text-gray-700',
      database: 'bg-indigo-100 text-indigo-700',
      properties: 'bg-green-100 text-green-700',
      payments: 'bg-blue-100 text-blue-700'
    };
    
    const color = colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-700';
    
    return (
      <Badge variant="outline" className={`${color} border-0`}>
        {source}
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
                    <Database className="h-8 w-8 text-green-600" />
                    System Logs
                  </h1>
                  <p className="text-gray-600 mt-1">Monitor system activity and troubleshoot issues</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {filteredLogs.length} Log Entries
                  </Badge>
                </div>
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
                        placeholder="Search logs by message, details, or source..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                      <SelectTrigger className="w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Logs Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No logs found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>User ID</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <p className="text-sm font-mono">
                                      {new Date(log.timestamp).toLocaleTimeString()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(log.timestamp).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getLevelBadge(log.level)}
                              </TableCell>
                              <TableCell>
                                {getSourceBadge(log.source)}
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">{log.message}</p>
                              </TableCell>
                              <TableCell>
                                <p className="text-sm text-gray-600 max-w-xs truncate">
                                  {log.details}
                                </p>
                              </TableCell>
                              <TableCell>
                                {log.user_id ? (
                                  <p className="text-xs font-mono text-gray-500">
                                    {log.user_id.slice(0, 8)}...
                                  </p>
                                ) : (
                                  <span className="text-gray-400">System</span>
                                )}
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

export default AdminLogs;
