
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface PropertyApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  onSuccess?: () => void;
}

const PropertyApplicationModal: React.FC<PropertyApplicationModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  onSuccess
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    applicant_name: user?.user_metadata?.name || '',
    applicant_email: user?.email || '',
    applicant_phone: '',
    employment_status: '',
    monthly_income: '',
    preferred_move_in_date: '',
    message: ''
  });

  const submitApplication = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('applications')
        .insert({
          property_id: propertyId,
          applicant_name: data.applicant_name,
          applicant_email: data.applicant_email,
          applicant_phone: data.applicant_phone,
          employment_status: data.employment_status,
          monthly_income: data.monthly_income ? parseInt(data.monthly_income) : null,
          preferred_move_in_date: data.preferred_move_in_date || null,
          message: data.message,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-application'] });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      console.error('Application submission error:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.applicant_name || !formData.applicant_email) {
      toast.error('Please fill in required fields');
      return;
    }

    submitApplication.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for {propertyTitle}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="applicant_name">Full Name *</Label>
            <Input
              id="applicant_name"
              value={formData.applicant_name}
              onChange={(e) => handleInputChange('applicant_name', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="applicant_email">Email *</Label>
            <Input
              id="applicant_email"
              type="email"
              value={formData.applicant_email}
              onChange={(e) => handleInputChange('applicant_email', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="applicant_phone">Phone Number</Label>
            <Input
              id="applicant_phone"
              value={formData.applicant_phone}
              onChange={(e) => handleInputChange('applicant_phone', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="employment_status">Employment Status</Label>
            <Input
              id="employment_status"
              value={formData.employment_status}
              onChange={(e) => handleInputChange('employment_status', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="monthly_income">Monthly Income (KES)</Label>
            <Input
              id="monthly_income"
              type="number"
              value={formData.monthly_income}
              onChange={(e) => handleInputChange('monthly_income', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="preferred_move_in_date">Preferred Move-in Date</Label>
            <Input
              id="preferred_move_in_date"
              type="date"
              value={formData.preferred_move_in_date}
              onChange={(e) => handleInputChange('preferred_move_in_date', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Tell us why you'd be a great tenant..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitApplication.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitApplication.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyApplicationModal;
