
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, Wrench, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface CaretakerStatsProps {
  properties: any[];
  applications: any[];
  maintenanceRequests: any[];
}

const CaretakerStats = ({ properties, applications, maintenanceRequests }: CaretakerStatsProps) => {
  const stats = [
    {
      title: 'Assigned Properties',
      value: properties.length,
      change: '+2 this month',
      icon: Building,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-white'
    },
    {
      title: 'Total Units',
      value: properties.reduce((sum, prop) => sum + prop.total_units, 0),
      change: `${properties.reduce((sum, prop) => sum + prop.occupied_units, 0)} occupied`,
      icon: Users,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-white'
    },
    {
      title: 'Pending Applications',
      value: applications.filter(app => app.status === 'pending').length,
      change: 'Needs review',
      icon: Clock,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-white'
    },
    {
      title: 'Open Requests',
      value: maintenanceRequests.filter(req => req.status === 'pending').length,
      change: `${maintenanceRequests.filter(req => req.priority === 'high').length} high priority`,
      icon: Wrench,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-white'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br ${stat.bgGradient} hover:shadow-2xl transition-all duration-500 hover:-translate-y-1`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
            
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">
                {stat.title}
              </CardTitle>
              <div className={`p-2 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <div className={`text-3xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default CaretakerStats;
