import { PathNode, NavigationPath, NavigationInstruction } from '@/types/campus';
import { pathNodes, locationToNode } from '@/data/campusData';

interface DijkstraNode {
  id: string;
  distance: number;
  previous: string | null;
}

function getDistance(a: PathNode, b: PathNode): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getAngle(from: PathNode, to: PathNode): number {
  return Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
}

function getTurnDirection(prevAngle: number, nextAngle: number): 'left' | 'right' | 'straight' {
  let diff = nextAngle - prevAngle;
  // Normalize to -180 to 180
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  
  if (Math.abs(diff) < 30) return 'straight';
  return diff > 0 ? 'right' : 'left';
}

export function findShortestPath(startLocationId: string, endLocationId: string): NavigationPath | null {
  const startNodeId = locationToNode[startLocationId];
  const endNodeId = locationToNode[endLocationId];
  
  if (!startNodeId || !endNodeId) return null;
  
  // Build node map
  const nodeMap = new Map<string, PathNode>();
  pathNodes.forEach(node => nodeMap.set(node.id, node));
  
  // Dijkstra's algorithm
  const distances = new Map<string, DijkstraNode>();
  const unvisited = new Set<string>();
  
  pathNodes.forEach(node => {
    distances.set(node.id, {
      id: node.id,
      distance: node.id === startNodeId ? 0 : Infinity,
      previous: null,
    });
    unvisited.add(node.id);
  });
  
  while (unvisited.size > 0) {
    // Find minimum distance node
    let minNode: DijkstraNode | null = null;
    for (const id of unvisited) {
      const node = distances.get(id)!;
      if (!minNode || node.distance < minNode.distance) {
        minNode = node;
      }
    }
    
    if (!minNode || minNode.distance === Infinity) break;
    if (minNode.id === endNodeId) break;
    
    unvisited.delete(minNode.id);
    
    const currentPathNode = nodeMap.get(minNode.id)!;
    
    for (const neighborId of currentPathNode.connections) {
      if (!unvisited.has(neighborId)) continue;
      
      const neighborPathNode = nodeMap.get(neighborId)!;
      const dist = getDistance(currentPathNode, neighborPathNode);
      const newDist = minNode.distance + dist;
      
      const neighborDijkstra = distances.get(neighborId)!;
      if (newDist < neighborDijkstra.distance) {
        neighborDijkstra.distance = newDist;
        neighborDijkstra.previous = minNode.id;
      }
    }
  }
  
  // Reconstruct path
  const path: PathNode[] = [];
  let currentId: string | null = endNodeId;
  
  while (currentId) {
    const node = nodeMap.get(currentId);
    if (node) path.unshift(node);
    currentId = distances.get(currentId)?.previous || null;
  }
  
  if (path.length === 0 || path[0].id !== startNodeId) return null;
  
  // Calculate total distance
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += getDistance(path[i], path[i + 1]);
  }
  
  // Generate instructions
  const instructions = generateInstructions(path, startLocationId, endLocationId);
  
  // Estimate time (assume 1 unit = 1 meter, walking speed 1.4 m/s)
  const estimatedTime = Math.round((totalDistance / 1.4) * 2); // Scale factor
  
  return {
    nodes: path,
    distance: totalDistance,
    estimatedTime,
    instructions,
  };
}

function generateInstructions(path: PathNode[], startId: string, endId: string): NavigationInstruction[] {
  const instructions: NavigationInstruction[] = [];
  
  // Start instruction
  instructions.push({
    text: `Starting navigation`,
    type: 'start',
    nodeIndex: 0,
  });
  
  if (path.length < 2) {
    instructions.push({
      text: `You've arrived at your destination`,
      type: 'arrive',
      nodeIndex: 0,
    });
    return instructions;
  }
  
  let prevAngle = getAngle(path[0], path[1]);
  
  for (let i = 1; i < path.length - 1; i++) {
    const nextAngle = getAngle(path[i], path[i + 1]);
    const turn = getTurnDirection(prevAngle, nextAngle);
    
    if (turn !== 'straight') {
      instructions.push({
        text: turn === 'left' ? 'Turn left' : 'Turn right',
        type: turn === 'left' ? 'turn_left' : 'turn_right',
        nodeIndex: i,
      });
    } else if (i % 3 === 0) {
      // Add "go straight" every few nodes
      instructions.push({
        text: 'Continue straight',
        type: 'go_straight',
        nodeIndex: i,
      });
    }
    
    // Add landmark callouts
    if (!path[i].isIndoor && path[i - 1]?.isIndoor) {
      instructions.push({
        text: 'Exiting the building',
        type: 'landmark',
        nodeIndex: i,
      });
    } else if (path[i].isIndoor && !path[i - 1]?.isIndoor) {
      instructions.push({
        text: 'Entering the building',
        type: 'landmark',
        nodeIndex: i,
      });
    }
    
    prevAngle = nextAngle;
  }
  
  // Arrival instruction
  instructions.push({
    text: `You have arrived`,
    type: 'arrive',
    nodeIndex: path.length - 1,
  });
  
  return instructions;
}

export function interpolatePosition(
  path: PathNode[],
  currentNodeIndex: number,
  progress: number
): { x: number; y: number } {
  if (path.length === 0) return { x: 0, y: 0 };
  if (currentNodeIndex >= path.length - 1) {
    const lastNode = path[path.length - 1];
    return { x: lastNode.x, y: lastNode.y };
  }
  
  const current = path[currentNodeIndex];
  const next = path[currentNodeIndex + 1];
  
  return {
    x: current.x + (next.x - current.x) * progress,
    y: current.y + (next.y - current.y) * progress,
  };
}
