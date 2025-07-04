
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Calendar, Trash2, Edit, DollarSign } from 'lucide-react';
import { useRecurringBills, useCreateRecurringBill, useUpdateRecurringBill, useDeleteRecurringBill } from '@/hooks/useRecurringBills';
import { toast } from 'sonner';
import { format, addDays, addMonths, addWeeks, parseISO } from 'date-fns';

const UtilityHubTab = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBill, setNewBill] = useState({
    bill_name: '',
    bill_category: '',
    amount: '',
    frequency: 'monthly',
    next_due_date: '',
    auto_pay_enabled: false,
    vendor_paybill: '',
    vendor_account: '',
    is_shared: false,
  });

  const { data: recurringBills, isLoading } = useRecurringBills();
  const createBill = useCreateRecurringBill();
  const updateBill = useUpdateRecurringBill();
  const deleteBill = useDeleteRecurringBill();

  const billCategories = [
    { value: 'internet', label: 'Internet/WiFi', icon: '📶' },
    { value: 'garbage', label: 'Garbage Collection', icon: '🗑️' },
    { value: 'security', label: 'Security Services', icon: '🔒' },
    { value: 'tv', label: 'TV/Cable', icon: '📺' },
    { value: 'gas', label: 'Gas/LPG', icon: '⛽' },
    { value: 'custom', label: 'Custom', icon: '⚙️' },
  ];

  const handleCreateBill = async () => {
    if (!newBill.bill_name || !newBill.bill_category || !newBill.amount || !newBill.next_due_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createBill.mutateAsync({
        bill_name: newBill.bill_name,
        bill_category: newBill.bill_category,
        amount: Math.round(parseFloat(newBill.amount) * 100), // Convert to cents
        frequency: newBill.frequency,
        next_due_date: newBill.next_due_date,
        auto_pay_enabled: newBill.auto_pay_enabled,
        vendor_paybill: newBill.vendor_paybill || null,
        vendor_account: newBill.vendor_account || null,
        is_shared: newBill.is_shared,
      });

      toast.success('Recurring bill created successfully');
      setIsCreateDialogOpen(false);
      setNewBill({
        bill_name: '',
        bill_category: '',
        amount: '',
        frequency: 'monthly',
        next_due_date: '',
        auto_pay_enabled: false,
        vendor_paybill: '',
        vendor_account: '',
        is_shared: false,
      });
    } catch (error) {
      toast.error('Failed to create recurring bill');
    }
  };

  const handleToggleAutoPay = async (billId: string, currentStatus: boolean) => {
    try {
      await updateBill.mutateAsync({
        id: billId,
        updates: { auto_pay_enabled: !currentStatus },
      });
      toast.success(`Auto-pay ${!currentStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update auto-pay setting');
    }
  };

  const handleDeleteBill = async (billId: string) => {
    try {
      await deleteBill.mutateAsync(billId);
      toast.success('Bill deleted successfully');
    } catch (error) {
      toast.error('Failed to delete bill');
    }
  };

  const getDueStatus = (dueDate: string) => {
    const due = parseISO(dueDate);
    const today = new Date();
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'overdue', color: 'bg-red-500', text: 'Overdue' };
    if (diffDays === 0) return { status: 'due_today', color: 'bg-orange-500', text: 'Due Today' };
    if (diffDays <= 3) return { status: 'due_soon', color: 'bg-yellow-500', text: 'Due Soon' };
    return { status: 'upcoming', color: 'bg-green-500', text: 'Upcoming' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recurring Bills Hub</h2>
          <p className="text-gray-600">Manage all your recurring utility and service payments</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Recurring Bill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bill_name">Bill Name *</Label>
                <Input
                  id="bill_name"
                  value={newBill.bill_name}
                  onChange={(e) => setNewBill({ ...newBill, bill_name: e.target.value })}
                  placeholder="e.g., Safaricom WiFi"
                />
              </div>

              <div>
                <Label htmlFor="bill_category">Category *</Label>
                <Select
                  value={newBill.bill_category}
                  onValueChange={(value) => setNewBill({ ...newBill, bill_category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {billCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount (KES) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newBill.amount}
                  onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={newBill.frequency}
                  onValueChange={(value) => setNewBill({ ...newBill, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="next_due_date">Next Due Date *</Label>
                <Input
                  id="next_due_date"
                  type="date"
                  value={newBill.next_due_date}
                  onChange={(e) => setNewBill({ ...newBill, next_due_date: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto_pay"
                  checked={newBill.auto_pay_enabled}
                  onCheckedChange={(checked) => setNewBill({ ...newBill, auto_pay_enabled: checked })}
                />
                <Label htmlFor="auto_pay">Enable Auto-Pay</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateBill}
                  disabled={createBill.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {createBill.isPending ? 'Creating...' : 'Create Bill'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {recurringBills && recurringBills.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recurringBills.map((bill) => {
            const dueStatus = getDueStatus(bill.next_due_date);
            const category = billCategories.find(c => c.value === bill.bill_category);
            
            return (
              <Card key={bill.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category?.icon || '📄'}</span>
                      <div>
                        <CardTitle className="text-lg">{bill.bill_name}</CardTitle>
                        <p className="text-sm text-gray-600 capitalize">{bill.bill_category}</p>
                      </div>
                    </div>
                    <Badge className={`${dueStatus.color} text-white`}>
                      {dueStatus.text}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="font-semibold">KES {(bill.amount / 100).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Due Date:</span>
                    <span className="text-sm">{format(parseISO(bill.next_due_date), 'MMM dd, yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Frequency:</span>
                    <span className="text-sm capitalize">{bill.frequency}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Auto-Pay:</span>
                    <Switch
                      checked={bill.auto_pay_enabled}
                      onCheckedChange={() => handleToggleAutoPay(bill.id, bill.auto_pay_enabled)}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Pay Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteBill(bill.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💡</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No recurring bills yet</h3>
          <p className="text-gray-600 mb-6">
            Add your first recurring bill to start managing all your utility payments in one place.
          </p>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Bill
          </Button>
        </div>
      )}
    </div>
  );
};

export default UtilityHubTab;
