import React from 'react';
import { Navigation, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="py-3 px-4 sm:py-4 sm:px-6 bg-card/80 backdrop-blur-xl border-b border-border/30 sticky top-0 z-50 safe-area-top">
      <div className="flex items-center justify-center gap-2.5 max-w-2xl mx-auto">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 relative overflow-hidden">
          <Navigation className="w-5 h-5 text-primary-foreground relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
              CampusNav
            </h1>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium tracking-wide -mt-0.5">
            Smart Indoor Navigation
          </p>
        </div>
      </div>
    </header>
  );
};
