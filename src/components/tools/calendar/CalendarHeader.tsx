
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CalendarHeaderProps {
  viewMode: 'month' | 'week' | 'day';
  onViewModeChange: (mode: 'month' | 'week' | 'day') => void;
  canAddEvents: boolean;
  onAddEventClick: () => void;
}

export const CalendarHeader = ({ 
  viewMode, 
  onViewModeChange, 
  canAddEvents, 
  onAddEventClick 
}: CalendarHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-1">
          {['month', 'week', 'day'].map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange(mode as any)}
              className="capitalize"
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {canAddEvents && (
          <Button className="bg-green-600 hover:bg-green-700" onClick={onAddEventClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        )}
      </div>
    </div>
  );
};
