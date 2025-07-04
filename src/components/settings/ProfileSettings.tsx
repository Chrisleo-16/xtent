
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Save } from 'lucide-react';

interface ProfileData {
  name: string;
  phone: string;
  email: string;
}

interface ProfileSettingsProps {
  profileData: ProfileData;
  userRole: string | null;
  isUpdating: boolean;
  onProfileUpdate: () => void;
  onProfileDataChange: (data: ProfileData) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  profileData,
  userRole,
  isUpdating,
  onProfileUpdate,
  onProfileDataChange,
}) => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-slate-800">
          <div className="p-2 bg-green-100 rounded-lg">
            <User className="h-5 w-5 text-green-600" />
          </div>
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-medium">Full Name *</Label>
            <Input
              id="name"
              value={profileData.name}
              onChange={(e) => onProfileDataChange({ ...profileData, name: e.target.value })}
              placeholder="Enter your full name"
              className="bg-white border-slate-200 focus:border-green-500 focus:ring-green-500/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
            <Input
              id="email"
              value={profileData.email}
              disabled
              className="bg-slate-50 border-slate-200 text-slate-500"
            />
            <p className="text-xs text-slate-500">Email cannot be changed</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => onProfileDataChange({ ...profileData, phone: e.target.value })}
              placeholder="Enter your phone number"
              className="bg-white border-slate-200 focus:border-green-500 focus:ring-green-500/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-700 font-medium">Account Type</Label>
            <Input
              id="role"
              value={userRole || 'tenant'}
              disabled
              className="bg-slate-50 border-slate-200 text-slate-500 capitalize"
            />
          </div>
        </div>
        <Button 
          onClick={onProfileUpdate}
          disabled={isUpdating}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-medium flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
