
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import LoadingFallback from '@/components/LoadingFallback';

const PropertyApplication = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    phone: '',
    message: ''
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/auth?redirect=/property/${id}/apply`);
    }
  }, [user, authLoading, navigate, id]);

  // Fetch property details
  const { data: property, isLoading: propertyLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      if (!id) throw new Error('Property ID is required');
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_types(name),
          landlord:profiles!properties_landlord_id_fkey(name, verification_status)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  // Check if user has already applied
  const { data: existingApplication, isLoading: applicationLoading } = useQuery({
    queryKey: ['user-application', id, user?.id],
    queryFn: async () => {
      if (!user?.id || !id) return null;
      
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('property_id', id)
        .eq('applicant_email', user.email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id && !!id,
  });

  // Get user profile for phone prefill
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Prefill phone number from profile
  useEffect(() => {
    if (profile?.phone && !formData.phone) {
      setFormData(prev => ({ ...prev, phone: profile.phone }));
    }
  }, [profile, formData.phone]);

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async () => {
      if (!user?.email || !id || !property?.landlord_id) {
        throw new Error('Missing required data for application submission');
      }
      
      console.log('Submitting application for property:', id);
      console.log('Property landlord_id:', property.landlord_id);
      console.log('User data:', { email: user.email, name: user.user_metadata?.name });
      
      const applicationData = {
        property_id: id,
        applicant_name: user.user_metadata?.name || user.user_metadata?.full_name || user.email.split('@')[0],
        applicant_email: user.email,
        applicant_phone: formData.phone.trim(),
        message: formData.message.trim() || null,
        status: 'pending'
      };

      console.log('Application data to insert:', applicationData);

      const { data, error } = await supabase
        .from('applications')
        .insert([applicationData])
        .select(`
          *,
          properties!inner(
            id,
            title,
            address,
            landlord_id
          )
        `);
      
      if (error) {
        console.error('Application submission error:', error);
        throw error;
      }

      console.log('Application submitted successfully:', data);
      return data[0];
    },
    onSuccess: (data) => {
      console.log('Application submission success callback:', data);
      toast.success('Application submitted successfully!', {
        description: 'The property owner will review your application and get back to you.'
      });
      
      // Invalidate multiple query keys to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: ['user-application', id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['applications', id] });
      queryClient.invalidateQueries({ queryKey: ['property-applications', id] });
      queryClient.invalidateQueries({ queryKey: ['landlord-applications', data?.properties?.landlord_id] });
      queryClient.invalidateQueries({ queryKey: ['tenant-applications'] });
      
      // Force refetch for landlord applications to ensure immediate visibility
      if (data?.properties?.landlord_id) {
        queryClient.refetchQueries({ 
          queryKey: ['landlord-applications', data.properties.landlord_id] 
        });
      }
    },
    onError: (error) => {
      console.error('Application submission error:', error);
      toast.error('Failed to submit application', {
        description: error.message || 'Please try again or contact support if the problem persists.'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }
    
    // Validate phone number format (basic validation)
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      toast.error('Please enter a valid Kenyan phone number');
      return;
    }
    
    console.log('Form validation passed, submitting application...');
    submitApplicationMutation.mutate();
  };

  if (authLoading || propertyLoading || applicationLoading) {
    return <LoadingFallback message="Loading application..." />;
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
              <p className="text-gray-600 mb-4">The property you're looking for doesn't exist or has been removed.</p>
              <Link to="/properties">
                <Button>Browse Properties</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Check if user is the property owner
  if (property.landlord_id === user.id) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Home className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">This is Your Property</h2>
              <p className="text-gray-600 mb-4">You cannot apply to your own property.</p>
              <Link to={`/property/${id}`}>
                <Button>View Property Details</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/properties" className="hover:text-green-600">Properties</Link>
          <span>/</span>
          <Link to={`/property/${id}`} className="hover:text-green-600">{property.title}</Link>
          <span>/</span>
          <span className="text-green-600">Apply</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {property.thumbnail_url && (
                  <img
                    src={property.thumbnail_url}
                    alt={property.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg">{property.title}</h3>
                  <p className="text-gray-600">{property.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    KES {property.monthly_rent?.toLocaleString()}
                  </span>
                  <span className="text-gray-500">/month</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {property.property_types?.name || 'Property'}
                  </Badge>
                  <Badge variant="outline">
                    {property.bedrooms} bed • {property.bathrooms} bath
                  </Badge>
                </div>
                {property.landlord?.name && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">Listed by</p>
                    <p className="font-medium">{property.landlord.name}</p>
                    {property.landlord.verification_status === 'verified' && (
                      <Badge variant="secondary" className="mt-1">Verified Landlord</Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Link to={`/property/${id}`}>
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to Property
                    </Button>
                  </Link>
                </div>
                <CardTitle>Apply for This Property</CardTitle>
              </CardHeader>
              <CardContent>
                {existingApplication ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Application Already Submitted</h3>
                    <p className="text-gray-600 mb-4">
                      You have already applied for this property on {new Date(existingApplication.created_at).toLocaleDateString()}.
                    </p>
                    <Badge 
                      variant={existingApplication.status === 'approved' ? 'default' : 'secondary'}
                      className="mb-4"
                    >
                      Status: {existingApplication.status.charAt(0).toUpperCase() + existingApplication.status.slice(1)}
                    </Badge>
                    <div className="space-y-2">
                      <Link to={`/property/${id}`}>
                        <Button variant="outline" className="w-full">
                          View Property Details
                        </Button>
                      </Link>
                      <Link to="/properties">
                        <Button className="w-full">Browse Other Properties</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Application Information</h4>
                      <p className="text-sm text-blue-700">
                        Your application will be sent directly to the property owner. Please provide accurate contact information.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={user.user_metadata?.name || user.user_metadata?.full_name || user.email.split('@')[0]}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This information is from your account profile
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="e.g., +254 700 000 000 or 0700 000 000"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Please enter a valid Kenyan phone number
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="message">Message (Optional)</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Tell the landlord a bit about yourself, your move-in timeline, or any questions you have..."
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          type="submit"
                          disabled={submitApplicationMutation.isPending || !formData.phone.trim()}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {submitApplicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
                        </Button>
                        <Link to={`/property/${id}`}>
                          <Button type="button" variant="outline" className="w-full sm:w-auto">
                            Cancel
                          </Button>
                        </Link>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        By submitting this application, you agree to share your contact information with the property owner.
                      </p>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <MobileNavigation role="tenant" />
    </div>
  );
};

export default PropertyApplication;
