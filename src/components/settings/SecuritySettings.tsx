
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, LogOut } from 'lucide-react';

interface SecuritySettingsProps {
  onLogout: () => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onLogout }) => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-slate-800">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="h-5 w-5 text-red-600" />
          </div>
          Security & Account Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 md:p-4 bg-slate-50/50 rounded-lg border border-slate-100">
          <Label className="text-slate-800 font-medium text-sm md:text-base">Password</Label>
          <p className="text-xs md:text-sm text-slate-600 mb-3">Change your account password</p>
          <Button variant="outline" disabled className="w-full text-sm md:text-base">
            Change Password (Coming Soon)
          </Button>
        </div>
        
        <div className="p-3 md:p-4 bg-slate-50/50 rounded-lg border border-slate-100">
          <Label className="text-slate-800 font-medium text-sm md:text-base">Two-Factor Authentication</Label>
          <p className="text-xs md:text-sm text-slate-600 mb-3">Add an extra layer of security</p>
          <Button variant="outline" disabled className="w-full text-sm md:text-base">
            Enable 2FA (Coming Soon)
          </Button>
        </div>

        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full flex items-center gap-2 border-slate-200 hover:bg-slate-50 text-sm md:text-base"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
