import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { CampusNode, getNodeById, campusEdges } from '@/data/campusData';

// Navigation states for floor transitions
export type NavigationState =
    | 'IDLE'              // Not navigating
    | 'WALKING'           // Moving on current floor
    | 'TURNING'           // Rotating at a junction
    | 'APPROACHING_STAIRS' // Walking to stairs
    | 'CLIMBING_STAIRS'   // Animated stair transition
    | 'APPROACHING_LIFT'  // Walking to lift
    | 'WAITING_FOR_LIFT'  // Waiting for lift doors
    | 'IN_LIFT'           // Vertical lift transition
    | 'EXITING_VERTICAL'  // Exiting stairs/lift
    | 'ARRIVED';          // Reached destination

export interface MarkerPosition {
    x: number;
    y: number;
    floor: number;
    rotation: number; // Direction in degrees (0 = north, 90 = east, etc.)
    stepPhase: number; // 0-1 oscillation for walking animation
}

export interface NavigationSegment {
    from: CampusNode;
    to: CampusNode;
    type: 'walk' | 'stairs' | 'lift';
    direction: string;
}

interface UseFloorNavigationProps {
    path: CampusNode[];
    isNavigating: boolean;
    onFloorChange: (floor: number) => void;
}

interface UseFloorNavigationReturn {
    navState: NavigationState;
    markerPosition: MarkerPosition | null;
    currentSegmentIndex: number;
    transitionProgress: number; // 0-1 for animations
    currentTransitionType: 'stairs' | 'lift' | null;
    liftWaitProgress: number; // 0-1 for lift waiting phase
    startNavigation: () => void;
    pauseNavigation: () => void;
    resumeNavigation: () => void;
    stopNavigation: () => void;
}

// Speed constants (meters per second) - Optimized for UI (faster than reality)
const WALK_SPEED = 8;  // Fast brisk walk/jog for UI responsiveness
const STAIR_SPEED = 4; // Slower on stairs
const LIFT_SPEED = 2;  // Matches approx 1-1.5s per floor (dist=2m)

// Timing constants (milliseconds)
const LIFT_WAIT_TIME = 3000; // Wait for lift doors to open
const LIFT_TRAVEL_TIME_PER_FLOOR = 1500; // Travel time per floor
const TURN_DURATION = 300; // Time to animate a turn

// Step animation frequency
const STEP_FREQUENCY = 3; // Steps per second

// Direction to rotation mapping
const directionToRotation: Record<string, number> = {
    'north': 0,
    'northeast': 45,
    'east': 90,
    'southeast': 135,
    'south': 180,
    'southwest': 225,
    'west': 270,
    'northwest': 315,
    'up': 0,
    'down': 180,
};

export const useFloorNavigation = ({
    path,
    isNavigating,
    onFloorChange,
}: UseFloorNavigationProps): UseFloorNavigationReturn => {
    const [navState, setNavState] = useState<NavigationState>('IDLE');
    const [markerPosition, setMarkerPosition] = useState<MarkerPosition | null>(null);
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
    const [transitionProgress, setTransitionProgress] = useState(0);
    const [currentTransitionType, setCurrentTransitionType] = useState<'stairs' | 'lift' | null>(null);
    const [liftWaitProgress, setLiftWaitProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [targetRotation, setTargetRotation] = useState(0);
    const [currentRotation, setCurrentRotation] = useState(0);

    const animationRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const liftWaitStartRef = useRef<number | null>(null);
    const stepTimeRef = useRef<number>(0);
    
    // Use refs to avoid recreating animate callback
    const segmentsRef = useRef<NavigationSegment[]>([]);
    const isPausedRef = useRef(false);
    const navStateRef = useRef<NavigationState>('IDLE');
    const currentSegmentIndexRef = useRef(0);
    const transitionProgressRef = useRef(0);
    const currentRotationRef = useRef(0);
    const targetRotationRef = useRef(0);
    const markerPositionRef = useRef<MarkerPosition | null>(null);

    // Calculate segments from path - memoized to prevent recalculation
    const segments = useMemo<NavigationSegment[]>(() => {
        const segs: NavigationSegment[] = [];
        if (path.length >= 2) {
            for (let i = 0; i < path.length - 1; i++) {
                const from = path[i];
                const to = path[i + 1];

                // Find edge between nodes
                const edge = campusEdges.find(e =>
                    (e.from === from.id && e.to === to.id) ||
                    (e.to === from.id && e.from === to.id)
                );

                const type = edge?.transitionType || 'walk';
                const direction = edge?.direction || '';

                segs.push({ from, to, type, direction });
            }
        }
        segmentsRef.current = segs;
        return segs;
    }, [path]);

    // Interpolate position between two points
    const interpolate = useCallback((
        from: { x: number; y: number },
        to: { x: number; y: number },
        t: number
    ): { x: number; y: number } => {
        // Use easeInOutQuad for smoother movement
        const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        return {
            x: from.x + (to.x - from.x) * easedT,
            y: from.y + (to.y - from.y) * easedT,
        };
    }, []);

    // Get distance between two nodes
    const getDistance = useCallback((from: CampusNode, to: CampusNode): number => {
        return Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
    }, []);

    // Interpolate rotation (shortest path)
    const interpolateRotation = useCallback((from: number, to: number, t: number): number => {
        // Normalize angles to 0-360
        from = ((from % 360) + 360) % 360;
        to = ((to % 360) + 360) % 360;

        // Find shortest path
        let diff = to - from;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        return from + diff * t;
    }, []);

    // Update refs when state changes
    useEffect(() => {
        isPausedRef.current = isPaused;
        navStateRef.current = navState;
        currentSegmentIndexRef.current = currentSegmentIndex;
        transitionProgressRef.current = transitionProgress;
        currentRotationRef.current = currentRotation;
        targetRotationRef.current = targetRotation;
        markerPositionRef.current = markerPosition;
    }, [isPaused, navState, currentSegmentIndex, transitionProgress, currentRotation, targetRotation, markerPosition]);

    // Animation loop - stable callback using refs
    const animate = useCallback((timestamp: number) => {
        if (isPausedRef.current || navStateRef.current === 'IDLE' || navStateRef.current === 'ARRIVED') {
            if (animationRef.current) {
                animationRef.current = requestAnimationFrame(animate);
            }
            return;
        }

        if (!lastTimeRef.current) {
            lastTimeRef.current = timestamp;
        }

        const deltaTime = (timestamp - lastTimeRef.current) / 1000; // seconds
        lastTimeRef.current = timestamp;

        // Update step phase for walking animation
        stepTimeRef.current += deltaTime;
        const stepPhase = (Math.sin(stepTimeRef.current * Math.PI * 2 * STEP_FREQUENCY) + 1) / 2;

        const currentSegIndex = currentSegmentIndexRef.current;
        const currentSegments = segmentsRef.current;

        if (currentSegIndex >= currentSegments.length) {
            setNavState('ARRIVED');
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            return;
        }

        const segment = currentSegments[currentSegIndex];
        const newTargetRotation = directionToRotation[segment.direction] ?? targetRotationRef.current;

        // Smoothly interpolate rotation
        const rotationDiff = Math.abs(newTargetRotation - currentRotationRef.current);
        if (rotationDiff > 5) {
            const rotationSpeed = 360 / (TURN_DURATION / 1000); // degrees per second
            const rotationStep = rotationSpeed * deltaTime;
            const interpolatedRotation = interpolateRotation(currentRotationRef.current, newTargetRotation, Math.min(1, rotationStep / rotationDiff));
            setCurrentRotation(interpolatedRotation);
            setTargetRotation(newTargetRotation);
        }

        // Handle lift waiting phase
        if (segment.type === 'lift' && segment.from.floor !== segment.to.floor) {
            if (navStateRef.current !== 'IN_LIFT' && navStateRef.current !== 'WAITING_FOR_LIFT' && transitionProgressRef.current < 0.1) {
                // Start waiting for lift
                if (!liftWaitStartRef.current) {
                    liftWaitStartRef.current = timestamp;
                    setNavState('WAITING_FOR_LIFT');
                }

                const waitElapsed = timestamp - liftWaitStartRef.current;
                const waitProgress = Math.min(1, waitElapsed / LIFT_WAIT_TIME);
                setLiftWaitProgress(waitProgress);

                if (waitProgress < 1) {
                    // Still waiting
                    setMarkerPosition(prev => prev ? {
                        ...prev,
                        stepPhase: 0, // Standing still while waiting
                        rotation: currentRotationRef.current,
                    } : null);
                    animationRef.current = requestAnimationFrame(animate);
                    return;
                } else {
                    // Done waiting, start moving
                    liftWaitStartRef.current = null;
                    setNavState('IN_LIFT');
                }
            }
        }

        const distance = getDistance(segment.from, segment.to);

        // Determine speed based on segment type
        let speed = WALK_SPEED;
        if (segment.type === 'stairs') speed = STAIR_SPEED;
        if (segment.type === 'lift') speed = LIFT_SPEED;

        // Calculate progress increment
        const progressIncrement = (speed * deltaTime) / distance;
        const newProgress = Math.min(1, transitionProgressRef.current + progressIncrement);
        setTransitionProgress(newProgress);

        // Update marker position with interpolation
        const pos = interpolate(segment.from, segment.to, newProgress);

        // Handle floor transitions for stairs
        if (segment.type === 'stairs') {
            setCurrentTransitionType('stairs');

            if (segment.from.floor !== segment.to.floor) {
                // Add diagonal offset for stair climbing effect
                const stairOffset = Math.sin(newProgress * Math.PI * 4) * 0.5; // Small oscillation (0.5m)

                // Switch floor at 50% progress
                if (newProgress >= 0.5 && markerPositionRef.current?.floor === segment.from.floor) {
                    onFloorChange(segment.to.floor);
                }

                if (newProgress < 0.5) {
                    setNavState('CLIMBING_STAIRS');
                } else {
                    setNavState('EXITING_VERTICAL');
                }

                setMarkerPosition({
                    x: pos.x + stairOffset,
                    y: pos.y - stairOffset, // Move diagonally upward visually
                    floor: newProgress >= 0.5 ? segment.to.floor : segment.from.floor,
                    rotation: currentRotationRef.current,
                    stepPhase: Math.abs(Math.sin(newProgress * Math.PI * 8)), // Faster oscillation for stairs
                });
            }
        } else if (segment.type === 'lift') {
            setCurrentTransitionType('lift');

            if (segment.from.floor !== segment.to.floor) {
                // Switch floor at 50% progress
                if (newProgress >= 0.5 && markerPositionRef.current?.floor === segment.from.floor) {
                    onFloorChange(segment.to.floor);
                }

                if (newProgress < 0.5) {
                    setNavState('IN_LIFT');
                } else {
                    setNavState('EXITING_VERTICAL');
                }

                setMarkerPosition({
                    x: pos.x,
                    y: pos.y,
                    floor: newProgress >= 0.5 ? segment.to.floor : segment.from.floor,
                    rotation: currentRotationRef.current,
                    stepPhase: 0, // No stepping while in lift
                });
            }
        } else {
            setCurrentTransitionType(null);
            setNavState('WALKING');

            setMarkerPosition({
                x: pos.x,
                y: pos.y,
                floor: segment.from.floor,
                rotation: currentRotationRef.current,
                stepPhase: stepPhase,
            });
        }

        // Move to next segment if complete
        if (newProgress >= 1) {
            const nextIndex = currentSegIndex + 1;
            setCurrentSegmentIndex(nextIndex);
            setTransitionProgress(0);
            setLiftWaitProgress(0);
            liftWaitStartRef.current = null;

            if (nextIndex >= currentSegments.length) {
                setNavState('ARRIVED');
                setMarkerPosition(prev => prev ? { ...prev, stepPhase: 0 } : null);
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
                return;
            }
        }

        animationRef.current = requestAnimationFrame(animate);
    }, [getDistance, interpolate, interpolateRotation, onFloorChange]);

    // Start navigation
    const startNavigation = useCallback(() => {
        if (path.length < 2) return;

        setNavState('WALKING');
        setCurrentSegmentIndex(0);
        setTransitionProgress(0);
        setLiftWaitProgress(0);
        setIsPaused(false);
        lastTimeRef.current = 0;
        stepTimeRef.current = 0;
        liftWaitStartRef.current = null;

        const startNode = path[0];
        const firstSegment = segments[0];
        const initialRotation = firstSegment ? (directionToRotation[firstSegment.direction] ?? 0) : 0;

        setCurrentRotation(initialRotation);
        setTargetRotation(initialRotation);
        setMarkerPosition({
            x: startNode.x,
            y: startNode.y,
            floor: startNode.floor,
            rotation: initialRotation,
            stepPhase: 0,
        });
        onFloorChange(startNode.floor);

        // Start animation loop immediately
        const startAnim = () => {
            animationRef.current = requestAnimationFrame(animate);
        };
        startAnim();
    }, [path, segments, onFloorChange, animate]);

    // Pause/Resume/Stop
    const pauseNavigation = useCallback(() => {
        setIsPaused(true);
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    }, []);

    const resumeNavigation = useCallback(() => {
        setIsPaused(false);
        lastTimeRef.current = 0;
        if (!animationRef.current) {
            animationRef.current = requestAnimationFrame(animate);
        }
    }, [animate]);

    const stopNavigation = useCallback(() => {
        setNavState('IDLE');
        setIsPaused(false);
        setCurrentSegmentIndex(0);
        setTransitionProgress(0);
        setLiftWaitProgress(0);
        setMarkerPosition(null);
        setCurrentTransitionType(null);
        setCurrentRotation(0);
        setTargetRotation(0);
        liftWaitStartRef.current = null;
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    }, []);

    // Start animation when navigation begins
    useEffect(() => {
        if (isNavigating && path.length >= 2) {
            if (navState === 'IDLE') {
                startNavigation();
            } else if (navState === 'ARRIVED') {
                // Reset and restart if needed
                stopNavigation();
                setTimeout(() => {
                    if (isNavigating && path.length >= 2) {
                        startNavigation();
                    }
                }, 100);
            }
        } else if (!isNavigating && navState !== 'IDLE') {
            stopNavigation();
        }
    }, [isNavigating, path.length, navState, startNavigation, stopNavigation]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return {
        navState,
        markerPosition,
        currentSegmentIndex,
        transitionProgress,
        currentTransitionType,
        liftWaitProgress,
        startNavigation,
        pauseNavigation,
        resumeNavigation,
        stopNavigation,
    };
};
