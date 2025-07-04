
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Globe, Moon, Shield, User } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const UniversalSettings = () => {
  const { universalSettings, updateUniversalSettings, isLoading } = useSettings();

  if (isLoading || !universalSettings) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const handleSettingUpdate = async (key: keyof typeof universalSettings, value: any) => {
    await updateUniversalSettings({ [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { 
              key: 'email_notifications', 
              title: 'Email Notifications', 
              description: 'Receive notifications via email' 
            },
            { 
              key: 'sms_notifications', 
              title: 'SMS Notifications', 
              description: 'Receive notifications via SMS' 
            },
            { 
              key: 'payment_reminders', 
              title: 'Payment Reminders', 
              description: 'Get reminded about upcoming payments' 
            },
            { 
              key: 'maintenance_updates', 
              title: 'Maintenance Updates', 
              description: 'Get notified about maintenance status changes' 
            },
            { 
              key: 'marketing_emails', 
              title: 'Marketing Emails', 
              description: 'Receive promotional emails and updates' 
            }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 md:p-4 bg-slate-50/50 rounded-lg border border-slate-100">
              <div className="flex-1 pr-4">
                <Label className="text-slate-800 font-medium text-sm md:text-base">{item.title}</Label>
                <p className="text-xs md:text-sm text-slate-600 mt-1">{item.description}</p>
              </div>
              <Switch
                checked={universalSettings[item.key as keyof typeof universalSettings] as boolean}
                onCheckedChange={(checked) => handleSettingUpdate(item.key as keyof typeof universalSettings, checked)}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Globe className="h-5 w-5 text-orange-600" />
            </div>
            App Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between p-3 md:p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="flex-1 pr-4">
              <Label className="text-slate-800 font-medium text-sm md:text-base">Dark Mode</Label>
              <p className="text-xs md:text-sm text-slate-600 mt-1">Use dark theme for the application</p>
            </div>
            <Switch
              checked={universalSettings.dark_mode}
              onCheckedChange={(checked) => handleSettingUpdate('dark_mode', checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium text-sm md:text-base">Language</Label>
              <Select
                value={universalSettings.language}
                onValueChange={(value) => handleSettingUpdate('language', value)}
              >
                <SelectTrigger className="bg-white border-slate-200 focus:border-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sw">Swahili</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium text-sm md:text-base">Currency</Label>
              <Select
                value={universalSettings.currency}
                onValueChange={(value) => handleSettingUpdate('currency', value)}
              >
                <SelectTrigger className="bg-white border-slate-200 focus:border-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES (Kenyan Shilling)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium text-sm md:text-base">Timezone</Label>
              <Select
                value={universalSettings.timezone}
                onValueChange={(value) => handleSettingUpdate('timezone', value)}
              >
                <SelectTrigger className="bg-white border-slate-200 focus:border-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UniversalSettings;
