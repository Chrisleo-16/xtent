
import { Card, CardContent } from '@/components/ui/card';

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = 'Loading...' }: LoadingStateProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>{message}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
