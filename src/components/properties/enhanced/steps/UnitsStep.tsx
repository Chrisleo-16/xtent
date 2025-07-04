
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Check } from 'lucide-react';
import { useUnitTypes } from '@/hooks/useUnitTypes';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

interface UnitConfiguration {
  id: string;
  unit_type_id: string;
  quantity: number;
  monthly_rent: number;
  bedrooms: number;
  bathrooms: number;
  saved: boolean;
}

interface UnitsStepProps {
  form: UseFormReturn<any>;
}

const UnitsStep = ({ form }: UnitsStepProps) => {
  const { data: unitTypes = [] } = useUnitTypes();
  
  const [units, setUnits] = useState<UnitConfiguration[]>([{
    id: '1',
    unit_type_id: '',
    quantity: 0,
    monthly_rent: 0,
    bedrooms: 0,
    bathrooms: 0,
    saved: false
  }]);

  useEffect(() => {
    // Only sync saved units to form
    const savedUnits = units.filter(unit => unit.saved);
    form.setValue('unit_configurations', savedUnits);
  }, [units, form]);

  const addUnitType = () => {
    const newId = Date.now().toString();
    setUnits([...units, {
      id: newId,
      unit_type_id: '',
      quantity: 0,
      monthly_rent: 0,
      bedrooms: 0,
      bathrooms: 0,
      saved: false
    }]);
  };

  const removeUnitType = (id: string) => {
    if (units.length > 1) {
      setUnits(units.filter(unit => unit.id !== id));
    }
  };

  const updateUnit = (id: string, field: keyof UnitConfiguration, value: any) => {
    setUnits(units.map(unit => unit.id === id ? {
      ...unit,
      [field]: value,
      saved: false // Mark as unsaved when edited
    } : unit));
  };

  const saveUnitType = (id: string) => {
    const unit = units.find(u => u.id === id);
    if (!unit) return;

    // Validate unit configuration
    const errors = [];
    if (!unit.unit_type_id) errors.push('Unit type is required');
    if (unit.quantity < 1) errors.push('Quantity must be at least 1');
    if (unit.monthly_rent <= 0) errors.push('Monthly rent must be greater than 0');
    if (unit.bedrooms < 0) errors.push('Bedrooms cannot be negative');
    if (unit.bathrooms < 0) errors.push('Bathrooms cannot be negative');

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    // Mark as saved
    setUnits(units.map(u => u.id === id ? { ...u, saved: true } : u));
    toast.success('Unit type configuration saved!');
  };

  const getUnitTypeName = (unitTypeId: string) => {
    const unitType = unitTypes.find(type => type.id === unitTypeId);
    return unitType?.name || 'Select unit type';
  };

  const validateUnit = (unit: UnitConfiguration) => {
    return unit.unit_type_id && unit.quantity >= 1 && unit.monthly_rent > 0 && unit.saved;
  };

  const totalUnits = units.filter(u => u.saved).reduce((sum, unit) => sum + (unit.quantity || 0), 0);
  const validUnits = units.filter(validateUnit);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Property Units</h2>
        <p className="text-gray-600">Configure the units in your property with their types, quantities, and specifications.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Unit Configuration</span>
            <span className="text-sm font-normal text-gray-500">
              Total Units: {totalUnits}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {units.map((unit, index) => (
            <div key={unit.id} className={`p-4 border rounded-lg space-y-4 ${unit.saved ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Unit Type {index + 1}
                  {unit.saved && <Check className="h-4 w-4 text-green-600" />}
                </Label>
                <div className="flex gap-2">
                  {!unit.saved && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => saveUnitType(unit.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Save Unit Type
                    </Button>
                  )}
                  {units.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUnitType(unit.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor={`unit-type-${unit.id}`}>Unit Type *</Label>
                  <Select
                    value={unit.unit_type_id}
                    onValueChange={(value) => updateUnit(unit.id, 'unit_type_id', value)}
                    disabled={unit.saved}
                  >
                    <SelectTrigger id={`unit-type-${unit.id}`}>
                      <SelectValue placeholder="Select unit type" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`quantity-${unit.id}`}>Quantity *</Label>
                  <Input
                    id={`quantity-${unit.id}`}
                    type="number"
                    min="1"
                    value={unit.quantity || ''}
                    onChange={(e) => updateUnit(unit.id, 'quantity', parseInt(e.target.value) || 0)}
                    placeholder="Number of units"
                    disabled={unit.saved}
                    className={unit.quantity < 1 && unit.quantity !== 0 ? 'border-red-300' : ''}
                  />
                </div>

                <div>
                  <Label htmlFor={`bedrooms-${unit.id}`}>Bedrooms</Label>
                  <Input
                    id={`bedrooms-${unit.id}`}
                    type="number"
                    min="0"
                    value={unit.bedrooms || ''}
                    onChange={(e) => updateUnit(unit.id, 'bedrooms', parseInt(e.target.value) || 0)}
                    placeholder="Bedrooms"
                    disabled={unit.saved}
                  />
                </div>

                <div>
                  <Label htmlFor={`bathrooms-${unit.id}`}>Bathrooms</Label>
                  <Input
                    id={`bathrooms-${unit.id}`}
                    type="number"
                    min="0"
                    value={unit.bathrooms || ''}
                    onChange={(e) => updateUnit(unit.id, 'bathrooms', parseInt(e.target.value) || 0)}
                    placeholder="Bathrooms"
                    disabled={unit.saved}
                  />
                </div>

                <div>
                  <Label htmlFor={`rent-${unit.id}`}>Monthly Rent (KES) *</Label>
                  <Input
                    id={`rent-${unit.id}`}
                    type="number"
                    min="0"
                    value={unit.monthly_rent || ''}
                    onChange={(e) => updateUnit(unit.id, 'monthly_rent', parseInt(e.target.value) || 0)}
                    placeholder="Rent per unit"
                    disabled={unit.saved}
                  />
                </div>
              </div>

              {validateUnit(unit) && (
                <div className="bg-green-100 p-3 rounded text-sm">
                  <p>
                    <strong>{unit.quantity}x {getUnitTypeName(unit.unit_type_id)}</strong> 
                    {' '}• {unit.bedrooms} bed, {unit.bathrooms} bath • KES {unit.monthly_rent.toLocaleString()}/month each
                  </p>
                  <p className="text-green-700 font-medium">
                    Total monthly potential: KES {(unit.quantity * unit.monthly_rent).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addUnitType}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Unit Type
          </Button>
        </CardContent>
      </Card>

      {validUnits.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-green-800 mb-2">Property Summary</h3>
            <div className="space-y-1 text-sm">
              {validUnits.map((unit) => (
                <p key={unit.id} className="text-green-700">
                  {unit.quantity}x {getUnitTypeName(unit.unit_type_id)} ({unit.bedrooms} bed, {unit.bathrooms} bath) - 
                  KES {(unit.quantity * unit.monthly_rent).toLocaleString()}/month
                </p>
              ))}
              <div className="border-t border-green-200 pt-2 mt-2">
                <p className="font-semibold text-green-800">
                  Total: {totalUnits} units - KES {validUnits.reduce((sum, unit) => sum + unit.quantity * unit.monthly_rent, 0).toLocaleString()}/month potential
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnitsStep;
