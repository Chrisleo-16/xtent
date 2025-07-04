
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, FileText, MessageSquare, Settings, Users, Wrench } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const LandlordSettings = () => {
  const { landlordSettings, updateLandlordSettings, isLoading } = useSettings();

  if (isLoading || !landlordSettings) {
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

  const handleSettingUpdate = async (key: keyof typeof landlordSettings, value: any) => {
    await updateLandlordSettings({ [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Property Management Settings */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            Property Management Defaults
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="lease-term" className="text-slate-700 font-medium">
                Default Lease Term (Months)
              </Label>
              <Input
                id="lease-term"
                type="number"
                value={landlordSettings.default_lease_term_months}
                onChange={(e) => handleSettingUpdate('default_lease_term_months', parseInt(e.target.value))}
                className="bg-white border-slate-200 focus:border-green-500"
                min="1"
                max="60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grace-period" className="text-slate-700 font-medium">
                Grace Period (Days)
              </Label>
              <Input
                id="grace-period"
                type="number"
                value={landlordSettings.grace_period_days}
                onChange={(e) => handleSettingUpdate('grace_period_days', parseInt(e.target.value))}
                className="bg-white border-slate-200 focus:border-green-500"
                min="0"
                max="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="late-fee" className="text-slate-700 font-medium">
                Late Fee Percentage (%)
              </Label>
              <Input
                id="late-fee"
                type="number"
                step="0.1"
                value={landlordSettings.late_fee_percentage}
                onChange={(e) => handleSettingUpdate('late_fee_percentage', parseFloat(e.target.value))}
                className="bg-white border-slate-200 focus:border-green-500"
                min="0"
                max="50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenance-budget" className="text-slate-700 font-medium">
                Maintenance Budget Limit (KES)
              </Label>
              <Input
                id="maintenance-budget"
                type="number"
                value={landlordSettings.maintenance_budget_limit}
                onChange={(e) => handleSettingUpdate('maintenance_budget_limit', parseInt(e.target.value))}
                className="bg-white border-slate-200 focus:border-green-500"
                min="0"
                step="1000"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="flex-1 pr-4">
              <Label className="text-slate-800 font-medium">Auto-Generate Invoices</Label>
              <p className="text-sm text-slate-600 mt-1">
                Automatically create rent invoices at the beginning of each month
              </p>
            </div>
            <Switch
              checked={landlordSettings.auto_generate_invoices}
              onCheckedChange={(checked) => handleSettingUpdate('auto_generate_invoices', checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tenant Management Settings */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            Tenant Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="flex-1 pr-4">
              <Label className="text-slate-800 font-medium">Require Tenant Verification</Label>
              <p className="text-sm text-slate-600 mt-1">
                Require ID verification before approving tenant applications
              </p>
            </div>
            <Switch
              checked={landlordSettings.require_tenant_verification}
              onCheckedChange={(checked) => handleSettingUpdate('require_tenant_verification', checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="flex-1 pr-4">
              <Label className="text-slate-800 font-medium">Auto-Approve Maintenance</Label>
              <p className="text-sm text-slate-600 mt-1">
                Automatically approve maintenance requests under budget limit
              </p>
            </div>
            <Switch
              checked={landlordSettings.auto_approve_maintenance}
              onCheckedChange={(checked) => handleSettingUpdate('auto_approve_maintenance', checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reporting Settings */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            Reports & Documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="report-day" className="text-slate-700 font-medium">
                Monthly Report Day
              </Label>
              <Input
                id="report-day"
                type="number"
                value={landlordSettings.financial_report_day}
                onChange={(e) => handleSettingUpdate('financial_report_day', parseInt(e.target.value))}
                className="bg-white border-slate-200 focus:border-green-500"
                min="1"
                max="28"
              />
              <p className="text-xs text-slate-500">Day of month to generate reports</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-format" className="text-slate-700 font-medium">
                Tax Document Format
              </Label>
              <Select
                value={landlordSettings.tax_document_format}
                onValueChange={(value) => handleSettingUpdate('tax_document_format', value)}
              >
                <SelectTrigger className="bg-white border-slate-200 focus:border-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="flex-1 pr-4">
              <Label className="text-slate-800 font-medium">Monthly Reports</Label>
              <p className="text-sm text-slate-600 mt-1">
                Automatically generate and email monthly financial reports
              </p>
            </div>
            <Switch
              checked={landlordSettings.monthly_report_enabled}
              onCheckedChange={(checked) => handleSettingUpdate('monthly_report_enabled', checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Communication Settings */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-orange-600" />
            </div>
            Communication Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="flex-1 pr-4">
              <Label className="text-slate-800 font-medium">Tenant Messages</Label>
              <p className="text-sm text-slate-600 mt-1">
                Receive notifications for messages from tenants
              </p>
            </div>
            <Switch
              checked={landlordSettings.tenant_message_notifications}
              onCheckedChange={(checked) => handleSettingUpdate('tenant_message_notifications', checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="flex-1 pr-4">
              <Label className="text-slate-800 font-medium">Maintenance Request Alerts</Label>
              <p className="text-sm text-slate-600 mt-1">
                Get immediate notifications for new maintenance requests
              </p>
            </div>
            <Switch
              checked={landlordSettings.maintenance_request_alerts}
              onCheckedChange={(checked) => handleSettingUpdate('maintenance_request_alerts', checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandlordSettings;
