
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import TenantCard from './tenants/TenantCard';
import ChangeUnitModal from './tenants/ChangeUnitModal';
import EndLeaseModal from './tenants/EndLeaseModal';
import TenantsEmptyState from './tenants/TenantsEmptyState';
import { useTenantManagement } from './tenants/useTenantManagement';

interface ManagePropertyTenantsProps {
  propertyId: string;
}

const ManagePropertyTenants = ({ propertyId }: ManagePropertyTenantsProps) => {
  const {
    tenancies,
    tenanciesLoading,
    vacantUnits,
    unitsLoading,
    selectedUnit,
    setSelectedUnit,
    isChangeUnitModalOpen,
    setIsChangeUnitModalOpen,
    isEndLeaseModalOpen,
    setIsEndLeaseModalOpen,
    handleChangeUnit,
    handleEndLease,
    handleConfirmChangeUnit,
    handleConfirmEndLease,
    isChangingUnit,
    isEndingLease,
  } = useTenantManagement(propertyId);

  if (tenanciesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tenancies || tenancies.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <TenantsEmptyState />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Tenants ({tenancies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tenancies.map((tenancy) => (
              <TenantCard
                key={tenancy.id}
                tenancy={tenancy}
                onChangeUnit={handleChangeUnit}
                onEndLease={handleEndLease}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <ChangeUnitModal
        isOpen={isChangeUnitModalOpen}
        onClose={() => setIsChangeUnitModalOpen(false)}
        vacantUnits={vacantUnits}
        unitsLoading={unitsLoading}
        selectedUnit={selectedUnit}
        onUnitSelect={setSelectedUnit}
        onConfirm={handleConfirmChangeUnit}
        isChanging={isChangingUnit}
      />

      <EndLeaseModal
        isOpen={isEndLeaseModalOpen}
        onClose={() => setIsEndLeaseModalOpen(false)}
        onConfirm={handleConfirmEndLease}
        isEnding={isEndingLease}
      />
    </div>
  );
};

export default ManagePropertyTenants;
