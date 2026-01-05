export interface Location {
  id: string;
  name: string;
  shortName?: string;
  type: 'room' | 'block' | 'facility' | 'entrance';
  block?: string;
  x: number;
  y: number;
  icon?: string;
}

export interface PathNode {
  id: string;
  x: number;
  y: number;
  connections: string[];
  isIndoor: boolean;
}

export interface NavigationPath {
  nodes: PathNode[];
  distance: number;
  estimatedTime: number; // in seconds
  instructions: NavigationInstruction[];
}

export interface NavigationInstruction {
  text: string;
  type: 'start' | 'turn_left' | 'turn_right' | 'go_straight' | 'arrive' | 'landmark';
  nodeIndex: number;
  distance?: number;
}

export interface UserPosition {
  x: number;
  y: number;
  currentNodeIndex: number;
  progress: number; // 0-1 between current and next node
}

export type BlockType = 'cse' | 'ece' | 'mechanical' | 'civil' | 'labs' | 'seminar' | 'office' | 'canteen' | 'bbc';
