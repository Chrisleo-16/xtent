
import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

interface SettingsHeaderProps {
  userRole: string | null;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({ userRole }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-4 md:px-8 pt-6 md:pt-8 pb-16 md:pb-20">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>
      
      <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-4 left-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <div className="text-white space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-fit">
              <SettingsIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                Account Settings
              </h1>
              <p className="text-base md:text-lg text-slate-200 mt-1">
                Manage your {userRole} preferences and account information
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsHeader;
