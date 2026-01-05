import React from 'react';
import { Button } from '@/components/ui/button';
import { Layers, Navigation } from 'lucide-react';
import { NavigationState } from '@/hooks/useFloorNavigation';

interface FloorSelectorProps {
  currentFloor: number;
  onFloorChange: (floor: number) => void;
  floors: { id: number; name: string }[];
  disabled?: boolean;
  navState?: NavigationState;
}

export const FloorSelector: React.FC<FloorSelectorProps> = ({
  currentFloor,
  onFloorChange,
  floors,
  disabled = false,
  navState = 'IDLE',
}) => {
  // Floor buttons are readonly during active navigation (except IDLE and ARRIVED)
  const isNavigating = navState !== 'IDLE' && navState !== 'ARRIVED';
  const isReadonly = disabled || isNavigating;

  return (
    <div className="glass-panel rounded-xl p-4 space-y-3 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Layers className="w-4 h-4 text-primary" />
          <span>Floor</span>
        </div>
        {isNavigating && (
          <div className="flex items-center gap-1.5 text-xs text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
            <Navigation className="w-3 h-3" />
            <span>Following marker</span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        {floors.map((floor) => (
          <Button
            key={floor.id}
            variant={currentFloor === floor.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => !isReadonly && onFloorChange(floor.id)}
            className={`flex-1 ${isReadonly && currentFloor !== floor.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isReadonly && currentFloor !== floor.id}
            title={isNavigating ? 'Floor follows marker during navigation' : undefined}
          >
            {floor.name}
          </Button>
        ))}
      </div>
      {isNavigating && (
        <p className="text-xs text-muted-foreground text-center">
          Floor changes automatically via stairs/lift
        </p>
      )}
    </div>
  );
};
