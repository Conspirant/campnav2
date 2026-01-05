import React from 'react';
import { Navigation, Clock, Volume2, VolumeX, X, RotateCcw, CheckCircle2, MapPin } from 'lucide-react';
import { NavigationPath } from '@/types/campus';
import { locations } from '@/data/campusData';

interface NavigationPanelProps {
  navigationPath: NavigationPath | null;
  endLocation: string | null;
  startLocation?: string;
  progressPercentage: number;
  isNavigating: boolean;
  hasArrived: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  onToggleMute: () => void;
  onStop: () => void;
  onRestart: () => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  navigationPath,
  endLocation,
  startLocation,
  progressPercentage,
  isNavigating,
  hasArrived,
  isMuted,
  isSpeaking,
  onToggleMute,
  onStop,
  onRestart,
}) => {
  if (!isNavigating || !navigationPath) return null;

  const destination = locations.find(l => l.id === endLocation);
  const start = locations.find(l => l.id === startLocation);
  const remainingTime = Math.max(
    0,
    Math.round(navigationPath.estimatedTime * (1 - progressPercentage / 100))
  );

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  // Get current instruction based on progress
  const currentInstructionIndex = Math.min(
    Math.floor((progressPercentage / 100) * navigationPath.instructions.length),
    navigationPath.instructions.length - 1
  );
  const currentInstruction = navigationPath.instructions[currentInstructionIndex];

  return (
    <div className="space-y-3 animate-slide-up">
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${hasArrived
              ? 'bg-success/10 text-success'
              : 'bg-primary/10 text-primary'
            }`}>
            {hasArrived ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
              <span className="truncate">{start?.name || 'Start'}</span>
              <span>→</span>
              <span className="truncate">{destination?.name || 'Dest'}</span>
            </div>
            <p className="font-bold text-base text-foreground truncate">
              {hasArrived ? '🎉 Arrived!' : destination?.name}
            </p>
          </div>
        </div>

        <button
          onClick={onStop}
          className="w-9 h-9 rounded-xl bg-muted hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-all duration-200 shrink-0"
          aria-label="Stop navigation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="progress-bar h-2">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className={`font-semibold ${hasArrived ? 'text-success' : 'text-primary'}`}>
            {hasArrived ? '✓ Complete' : `${Math.round(progressPercentage)}%`}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            {hasArrived ? 'You made it!' : formatTime(remainingTime)}
          </span>
        </div>
      </div>

      {/* Current Instruction - Compact */}
      {!hasArrived && currentInstruction && (
        <div className="bg-muted/40 rounded-xl p-3 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSpeaking ? 'bg-primary text-primary-foreground animate-pulse' : 'bg-primary/15 text-primary'
            }`}>
            <span className="text-base">
              {currentInstruction.type === 'turn_left' ? '↰' :
                currentInstruction.type === 'turn_right' ? '↱' :
                  currentInstruction.type === 'arrive' ? '📍' :
                    currentInstruction.type === 'landmark' ? '🏛️' : '→'}
            </span>
          </div>
          <p className="font-medium text-sm text-foreground flex-1 leading-snug">
            {currentInstruction.text}
          </p>
        </div>
      )}

      {/* Success Message */}
      {hasArrived && (
        <div className="bg-success/10 rounded-xl p-3 text-center">
          <p className="text-success font-semibold text-sm">You've reached your destination!</p>
        </div>
      )}

      {/* Action Buttons - Horizontal on mobile */}
      <div className="flex gap-2">
        <button
          onClick={onToggleMute}
          className={`voice-fab ${isMuted ? 'muted' : ''} ${isSpeaking && !isMuted ? 'active' : ''}`}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {hasArrived && (
          <button
            onClick={onRestart}
            className="nav-button flex-1 flex items-center justify-center gap-2 text-sm py-3"
          >
            <RotateCcw className="w-4 h-4" />
            New Route
          </button>
        )}
      </div>
    </div>
  );
};
