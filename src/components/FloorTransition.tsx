import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { NavigationState } from '@/hooks/useFloorNavigation';

interface FloorTransitionProps {
    fromFloor: number;
    toFloor: number;
    transitionType: 'stairs' | 'lift';
    transitionProgress: number;
    liftWaitProgress?: number;
    navState: NavigationState;
    onComplete?: () => void;
}

const floorNames = ['Ground', 'Floor 1', 'Floor 2'];

export const FloorTransition: React.FC<FloorTransitionProps> = ({
    fromFloor,
    toFloor,
    transitionType,
    transitionProgress,
    liftWaitProgress = 0,
    navState,
}) => {
    const isGoingUp = toFloor > fromFloor;
    const floorDiff = Math.abs(toFloor - fromFloor);

    // Show overlay for lift waiting state or mid-transition
    const isActive = navState === 'WAITING_FOR_LIFT' ||
        navState === 'CLIMBING_STAIRS' ||
        navState === 'IN_LIFT' ||
        navState === 'EXITING_VERTICAL';

    if (!isActive) return null;

    // Calculate overall progress for stairs (just transition progress)
    // For lift: combine wait + travel progress
    const overallProgress = transitionType === 'lift'
        ? (navState === 'WAITING_FOR_LIFT' ? liftWaitProgress * 0.4 : 0.4 + transitionProgress * 0.6)
        : transitionProgress;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 animate-scale-up">
                {/* Icon container */}
                <div className="flex justify-center mb-4">
                    <div className={`
                        w-20 h-20 rounded-full flex items-center justify-center
                        ${transitionType === 'stairs'
                            ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                            : 'bg-gradient-to-br from-violet-400 to-violet-600'}
                        shadow-lg
                    `}>
                        {transitionType === 'stairs' ? (
                            // Animated stairs icon
                            <div className="relative">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-white">
                                    <path
                                        d="M4 20h4v-4h4v-4h4v-4h4V4"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                {/* Walking person on stairs */}
                                <div
                                    className="absolute text-2xl transition-all duration-300"
                                    style={{
                                        bottom: `${10 + transitionProgress * 30}px`,
                                        left: `${-5 + transitionProgress * 15}px`,
                                    }}
                                >
                                    🚶
                                </div>
                            </div>
                        ) : (
                            // Animated lift icon
                            <div className="relative">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-white">
                                    <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                                    {/* Door animation - opens when waiting, closes when moving */}
                                    <line
                                        x1="12"
                                        y1="6"
                                        x2="12"
                                        y2="18"
                                        stroke="currentColor"
                                        strokeWidth={navState === 'WAITING_FOR_LIFT' ? 0 : 2}
                                        className="transition-all duration-500"
                                    />
                                </svg>
                                {/* Floor indicator */}
                                <div
                                    className="absolute -right-3 transition-all duration-300 text-lg"
                                    style={{
                                        top: `${35 - transitionProgress * 30}px`,
                                    }}
                                >
                                    {isGoingUp ? '⬆️' : '⬇️'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status text */}
                <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-foreground mb-1">
                        {transitionType === 'stairs' ? '🪜 Using Stairs' : '🛗 Taking Elevator'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {navState === 'WAITING_FOR_LIFT' && 'Waiting for elevator...'}
                        {navState === 'IN_LIFT' && 'Riding elevator...'}
                        {navState === 'CLIMBING_STAIRS' && (isGoingUp ? 'Climbing up...' : 'Walking down...')}
                        {navState === 'EXITING_VERTICAL' && 'Almost there...'}
                    </p>
                </div>

                {/* Floor transition display */}
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className={`
                        px-4 py-2 rounded-full text-sm font-medium
                        ${transitionProgress < 0.5
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'}
                        transition-all duration-300
                    `}>
                        {floorNames[fromFloor]}
                    </div>

                    <div className="flex items-center gap-1">
                        {isGoingUp ? (
                            <ArrowUp className="w-5 h-5 text-primary animate-bounce" />
                        ) : (
                            <ArrowDown className="w-5 h-5 text-primary animate-bounce" />
                        )}
                    </div>

                    <div className={`
                        px-4 py-2 rounded-full text-sm font-medium
                        ${transitionProgress >= 0.5
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'}
                        transition-all duration-300
                    `}>
                        {floorNames[toFloor]}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className={`
                            h-full rounded-full transition-all duration-150
                            ${transitionType === 'stairs'
                                ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                                : 'bg-gradient-to-r from-violet-400 to-violet-600'}
                        `}
                        style={{ width: `${overallProgress * 100}%` }}
                    />
                </div>

                {/* Time estimate */}
                <p className="text-xs text-center text-muted-foreground mt-3">
                    {transitionType === 'stairs'
                        ? `~${Math.ceil((1 - transitionProgress) * floorDiff * 15)}s remaining`
                        : navState === 'WAITING_FOR_LIFT'
                            ? `Doors opening... ${Math.ceil((1 - liftWaitProgress) * 3)}s`
                            : `~${Math.ceil((1 - transitionProgress) * floorDiff * 5)}s remaining`
                    }
                </p>
            </div>
        </div>
    );
};
