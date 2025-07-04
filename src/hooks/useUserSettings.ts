
import { useSettings } from '@/contexts/SettingsContext';
import { useUserRole } from '@/hooks/useUserRole';

export const useUserSettings = () => {
  const { role } = useUserRole();
  const {
    universalSettings,
    tenantSettings,
    landlordSettings,
    isLoading,
    updateUniversalSettings,
    updateTenantSettings,
    updateLandlordSettings,
    refreshSettings,
  } = useSettings();

  // Helper function to get all relevant settings for the current user
  const getAllSettings = () => {
    const settings: any = { ...universalSettings };
    
    if (role === 'tenant' && tenantSettings) {
      settings.tenant = tenantSettings;
    }
    
    if (role === 'landlord' && landlordSettings) {
      settings.landlord = landlordSettings;
    }
    
    return settings;
  };

  // Helper function to update settings based on type
  const updateSettings = async (type: 'universal' | 'tenant' | 'landlord', updates: any) => {
    switch (type) {
      case 'universal':
        await updateUniversalSettings(updates);
        break;
      case 'tenant':
        await updateTenantSettings(updates);
        break;
      case 'landlord':
        await updateLandlordSettings(updates);
        break;
    }
  };

  return {
    universalSettings,
    tenantSettings,
    landlordSettings,
    allSettings: getAllSettings(),
    isLoading,
    updateSettings,
    refreshSettings,
    role,
  };
};
