
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LandlordUtilityQuestionnaireData {
  id?: string;
  landlord_id?: string;
  property_id: string;
  water_billing_method: string;
  water_service_provider_id?: string;
  water_shared_allocation_method?: string;
  water_bill_frequency?: string;
  water_additional_charges?: string[];
  electricity_billing_method: string;
  electricity_provider?: string;
  electricity_shared_allocation_method?: string;
  electricity_token_management?: string;
  electricity_additional_charges?: string[];
  utilities_included_in_rent: boolean;
  included_utilities?: string[];
  extra_charges_in_rent?: string[];
  service_charge_amount?: number;
  billing_cycle: string;
  payment_due_day?: number;
  late_payment_fee?: number;
  advance_notice_days?: number;
  is_completed?: boolean;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export const useLandlordUtilityQuestionnaire = (propertyId: string) => {
  return useQuery({
    queryKey: ['landlord-utility-questionnaire', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_landlord_questionnaire', { p_property_id: propertyId });

      if (error) {
        console.error('Error fetching questionnaire:', error);
        return null;
      }

      return data?.[0] as LandlordUtilityQuestionnaireData || null;
    },
    enabled: !!propertyId,
  });
};

export const useCreateOrUpdateQuestionnaire = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<LandlordUtilityQuestionnaireData>) => {
      const { error } = await supabase
        .rpc('upsert_landlord_questionnaire', {
          p_data: data
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Utility questionnaire saved successfully!');
      queryClient.invalidateQueries({
        queryKey: ['landlord-utility-questionnaire']
      });
    },
    onError: (error) => {
      console.error('Error saving questionnaire:', error);
      toast.error('Failed to save questionnaire. Please try again.');
    },
  });
};
