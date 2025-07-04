
import React from 'react';

const SettingsLoadingSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="animate-pulse space-y-4">
      <div className="h-32 bg-gray-200 rounded-lg"></div>
      <div className="h-32 bg-gray-200 rounded-lg"></div>
      <div className="h-32 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

export default SettingsLoadingSkeleton;
