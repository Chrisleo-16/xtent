
import React, { useState, Suspense, lazy } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useUpdateProfile } from '@/hooks/useUserPreferences';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import ProfileSettings from './ProfileSettings';
import SecuritySettings from './SecuritySettings';
import SettingsNavigation from './SettingsNavigation';
import SettingsLoadingSkeleton from './SettingsLoadingSkeleton';

// Lazy load role-specific components for better performance
const TenantSettings = lazy(() => import('./TenantSettings'));
const LandlordSettings = lazy(() => import('./LandlordSettings'));
const UniversalSettings = lazy(() => import('./UniversalSettings'));

interface ProfileData {
  name: string;
  phone: string;
  email: string;
}

const SettingsContainer: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    phone: '',
    email: '',
  });

  const { user } = useAuth();
  const { role: userRole } = useUserRole();
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();

  // Initialize profile data when user is available
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('name, phone, email')
            .eq('id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error);
            return;
          }

          setProfileData({
            name: profile?.name || user.user_metadata?.name || '',
            phone: profile?.phone || user.user_metadata?.phone || '',
            email: profile?.email || user.email || '',
          });
        } catch (error) {
          console.error('Error fetching profile:', error);
          setProfileData({
            name: user.user_metadata?.name || '',
            phone: user.user_metadata?.phone || '',
            email: user.email || '',
          });
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleProfileUpdate = async () => {
    if (!profileData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: profileData.name,
        phone: profileData.phone,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="p-4 md:p-6 -mt-8 md:-mt-12 relative z-20 max-w-6xl mx-auto">
      <Tabs defaultValue="profile" className="space-y-6">
        <SettingsNavigation userRole={userRole} />

        <TabsContent value="profile" className="space-y-6">
          <ProfileSettings
            profileData={profileData}
            userRole={userRole}
            isUpdating={updateProfile.isPending}
            onProfileUpdate={handleProfileUpdate}
            onProfileDataChange={setProfileData}
          />
        </TabsContent>

        <TabsContent value="universal" className="space-y-6">
          <Suspense fallback={<SettingsLoadingSkeleton />}>
            <UniversalSettings />
          </Suspense>
        </TabsContent>

        {userRole === 'tenant' && (
          <TabsContent value="tenant" className="space-y-6">
            <Suspense fallback={<SettingsLoadingSkeleton />}>
              <TenantSettings />
            </Suspense>
          </TabsContent>
        )}

        {userRole === 'landlord' && (
          <TabsContent value="landlord" className="space-y-6">
            <Suspense fallback={<SettingsLoadingSkeleton />}>
              <LandlordSettings />
            </Suspense>
          </TabsContent>
        )}

        <TabsContent value="security" className="space-y-6">
          <SecuritySettings onLogout={handleLogout} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsContainer;
