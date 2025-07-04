
export interface UniversalSettings {
  dark_mode: boolean;
  language: string;
  currency: string;
  timezone: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  payment_reminders: boolean;
  maintenance_updates: boolean;
  marketing_emails: boolean;
}

export interface TenantSettings {
  payment_reminder_days: number;
  auto_pay_enabled: boolean;
  payment_method_preference: string;
  maintenance_priority_notifications: boolean;
  maintenance_photo_required: boolean;
  landlord_message_notifications: boolean;
  community_announcements: boolean;
  enable_rent_credit: boolean;
  credit_limit_amount: number;
}

export interface LandlordSettings {
  default_lease_term_months: number;
  auto_generate_invoices: boolean;
  late_fee_percentage: number;
  grace_period_days: number;
  require_tenant_verification: boolean;
  auto_approve_maintenance: boolean;
  maintenance_budget_limit: number;
  monthly_report_enabled: boolean;
  financial_report_day: number;
  tax_document_format: string;
  tenant_message_notifications: boolean;
  maintenance_request_alerts: boolean;
}

export interface SettingsContextType {
  universalSettings: UniversalSettings | null;
  tenantSettings: TenantSettings | null;
  landlordSettings: LandlordSettings | null;
  isLoading: boolean;
  updateUniversalSettings: (updates: Partial<UniversalSettings>) => Promise<void>;
  updateTenantSettings: (updates: Partial<TenantSettings>) => Promise<void>;
  updateLandlordSettings: (updates: Partial<LandlordSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}
