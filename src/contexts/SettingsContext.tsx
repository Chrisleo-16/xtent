
import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useUniversalSettings } from './settings/useUniversalSettings';
import { useTenantSettings } from './settings/useTenantSettings';
import { useLandlordSettings } from './settings/useLandlordSettings';
import { SettingsContextType } from './settings/types';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [isLoading, setIsLoading] = useState(true);

  const {
    universalSettings,
    updateUniversalSettings,
    refreshUniversalSettings,
  } = useUniversalSettings();

  const {
    tenantSettings,
    updateTenantSettings,
    refreshTenantSettings,
  } = useTenantSettings();

  const {
    landlordSettings,
    updateLandlordSettings,
    refreshLandlordSettings,
  } = useLandlordSettings();

  const refreshSettings = async () => {
    setIsLoading(true);
    await Promise.all([
      refreshUniversalSettings(),
      refreshTenantSettings(),
      refreshLandlordSettings(),
    ]);
    setIsLoading(false);
  };

  React.useEffect(() => {
    if (user && role) {
      refreshSettings();
    }
  }, [user, role]);

  return (
    <SettingsContext.Provider
      value={{
        universalSettings,
        tenantSettings,
        landlordSettings,
        isLoading,
        updateUniversalSettings,
        updateTenantSettings,
        updateLandlordSettings,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
