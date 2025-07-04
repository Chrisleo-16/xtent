
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { TenantData } from '@/hooks/useLandlordTenants';
import { getStatusBadge, getRentStatusText } from './utils';

interface TenantsTableProps {
  tenants: TenantData[];
}

const TenantsTable = ({ tenants }: TenantsTableProps) => {
  return (
    <Card className="shadow-md hidden md:block">
      <CardHeader>
        <CardTitle>All Tenants</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Rent Amount</TableHead>
              <TableHead>Rent Status</TableHead>
              <TableHead>Lease End</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{tenant.name}</div>
                    <div className="text-sm text-gray-500">{tenant.email}</div>
                  </div>
                </TableCell>
                <TableCell>{tenant.property}</TableCell>
                <TableCell>KES {tenant.rentAmount.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge className={getStatusBadge(tenant.rentStatus)}>
                      {tenant.rentStatus}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {getRentStatusText(tenant.daysUntilRent)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{new Date(tenant.leaseEnd).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TenantsTable;
