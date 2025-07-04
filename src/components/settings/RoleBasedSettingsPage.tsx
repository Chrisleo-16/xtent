
import React from 'react';
import ResponsiveSidebarLayout from '@/components/ResponsiveSidebarLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { SettingsProvider } from '@/contexts/SettingsContext';
import SettingsHeader from './SettingsHeader';
import SettingsContainer from './SettingsContainer';

const RoleBasedSettingsPage: React.FC = () => {
  const { role: userRole } = useUserRole();

  return (
    <SettingsProvider>
      <ResponsiveSidebarLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/20">
          <SettingsHeader userRole={userRole} />
          <SettingsContainer />
        </div>
      </ResponsiveSidebarLayout>
    </SettingsProvider>
  );
};

export default RoleBasedSettingsPage;
