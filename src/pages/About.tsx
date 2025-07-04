
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Award,
  Target,
  Heart,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import { useAuth } from '@/hooks/useAuth';

const About = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <Header />
      
      <main className="py-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 text-center mb-20">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 px-4 py-2 bg-green-100 text-green-800 text-sm font-medium">
              About XTENT
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Revolutionizing Rental Living in Kenya
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              We're building the future of property management and rental experiences across Kenya
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                To provide the best rental living experience in Kenya through innovative technology, 
                verified properties, and exceptional service that connects quality tenants with trusted landlords.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span className="text-gray-700">Verified properties and landlords</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span className="text-gray-700">Transparent pricing and processes</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span className="text-gray-700">24/7 customer support</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="text-center p-6">
                <Building2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">500+</h3>
                <p className="text-gray-600">Properties Listed</p>
              </Card>
              <Card className="text-center p-6">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">1000+</h3>
                <p className="text-gray-600">Happy Tenants</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-8">
                <Award className="h-16 w-16 text-green-600 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">Excellence</h3>
                <p className="text-gray-600">
                  We strive for excellence in every interaction, ensuring the highest quality 
                  service for our users.
                </p>
              </Card>
              
              <Card className="text-center p-8">
                <Target className="h-16 w-16 text-blue-600 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
                <p className="text-gray-600">
                  We continuously innovate to solve real problems in the rental market 
                  with cutting-edge technology.
                </p>
              </Card>
              
              <Card className="text-center p-8">
                <Heart className="h-16 w-16 text-purple-600 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">Community</h3>
                <p className="text-gray-600">
                  We build strong communities by connecting people and creating lasting 
                  relationships in the rental ecosystem.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Experience the Best of Rental Living?
            </h2>
            <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
              Join thousands of satisfied users who have found their perfect rental through XTENT.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Button asChild size="lg" className="bg-white text-green-600 hover:bg-gray-100 font-semibold">
                    <Link to="/auth">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-green-600">
                    <Link to="/properties">Browse Properties</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-white text-green-600 hover:bg-gray-100 font-semibold">
                    <Link to="/tenant-dashboard">Go to Dashboard</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-green-600">
                    <Link to="/properties">Browse Properties</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <MobileNavigation role={user ? "tenant" : "guest"} />
    </div>
  );
};

export default About;
