
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, Calendar, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useLandlordProperties } from '@/hooks/useLandlordProperties';

const ElectricityBillingTab = () => {
  const { user } = useAuth();
  const { data: properties = [] } = useLandlordProperties();
  const [selectedProperty, setSelectedProperty] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billingPeriod, setBillingPeriod] = useState('');
  const [units, setUnits] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch electricity bills
  const { data: electricityBills = [], refetch } = useQuery({
    queryKey: ['electricity-bills', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('utility_bills')
        .select(`
          *,
          properties!inner(title, address)
        `)
        .eq('landlord_id', user.id)
        .eq('utility_type', 'electricity')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleSubmitBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty || !billAmount || !billingPeriod) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('utility_bills')
        .insert({
          landlord_id: user?.id,
          property_id: selectedProperty,
          utility_type: 'electricity',
          provider_name: 'Kenya Power',
          total_amount: parseInt(billAmount) * 100, // Convert to cents
          total_units_consumed: units ? parseFloat(units) : null,
          billing_period_start: new Date(billingPeriod + '-01').toISOString().split('T')[0],
          billing_period_end: new Date(new Date(billingPeriod + '-01').getFullYear(), new Date(billingPeriod + '-01').getMonth() + 1, 0).toISOString().split('T')[0],
          payment_status: 'pending'
        });

      if (error) throw error;

      toast.success('Electricity bill added successfully');
      setBillAmount('');
      setBillingPeriod('');
      setUnits('');
      setSelectedProperty('');
      refetch();
    } catch (error) {
      console.error('Error adding electricity bill:', error);
      toast.error('Failed to add electricity bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Bill */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Add Electricity Bill
          </CardTitle>
          <CardDescription>
            Record electricity bills for your properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitBill} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property">Property *</Label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Bill Amount (KES) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <Label htmlFor="period">Billing Period *</Label>
                <Input
                  id="period"
                  type="month"
                  value={billingPeriod}
                  onChange={(e) => setBillingPeriod(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="units">Units Consumed (kWh)</Label>
                <Input
                  id="units"
                  type="number"
                  step="0.1"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  placeholder="Enter units"
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Adding...' : 'Add Bill'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bills History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Electricity Bills History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {electricityBills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No electricity bills recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {electricityBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{bill.properties?.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(bill.billing_period_start).toLocaleDateString()} - {new Date(bill.billing_period_end).toLocaleDateString()}
                    </p>
                    {bill.total_units_consumed && (
                      <p className="text-sm text-gray-500">
                        {bill.total_units_consumed} kWh consumed
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">KES {(bill.total_amount / 100).toLocaleString()}</p>
                    <Badge variant={bill.payment_status === 'paid' ? 'default' : 'secondary'}>
                      {bill.payment_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ElectricityBillingTab;
