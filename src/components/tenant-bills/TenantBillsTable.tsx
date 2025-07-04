
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Receipt } from 'lucide-react';
import { Bill, getStatusBadge } from './utils';

interface TenantBillsTableProps {
  bills: Bill[];
}

const TenantBillsTable = ({ bills }: TenantBillsTableProps) => {
  return (
    <Card className="hidden md:block border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/20 mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Bills History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200">
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Due Date</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-medium">{bill.description}</TableCell>
                <TableCell className="capitalize">{bill.type}</TableCell>
                <TableCell className="font-semibold">KES {bill.amount.toLocaleString()}</TableCell>
                <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(bill.status)}
                  </div>
                </TableCell>
                <TableCell>
                  {bill.status !== 'paid' && (
                    <Button size="sm" className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg">
                      <CreditCard className="h-4 w-4 mr-1" />
                      Pay Now
                    </Button>
                  )}
                  {bill.status === 'paid' && (
                    <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                      <Receipt className="h-4 w-4 mr-1" />
                      Receipt
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TenantBillsTable;
