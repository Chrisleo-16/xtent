
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, DollarSign, ShieldCheck } from 'lucide-react';
import InviteUser from './InviteUser';
import { Link } from 'react-router-dom';
import { CreativeActionButton } from '../ui/creative-action-button';

const QuickActions = () => {
  return (
    <Card className="shadow-md mb-6">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <InviteUser />
          <Link to="/add-property" className="contents">
            <CreativeActionButton icon={Plus} label="Add Property" variant="primary" />
          </Link>
          <CreativeActionButton icon={Calendar} label="Schedule Inspection" variant="orange" />
          <CreativeActionButton icon={DollarSign} label="Financial Reports" variant="orange" />
          <Link to="/verify-account" className="contents">
            <CreativeActionButton icon={ShieldCheck} label="Verify Account" variant="blue" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
