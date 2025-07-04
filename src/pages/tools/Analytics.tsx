
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnalyticsDashboard } from '@/components/tools/AnalyticsDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

const Analytics = () => {
  const { user } = useAuth();
  const { role } = useUserRole();

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <Link 
          to="/tools" 
          className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tools
        </Link>
        <h1 className="text-2xl font-bold text-green-800 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Get insights into your property performance and revenue trends
        </p>
      </div>

      <AnalyticsDashboard userRole={role || 'tenant'} />
    </div>
  );
};

export default Analytics;
