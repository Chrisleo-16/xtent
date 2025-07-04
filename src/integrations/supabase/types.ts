export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      amenities: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          applicant_email: string
          applicant_name: string
          applicant_phone: string | null
          created_at: string
          employment_status: string | null
          id: string
          message: string | null
          monthly_income: number | null
          preferred_move_in_date: string | null
          property_id: string
          status: string
          updated_at: string
        }
        Insert: {
          applicant_email: string
          applicant_name: string
          applicant_phone?: string | null
          created_at?: string
          employment_status?: string | null
          id?: string
          message?: string | null
          monthly_income?: number | null
          preferred_move_in_date?: string | null
          property_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string | null
          created_at?: string
          employment_status?: string | null
          id?: string
          message?: string | null
          monthly_income?: number | null
          preferred_move_in_date?: string | null
          property_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          is_recurring: boolean | null
          maintenance_request_id: string | null
          priority: string
          property_id: string | null
          recurring_end_date: string | null
          recurring_frequency: string | null
          start_date: string
          tenant_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          is_recurring?: boolean | null
          maintenance_request_id?: string | null
          priority?: string
          property_id?: string | null
          recurring_end_date?: string | null
          recurring_frequency?: string | null
          start_date: string
          tenant_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          is_recurring?: boolean | null
          maintenance_request_id?: string | null
          priority?: string
          property_id?: string | null
          recurring_end_date?: string | null
          recurring_frequency?: string | null
          start_date?: string
          tenant_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_calendar_events_maintenance"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_calendar_events_property"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_calendar_events_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_channels: {
        Row: {
          created_at: string | null
          id: string
          landlord_id: string | null
          property_id: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          landlord_id?: string | null
          property_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          landlord_id?: string | null
          property_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_channels_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_channels_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_channels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          attachments: string[] | null
          created_at: string | null
          id: string
          is_read: boolean | null
          lease_id: string | null
          maintenance_request_id: string | null
          message: string
          property_id: string | null
          recipient_id: string | null
          sender_id: string | null
          subject: string | null
          type: Database["public"]["Enums"]["communication_type"] | null
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          lease_id?: string | null
          maintenance_request_id?: string | null
          message: string
          property_id?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
          type?: Database["public"]["Enums"]["communication_type"] | null
        }
        Update: {
          attachments?: string[] | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          lease_id?: string | null
          maintenance_request_id?: string | null
          message?: string
          property_id?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
          type?: Database["public"]["Enums"]["communication_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string
          id: string
          is_recurring: boolean | null
          landlord_id: string | null
          property_id: string | null
          receipt_url: string | null
          recurring_frequency: string | null
          vendor_name: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date: string
          description: string
          id?: string
          is_recurring?: boolean | null
          landlord_id?: string | null
          property_id?: string | null
          receipt_url?: string | null
          recurring_frequency?: string | null
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          is_recurring?: boolean | null
          landlord_id?: string | null
          property_id?: string | null
          receipt_url?: string | null
          recurring_frequency?: string | null
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      landlord_settings: {
        Row: {
          auto_approve_maintenance: boolean | null
          auto_generate_invoices: boolean | null
          created_at: string | null
          default_lease_term_months: number | null
          financial_report_day: number | null
          grace_period_days: number | null
          id: string
          late_fee_percentage: number | null
          maintenance_budget_limit: number | null
          maintenance_request_alerts: boolean | null
          monthly_report_enabled: boolean | null
          require_tenant_verification: boolean | null
          tax_document_format: string | null
          tenant_message_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_approve_maintenance?: boolean | null
          auto_generate_invoices?: boolean | null
          created_at?: string | null
          default_lease_term_months?: number | null
          financial_report_day?: number | null
          grace_period_days?: number | null
          id?: string
          late_fee_percentage?: number | null
          maintenance_budget_limit?: number | null
          maintenance_request_alerts?: boolean | null
          monthly_report_enabled?: boolean | null
          require_tenant_verification?: boolean | null
          tax_document_format?: string | null
          tenant_message_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_approve_maintenance?: boolean | null
          auto_generate_invoices?: boolean | null
          created_at?: string | null
          default_lease_term_months?: number | null
          financial_report_day?: number | null
          grace_period_days?: number | null
          id?: string
          late_fee_percentage?: number | null
          maintenance_budget_limit?: number | null
          maintenance_request_alerts?: boolean | null
          monthly_report_enabled?: boolean | null
          require_tenant_verification?: boolean | null
          tax_document_format?: string | null
          tenant_message_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      landlord_utility_questionnaires: {
        Row: {
          advance_notice_days: number | null
          billing_cycle: string
          completed_at: string | null
          created_at: string | null
          electricity_additional_charges: string[] | null
          electricity_billing_method: string
          electricity_provider: string | null
          electricity_shared_allocation_method: string | null
          electricity_token_management: string | null
          extra_charges_in_rent: string[] | null
          id: string
          included_utilities: string[] | null
          is_completed: boolean | null
          landlord_id: string
          late_payment_fee: number | null
          payment_due_day: number | null
          property_id: string
          service_charge_amount: number | null
          updated_at: string | null
          utilities_included_in_rent: boolean | null
          water_additional_charges: string[] | null
          water_bill_frequency: string | null
          water_billing_method: string
          water_service_provider_id: string | null
          water_shared_allocation_method: string | null
        }
        Insert: {
          advance_notice_days?: number | null
          billing_cycle: string
          completed_at?: string | null
          created_at?: string | null
          electricity_additional_charges?: string[] | null
          electricity_billing_method: string
          electricity_provider?: string | null
          electricity_shared_allocation_method?: string | null
          electricity_token_management?: string | null
          extra_charges_in_rent?: string[] | null
          id?: string
          included_utilities?: string[] | null
          is_completed?: boolean | null
          landlord_id: string
          late_payment_fee?: number | null
          payment_due_day?: number | null
          property_id: string
          service_charge_amount?: number | null
          updated_at?: string | null
          utilities_included_in_rent?: boolean | null
          water_additional_charges?: string[] | null
          water_bill_frequency?: string | null
          water_billing_method: string
          water_service_provider_id?: string | null
          water_shared_allocation_method?: string | null
        }
        Update: {
          advance_notice_days?: number | null
          billing_cycle?: string
          completed_at?: string | null
          created_at?: string | null
          electricity_additional_charges?: string[] | null
          electricity_billing_method?: string
          electricity_provider?: string | null
          electricity_shared_allocation_method?: string | null
          electricity_token_management?: string | null
          extra_charges_in_rent?: string[] | null
          id?: string
          included_utilities?: string[] | null
          is_completed?: boolean | null
          landlord_id?: string
          late_payment_fee?: number | null
          payment_due_day?: number | null
          property_id?: string
          service_charge_amount?: number | null
          updated_at?: string | null
          utilities_included_in_rent?: boolean | null
          water_additional_charges?: string[] | null
          water_bill_frequency?: string | null
          water_billing_method?: string
          water_service_provider_id?: string | null
          water_shared_allocation_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landlord_utility_questionnaires_water_service_provider_id_fkey"
            columns: ["water_service_provider_id"]
            isOneToOne: false
            referencedRelation: "water_service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          created_at: string | null
          deposit_amount: number
          end_date: string
          id: string
          landlord_id: string | null
          lease_terms: string | null
          monthly_rent: number
          property_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["lease_status"] | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deposit_amount: number
          end_date: string
          id?: string
          landlord_id?: string | null
          lease_terms?: string | null
          monthly_rent: number
          property_id?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["lease_status"] | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deposit_amount?: number
          end_date?: string
          id?: string
          landlord_id?: string | null
          lease_terms?: string | null
          monthly_rent?: number
          property_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["lease_status"] | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leases_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          completed_date: string | null
          created_at: string | null
          description: string
          estimated_cost: number | null
          id: string
          images: string[] | null
          landlord_id: string | null
          priority: string | null
          property_id: string | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["maintenance_status"] | null
          tenant_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          description: string
          estimated_cost?: number | null
          id?: string
          images?: string[] | null
          landlord_id?: string | null
          priority?: string | null
          property_id?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          tenant_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string
          estimated_cost?: number | null
          id?: string
          images?: string[] | null
          landlord_id?: string | null
          priority?: string | null
          property_id?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          landlord_id: string | null
          lease_id: string | null
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          payment_type: string
          status: Database["public"]["Enums"]["payment_status"] | null
          tenant_id: string | null
          transaction_reference: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          landlord_id?: string | null
          lease_id?: string | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_type?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          tenant_id?: string | null
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          landlord_id?: string | null
          lease_id?: string | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_type?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          tenant_id?: string | null
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          rejection_reason: string | null
          role: Database["public"]["Enums"]["user_role"]
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          bathrooms: number | null
          bedrooms: number | null
          caretaker_id: string | null
          created_at: string
          custom_type: string | null
          description: string | null
          id: string
          images: string[] | null
          is_single_unit: boolean | null
          landlord_id: string | null
          latitude: number | null
          longitude: number | null
          monthly_rent: number
          property_type_id: string | null
          size_sqft: number | null
          status: Database["public"]["Enums"]["property_status"] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          address: string
          bathrooms?: number | null
          bedrooms?: number | null
          caretaker_id?: string | null
          created_at?: string
          custom_type?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_single_unit?: boolean | null
          landlord_id?: string | null
          latitude?: number | null
          longitude?: number | null
          monthly_rent: number
          property_type_id?: string | null
          size_sqft?: number | null
          status?: Database["public"]["Enums"]["property_status"] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          address?: string
          bathrooms?: number | null
          bedrooms?: number | null
          caretaker_id?: string | null
          created_at?: string
          custom_type?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_single_unit?: boolean | null
          landlord_id?: string | null
          latitude?: number | null
          longitude?: number | null
          monthly_rent?: number
          property_type_id?: string | null
          size_sqft?: number | null
          status?: Database["public"]["Enums"]["property_status"] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_property_type_id_fkey"
            columns: ["property_type_id"]
            isOneToOne: false
            referencedRelation: "property_types"
            referencedColumns: ["id"]
          },
        ]
      }
      property_amenities: {
        Row: {
          amenity_id: string
          property_id: string
        }
        Insert: {
          amenity_id: string
          property_id: string
        }
        Update: {
          amenity_id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_amenities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_thumbnail: boolean | null
          property_id: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_thumbnail?: boolean | null
          property_id: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_thumbnail?: boolean | null
          property_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      recurring_bills: {
        Row: {
          amount: number
          auto_pay_enabled: boolean | null
          bill_category: string
          bill_name: string
          created_at: string
          frequency: string
          id: string
          is_active: boolean | null
          is_shared: boolean | null
          next_due_date: string
          property_id: string | null
          updated_at: string
          user_id: string
          vendor_account: string | null
          vendor_paybill: string | null
        }
        Insert: {
          amount: number
          auto_pay_enabled?: boolean | null
          bill_category: string
          bill_name: string
          created_at?: string
          frequency: string
          id?: string
          is_active?: boolean | null
          is_shared?: boolean | null
          next_due_date: string
          property_id?: string | null
          updated_at?: string
          user_id: string
          vendor_account?: string | null
          vendor_paybill?: string | null
        }
        Update: {
          amount?: number
          auto_pay_enabled?: boolean | null
          bill_category?: string
          bill_name?: string
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          is_shared?: boolean | null
          next_due_date?: string
          property_id?: string | null
          updated_at?: string
          user_id?: string
          vendor_account?: string | null
          vendor_paybill?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_bills_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_bills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_bill_splits: {
        Row: {
          allocated_amount: number
          created_at: string
          id: string
          payment_status: string | null
          recurring_bill_id: string
          split_percentage: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          allocated_amount: number
          created_at?: string
          id?: string
          payment_status?: string | null
          recurring_bill_id: string
          split_percentage?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          allocated_amount?: number
          created_at?: string
          id?: string
          payment_status?: string | null
          recurring_bill_id?: string
          split_percentage?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_bill_splits_recurring_bill_id_fkey"
            columns: ["recurring_bill_id"]
            isOneToOne: false
            referencedRelation: "recurring_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_bill_splits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenancies: {
        Row: {
          created_at: string
          id: string
          landlord_id: string
          lease_end_date: string
          lease_start_date: string
          lease_terms: string | null
          monthly_rent: number
          property_id: string
          security_deposit: number | null
          status: string
          tenant_id: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          landlord_id: string
          lease_end_date: string
          lease_start_date: string
          lease_terms?: string | null
          monthly_rent: number
          property_id: string
          security_deposit?: number | null
          status?: string
          tenant_id: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          landlord_id?: string
          lease_end_date?: string
          lease_start_date?: string
          lease_terms?: string | null
          monthly_rent?: number
          property_id?: string
          security_deposit?: number | null
          status?: string
          tenant_id?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenancies_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenancies_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_type: Database["public"]["Enums"]["invitation_type"]
          landlord_id: string
          lease_id: string | null
          name: string | null
          property_id: string
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invitation_type?: Database["public"]["Enums"]["invitation_type"]
          landlord_id: string
          lease_id?: string | null
          name?: string | null
          property_id: string
          status?: Database["public"]["Enums"]["invitation_status"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_type?: Database["public"]["Enums"]["invitation_type"]
          landlord_id?: string
          lease_id?: string | null
          name?: string | null
          property_id?: string
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invitations_accepted_by_user_id_fkey"
            columns: ["accepted_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_invitations_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_invitations_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_invitations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_settings: {
        Row: {
          auto_pay_enabled: boolean | null
          community_announcements: boolean | null
          created_at: string | null
          credit_limit_amount: number | null
          enable_rent_credit: boolean | null
          id: string
          landlord_message_notifications: boolean | null
          maintenance_photo_required: boolean | null
          maintenance_priority_notifications: boolean | null
          payment_method_preference: string | null
          payment_reminder_days: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_pay_enabled?: boolean | null
          community_announcements?: boolean | null
          created_at?: string | null
          credit_limit_amount?: number | null
          enable_rent_credit?: boolean | null
          id?: string
          landlord_message_notifications?: boolean | null
          maintenance_photo_required?: boolean | null
          maintenance_priority_notifications?: boolean | null
          payment_method_preference?: string | null
          payment_reminder_days?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_pay_enabled?: boolean | null
          community_announcements?: boolean | null
          created_at?: string | null
          credit_limit_amount?: number | null
          enable_rent_credit?: boolean | null
          id?: string
          landlord_message_notifications?: boolean | null
          maintenance_photo_required?: boolean | null
          maintenance_priority_notifications?: boolean | null
          payment_method_preference?: string | null
          payment_reminder_days?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tenant_utility_allocations: {
        Row: {
          allocated_amount: number
          allocation_method: string
          allocation_percentage: number | null
          created_at: string
          due_date: string
          id: string
          payment_status: string | null
          tenant_id: string
          unit_identifier: string
          units_consumed: number | null
          updated_at: string
          utility_bill_id: string
        }
        Insert: {
          allocated_amount: number
          allocation_method: string
          allocation_percentage?: number | null
          created_at?: string
          due_date: string
          id?: string
          payment_status?: string | null
          tenant_id: string
          unit_identifier: string
          units_consumed?: number | null
          updated_at?: string
          utility_bill_id: string
        }
        Update: {
          allocated_amount?: number
          allocation_method?: string
          allocation_percentage?: number | null
          created_at?: string
          due_date?: string
          id?: string
          payment_status?: string | null
          tenant_id?: string
          unit_identifier?: string
          units_consumed?: number | null
          updated_at?: string
          utility_bill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_utility_allocations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_utility_allocations_utility_bill_id_fkey"
            columns: ["utility_bill_id"]
            isOneToOne: false
            referencedRelation: "utility_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          max_occupancy: number | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          max_occupancy?: number | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          max_occupancy?: number | null
          name?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          created_at: string | null
          id: string
          monthly_rent: number | null
          property_id: string
          rent_amount: number | null
          status: string | null
          unit_number: string
          unit_type_id: string
          updated_at: string | null
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          id?: string
          monthly_rent?: number | null
          property_id: string
          rent_amount?: number | null
          status?: string | null
          unit_number: string
          unit_type_id: string
          updated_at?: string | null
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          id?: string
          monthly_rent?: number | null
          property_id?: string
          rent_amount?: number | null
          status?: string | null
          unit_number?: string
          unit_type_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_unit_type_id_fkey"
            columns: ["unit_type_id"]
            isOneToOne: false
            referencedRelation: "unit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          currency: string | null
          dark_mode: boolean | null
          email_notifications: boolean | null
          id: string
          language: string | null
          maintenance_updates: boolean | null
          marketing_emails: boolean | null
          payment_reminders: boolean | null
          sms_notifications: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          dark_mode?: boolean | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          maintenance_updates?: boolean | null
          marketing_emails?: boolean | null
          payment_reminders?: boolean | null
          sms_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          dark_mode?: boolean | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          maintenance_updates?: boolean | null
          marketing_emails?: boolean | null
          payment_reminders?: boolean | null
          sms_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      utility_bills: {
        Row: {
          bill_image_url: string | null
          bill_reference: string | null
          billing_period_end: string
          billing_period_start: string
          created_at: string
          id: string
          landlord_id: string
          payment_status: string | null
          property_id: string
          provider_name: string
          total_amount: number
          total_units_consumed: number | null
          updated_at: string
          utility_type: string
        }
        Insert: {
          bill_image_url?: string | null
          bill_reference?: string | null
          billing_period_end: string
          billing_period_start: string
          created_at?: string
          id?: string
          landlord_id: string
          payment_status?: string | null
          property_id: string
          provider_name: string
          total_amount: number
          total_units_consumed?: number | null
          updated_at?: string
          utility_type: string
        }
        Update: {
          bill_image_url?: string | null
          bill_reference?: string | null
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string
          id?: string
          landlord_id?: string
          payment_status?: string | null
          property_id?: string
          provider_name?: string
          total_amount?: number
          total_units_consumed?: number | null
          updated_at?: string
          utility_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "utility_bills_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utility_bills_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      utility_meters: {
        Row: {
          created_at: string
          current_reading: number
          id: string
          meter_number: string | null
          previous_reading: number
          property_id: string
          reading_date: string
          reading_image_url: string | null
          tenant_id: string | null
          unit_identifier: string
          units_consumed: number | null
          updated_at: string
          utility_type: string
        }
        Insert: {
          created_at?: string
          current_reading?: number
          id?: string
          meter_number?: string | null
          previous_reading?: number
          property_id: string
          reading_date: string
          reading_image_url?: string | null
          tenant_id?: string | null
          unit_identifier: string
          units_consumed?: number | null
          updated_at?: string
          utility_type: string
        }
        Update: {
          created_at?: string
          current_reading?: number
          id?: string
          meter_number?: string | null
          previous_reading?: number
          property_id?: string
          reading_date?: string
          reading_image_url?: string | null
          tenant_id?: string | null
          unit_identifier?: string
          units_consumed?: number | null
          updated_at?: string
          utility_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "utility_meters_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utility_meters_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      utility_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_date: string
          payment_method: string | null
          receipt_url: string | null
          recurring_bill_id: string | null
          shared_bill_split_id: string | null
          tenant_id: string
          transaction_reference: string | null
          utility_allocation_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_date?: string
          payment_method?: string | null
          receipt_url?: string | null
          recurring_bill_id?: string | null
          shared_bill_split_id?: string | null
          tenant_id: string
          transaction_reference?: string | null
          utility_allocation_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_date?: string
          payment_method?: string | null
          receipt_url?: string | null
          recurring_bill_id?: string | null
          shared_bill_split_id?: string | null
          tenant_id?: string
          transaction_reference?: string | null
          utility_allocation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "utility_payments_recurring_bill_id_fkey"
            columns: ["recurring_bill_id"]
            isOneToOne: false
            referencedRelation: "recurring_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utility_payments_shared_bill_split_id_fkey"
            columns: ["shared_bill_split_id"]
            isOneToOne: false
            referencedRelation: "shared_bill_splits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utility_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utility_payments_utility_allocation_id_fkey"
            columns: ["utility_allocation_id"]
            isOneToOne: false
            referencedRelation: "tenant_utility_allocations"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_documents: {
        Row: {
          created_at: string
          document_type: string
          file_path: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_path: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_path?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      water_service_providers: {
        Row: {
          account_format: string | null
          code: string
          contact_email: string | null
          contact_phone: string | null
          county: string
          coverage_areas: string[] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          paybill_number: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          account_format?: string | null
          code: string
          contact_email?: string | null
          contact_phone?: string | null
          county: string
          coverage_areas?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          paybill_number?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          account_format?: string | null
          code?: string
          contact_email?: string | null
          contact_phone?: string | null
          county?: string
          coverage_areas?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          paybill_number?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_rent_due_events: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_property_and_related: {
        Args: { prop_id: string }
        Returns: undefined
      }
      generate_monthly_rent_payments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_landlord_questionnaire: {
        Args: { p_property_id: string }
        Returns: {
          advance_notice_days: number | null
          billing_cycle: string
          completed_at: string | null
          created_at: string | null
          electricity_additional_charges: string[] | null
          electricity_billing_method: string
          electricity_provider: string | null
          electricity_shared_allocation_method: string | null
          electricity_token_management: string | null
          extra_charges_in_rent: string[] | null
          id: string
          included_utilities: string[] | null
          is_completed: boolean | null
          landlord_id: string
          late_payment_fee: number | null
          payment_due_day: number | null
          property_id: string
          service_charge_amount: number | null
          updated_at: string | null
          utilities_included_in_rent: boolean | null
          water_additional_charges: string[] | null
          water_bill_frequency: string | null
          water_billing_method: string
          water_service_provider_id: string | null
          water_shared_allocation_method: string | null
        }[]
      }
      get_user_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      request_verification: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      upsert_landlord_questionnaire: {
        Args: { p_data: Json }
        Returns: string
      }
      user_has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      amenity_type:
        | "parking"
        | "gym"
        | "balcony"
        | "garden"
        | "swimming_pool"
        | "lift"
        | "security"
        | "wifi"
        | "laundry"
        | "water_tank"
      communication_type:
        | "message"
        | "complaint"
        | "maintenance_request"
        | "payment_reminder"
        | "notice"
      invitation_status: "pending" | "accepted" | "expired"
      invitation_type: "tenant" | "caretaker"
      lease_status: "active" | "pending" | "expired" | "terminated" | "draft"
      maintenance_status: "pending" | "in_progress" | "completed" | "cancelled"
      payment_status: "pending" | "paid" | "overdue" | "failed" | "refunded"
      property_status: "available" | "occupied" | "maintenance" | "unavailable"
      user_role: "landlord" | "tenant" | "caretaker" | "vendor" | "admin"
      verification_status: "unverified" | "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      amenity_type: [
        "parking",
        "gym",
        "balcony",
        "garden",
        "swimming_pool",
        "lift",
        "security",
        "wifi",
        "laundry",
        "water_tank",
      ],
      communication_type: [
        "message",
        "complaint",
        "maintenance_request",
        "payment_reminder",
        "notice",
      ],
      invitation_status: ["pending", "accepted", "expired"],
      invitation_type: ["tenant", "caretaker"],
      lease_status: ["active", "pending", "expired", "terminated", "draft"],
      maintenance_status: ["pending", "in_progress", "completed", "cancelled"],
      payment_status: ["pending", "paid", "overdue", "failed", "refunded"],
      property_status: ["available", "occupied", "maintenance", "unavailable"],
      user_role: ["landlord", "tenant", "caretaker", "vendor", "admin"],
      verification_status: ["unverified", "pending", "verified", "rejected"],
    },
  },
} as const
