
import { Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Shield, Star, Users, Building, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import LoadingFallback from '@/components/LoadingFallback';
import FeaturedPropertyCard from '@/components/FeaturedPropertyCard';
import { useAuth } from '@/hooks/useAuth';
import { useFeaturedProperties } from '@/hooks/useFeaturedProperties';

const Index = () => {
  console.log('🏠 Index page rendering');

  const { user, isLoading } = useAuth();
  const { data: featuredProperties = [], isLoading: propertiesLoading } = useFeaturedProperties();
  const [searchLocation, setSearchLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');

  console.log('🔐 Auth state:', { user: user?.id, isLoading });

  const handleSearch = () => {
    // Navigate to properties page with search parameters
    const params = new URLSearchParams();
    if (searchLocation) params.set('location', searchLocation);
    if (priceRange) params.set('price', priceRange);
    
    const searchQuery = params.toString();
    window.location.href = `/properties${searchQuery ? `?${searchQuery}` : ''}`;
  };

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        <Header />
        
        <Suspense fallback={<LoadingFallback message="Loading homepage..." showCard={false} />}>
          <main>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 py-16 px-4">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  {/* Premium Platform Badge */}
                  <div className="mb-6">
                    <Badge className="bg-green-100 text-green-700 px-4 py-2 text-sm font-medium border border-green-200">
                      Kenya's #1 Premium Rental Platform
                    </Badge>
                  </div>

                  {/* Main Heading */}
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                    Find Your Perfect
                    <br />
                    <span className="text-green-600">Rental Home</span>
                  </h1>

                  <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                    Discover premium rental properties across Kenya. From modern apartments to luxury homes, 
                    find your ideal living space with verified landlords and transparent pricing.
                  </p>

                  {/* Search Section */}
                  <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-green-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      {/* Location Search */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 text-left">
                          Location
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            placeholder="Enter city, area or neighborhood"
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      {/* Price Range */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 text-left">
                          Price Range
                        </label>
                        <Select value={priceRange} onValueChange={setPriceRange}>
                          <SelectTrigger className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500">
                            <SelectValue placeholder="Select price range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-15000">Under KES 15,000</SelectItem>
                            <SelectItem value="15000-30000">KES 15,000 - 30,000</SelectItem>
                            <SelectItem value="30000-50000">KES 30,000 - 50,000</SelectItem>
                            <SelectItem value="50000-100000">KES 50,000 - 100,000</SelectItem>
                            <SelectItem value="100000+">Above KES 100,000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Search Button */}
                      <Button 
                        onClick={handleSearch}
                        size="lg" 
                        className="h-12 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Search className="h-5 w-5 mr-2" />
                        Search Rentals
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Trust Indicators */}
            <section className="py-16 bg-white">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Building className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">500+</div>
                    <div className="text-gray-600">Verified Properties</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">1000+</div>
                    <div className="text-gray-600">Happy Tenants</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                      <Star className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">4.8/5</div>
                    <div className="text-gray-600">Average Rating</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <Shield className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">100%</div>
                    <div className="text-gray-600">Secure Platform</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Properties Section */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <Badge className="mb-4 px-4 py-2 bg-green-100 text-green-800 text-sm font-medium">
                    Featured Properties
                  </Badge>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Premium Properties for You
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Discover handpicked premium properties from verified landlords across Kenya
                  </p>
                </div>

                {propertiesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 animate-pulse">
                        <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                        <div className="h-6 bg-gray-200 rounded mb-2 w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : featuredProperties.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                      {featuredProperties.map((property) => (
                        <FeaturedPropertyCard key={property.id} property={property} />
                      ))}
                    </div>
                    
                    <div className="text-center">
                      <Link to="/properties">
                        <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8">
                          View All Properties
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Building className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No featured properties available yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Check back soon for amazing property listings
                    </p>
                    <Link to="/properties">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Browse All Properties
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to Find Your Dream Home?
                </h2>
                <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
                  Join thousands of satisfied tenants who found their perfect rental through XTENT.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!user ? (
                    <>
                      <Button asChild size="lg" className="bg-white text-green-600 hover:bg-gray-100 font-semibold">
                        <Link to="/auth">Get Started Free</Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="border-white bg-green-600 text-white hover:bg-white hover:text-green-600">
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
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('❌ Index page error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Page Error</h1>
          <p className="text-gray-600 mb-4">Unable to load the homepage.</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    );
  }
};

export default Index;
