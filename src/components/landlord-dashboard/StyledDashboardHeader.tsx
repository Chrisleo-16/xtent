
import { Home, Star, TrendingUp } from 'lucide-react';
import XtentLogo from '@/components/XtentLogo';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard';
import { formatCurrency } from '@/lib/formatCurrency';

const StyledDashboardHeader = () => {
  const { user } = useAuth();
  const { dashboardStats } = useRealtimeDashboard();

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const occupancyRate = dashboardStats?.totalProperties ? 
    Math.round((dashboardStats.occupiedUnits / dashboardStats.totalProperties) * 100) : 0;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-6 pt-8 pb-8 rounded-2xl shadow-xl">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
      
      {/* Floating elements */}
      <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-4 left-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <XtentLogo size="lg" showTagline={true} variant="dark" />
          <div className="hidden md:flex items-center gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <span className="text-sm">
                {dashboardStats?.totalProperties || 0} Properties
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">
                {occupancyRate}% Occupied
              </span>
            </div>
          </div>
        </div>
        
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {getCurrentGreeting()}, {user?.user_metadata?.name || 'Landlord'}! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            Here's what's happening with your properties today
          </p>
        </div>
      </div>
    </div>
  );
};

export default StyledDashboardHeader;
