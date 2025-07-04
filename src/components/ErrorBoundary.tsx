
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('Error caught by boundary:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/20 flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h2>
                  <p className="text-slate-600 text-sm mb-4">
                    {this.state.error?.message || 'An unexpected error occurred in the application'}
                  </p>
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="text-left bg-slate-50 p-3 rounded text-xs mb-4">
                      <summary className="cursor-pointer text-slate-700 font-medium">Error Details</summary>
                      <pre className="mt-2 text-red-600 whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </details>
                  )}
                </div>
                <div className="flex gap-2 w-full">
                  <Button 
                    onClick={this.resetError} 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try again
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                    className="flex-1"
                  >
                    Reload page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
