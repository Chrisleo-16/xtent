
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
  showCard?: boolean;
}

export const LoadingFallback = ({ 
  message = "Loading...", 
  showCard = true 
}: LoadingFallbackProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  );

  if (showCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            {content}
          </CardContent>
        </Card>
      </div>
    );
  }

  return content;
};

export default LoadingFallback;
