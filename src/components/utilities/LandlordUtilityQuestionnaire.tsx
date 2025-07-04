
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useWaterServiceProviders } from '@/hooks/useWaterServiceProviders';
import { 
  useLandlordUtilityQuestionnaire, 
  useCreateOrUpdateQuestionnaire, 
  type LandlordUtilityQuestionnaireData 
} from '@/hooks/useLandlordUtilityQuestionnaire';
import { useTranslation } from '@/hooks/useTranslation';

interface LandlordUtilityQuestionnaireProps {
  propertyId: string;
}

const utilityOptions = [
  'water', 'electricity', 'internet', 'cable_tv', 'security', 'garbage_collection', 'cleaning', 'maintenance'
];

const extraChargeOptions = [
  'service_charge', 'parking', 'gym', 'pool', 'security_deposit', 'cleaning_fee', 'maintenance_reserve'
];

export const LandlordUtilityQuestionnaire = ({ propertyId }: LandlordUtilityQuestionnaireProps) => {
  const { t } = useTranslation('utilities');
  const { data: waterProviders } = useWaterServiceProviders();
  const { data: existingQuestionnaire } = useLandlordUtilityQuestionnaire(propertyId);
  const createOrUpdateMutation = useCreateOrUpdateQuestionnaire();
  
  const [additionalWaterCharges, setAdditionalWaterCharges] = useState<string[]>(
    existingQuestionnaire?.water_additional_charges || []
  );
  const [additionalElectricityCharges, setAdditionalElectricityCharges] = useState<string[]>(
    existingQuestionnaire?.electricity_additional_charges || []
  );

  const form = useForm<Partial<LandlordUtilityQuestionnaireData>>({
    defaultValues: {
      property_id: propertyId,
      water_billing_method: existingQuestionnaire?.water_billing_method || 'individual_meters',
      electricity_billing_method: existingQuestionnaire?.electricity_billing_method || 'individual_meters',
      utilities_included_in_rent: existingQuestionnaire?.utilities_included_in_rent || false,
      billing_cycle: existingQuestionnaire?.billing_cycle || 'monthly',
      advance_notice_days: existingQuestionnaire?.advance_notice_days || 7,
      electricity_provider: existingQuestionnaire?.electricity_provider || 'KPLC',
      ...existingQuestionnaire,
    },
  });

  const onSubmit = async (data: Partial<LandlordUtilityQuestionnaireData>) => {
    const submissionData = {
      ...data,
      property_id: propertyId,
      water_additional_charges: additionalWaterCharges,
      electricity_additional_charges: additionalElectricityCharges,
    };

    createOrUpdateMutation.mutate(submissionData);
  };

  const addWaterCharge = (charge: string) => {
    if (!additionalWaterCharges.includes(charge)) {
      setAdditionalWaterCharges([...additionalWaterCharges, charge]);
    }
  };

  const removeWaterCharge = (charge: string) => {
    setAdditionalWaterCharges(additionalWaterCharges.filter(c => c !== charge));
  };

  const addElectricityCharge = (charge: string) => {
    if (!additionalElectricityCharges.includes(charge)) {
      setAdditionalElectricityCharges([...additionalElectricityCharges, charge]);
    }
  };

  const removeElectricityCharge = (charge: string) => {
    setAdditionalElectricityCharges(additionalElectricityCharges.filter(c => c !== charge));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t('utility_management_questionnaire', 'Utility Management Questionnaire')}</CardTitle>
        <CardDescription>
          {t('questionnaire_description', 'Help us understand how you manage utilities in your property to provide better billing and management features.')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Water Management Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{t('water_management', 'Water Management')}</h3>
              </div>
              
              <FormField
                control={form.control}
                name="water_billing_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('water_billing_method', 'How do you handle water billing?')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual_meters">{t('individual_meters', 'Individual Meters')}</SelectItem>
                        <SelectItem value="shared_meter">{t('shared_meter', 'Shared Meter')}</SelectItem>
                        <SelectItem value="fixed_rate">{t('fixed_rate', 'Fixed Rate')}</SelectItem>
                        <SelectItem value="included_in_rent">{t('included_in_rent', 'Included in Rent')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="water_service_provider_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('water_service_provider', 'Water Service Provider')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('select_provider', 'Select a provider')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {waterProviders?.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name} ({provider.county})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('water_billing_method') === 'shared_meter' && (
                <FormField
                  control={form.control}
                  name="water_shared_allocation_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('water_allocation_method', 'How do you split shared water bills?')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="equal_split">{t('equal_split', 'Equal Split')}</SelectItem>
                          <SelectItem value="per_room">{t('per_room', 'Per Room')}</SelectItem>
                          <SelectItem value="per_occupant">{t('per_occupant', 'Per Occupant')}</SelectItem>
                          <SelectItem value="square_footage">{t('square_footage', 'By Square Footage')}</SelectItem>
                          <SelectItem value="custom">{t('custom', 'Custom Method')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div>
                <FormLabel>{t('water_additional_charges', 'Additional Water-Related Charges')}</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  {additionalWaterCharges.map((charge) => (
                    <Badge key={charge} variant="secondary" className="flex items-center gap-1">
                      {charge}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeWaterCharge(charge)} />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addWaterCharge}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('add_charge', 'Add additional charge')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="connection_fee">{t('connection_fee', 'Connection Fee')}</SelectItem>
                    <SelectItem value="meter_rent">{t('meter_rent', 'Meter Rent')}</SelectItem>
                    <SelectItem value="maintenance_fee">{t('maintenance_fee', 'Maintenance Fee')}</SelectItem>
                    <SelectItem value="reconnection_fee">{t('reconnection_fee', 'Reconnection Fee')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Electricity Management Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">{t('electricity_management', 'Electricity Management')}</h3>
              
              <FormField
                control={form.control}
                name="electricity_billing_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('electricity_billing_method', 'How do you handle electricity billing?')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual_meters">{t('individual_meters', 'Individual Meters')}</SelectItem>
                        <SelectItem value="shared_meter">{t('shared_meter', 'Shared Meter')}</SelectItem>
                        <SelectItem value="prepaid_tokens">{t('prepaid_tokens', 'Prepaid Tokens')}</SelectItem>
                        <SelectItem value="fixed_rate">{t('fixed_rate', 'Fixed Rate')}</SelectItem>
                        <SelectItem value="included_in_rent">{t('included_in_rent', 'Included in Rent')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('electricity_billing_method') === 'prepaid_tokens' && (
                <FormField
                  control={form.control}
                  name="electricity_token_management"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('token_management', 'How are electricity tokens managed?')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="landlord_purchases">{t('landlord_purchases', 'Landlord Purchases')}</SelectItem>
                          <SelectItem value="tenant_individual">{t('tenant_individual', 'Tenant Individual Purchase')}</SelectItem>
                          <SelectItem value="tenant_contribution">{t('tenant_contribution', 'Tenant Contribution')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div>
                <FormLabel>{t('electricity_additional_charges', 'Additional Electricity-Related Charges')}</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  {additionalElectricityCharges.map((charge) => (
                    <Badge key={charge} variant="secondary" className="flex items-center gap-1">
                      {charge}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeElectricityCharge(charge)} />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addElectricityCharge}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('add_charge', 'Add additional charge')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="connection_fee">{t('connection_fee', 'Connection Fee')}</SelectItem>
                    <SelectItem value="meter_rent">{t('meter_rent', 'Meter Rent')}</SelectItem>
                    <SelectItem value="power_factor_penalty">{t('power_factor_penalty', 'Power Factor Penalty')}</SelectItem>
                    <SelectItem value="reconnection_fee">{t('reconnection_fee', 'Reconnection Fee')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Rent Structure Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">{t('rent_structure', 'Rent Structure & Additional Charges')}</h3>
              
              <FormField
                control={form.control}
                name="utilities_included_in_rent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t('utilities_included', 'Some utilities are included in rent')}</FormLabel>
                      <FormDescription>
                        {t('utilities_included_desc', 'Check this if any utilities are included in the monthly rent')}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch('utilities_included_in_rent') && (
                <FormField
                  control={form.control}
                  name="included_utilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('included_utilities_list', 'Which utilities are included?')}</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {utilityOptions.map((utility) => (
                          <div key={utility} className="flex items-center space-x-2">
                            <Checkbox
                              id={utility}
                              checked={field.value?.includes(utility) || false}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current, utility]);
                                } else {
                                  field.onChange(current.filter(u => u !== utility));
                                }
                              }}
                            />
                            <label htmlFor={utility} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {t(utility, utility.replace('_', ' '))}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="service_charge_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('service_charge', 'Monthly Service Charge (KES)')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) * 100)} // Convert to cents
                        value={field.value ? field.value / 100 : ''} // Convert from cents
                      />
                    </FormControl>
                    <FormDescription>
                      {t('service_charge_desc', 'Any fixed monthly service charge for property maintenance, security, etc.')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* General Management Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">{t('general_management', 'General Management Preferences')}</h3>
              
              <FormField
                control={form.control}
                name="billing_cycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('billing_cycle', 'Billing Cycle')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">{t('monthly', 'Monthly')}</SelectItem>
                        <SelectItem value="quarterly">{t('quarterly', 'Quarterly')}</SelectItem>
                        <SelectItem value="semi_annual">{t('semi_annual', 'Semi-Annual')}</SelectItem>
                        <SelectItem value="annual">{t('annual', 'Annual')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="payment_due_day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('payment_due_day', 'Payment Due Day')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="31" 
                          placeholder="1" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('payment_due_day_desc', 'Day of the month when payments are due')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="late_payment_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('late_payment_fee', 'Late Payment Fee (KES)')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) * 100)} // Convert to cents
                          value={field.value ? field.value / 100 : ''} // Convert from cents
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="advance_notice_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('advance_notice_days', 'Advance Notice (Days)')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          placeholder="7" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('advance_notice_desc', 'Days before due date to send payment reminders')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="submit" disabled={createOrUpdateMutation.isPending}>
                {createOrUpdateMutation.isPending ? t('saving', 'Saving...') : t('save_questionnaire', 'Save Questionnaire')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
