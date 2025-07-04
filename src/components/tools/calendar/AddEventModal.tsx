

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useCreateEvent } from '@/hooks/useCalendarEvents';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to get next occurrence of a specific day
const getNextDayOfWeek = (dayOfWeek: number): string => {
  const today = new Date();
  const resultDate = new Date(today);
  const days = (dayOfWeek + 7 - today.getDay()) % 7;
  resultDate.setDate(today.getDate() + (days === 0 ? 7 : days));
  
  // Format as datetime-local string
  const year = resultDate.getFullYear();
  const month = String(resultDate.getMonth() + 1).padStart(2, '0');
  const day = String(resultDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}T09:00`;
};

// Predefined event templates
const eventTemplates = {
  garbage: {
    title: 'Garbage Collection',
    description: 'Weekly garbage collection',
    event_type: 'other',
    priority: 'medium',
    is_recurring: true,
    recurring_frequency: 'weekly',
    suggested_date: () => getNextDayOfWeek(5), // Friday (0=Sunday, 5=Friday)
  },
  rent: {
    title: 'Rent Collection',
    description: 'Monthly rent collection',
    event_type: 'rent',
    priority: 'high',
    is_recurring: true,
    recurring_frequency: 'monthly',
    suggested_date: () => {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01T09:00`;
    },
  },
  maintenance: {
    title: 'Property Maintenance',
    description: 'Scheduled property maintenance',
    event_type: 'maintenance',
    priority: 'medium',
    is_recurring: false,
    recurring_frequency: '',
    suggested_date: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}T10:00`;
    },
  },
  inspection: {
    title: 'Property Inspection',
    description: 'Quarterly property inspection',
    event_type: 'inspection',
    priority: 'high',
    is_recurring: true,
    recurring_frequency: 'monthly',
    suggested_date: () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}T14:00`;
    },
  }
};

export const AddEventModal = ({ isOpen, onClose }: AddEventModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    event_type: 'other',
    priority: 'medium',
    property_id: '',
    tenant_id: '',
    is_recurring: false,
    recurring_frequency: ''
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const createEventMutation = useCreateEvent();

  // Fetch user's properties for the dropdown
  const { data: properties } = useQuery({
    queryKey: ['user-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('id, title')
        .eq('landlord_id', user.id)
        .order('title');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch tenants for the selected property
  const { data: tenants } = useQuery({
    queryKey: ['property-tenants', formData.property_id],
    queryFn: async () => {
      if (!formData.property_id || formData.property_id === 'none') return [];
      
      // First get tenancies for the property
      const { data: tenancyData, error: tenancyError } = await supabase
        .from('tenancies')
        .select('tenant_id')
        .eq('property_id', formData.property_id)
        .eq('status', 'active');

      if (tenancyError) throw tenancyError;
      
      if (!tenancyData || tenancyData.length === 0) return [];

      // Then get profile information for these tenants
      const tenantIds = tenancyData.map(t => t.tenant_id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', tenantIds);

      if (profileError) throw profileError;

      return profileData?.map(profile => ({
        id: profile.id,
        name: profile.name || profile.email || 'Unknown',
        email: profile.email || ''
      })) || [];
    },
    enabled: !!formData.property_id && formData.property_id !== 'none'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.start_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required fields (Title and Start Date).",
        variant: "destructive"
      });
      return;
    }

    try {
      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        event_type: formData.event_type,
        priority: formData.priority,
        property_id: formData.property_id || undefined,
        tenant_id: formData.tenant_id || undefined,
        is_recurring: formData.is_recurring,
        recurring_frequency: formData.is_recurring ? formData.recurring_frequency : undefined
      };

      console.log('Creating calendar event:', eventData);
      
      await createEventMutation.mutateAsync(eventData);
      
      toast({
        title: "Event Created",
        description: "Your calendar event has been created successfully.",
      });
      
      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        event_type: 'other',
        priority: 'medium',
        property_id: '',
        tenant_id: '',
        is_recurring: false,
        recurring_frequency: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create the event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (templateKey: string) => {
    const template = eventTemplates[templateKey as keyof typeof eventTemplates];
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: template.title,
        description: template.description,
        event_type: template.event_type,
        priority: template.priority,
        is_recurring: template.is_recurring,
        recurring_frequency: template.recurring_frequency,
        start_date: template.suggested_date(),
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Templates */}
          <div>
            <Label>Quick Templates</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTemplateSelect('garbage')}
                className="text-xs"
              >
                🗑️ Garbage (Friday)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTemplateSelect('rent')}
                className="text-xs"
              >
                💰 Rent Collection
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTemplateSelect('maintenance')}
                className="text-xs"
              >
                🔧 Maintenance
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTemplateSelect('inspection')}
                className="text-xs"
              >
                🏠 Inspection
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Event title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Event description (optional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_type">Event Type</Label>
              <Select value={formData.event_type} onValueChange={(value) => handleInputChange('event_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Rent Collection</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inspection">Property Inspection</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="property_id">Property (Optional)</Label>
            <Select value={formData.property_id} onValueChange={(value) => handleInputChange('property_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Property</SelectItem>
                {properties?.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.property_id && formData.property_id !== 'none' && tenants && tenants.length > 0 && (
            <div>
              <Label htmlFor="tenant_id">Tenant (Optional)</Label>
              <Select value={formData.tenant_id} onValueChange={(value) => handleInputChange('tenant_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Tenant</SelectItem>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="is_recurring"
              checked={formData.is_recurring}
              onCheckedChange={(checked) => handleInputChange('is_recurring', checked)}
            />
            <Label htmlFor="is_recurring">Recurring Event</Label>
          </div>

          {formData.is_recurring && (
            <div>
              <Label htmlFor="recurring_frequency">Frequency</Label>
              <Select value={formData.recurring_frequency} onValueChange={(value) => handleInputChange('recurring_frequency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEventMutation.isPending}>
              {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

