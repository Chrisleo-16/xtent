
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';

const TestPage = () => {
  const { user, isLoading } = useAuth();

  console.log('TestPage render:', { user: user?.id, isLoading });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-green-600 text-center">
              ✅ XTent Test Page Working!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">System Status:</h3>
              <ul className="space-y-1 text-green-700">
                <li>✅ React Router: Working</li>
                <li>✅ UI Components: Working</li>
                <li>✅ Styling: Working</li>
                <li>✅ Auth Hook: {isLoading ? 'Loading...' : user ? 'Authenticated' : 'Not authenticated'}</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Debug Info:</h3>
              <pre className="text-xs text-blue-700 bg-white p-2 rounded">
                {JSON.stringify({
                  userId: user?.id || 'None',
                  userEmail: user?.email || 'None',
                  isLoading,
                  timestamp: new Date().toISOString()
                }, null, 2)}
              </pre>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/">Go to Home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/auth">Go to Auth</Link>
              </Button>
              {user && (
                <Button asChild variant="outline">
                  <Link to="/tenant-dashboard">Go to Dashboard</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestPage;
