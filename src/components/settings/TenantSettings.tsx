
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Home, MessageSquare, Settings, Wrench } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const TenantSettings = () => {
  const { tenantSettings, updateTenantSettings, isLoading } = useSettings();

  if (isLoading || !tenantSettings) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const handleSettingUpdate = async (key: keyof typeof tenantSettings, value: any) => {
    await updateTenantSettings({ [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Payment & Billing Settings */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            Payment & Billing Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="payment-reminder-days" className="text-slate-700 font-medium">
                Payment Reminder (Days Before Due)
              </Label>
              <Input
                id="payment-reminder-days"
                type="number"
                value={tenantSettings.payment_reminder_days}
                onChange={(e) => handleSettingUpdate('payment_reminder_days', parseInt(e.target.value))}
                className="bg-white border-slate-200 focus:border-green-500"
                min="1"
                max="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method" className="text-slate-700 font-medium">
                Preferred Payment Method
              </Label>
              <Select
                value={tenantSettings.payment_method_preference}
                onValueChange={(value) => handleSettingUpdate('payment_method_preference', value)}
              >
                <SelectTrigger className="bg-white border-slate-200 focus:border-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="flex-1 pr-4">
              <Label className="text-slate-800 font-medium">Auto-Pay</Label>
              <p className="text-sm text-slate-600 mt-1">
                Automatically pay rent when due (requires setup)
              </p>
            </div>
            <Switch
              checked={tenantSettings.auto_pay_enabled}
              onCheckedChange={(checked) => handleSettingUpdate('auto_pay_enabled', checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Settings */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wrench className="h-5 w-5 text-blue-600" />
            </div>
            Maintenance Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="flex-1 pr-4">
              <Label className="text-slate-800 font-medium">Priority Notifications</Label>
              <p className="text-sm text-slate-600 mt-1">
                Get notified immediately for urgent maintenance issues
              </p>
            </div>
            <Switch
              checked={tenantSettings.maintenance_priority_notifications}
              onCheckedChange={(checked) => handleSettingUpdate('maintenance_priority_notifications', checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="flex-1 pr-4">
              <Label className="text-slate-800 font-medium">Require Photo Uploads</Label>
              <p className="text-sm text-slate-600 mt-1">
                Always include photos when submitting maintenance requests
              </p>
            </div>
            <Switch
              checked={tenantSettings.maintenance_photo_required}
              onCheckedChange={(checked) => handleSettingUpdate('maintenance_photo_required', checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Communication Settings */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            Communication Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="flex-1 pr-4">
              <Label className="text-slate-800 font-medium">Landlord Messages</Label>
              <p className="text-sm text-slate-600 mt-1">
                Receive notifications for messages from your landlord
              </p>
            </div>
            <Switch
              checked={tenantSettings.landlord_message_notifications}
              onCheckedChange={(checked) => handleSettingUpdate('landlord_message_notifications', checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="flex-1 pr-4">
              <Label className="text-slate-800 font-medium">Community Announcements</Label>
              <p className="text-sm text-slate-600 mt-1">
                Get notified about building or community announcements
              </p>
            </div>
            <Switch
              checked={tenantSettings.community_announcements}
              onCheckedChange={(checked) => handleSettingUpdate('community_announcements', checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Rental Credit Settings */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Home className="h-5 w-5 text-orange-600" />
            </div>
            Rental Credit (Future Feature)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="flex-1 pr-4">
              <Label className="text-slate-800 font-medium">Enable Rental Credit</Label>
              <p className="text-sm text-slate-600 mt-1">
                Allow borrowing against future rent payments
              </p>
            </div>
            <Switch
              checked={tenantSettings.enable_rent_credit}
              onCheckedChange={(checked) => handleSettingUpdate('enable_rent_credit', checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          {tenantSettings.enable_rent_credit && (
            <div className="space-y-2">
              <Label htmlFor="credit-limit" className="text-slate-700 font-medium">
                Credit Limit (KES)
              </Label>
              <Input
                id="credit-limit"
                type="number"
                value={tenantSettings.credit_limit_amount}
                onChange={(e) => handleSettingUpdate('credit_limit_amount', parseInt(e.target.value))}
                className="bg-white border-slate-200 focus:border-green-500"
                min="0"
                step="1000"
              />
              <p className="text-xs text-slate-500">
                Maximum amount you can borrow against future rent
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantSettings;
