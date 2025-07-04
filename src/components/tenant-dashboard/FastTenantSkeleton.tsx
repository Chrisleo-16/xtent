
import { Skeleton } from '@/components/ui/skeleton';

const FastTenantSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {/* Quick header skeleton */}
    <div className="bg-gradient-to-r from-blue-600 to-indigo-500 p-4 rounded-lg">
      <Skeleton className="h-6 w-32 bg-white/20 mb-2" />
      <Skeleton className="h-8 w-64 bg-white/20" />
    </div>

    {/* Fast cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 shadow-sm border">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-6 w-24 mb-3" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>

    {/* Quick content skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  </div>
);

export default FastTenantSkeleton;
