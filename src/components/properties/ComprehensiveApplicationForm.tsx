
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Mail, Phone, MessageSquare, X, User } from 'lucide-react';
import { toast } from 'sonner';

interface ComprehensiveApplicationFormProps {
  propertyId: string;
  propertyTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  moveInDate: string;
  message: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  moveInDate?: string;
  agreeToTerms?: string;
}

const ComprehensiveApplicationForm = ({ 
  propertyId, 
  propertyTitle, 
  onClose, 
  onSuccess 
}: ComprehensiveApplicationFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<FormData>({
    fullName: user?.user_metadata?.name || user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    moveInDate: '',
    message: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const applicationMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase
        .from('applications')
        .insert({
          property_id: propertyId,
          applicant_name: data.fullName,
          applicant_email: data.email,
          applicant_phone: data.phone,
          message: data.message,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-application', propertyId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tenant-applications', user?.id] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to submit application: ${error.message}`);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.moveInDate) {
      newErrors.moveInDate = 'Preferred move-in date is required';
    } else if (new Date(formData.moveInDate) < new Date()) {
      newErrors.moveInDate = 'Move-in date must be today or later';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    applicationMutation.mutate(formData);
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="shadow-lg border-green-200">
      <CardHeader className="bg-green-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-800 flex items-center gap-2">
            <User className="h-5 w-5" />
            Apply for {propertyTitle}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name *
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && (
              <p className="text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              readOnly
              className="bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">
              This email is linked to your account and cannot be changed
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+254 712 345 678"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Preferred Move-in Date */}
          <div className="space-y-2">
            <Label htmlFor="moveInDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Preferred Move-in Date *
            </Label>
            <Input
              id="moveInDate"
              type="date"
              value={formData.moveInDate}
              onChange={(e) => handleChange('moveInDate', e.target.value)}
              min={today}
              className={errors.moveInDate ? 'border-red-500' : ''}
            />
            {errors.moveInDate && (
              <p className="text-sm text-red-600">{errors.moveInDate}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Message / Notes (Optional)
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Tell the landlord why you're interested in this property, any special requirements, or questions you might have..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Terms Agreement */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleChange('agreeToTerms', !!checked)}
                className={errors.agreeToTerms ? 'border-red-500' : ''}
              />
              <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                I agree to the{' '}
                <a href="/terms" className="text-green-600 hover:underline" target="_blank">
                  terms and conditions
                </a>
                {' '}and{' '}
                <a href="/privacy" className="text-green-600 hover:underline" target="_blank">
                  privacy policy
                </a>
                {' '}*
              </Label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={applicationMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {applicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ComprehensiveApplicationForm;
