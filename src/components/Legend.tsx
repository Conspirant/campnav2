import React from 'react';

const legendItems = [
  { name: 'CSE Block', color: 'bg-campus-cse' },
  { name: 'ECE Block', color: 'bg-campus-ece' },
  { name: 'Mechanical', color: 'bg-campus-mech' },
  { name: 'Civil', color: 'bg-campus-civil' },
  { name: 'Labs', color: 'bg-campus-labs' },
  { name: 'Office', color: 'bg-campus-office' },
  { name: 'Seminar Hall', color: 'bg-campus-seminar' },
  { name: 'Canteen', color: 'bg-campus-canteen' },
  { name: 'Basketball Court', color: 'bg-campus-bbc' },
];

export const Legend: React.FC = () => {
  return (
    <div className="glass-panel rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <h3 className="text-sm font-semibold text-foreground mb-3">Map Legend</h3>
      <div className="grid grid-cols-3 gap-2">
        {legendItems.map(item => (
          <div key={item.name} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${item.color}`} />
            <span className="text-xs text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
