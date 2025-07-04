
import { Shield, Star } from 'lucide-react';
import XtentLogo from '@/components/XtentLogo';

const DashboardHeader = () => (
  <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 p-6 md:p-8">
    <div className="absolute inset-0 bg-black/10"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
    
    <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
    <div className="absolute bottom-4 left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <XtentLogo size="lg" showTagline={true} variant="dark" />
        <div className="hidden md:flex items-center gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
            <div className="flex items-center gap-2 text-white">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Verified Tenant</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-white space-y-2">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">
          Welcome Back!
        </h1>
        <p className="text-xl md:text-2xl font-light text-green-100 max-w-2xl">
          Your premium living experience dashboard
        </p>
        <div className="flex items-center gap-2 mt-4">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map((star) => (
              <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-green-100 text-sm">Premium Property Management</span>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardHeader;
