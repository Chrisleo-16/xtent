
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const OptimizedTenantSkeleton = () => (
  <div className="space-y-6">
    {/* Header Skeleton */}
    <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-6 pt-8 pb-8 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-32 bg-white/20" />
        <div className="hidden md:flex items-center gap-6">
          <Skeleton className="h-5 w-24 bg-white/20" />
          <Skeleton className="h-5 w-20 bg-white/20" />
        </div>
      </div>
      <Skeleton className="h-10 w-80 bg-white/20 mb-2" />
      <Skeleton className="h-6 w-64 bg-white/20" />
    </div>

    {/* Info Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 -mt-8 relative z-20">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="border-0 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-40 mb-3" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Property and Contact Info Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-6 w-48" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Charts and Actions Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default OptimizedTenantSkeleton;
