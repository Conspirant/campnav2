import { useState, useCallback, useEffect, useRef } from 'react';
import { NavigationPath, UserPosition } from '@/types/campus';
import { findShortestPath, interpolatePosition } from '@/utils/pathfinding';
import { useVoiceNavigation } from './useVoiceNavigation';
import { locations } from '@/data/campusData';

export function useNavigation() {
  const [startLocation, setStartLocation] = useState<string>('entrance');
  const [endLocation, setEndLocation] = useState<string | null>(null);
  const [navigationPath, setNavigationPath] = useState<NavigationPath | null>(null);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);

  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  const voice = useVoiceNavigation();

  const startNavigation = useCallback((destinationId: string, startLocationId?: string) => {
    const actualStartLocation = startLocationId || startLocation;
    const path = findShortestPath(actualStartLocation, destinationId);

    if (!path) {
      console.error('Could not find path');
      return;
    }

    if (startLocationId) {
      setStartLocation(startLocationId);
    }

    setEndLocation(destinationId);
    setNavigationPath(path);
    setHasArrived(false);
    setUserPosition({
      x: path.nodes[0].x,
      y: path.nodes[0].y,
      currentNodeIndex: 0,
      progress: 0,
    });
    setIsNavigating(true);
    lastTimeRef.current = 0;
    accumulatedTimeRef.current = 0;

    // Speak start instruction
    const destination = locations.find(l => l.id === destinationId);
    const start = locations.find(l => l.id === actualStartLocation);
    voice.resetSpeech();
    setTimeout(() => {
      voice.speak(`Starting navigation from ${start?.name || 'entrance'} to ${destination?.name || 'destination'}`);
    }, 300);
  }, [startLocation, voice]);

  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    setNavigationPath(null);
    setUserPosition(null);
    setEndLocation(null);
    setHasArrived(false);
    voice.resetSpeech();
    lastTimeRef.current = 0;
    accumulatedTimeRef.current = 0;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [voice]);

  // Smooth animation loop using requestAnimationFrame with fixed timestep
  useEffect(() => {
    if (!isNavigating || !navigationPath || hasArrived) return;

    const SPEED = 0.00025; // Much slower, smoother movement
    const FIXED_TIMESTEP = 16; // ~60fps target

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = Math.min(timestamp - lastTimeRef.current, 50); // Cap delta to prevent jumps
      lastTimeRef.current = timestamp;
      accumulatedTimeRef.current += deltaTime;

      // Process in fixed timesteps for consistent movement
      while (accumulatedTimeRef.current >= FIXED_TIMESTEP) {
        accumulatedTimeRef.current -= FIXED_TIMESTEP;

        setUserPosition(prev => {
          if (!prev || !navigationPath) return prev;

          let newProgress = prev.progress + SPEED * FIXED_TIMESTEP;
          let newNodeIndex = prev.currentNodeIndex;

          // Move to next node if progress exceeds 1
          if (newProgress >= 1 && newNodeIndex < navigationPath.nodes.length - 1) {
            newProgress = 0;
            newNodeIndex++;

            // Check for instructions at this node
            const instruction = navigationPath.instructions.find(
              inst => inst.nodeIndex === newNodeIndex
            );
            if (instruction) {
              voice.speakInstruction(instruction, newNodeIndex);
            }
          }

          // Check if arrived
          if (newNodeIndex >= navigationPath.nodes.length - 1 && newProgress >= 1) {
            newProgress = 1;
            if (!hasArrived) {
              setHasArrived(true);
              voice.speak('You have arrived at your destination');
            }
            return {
              ...prev,
              currentNodeIndex: newNodeIndex,
              progress: 1,
              x: navigationPath.nodes[navigationPath.nodes.length - 1].x,
              y: navigationPath.nodes[navigationPath.nodes.length - 1].y,
            };
          }

          const position = interpolatePosition(navigationPath.nodes, newNodeIndex, Math.min(newProgress, 1));

          return {
            x: position.x,
            y: position.y,
            currentNodeIndex: newNodeIndex,
            progress: newProgress,
          };
        });
      }

      if (!hasArrived) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isNavigating, navigationPath, hasArrived, voice]);

  // Calculate progress percentage
  const progressPercentage = userPosition && navigationPath && navigationPath.nodes.length > 1
    ? ((userPosition.currentNodeIndex + userPosition.progress) / (navigationPath.nodes.length - 1)) * 100
    : 0;

  return {
    startLocation,
    setStartLocation,
    endLocation,
    navigationPath,
    userPosition,
    isNavigating,
    hasArrived,
    progressPercentage: Math.min(progressPercentage, 100),
    startNavigation,
    stopNavigation,
    voice,
  };
}
