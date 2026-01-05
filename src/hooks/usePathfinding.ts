import { useMemo, useCallback } from 'react';
import { campusNodes, campusEdges, CampusNode, getNodeById } from '@/data/campusData';

interface PathResult {
  path: CampusNode[];
  totalDistance: number;
  directions: string[];
}

// Priority Queue implementation for A*
class PriorityQueue<T> {
  private items: { element: T; priority: number }[] = [];

  enqueue(element: T, priority: number) {
    const item = { element, priority };
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (item.priority < this.items[i].priority) {
        this.items.splice(i, 0, item);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(item);
    }
  }

  dequeue(): T | undefined {
    return this.items.shift()?.element;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

export const usePathfinding = () => {
  // Build base adjacency list from edges
  const baseAdjacencyList = useMemo(() => {
    const list: Map<string, { nodeId: string; distance: number; direction: string; transitionType?: string }[]> = new Map();

    campusNodes.forEach(node => {
      list.set(node.id, []);
    });

    campusEdges.forEach(edge => {
      // Add both directions (undirected graph)
      list.get(edge.from)?.push({
        nodeId: edge.to,
        distance: edge.distance,
        direction: edge.direction || '',
        transitionType: edge.transitionType,
      });

      // Reverse direction for the opposite edge
      const reverseDirection = getOppositeDirection(edge.direction || '');
      list.get(edge.to)?.push({
        nodeId: edge.from,
        distance: edge.distance,
        direction: reverseDirection,
        transitionType: edge.transitionType,
      });
    });

    return list;
  }, []);

  // Heuristic function for A* (Euclidean distance)
  const heuristic = useCallback((nodeA: CampusNode, nodeB: CampusNode): number => {
    const dx = nodeA.x - nodeB.x;
    const dy = nodeA.y - nodeB.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // A* pathfinding algorithm with transport preference
  const findPath = useCallback((startId: string, endId: string, preferredTransport?: 'stairs' | 'lift'): PathResult | null => {
    const startNode = getNodeById(startId);
    const endNode = getNodeById(endId);

    if (!startNode || !endNode) {
      return null;
    }

    // Filter adjacency list based on transport preference
    const adjacencyList = new Map<string, { nodeId: string; distance: number; direction: string }[]>();

    baseAdjacencyList.forEach((neighbors, nodeId) => {
      const filteredNeighbors = neighbors.filter(neighbor => {
        // If there's a preferred transport, filter vertical transitions
        if (preferredTransport && neighbor.transitionType) {
          const fromNode = getNodeById(nodeId);
          const toNode = getNodeById(neighbor.nodeId);

          // Check if this is a vertical transition (floor change)
          if (fromNode && toNode && fromNode.floor !== toNode.floor) {
            // Only allow the preferred transport type
            return neighbor.transitionType === preferredTransport;
          }
        }
        // Allow all other edges (walking, same floor, etc.)
        return true;
      });

      adjacencyList.set(nodeId, filteredNeighbors.map(n => ({
        nodeId: n.nodeId,
        distance: n.distance,
        direction: n.direction,
      })));
    });

    const openSet = new PriorityQueue<string>();
    const cameFrom: Map<string, string> = new Map();
    const gScore: Map<string, number> = new Map();
    const fScore: Map<string, number> = new Map();
    const directionFromPrev: Map<string, string> = new Map();

    campusNodes.forEach(node => {
      gScore.set(node.id, Infinity);
      fScore.set(node.id, Infinity);
    });

    gScore.set(startId, 0);
    fScore.set(startId, heuristic(startNode, endNode));
    openSet.enqueue(startId, fScore.get(startId)!);

    while (!openSet.isEmpty()) {
      const current = openSet.dequeue()!;

      if (current === endId) {
        // Reconstruct path
        const path: CampusNode[] = [];
        const directions: string[] = [];
        let node = current;

        while (node !== startId) {
          const nodeData = getNodeById(node);
          if (nodeData) path.unshift(nodeData);

          const dir = directionFromPrev.get(node);
          if (dir) directions.unshift(dir);

          node = cameFrom.get(node)!;
        }

        path.unshift(startNode);

        return {
          path,
          totalDistance: gScore.get(endId)!,
          directions: generateVoiceDirections(path, directions),
        };
      }

      const neighbors = adjacencyList.get(current) || [];

      for (const neighbor of neighbors) {
        const currentGScore = gScore.get(current);
        if (currentGScore === undefined || currentGScore === Infinity) continue;

        const tentativeGScore = currentGScore + neighbor.distance;
        const neighborGScore = gScore.get(neighbor.nodeId) ?? Infinity;

        if (tentativeGScore < neighborGScore) {
          cameFrom.set(neighbor.nodeId, current);
          directionFromPrev.set(neighbor.nodeId, neighbor.direction);
          gScore.set(neighbor.nodeId, tentativeGScore);

          const neighborNode = getNodeById(neighbor.nodeId);
          if (neighborNode) {
            const h = heuristic(neighborNode, endNode);
            const f = tentativeGScore + h;
            fScore.set(neighbor.nodeId, f);
            openSet.enqueue(neighbor.nodeId, f);
          }
        }
      }
    }

    return null; // No path found
  }, [baseAdjacencyList, heuristic]);

  return { findPath };
};

// Helper function to get opposite direction
function getOppositeDirection(direction: string): string {
  const opposites: Record<string, string> = {
    north: 'south',
    south: 'north',
    east: 'west',
    west: 'east',
    northeast: 'southwest',
    northwest: 'southeast',
    southeast: 'northwest',
    southwest: 'northeast',
  };
  return opposites[direction] || direction;
}

// Generate human-readable voice directions
function generateVoiceDirections(path: CampusNode[], directions: string[]): string[] {
  const voiceDirections: string[] = [];

  if (path.length === 0) return voiceDirections;

  voiceDirections.push(`Starting from ${path[0].name}`);

  let prevDirection = '';
  let straightDistance = 0;

  for (let i = 1; i < path.length; i++) {
    const currentDirection = directions[i - 1] || '';
    const node = path[i];
    const prevNode = path[i - 1];

    // Calculate approximate distance
    const dx = node.x - prevNode.x;
    const dy = node.y - prevNode.y;
    const distance = Math.round(Math.sqrt(dx * dx + dy * dy) / 10) * 5; // Round to nearest 5 meters

    if (currentDirection === prevDirection && node.type !== 'room' && node.type !== 'outdoor') {
      straightDistance += distance;
    } else {
      if (straightDistance > 0 && prevDirection) {
        voiceDirections.push(`Continue ${prevDirection} for ${straightDistance} meters`);
      }

      if (node.type === 'room' || node.type === 'outdoor') {
        if (currentDirection) {
          voiceDirections.push(`Turn ${currentDirection} and enter ${node.name}`);
        } else {
          voiceDirections.push(`You have arrived at ${node.name}`);
        }
      } else if (node.type === 'junction' || node.type === 'entrance') {
        if (currentDirection && currentDirection !== prevDirection) {
          voiceDirections.push(`Turn ${currentDirection} at ${node.name}`);
        }
      }

      straightDistance = distance;
      prevDirection = currentDirection;
    }
  }

  // Final destination
  const lastNode = path[path.length - 1];
  voiceDirections.push(`You have reached your destination: ${lastNode.name}`);

  return voiceDirections;
}
