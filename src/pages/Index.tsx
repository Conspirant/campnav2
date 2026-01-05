import React, { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { CampusMap } from '@/components/CampusMap';
import { DestinationPicker } from '@/components/DestinationPicker';
import { NavigationPanel } from '@/components/NavigationPanel';
import { useNavigation } from '@/hooks/useNavigation';
import { Navigation, Compass, MapPin, ArrowRight, ChevronUp, ChevronDown, GripHorizontal } from 'lucide-react';
import { locations } from '@/data/campusData';

const Index = () => {
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState<string>('entrance');
  const [selectionMode, setSelectionMode] = useState<'start' | 'destination'>('destination');
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  const {
    navigationPath,
    userPosition,
    isNavigating,
    hasArrived,
    progressPercentage,
    startNavigation,
    stopNavigation,
    voice,
  } = useNavigation();

  const handleStartNavigation = useCallback(() => {
    if (selectedDestination) {
      startNavigation(selectedDestination, selectedStart);
      setIsPanelExpanded(true); // Expand panel when navigating
    }
  }, [selectedDestination, selectedStart, startNavigation]);

  const handleRestart = useCallback(() => {
    stopNavigation();
    setSelectedDestination(null);
    setSelectedStart('entrance');
    setSelectionMode('destination');
  }, [stopNavigation]);

  const handleMapLocationClick = useCallback((locationId: string) => {
    if (selectionMode === 'start') {
      setSelectedStart(locationId);
      setSelectionMode('destination');
    } else {
      setSelectedDestination(locationId);
    }
    // Auto-expand panel when selection is made
    if (!isPanelExpanded) {
      setIsPanelExpanded(true);
    }
  }, [selectionMode, isPanelExpanded]);

  const startLocation = locations.find(l => l.id === selectedStart);
  const destLocation = locations.find(l => l.id === selectedDestination);

  const togglePanel = () => setIsPanelExpanded(!isPanelExpanded);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Map Container - Takes full available space */}
        <div className="flex-1 relative min-h-0">
          <div className="absolute inset-0 p-2 sm:p-3">
            <div className="campus-card h-full p-1.5 sm:p-2 relative overflow-hidden">
              <CampusMap
                navigationPath={navigationPath}
                userPosition={userPosition}
                isNavigating={isNavigating}
                selectedDestination={selectedDestination}
                selectedStart={selectedStart}
                selectionMode={selectionMode}
                onLocationClick={!isNavigating ? handleMapLocationClick : undefined}
              />

              {/* Floating hint - only show when panel is collapsed */}
              {!isNavigating && !isPanelExpanded && (
                <div className="absolute top-2 left-2 right-2 flex justify-center pointer-events-none">
                  <div className="bg-card/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-border/60 flex items-center gap-2 text-xs font-medium animate-fade-up">
                    <Compass className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground">Tap a room or swipe up to select</span>
                  </div>
                </div>
              )}

              {/* Navigating Status */}
              {isNavigating && !hasArrived && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 status-badge status-badge-active animate-fade-up">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Navigating
                </div>
              )}

              {hasArrived && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 status-badge status-badge-success animate-fade-up">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  Arrived
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation Area */}
        <div className="bg-card/98 backdrop-blur-xl border-t border-border/40 shadow-xl safe-area-bottom">
          {/* Start Navigation Button - Always visible when destination selected */}
          {!isNavigating && selectedDestination && (
            <div className="px-4 py-3 border-b border-border/30">
              <button
                onClick={handleStartNavigation}
                className="nav-button w-full flex items-center justify-center gap-3 animate-scale-in text-base py-4"
              >
                <Navigation className="w-5 h-5" />
                Start Navigation to {destLocation?.shortName || destLocation?.name}
              </button>
            </div>
          )}

          {/* Collapsible Panel */}
          <div className={`transition-all duration-300 ease-out ${isPanelExpanded ? 'max-h-[45vh]' : 'max-h-14'}`}>
            {/* Drag Handle / Toggle */}
            <button
              onClick={togglePanel}
              className="w-full flex flex-col items-center py-2 cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-1" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isPanelExpanded ? (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>Collapse</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>{isNavigating ? 'View Progress' : 'Select Destination'}</span>
                  </>
                )}
              </div>
            </button>

            {/* Panel Content */}
            <div className={`overflow-hidden transition-all duration-300 ${isPanelExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="max-w-2xl mx-auto px-4 pb-4 sm:pb-6 space-y-3">
                {isNavigating ? (
                  <NavigationPanel
                    navigationPath={navigationPath}
                    endLocation={selectedDestination}
                    startLocation={selectedStart}
                    progressPercentage={progressPercentage}
                    isNavigating={isNavigating}
                    hasArrived={hasArrived}
                    isMuted={voice.isMuted}
                    isSpeaking={voice.isSpeaking}
                    onToggleMute={voice.toggleMute}
                    onStop={handleRestart}
                    onRestart={handleRestart}
                  />
                ) : (
                  <>
                    {/* Route Summary Card */}
                    <div className="campus-card p-3 space-y-2">
                      {/* Start Location */}
                      <button
                        onClick={() => setSelectionMode('start')}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${selectionMode === 'start'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/50'
                          : 'hover:bg-muted/50'
                          }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selectionMode === 'start' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 dark:bg-emerald-900/30'
                          }`}>
                          <span className="text-sm font-bold">A</span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Start</p>
                          <p className="font-semibold text-sm truncate">
                            {startLocation?.name || 'Select start point'}
                          </p>
                        </div>
                        {startLocation?.icon && (
                          <span className="text-lg">{startLocation.icon}</span>
                        )}
                      </button>

                      {/* Arrow */}
                      <div className="flex justify-center">
                        <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                      </div>

                      {/* Destination */}
                      <button
                        onClick={() => setSelectionMode('destination')}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${selectionMode === 'destination'
                          ? 'bg-primary/5 ring-2 ring-primary/50'
                          : 'hover:bg-muted/50'
                          }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selectionMode === 'destination' ? 'bg-primary text-white' : 'bg-primary/10'
                          }`}>
                          <span className="text-sm font-bold">B</span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Destination</p>
                          <p className={`font-semibold text-sm truncate ${!destLocation ? 'text-muted-foreground' : ''}`}>
                            {destLocation?.name || 'Choose where to go'}
                          </p>
                        </div>
                        {destLocation?.icon && (
                          <span className="text-lg">{destLocation.icon}</span>
                        )}
                      </button>
                    </div>

                    {/* Location Picker - Shows for both start and destination */}
                    <DestinationPicker
                      selectedDestination={selectionMode === 'start' ? selectedStart : selectedDestination}
                      onSelect={(id) => {
                        if (selectionMode === 'start') {
                          setSelectedStart(id);
                        } else {
                          setSelectedDestination(id);
                        }
                      }}
                      disabled={isNavigating}
                      mode={selectionMode}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
