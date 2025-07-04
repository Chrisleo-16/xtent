
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  CreditCard, 
  Wrench, 
  MessageSquare,
  Check,
  ArrowRight,
  Star,
  Phone,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';

const Services = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Current services we offer - simplified list
  const services = [
    {
      icon: Building2,
      title: t('services.propertyManagement.title', 'Property Management'),
      description: t('services.propertyManagement.description', 'Full-service property management including rent collection, maintenance coordination, and financial reporting.'),
      features: [
        t('services.propertyManagement.features.1', 'Rent Collection'),
        t('services.propertyManagement.features.2', 'Maintenance Management'),
        t('services.propertyManagement.features.3', 'Financial Reporting'),
        'Property Marketing'
      ],
      color: 'bg-green-100 text-green-600',
      status: 'Available Now'
    },
    {
      icon: CreditCard,
      title: t('services.rentCollection.title', 'Rent Collection'),
      description: t('services.rentCollection.description', 'Automated rent collection with multiple payment options and late fee management.'),
      features: [
        t('services.rentCollection.features.0', 'Online Payments'),
        t('services.rentCollection.features.1', 'Automated Reminders'),
        t('services.rentCollection.features.2', 'Late Fee Management'),
        t('services.rentCollection.features.3', 'Payment Tracking')
      ],
      color: 'bg-purple-100 text-purple-600',
      status: 'Available Now'
    },
    {
      icon: Wrench,
      title: t('services.maintenanceServices.title', 'Maintenance Services'),
      description: t('services.maintenanceServices.description', '24/7 maintenance request system with vetted contractors and real-time updates.'),
      features: [
        t('services.maintenanceServices.features.0', '24/7 Requests'),
        t('services.maintenanceServices.features.1', 'Vetted Contractors'),
        t('services.maintenanceServices.features.2', 'Real-time Updates'),
        t('services.maintenanceServices.features.3', 'Emergency Response')
      ],
      color: 'bg-orange-100 text-orange-600',
      status: 'Available Now'
    },
    {
      icon: MessageSquare,
      title: t('services.consultingServices.title', 'Rental Consulting'),
      description: t('services.consultingServices.description', 'Expert advice on rental rates, property improvements, and market trends.'),
      features: [
        t('services.consultingServices.features.0', 'Market Analysis'),
        t('services.consultingServices.features.1', 'Pricing Strategy'),
        t('services.consultingServices.features.2', 'Property Improvements'),
        t('services.consultingServices.features.3', 'Investment Advice')
      ],
      color: 'bg-indigo-100 text-indigo-600',
      status: 'Available Now'
    }
  ];

  const handleGetStarted = () => {
    if (user) {
      // Redirect to appropriate dashboard based on user role
      const userRole = user.user_metadata?.role || 'tenant';
      window.location.href = userRole === 'landlord' ? '/landlord-dashboard' : '/tenant-dashboard';
    } else {
      window.location.href = '/auth';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <Header />
      
      <main className="py-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 text-center mb-20">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 px-4 py-2 bg-green-100 text-green-800 text-sm font-medium">
              <Star className="h-4 w-4 mr-2" />
              Premium Rental Solutions
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('services.title', 'Our Rental Services')}
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              {t('services.subtitle', 'Comprehensive rental solutions for tenants, landlords, and property managers')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={handleGetStarted}>
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">Schedule Consultation</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Current Services Grid */}
        <section className="container mx-auto px-4 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Current Services Available
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These are the services we currently offer. More services will be added as we continue to expand our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${service.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {service.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              More Services Coming Soon
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're continuously working to expand our service offerings. Stay tuned for more comprehensive rental solutions.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Want to be notified about new services?
            </h3>
            <p className="text-gray-600 mb-6">
              Subscribe to our updates and be the first to know when we launch new features and services.
            </p>
            <Button className="bg-green-600 hover:bg-green-700" asChild>
              <Link to="/contact">Subscribe to Updates</Link>
            </Button>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Contact our rental experts to discuss your specific needs and see how XTENT can help you succeed.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                  <Phone className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Call Us</h3>
                <p className="text-lg opacity-90 mb-4">
                  Speak with our rental specialists
                </p>
                <p className="text-xl font-semibold">
                  +254 700 123 456
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                  <Mail className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Email Us</h3>
                <p className="text-lg opacity-90 mb-4">
                  Get detailed information about our services
                </p>
                <p className="text-xl font-semibold">
                  services@xtent.co.ke
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100" asChild>
                <Link to="/contact">
                  Schedule a Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <MobileNavigation role="guest" />
    </div>
  );
};

export default Services;
