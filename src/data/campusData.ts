import { Location, PathNode } from '@/types/campus';

// Campus map dimensions - Expanded for better spacing
export const CAMPUS_WIDTH = 1400;
export const CAMPUS_HEIGHT = 1100;

// Main building bounds - L-shaped structure with proper spacing
export const MAIN_BUILDING = {
  verticalWing: { x: 80, y: 80, width: 320, height: 900 },
  horizontalWing: { x: 80, y: 80, width: 900, height: 320 },
};

// ============================================
// LOCATIONS - Properly spaced in L-shaped layout
// ============================================
export const locations: Location[] = [
  // ENTRANCE - At the L intersection
  { id: 'entrance', name: 'Main Entrance', type: 'entrance', x: 400, y: 400, icon: '🚪' },

  // ============================================
  // VERTICAL WING (Left side) - TOP TO BOTTOM
  // Each room has 120px vertical spacing
  // ============================================

  // Row 1 - Library
  { id: 'library', name: 'Library', type: 'facility', block: 'library', x: 160, y: 140, icon: '📚' },

  // Row 2 - ISE Lab
  { id: 'ise_lab', name: 'ISE Lab', shortName: 'ISE Lab', type: 'room', block: 'ise', x: 160, y: 260, icon: '💻' },

  // Row 3 - ISE Class
  { id: 'ise_class', name: 'ISE Classrooms', shortName: 'ISE Class', type: 'room', block: 'ise', x: 160, y: 380, icon: '🎓' },

  // Row 4 - CSE Lab
  { id: 'cse_lab', name: 'CSE Lab', shortName: 'CSE Lab', type: 'room', block: 'cse', x: 160, y: 500, icon: '🖥️' },

  // Row 5 - CSE Class
  { id: 'cse_class', name: 'CSE Classrooms', shortName: 'CSE Class', type: 'room', block: 'cse', x: 160, y: 620, icon: '🎓' },

  // Row 6 - Chemistry Lab
  { id: 'chem_lab', name: 'Chemistry Lab', shortName: 'Chem Lab', type: 'room', block: 'chemistry', x: 160, y: 740, icon: '🧪' },

  // Row 7 - Gym
  { id: 'gym', name: 'Gym', type: 'facility', block: 'gym', x: 160, y: 860, icon: '🏋️' },

  // ============================================
  // VERTICAL WING - RIGHT SIDE STRIP (Facilities)
  // ============================================
  { id: 'stairs', name: 'Stairs', type: 'facility', block: 'facility', x: 340, y: 480, icon: '🪜' },
  { id: 'lift', name: 'Lift', type: 'facility', block: 'facility', x: 340, y: 560, icon: '🛗' },
  { id: 'staff_wc', name: 'Staff WC', type: 'facility', block: 'facility', x: 340, y: 640, icon: '🚻' },
  { id: 'girls_wc', name: 'Girls WC', type: 'facility', block: 'facility', x: 340, y: 720, icon: '🚺' },
  { id: 'chem_hod', name: 'Chemistry HOD', shortName: 'Chem HOD', type: 'room', block: 'chemistry', x: 340, y: 800, icon: '👨‍🔬' },
  { id: 'boys_wc', name: 'Boys WC', type: 'facility', block: 'facility', x: 340, y: 880, icon: '🚹' },

  // ============================================
  // HORIZONTAL WING (Top section) - LEFT TO RIGHT
  // Each room has 130px horizontal spacing
  // ============================================

  // Column 1 - Seminar
  { id: 'seminar', name: 'Seminar Hall', type: 'facility', block: 'seminar', x: 480, y: 140, icon: '🎤' },
  { id: 'mech_dept', name: 'Mechanical Dept', shortName: 'MECH Dept', type: 'block', block: 'mechanical', x: 480, y: 280, icon: '⚙️' },

  // Column 2 - Auditorium & Mech HOD
  { id: 'auditorium', name: 'Auditorium', type: 'facility', block: 'seminar', x: 610, y: 140, icon: '🎭' },
  { id: 'mech_hod', name: 'Mech HOD Office', shortName: 'Mech HOD', type: 'room', block: 'mechanical', x: 610, y: 280, icon: '👨‍🏫' },

  // Column 3 - Admin & Office
  { id: 'admin_office', name: 'Admin Office', shortName: 'Admin', type: 'facility', block: 'office', x: 740, y: 140, icon: '📋' },
  { id: 'office', name: 'Main Office', type: 'facility', block: 'office', x: 740, y: 280, icon: '📋' },

  // Column 4 - Admission & Conference
  { id: 'admission', name: 'Admission Block', shortName: 'Admission', type: 'facility', block: 'office', x: 870, y: 140, icon: '📝' },
  { id: 'conference', name: 'Conference Room', shortName: 'Conf Room', type: 'facility', block: 'office', x: 870, y: 280, icon: '🎥' },

  // Column 5 - Principal & Physics
  { id: 'principal', name: 'Principal Office', shortName: 'Principal', type: 'facility', block: 'office', x: 1000, y: 140, icon: '👔' },
  { id: 'physics_lab', name: 'Physics Lab', shortName: 'Physics Lab', type: 'room', block: 'physics', x: 1000, y: 280, icon: '⚛️' },

  // Column 6 - Math & Labs
  { id: 'math_dept', name: 'Math Department', shortName: 'Math Dept', type: 'room', block: 'math', x: 1130, y: 140, icon: '📐' },
  { id: 'physics_hod', name: 'Physics HOD', shortName: 'Phy HOD', type: 'room', block: 'physics', x: 1130, y: 280, icon: '👨‍🔬' },

  // Column 7 - Extended Labs
  { id: 'math_lab', name: 'Math Lab', shortName: 'Math Lab', type: 'room', block: 'labs', x: 1260, y: 140, icon: '🔢' },
  { id: 'caed_lab', name: 'CAED Lab', shortName: 'CAED Lab', type: 'room', block: 'labs', x: 1260, y: 280, icon: '🖥️' },

  // R&D Lab - Extended right
  { id: 'rd_lab', name: 'R&D / L2M Lab', shortName: 'R&D Lab', type: 'room', block: 'labs', x: 1260, y: 420, icon: '🔬' },

  // ============================================
  // OUTSIDE FACILITIES
  // ============================================
  { id: 'canteen', name: 'Canteen', type: 'facility', block: 'canteen', x: 1320, y: 580, icon: '🍽️' },
  { id: 'bbc', name: 'Basketball Court', shortName: 'BBC', type: 'facility', block: 'bbc', x: 1320, y: 780, icon: '🏀' },
];

// ============================================
// PATH NODES - Perfect geometric grid
// Main corridors at x=280 (vertical) and y=210 (horizontal)
// ============================================
export const pathNodes: PathNode[] = [
  // ============================================
  // MAIN ENTRANCE NODE
  // ============================================
  { id: 'n_entrance', x: 400, y: 400, connections: ['n_corridor_v4', 'n_corridor_h1'], isIndoor: true },

  // ============================================
  // VERTICAL CORRIDOR - Main spine at x=280
  // Runs from y=140 to y=900
  // ============================================
  { id: 'n_corridor_v1', x: 280, y: 140, connections: ['n_library', 'n_corridor_v2'], isIndoor: true },
  { id: 'n_corridor_v2', x: 280, y: 260, connections: ['n_corridor_v1', 'n_ise_lab', 'n_corridor_v3'], isIndoor: true },
  { id: 'n_corridor_v3', x: 280, y: 380, connections: ['n_corridor_v2', 'n_ise_class', 'n_corridor_v4', 'n_corridor_h1'], isIndoor: true },
  { id: 'n_corridor_v4', x: 280, y: 500, connections: ['n_corridor_v3', 'n_cse_lab', 'n_stairs', 'n_entrance', 'n_corridor_v5'], isIndoor: true },
  { id: 'n_corridor_v5', x: 280, y: 620, connections: ['n_corridor_v4', 'n_cse_class', 'n_lift', 'n_staff_wc', 'n_corridor_v6'], isIndoor: true },
  { id: 'n_corridor_v6', x: 280, y: 740, connections: ['n_corridor_v5', 'n_chem_lab', 'n_girls_wc', 'n_chem_hod', 'n_corridor_v7'], isIndoor: true },
  { id: 'n_corridor_v7', x: 280, y: 860, connections: ['n_corridor_v6', 'n_gym', 'n_boys_wc'], isIndoor: true },

  // ============================================
  // ROOM NODES - Vertical Wing Left Side
  // Each connects directly to corridor
  // ============================================
  { id: 'n_library', x: 160, y: 140, connections: ['n_corridor_v1'], isIndoor: true },
  { id: 'n_ise_lab', x: 160, y: 260, connections: ['n_corridor_v2'], isIndoor: true },
  { id: 'n_ise_class', x: 160, y: 380, connections: ['n_corridor_v3'], isIndoor: true },
  { id: 'n_cse_lab', x: 160, y: 500, connections: ['n_corridor_v4'], isIndoor: true },
  { id: 'n_cse_class', x: 160, y: 620, connections: ['n_corridor_v5'], isIndoor: true },
  { id: 'n_chem_lab', x: 160, y: 740, connections: ['n_corridor_v6'], isIndoor: true },
  { id: 'n_gym', x: 160, y: 860, connections: ['n_corridor_v7'], isIndoor: true },

  // ============================================
  // ROOM NODES - Vertical Wing Right Side (Facilities)
  // ============================================
  { id: 'n_stairs', x: 340, y: 480, connections: ['n_corridor_v4'], isIndoor: true },
  { id: 'n_lift', x: 340, y: 560, connections: ['n_corridor_v5'], isIndoor: true },
  { id: 'n_staff_wc', x: 340, y: 640, connections: ['n_corridor_v5'], isIndoor: true },
  { id: 'n_girls_wc', x: 340, y: 720, connections: ['n_corridor_v6'], isIndoor: true },
  { id: 'n_chem_hod', x: 340, y: 800, connections: ['n_corridor_v6'], isIndoor: true },
  { id: 'n_boys_wc', x: 340, y: 880, connections: ['n_corridor_v7'], isIndoor: true },

  // ============================================
  // HORIZONTAL CORRIDOR - Main spine at y=210
  // Runs from x=400 to x=1300
  // ============================================
  { id: 'n_corridor_h1', x: 400, y: 210, connections: ['n_entrance', 'n_corridor_v3', 'n_corridor_h2'], isIndoor: true },
  { id: 'n_corridor_h2', x: 480, y: 210, connections: ['n_corridor_h1', 'n_seminar', 'n_mech_dept', 'n_corridor_h3'], isIndoor: true },
  { id: 'n_corridor_h3', x: 610, y: 210, connections: ['n_corridor_h2', 'n_auditorium', 'n_mech_hod', 'n_corridor_h4'], isIndoor: true },
  { id: 'n_corridor_h4', x: 740, y: 210, connections: ['n_corridor_h3', 'n_admin_office', 'n_office', 'n_corridor_h5'], isIndoor: true },
  { id: 'n_corridor_h5', x: 870, y: 210, connections: ['n_corridor_h4', 'n_admission', 'n_conference', 'n_corridor_h6'], isIndoor: true },
  { id: 'n_corridor_h6', x: 1000, y: 210, connections: ['n_corridor_h5', 'n_principal', 'n_physics_lab', 'n_corridor_h7'], isIndoor: true },
  { id: 'n_corridor_h7', x: 1130, y: 210, connections: ['n_corridor_h6', 'n_math_dept', 'n_physics_hod', 'n_corridor_h8'], isIndoor: true },
  { id: 'n_corridor_h8', x: 1260, y: 210, connections: ['n_corridor_h7', 'n_math_lab', 'n_caed_lab', 'n_corridor_h9'], isIndoor: true },
  { id: 'n_corridor_h9', x: 1260, y: 350, connections: ['n_corridor_h8', 'n_rd_lab', 'n_outdoor_exit'], isIndoor: true },

  // ============================================
  // ROOM NODES - Horizontal Wing Top Row
  // ============================================
  { id: 'n_seminar', x: 480, y: 140, connections: ['n_corridor_h2'], isIndoor: true },
  { id: 'n_auditorium', x: 610, y: 140, connections: ['n_corridor_h3'], isIndoor: true },
  { id: 'n_admin_office', x: 740, y: 140, connections: ['n_corridor_h4'], isIndoor: true },
  { id: 'n_admission', x: 870, y: 140, connections: ['n_corridor_h5'], isIndoor: true },
  { id: 'n_principal', x: 1000, y: 140, connections: ['n_corridor_h6'], isIndoor: true },
  { id: 'n_math_dept', x: 1130, y: 140, connections: ['n_corridor_h7'], isIndoor: true },
  { id: 'n_math_lab', x: 1260, y: 140, connections: ['n_corridor_h8'], isIndoor: true },

  // ============================================
  // ROOM NODES - Horizontal Wing Bottom Row
  // ============================================
  { id: 'n_mech_dept', x: 480, y: 280, connections: ['n_corridor_h2'], isIndoor: true },
  { id: 'n_mech_hod', x: 610, y: 280, connections: ['n_corridor_h3'], isIndoor: true },
  { id: 'n_office', x: 740, y: 280, connections: ['n_corridor_h4'], isIndoor: true },
  { id: 'n_conference', x: 870, y: 280, connections: ['n_corridor_h5'], isIndoor: true },
  { id: 'n_physics_lab', x: 1000, y: 280, connections: ['n_corridor_h6'], isIndoor: true },
  { id: 'n_physics_hod', x: 1130, y: 280, connections: ['n_corridor_h7'], isIndoor: true },
  { id: 'n_caed_lab', x: 1260, y: 280, connections: ['n_corridor_h8'], isIndoor: true },
  { id: 'n_rd_lab', x: 1260, y: 420, connections: ['n_corridor_h9'], isIndoor: true },

  // ============================================
  // OUTDOOR PATH
  // ============================================
  { id: 'n_outdoor_exit', x: 1320, y: 450, connections: ['n_corridor_h9', 'n_outdoor_path'], isIndoor: false },
  { id: 'n_outdoor_path', x: 1320, y: 650, connections: ['n_outdoor_exit', 'n_canteen', 'n_bbc'], isIndoor: false },
  { id: 'n_canteen', x: 1320, y: 580, connections: ['n_outdoor_path'], isIndoor: false },
  { id: 'n_bbc', x: 1320, y: 780, connections: ['n_outdoor_path'], isIndoor: false },
];

// Map location IDs to their nearest path nodes
export const locationToNode: Record<string, string> = {
  'entrance': 'n_entrance',
  'library': 'n_library',
  'ise_lab': 'n_ise_lab',
  'ise_class': 'n_ise_class',
  'cse_lab': 'n_cse_lab',
  'cse_class': 'n_cse_class',
  'chem_lab': 'n_chem_lab',
  'chem_hod': 'n_chem_hod',
  'gym': 'n_gym',
  'stairs': 'n_stairs',
  'lift': 'n_lift',
  'staff_wc': 'n_staff_wc',
  'girls_wc': 'n_girls_wc',
  'boys_wc': 'n_boys_wc',
  'seminar': 'n_seminar',
  'auditorium': 'n_auditorium',
  'mech_dept': 'n_mech_dept',
  'mech_hod': 'n_mech_hod',
  'admin_office': 'n_admin_office',
  'office': 'n_office',
  'admission': 'n_admission',
  'conference': 'n_conference',
  'principal': 'n_principal',
  'physics_lab': 'n_physics_lab',
  'physics_hod': 'n_physics_hod',
  'math_dept': 'n_math_dept',
  'math_lab': 'n_math_lab',
  'caed_lab': 'n_caed_lab',
  'rd_lab': 'n_rd_lab',
  'canteen': 'n_canteen',
  'bbc': 'n_bbc',
};

// All destinations grouped by category
export const destinationCategories = [
  {
    name: 'Quick Access',
    items: [
      { id: 'canteen', label: 'Canteen', icon: '🍽️' },
      { id: 'library', label: 'Library', icon: '📚' },
      { id: 'auditorium', label: 'Auditorium', icon: '🎭' },
      { id: 'seminar', label: 'Seminar Hall', icon: '🎤' },
      { id: 'office', label: 'Main Office', icon: '📋' },
      { id: 'bbc', label: 'Basketball Court', icon: '🏀' },
    ],
  },
  {
    name: 'Computer Labs',
    items: [
      { id: 'cse_lab', label: 'CSE Lab', icon: '🖥️' },
      { id: 'ise_lab', label: 'ISE Lab', icon: '💻' },
      { id: 'caed_lab', label: 'CAED Lab', icon: '🖥️' },
      { id: 'rd_lab', label: 'R&D / L2M Lab', icon: '🔬' },
    ],
  },
  {
    name: 'Science Labs',
    items: [
      { id: 'chem_lab', label: 'Chemistry Lab', icon: '🧪' },
      { id: 'chem_hod', label: 'Chemistry HOD', icon: '👨‍🔬' },
      { id: 'physics_lab', label: 'Physics Lab', icon: '⚛️' },
      { id: 'physics_hod', label: 'Physics HOD', icon: '👨‍🔬' },
      { id: 'math_lab', label: 'Math Lab', icon: '🔢' },
    ],
  },
  {
    name: 'Classrooms',
    items: [
      { id: 'cse_class', label: 'CSE Classrooms', icon: '🎓' },
      { id: 'ise_class', label: 'ISE Classrooms', icon: '🎓' },
    ],
  },
  {
    name: 'Departments',
    items: [
      { id: 'mech_dept', label: 'Mech Department', icon: '⚙️' },
      { id: 'mech_hod', label: 'Mech HOD', icon: '👨‍🏫' },
      { id: 'math_dept', label: 'Math Department', icon: '📐' },
    ],
  },
  {
    name: 'Administration',
    items: [
      { id: 'principal', label: 'Principal Office', icon: '👔' },
      { id: 'admin_office', label: 'Admin Office', icon: '📋' },
      { id: 'admission', label: 'Admission', icon: '📝' },
      { id: 'conference', label: 'Conference Room', icon: '🎥' },
    ],
  },
  {
    name: 'Facilities',
    items: [
      { id: 'gym', label: 'Gym', icon: '🏋️' },
      { id: 'lift', label: 'Lift', icon: '🛗' },
      { id: 'stairs', label: 'Stairs', icon: '🪜' },
      { id: 'staff_wc', label: 'Staff WC', icon: '🚻' },
      { id: 'girls_wc', label: 'Girls WC', icon: '🚺' },
      { id: 'boys_wc', label: 'Boys WC', icon: '🚹' },
    ],
  },
];

// Flat list for quick access chips
export const quickDestinations = [
  { id: 'canteen', label: 'Canteen', icon: '🍽️' },
  { id: 'library', label: 'Library', icon: '📚' },
  { id: 'auditorium', label: 'Auditorium', icon: '🎭' },
  { id: 'seminar', label: 'Seminar', icon: '🎤' },
  { id: 'office', label: 'Office', icon: '📋' },
  { id: 'cse_lab', label: 'CSE Lab', icon: '🖥️' },
  { id: 'bbc', label: 'BBC', icon: '🏀' },
];
