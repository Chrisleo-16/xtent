
import { useState } from 'react';
import { useTenancies } from './hooks/useTenancies';
import { TenancyWithTenant } from './types/tenancy';
import TenanciesEmptyState from './components/TenanciesEmptyState';
import TenancyCard from './components/TenancyCard';
import EditLeaseModal from './EditLeaseModal';

interface TenanciesTabProps {
  propertyId: string;
}

const TenanciesTab = ({ propertyId }: TenanciesTabProps) => {
  const [editingTenancy, setEditingTenancy] = useState<TenancyWithTenant | null>(null);
  const { tenancies, isLoading, endTenancy, isEndingTenancy } = useTenancies(propertyId);

  if (isLoading) {
    return <div className="text-center py-8">Loading tenancies...</div>;
  }

  return (
    <div className="space-y-4">
      {tenancies.length === 0 ? (
        <TenanciesEmptyState />
      ) : (
        tenancies.map((tenancy) => (
          <TenancyCard
            key={tenancy.id}
            tenancy={tenancy}
            onEdit={setEditingTenancy}
            onEndTenancy={endTenancy}
            isEndingTenancy={isEndingTenancy}
          />
        ))
      )}

      {editingTenancy && (
        <EditLeaseModal
          isOpen={!!editingTenancy}
          onClose={() => setEditingTenancy(null)}
          tenancy={editingTenancy}
        />
      )}
    </div>
  );
};

export default TenanciesTab;
