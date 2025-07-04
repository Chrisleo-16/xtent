
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Globe, Shield, Building2, Home } from 'lucide-react';

interface SettingsNavigationProps {
  userRole: string | null;
}

const SettingsNavigation: React.FC<SettingsNavigationProps> = ({ userRole }) => {
  const getRoleTabs = () => {
    const tabs = [
      { value: 'profile', label: 'Profile', icon: User },
      { value: 'universal', label: 'General', icon: Globe },
    ];

    if (userRole === 'tenant') {
      tabs.push({ value: 'tenant', label: 'Tenant', icon: Home });
    }

    if (userRole === 'landlord') {
      tabs.push({ value: 'landlord', label: 'Landlord', icon: Building2 });
    }

    tabs.push({ value: 'security', label: 'Security', icon: Shield });

    return tabs;
  };

  return (
    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 bg-white/80 backdrop-blur-sm border border-slate-200">
      {getRoleTabs().map((tab) => {
        const Icon = tab.icon;
        return (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value}
            className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
};

export default SettingsNavigation;
