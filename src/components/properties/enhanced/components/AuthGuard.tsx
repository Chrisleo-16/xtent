
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface AuthGuardProps {
  editMode: boolean;
}

const AuthGuard = ({ editMode }: AuthGuardProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <p>You must be logged in to {editMode ? 'edit' : 'create'} a property.</p>
          <Button onClick={() => navigate('/auth')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthGuard;
