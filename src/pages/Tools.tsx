
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BarChart3, FileText, ListPlus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Tools = () => {
  const tools = [
    {
      id: 'list-property',
      title: 'List Property',
      description: 'Make your properties visible to potential tenants and manage listings.',
      icon: ListPlus,
      href: '/tools/list-property',
      color: 'from-green-500 to-emerald-600',
      features: ['Property visibility', 'Application management', 'Quick listing']
    },
    {
      id: 'calendar',
      title: 'Property Calendar',
      description: 'Schedule rent collections, maintenance, inspections, and property events.',
      icon: Calendar,
      href: '/tools/calendar',
      color: 'from-blue-500 to-cyan-600',
      features: ['Event scheduling', 'Maintenance reminders', 'Tenant notifications']
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Get insights into property performance, revenue trends, and analytics.',
      icon: BarChart3,
      href: '/tools/analytics',
      color: 'from-purple-500 to-violet-600',
      features: ['Revenue tracking', 'Occupancy rates', 'Performance metrics']
    },
    {
      id: 'reports',
      title: 'Report Generator',
      description: 'Generate comprehensive reports for income, expenses, and tenant data.',
      icon: FileText,
      href: '/tools/reports',
      color: 'from-orange-500 to-red-600',
      features: ['Financial reports', 'Maintenance logs', 'Custom exports']
    }
  ];

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-3">Property Management Tools</h1>
        <p className="text-gray-600 text-lg">
          Powerful tools to help you manage your properties efficiently and effectively
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Link key={tool.id} to={tool.href} className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-gray-50 group-hover:to-gray-100">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${tool.color} shadow-lg`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors duration-200" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800 group-hover:text-green-800 transition-colors">
                    {tool.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="space-y-2">
                    {tool.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-500">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-sm text-green-700 font-medium">More tools coming soon</span>
        </div>
      </div>
    </div>
  );
};

export default Tools;
