import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { CAMPUS_WIDTH, CAMPUS_HEIGHT, locations, pathNodes } from '@/data/campusData';
import { NavigationPath, UserPosition } from '@/types/campus';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface CampusMapProps {
  navigationPath: NavigationPath | null;
  userPosition: UserPosition | null;
  isNavigating: boolean;
  onLocationClick?: (locationId: string) => void;
  selectedDestination?: string | null;
  selectedStart?: string | null;
  selectionMode?: 'start' | 'destination';
}

export const CampusMap: React.FC<CampusMapProps> = ({
  navigationPath, userPosition, isNavigating, onLocationClick, selectedDestination, selectedStart, selectionMode = 'destination',
}) => {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [scale, setScale] = useState(0.65);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // For distinguishing click vs drag
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const MIN_SCALE = 0.3;
  const MAX_SCALE = 3;
  const DRAG_THRESHOLD = 5; // pixels before considered a drag
  const CLICK_TIME_THRESHOLD = 300; // ms

  const handleZoomIn = useCallback(() => setScale(s => Math.min(s * 1.3, MAX_SCALE)), []);
  const handleZoomOut = useCallback(() => setScale(s => Math.max(s / 1.3, MIN_SCALE)), []);
  const handleReset = useCallback(() => { setScale(0.65); setTranslate({ x: 0, y: 0 }); }, []);

  // Wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale(s => Math.max(MIN_SCALE, Math.min(MAX_SCALE, s * (e.deltaY > 0 ? 0.9 : 1.1))));
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStartRef.current || !lastPosRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > DRAG_THRESHOLD) {
      isDraggingRef.current = true;
      const moveDx = e.clientX - lastPosRef.current.x;
      const moveDy = e.clientY - lastPosRef.current.y;
      setTranslate(t => ({ x: t.x + moveDx / scale, y: t.y + moveDy / scale }));
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [scale]);

  const handleMouseUp = useCallback(() => {
    dragStartRef.current = null;
    lastPosRef.current = null;
    // Reset drag flag after a small delay
    setTimeout(() => { isDraggingRef.current = false; }, 50);
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
      lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isDraggingRef.current = false;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && dragStartRef.current && lastPosRef.current) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > DRAG_THRESHOLD) {
        isDraggingRef.current = true;
        const moveDx = e.touches[0].clientX - lastPosRef.current.x;
        const moveDy = e.touches[0].clientY - lastPosRef.current.y;
        setTranslate(t => ({ x: t.x + moveDx / scale, y: t.y + moveDy / scale }));
        lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    } else if (e.touches.length === 2) {
      // Pinch zoom
      isDraggingRef.current = true;
    }
  }, [scale]);

  const handleTouchEnd = useCallback(() => {
    dragStartRef.current = null;
    lastPosRef.current = null;
    setTimeout(() => { isDraggingRef.current = false; }, 50);
  }, []);

  // Click handler for locations - only fires if not dragging
  const handleLocationClick = useCallback((id: string) => {
    if (isDraggingRef.current) return;
    if (onLocationClick && !isNavigating) {
      onLocationClick(id);
    }
  }, [onLocationClick, isNavigating]);

  const isSelected = (id: string) => selectedDestination === id || selectedStart === id;
  const isStart = (id: string) => selectedStart === id;

  // Room component
  const Room = ({ x, y, w, h, label, id, fill, stroke, fontSize = 11, icon }: {
    x: number; y: number; w: number; h: number; label: string; id: string; fill: string; stroke: string; fontSize?: number; icon?: string
  }) => {
    const hovered = hoveredLocation === id;
    const selected = isSelected(id);
    const start = isStart(id);

    return (
      <g
        style={{ cursor: onLocationClick && !isNavigating ? 'pointer' : 'default' }}
        onClick={() => handleLocationClick(id)}
        onMouseEnter={() => setHoveredLocation(id)}
        onMouseLeave={() => setHoveredLocation(null)}
      >
        <rect x={x} y={y} width={w} height={h} rx="10"
          fill={selected ? (start ? '#D1FAE5' : '#DBEAFE') : fill}
          stroke={selected ? (start ? '#10B981' : '#3B82F6') : stroke}
          strokeWidth={selected ? '3' : '2'}
          style={{ transform: hovered ? 'scale(1.02)' : 'scale(1)', transformOrigin: `${x + w / 2}px ${y + h / 2}px`, transition: 'all 0.15s ease-out' }}
        />
        {icon && <text x={x + w / 2} y={y + h / 2 - 6} textAnchor="middle" fontSize="16" style={{ pointerEvents: 'none' }}>{icon}</text>}
        <text x={x + w / 2} y={y + h / 2 + (icon ? 10 : 4)} textAnchor="middle" fontSize={fontSize} fontWeight="600" fill="#374151" style={{ pointerEvents: 'none' }}>{label}</text>
      </g>
    );
  };

  // Generate path lines
  const allPathLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; isIndoor: boolean }[] = [];
    const processedPairs = new Set<string>();
    pathNodes.forEach(node => {
      node.connections.forEach(connId => {
        const pairKey = [node.id, connId].sort().join('-');
        if (!processedPairs.has(pairKey)) {
          processedPairs.add(pairKey);
          const connNode = pathNodes.find(n => n.id === connId);
          if (connNode) {
            lines.push({ x1: node.x, y1: node.y, x2: connNode.x, y2: connNode.y, isIndoor: node.isIndoor && connNode.isIndoor });
          }
        }
      });
    });
    return lines;
  }, []);

  // Navigation path
  const pathD = useMemo(() => {
    if (!navigationPath?.nodes.length) return '';
    return navigationPath.nodes.map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.x} ${n.y}`).join(' ');
  }, [navigationPath]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gradient-to-br from-sky-50 to-blue-50"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab', touchAction: 'none' }}
    >
      <svg
        viewBox={`0 0 ${CAMPUS_WIDTH} ${CAMPUS_HEIGHT}`}
        className="w-full h-full"
        style={{
          transform: `scale(${scale}) translate(${translate.x}px, ${translate.y}px)`,
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease-out'
        }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="navGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" /></filter>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CBD5E1" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Background */}
        <rect width={CAMPUS_WIDTH} height={CAMPUS_HEIGHT} fill="#F0F9FF" />
        <rect width={CAMPUS_WIDTH} height={CAMPUS_HEIGHT} fill="url(#grid)" opacity="0.4" />

        {/* Building shells */}
        <rect x="80" y="80" width="320" height="900" rx="12" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="3" filter="url(#shadow)" />
        <rect x="400" y="80" width="920" height="320" rx="12" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="3" filter="url(#shadow)" />

        {/* Path lines */}
        {allPathLines.map((line, i) => (
          <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
            stroke={line.isIndoor ? "#CBD5E1" : "#93C5FD"} strokeWidth="6"
            strokeLinecap="round" opacity="0.7" />
        ))}

        {/* VERTICAL WING ROOMS */}
        <Room x={90} y={100} w={140} h={80} label="LIBRARY" id="library" fill="#DBEAFE" stroke="#3B82F6" icon="📚" />
        <Room x={90} y={220} w={140} h={80} label="ISE LAB" id="ise_lab" fill="#BFDBFE" stroke="#2563EB" icon="💻" />
        <Room x={90} y={340} w={140} h={80} label="ISE CLASS" id="ise_class" fill="#DBEAFE" stroke="#3B82F6" icon="🎓" />
        <Room x={90} y={460} w={140} h={80} label="CSE LAB" id="cse_lab" fill="#BBF7D0" stroke="#22C55E" icon="🖥️" />
        <Room x={90} y={580} w={140} h={80} label="CSE CLASS" id="cse_class" fill="#D1FAE5" stroke="#16A34A" icon="🎓" />
        <Room x={90} y={700} w={140} h={80} label="CHEM LAB" id="chem_lab" fill="#FEF08A" stroke="#EAB308" icon="🧪" />
        <Room x={90} y={820} w={140} h={80} label="GYM" id="gym" fill="#FECACA" stroke="#EF4444" icon="🏋️" />

        {/* VERTICAL WING FACILITIES */}
        <Room x={300} y={440} w={90} h={70} label="STAIRS" id="stairs" fill="#E0E7FF" stroke="#6366F1" fontSize={9} icon="🪜" />
        <Room x={300} y={520} w={90} h={70} label="LIFT" id="lift" fill="#DDD6FE" stroke="#8B5CF6" fontSize={10} icon="🛗" />
        <Room x={300} y={600} w={90} h={70} label="STAFF WC" id="staff_wc" fill="#F3F4F6" stroke="#9CA3AF" fontSize={8} icon="🚻" />
        <Room x={300} y={680} w={90} h={70} label="GIRLS WC" id="girls_wc" fill="#FCE7F3" stroke="#EC4899" fontSize={8} icon="🚺" />
        <Room x={300} y={760} w={90} h={70} label="CHEM HOD" id="chem_hod" fill="#FEF9C3" stroke="#CA8A04" fontSize={8} icon="👨‍🔬" />
        <Room x={300} y={840} w={90} h={70} label="BOYS WC" id="boys_wc" fill="#DBEAFE" stroke="#3B82F6" fontSize={8} icon="🚹" />

        {/* HORIZONTAL WING TOP */}
        <Room x={420} y={100} w={120} h={80} label="SEMINAR" id="seminar" fill="#E9D5FF" stroke="#A855F7" icon="🎤" />
        <Room x={550} y={100} w={120} h={80} label="AUDITORIUM" id="auditorium" fill="#FED7AA" stroke="#F97316" fontSize={9} icon="🎭" />
        <Room x={680} y={100} w={120} h={80} label="ADMIN" id="admin_office" fill="#FEF3C7" stroke="#F59E0B" fontSize={10} icon="📋" />
        <Room x={810} y={100} w={120} h={80} label="ADMISSION" id="admission" fill="#FDE68A" stroke="#EAB308" fontSize={9} icon="📝" />
        <Room x={940} y={100} w={120} h={80} label="PRINCIPAL" id="principal" fill="#FEF9C3" stroke="#CA8A04" fontSize={9} icon="👔" />
        <Room x={1070} y={100} w={120} h={80} label="MATH DEPT" id="math_dept" fill="#DBEAFE" stroke="#3B82F6" fontSize={9} icon="📐" />
        <Room x={1200} y={100} w={120} h={80} label="MATH LAB" id="math_lab" fill="#D1FAE5" stroke="#16A34A" fontSize={9} icon="🔢" />

        {/* HORIZONTAL WING BOTTOM */}
        <Room x={420} y={240} w={120} h={80} label="MECH DEPT" id="mech_dept" fill="#FED7AA" stroke="#F97316" fontSize={9} icon="⚙️" />
        <Room x={550} y={240} w={120} h={80} label="MECH HOD" id="mech_hod" fill="#FFEDD5" stroke="#FB923C" fontSize={9} icon="👨‍🏫" />
        <Room x={680} y={240} w={120} h={80} label="OFFICE" id="office" fill="#FEF3C7" stroke="#F59E0B" icon="📋" />
        <Room x={810} y={240} w={120} h={80} label="CONFERENCE" id="conference" fill="#E0E7FF" stroke="#6366F1" fontSize={9} icon="🎥" />
        <Room x={940} y={240} w={120} h={80} label="PHYSICS LAB" id="physics_lab" fill="#D1FAE5" stroke="#16A34A" fontSize={9} icon="⚛️" />
        <Room x={1070} y={240} w={120} h={80} label="PHY HOD" id="physics_hod" fill="#D1FAE5" stroke="#16A34A" fontSize={9} icon="👨‍🔬" />
        <Room x={1200} y={240} w={120} h={80} label="CAED LAB" id="caed_lab" fill="#D1FAE5" stroke="#16A34A" fontSize={9} icon="🖥️" />

        <Room x={1200} y={380} w={120} h={80} label="R&D LAB" id="rd_lab" fill="#E0E7FF" stroke="#6366F1" fontSize={10} icon="🔬" />

        {/* ENTRANCE */}
        <g onClick={() => handleLocationClick('entrance')} style={{ cursor: 'pointer' }}>
          <rect x={360} y={360} width={80} height={80} rx="16" fill={isStart('entrance') ? '#10B981' : '#3B82F6'} filter="url(#shadow)" />
          <text x={400} y={395} textAnchor="middle" fontSize="24">🚪</text>
          <text x={400} y={420} textAnchor="middle" fontSize="10" fontWeight="700" fill="white">ENTRANCE</text>
        </g>

        {/* OUTSIDE FACILITIES */}
        <g onClick={() => handleLocationClick('canteen')} style={{ cursor: 'pointer' }}>
          <rect x={1270} y={530} width={110} height={100} rx="16" fill={isSelected('canteen') ? '#DBEAFE' : '#FEF3C7'} stroke={isSelected('canteen') ? '#3B82F6' : '#F59E0B'} strokeWidth="2" filter="url(#shadow)" />
          <text x={1325} y={570} textAnchor="middle" fontSize="28">🍽️</text>
          <text x={1325} y={605} textAnchor="middle" fontSize="12" fontWeight="600" fill="#92400E">CANTEEN</text>
        </g>

        <g onClick={() => handleLocationClick('bbc')} style={{ cursor: 'pointer' }}>
          <rect x={1270} y={700} width={110} height={140} rx="16" fill={isSelected('bbc') ? '#DBEAFE' : '#FEE2E2'} stroke={isSelected('bbc') ? '#3B82F6' : '#EF4444'} strokeWidth="2" filter="url(#shadow)" />
          <text x={1325} y={760} textAnchor="middle" fontSize="28">🏀</text>
          <text x={1325} y={800} textAnchor="middle" fontSize="10" fontWeight="600" fill="#991B1B">BASKETBALL</text>
          <text x={1325} y={815} textAnchor="middle" fontSize="10" fontWeight="600" fill="#991B1B">COURT</text>
        </g>

        {/* NAVIGATION PATH */}
        {isNavigating && pathD && (
          <>
            <path d={pathD} fill="none" stroke="#93C5FD" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
            <path d={pathD} fill="none" stroke="url(#navGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="12 8" className="animate-path-flow" />
          </>
        )}

        {/* USER MARKER */}
        {userPosition && (
          <g>
            <circle cx={userPosition.x} cy={userPosition.y} r="24" fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.3" className="animate-pulse-ring" />
            <circle cx={userPosition.x} cy={userPosition.y} r="14" fill="#3B82F6" stroke="white" strokeWidth="4" />
            <circle cx={userPosition.x} cy={userPosition.y} r="5" fill="white" />
          </g>
        )}

        {/* DESTINATION MARKER */}
        {isNavigating && navigationPath && navigationPath.nodes.length > 0 && (
          <g>
            <circle cx={navigationPath.nodes[navigationPath.nodes.length - 1].x} cy={navigationPath.nodes[navigationPath.nodes.length - 1].y} r="20" fill="none" stroke="#EC4899" strokeWidth="2" opacity="0.5" className="animate-pulse-ring" />
            <circle cx={navigationPath.nodes[navigationPath.nodes.length - 1].x} cy={navigationPath.nodes[navigationPath.nodes.length - 1].y} r="14" fill="#EC4899" stroke="white" strokeWidth="3" />
          </g>
        )}

        {/* SELECTION PREVIEW */}
        {!isNavigating && selectedStart && selectedStart !== 'entrance' && (() => {
          const loc = locations.find(l => l.id === selectedStart);
          return loc && <circle cx={loc.x} cy={loc.y} r="14" fill="#10B981" stroke="white" strokeWidth="3" />;
        })()}
        {!isNavigating && selectedDestination && (() => {
          const loc = locations.find(l => l.id === selectedDestination);
          return loc && (
            <g>
              <circle cx={loc.x} cy={loc.y} r="20" fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.5" className="animate-pulse-ring" />
              <circle cx={loc.x} cy={loc.y} r="14" fill="#3B82F6" stroke="white" strokeWidth="3" />
            </g>
          );
        })()}
      </svg>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <button onClick={handleZoomIn} className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all">
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </button>
        <button onClick={handleZoomOut} className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all">
          <ZoomOut className="w-5 h-5 text-gray-700" />
        </button>
        <button onClick={handleReset} className="w-12 h-12 rounded-xl bg-blue-500 shadow-lg flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all">
          <RotateCcw className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur text-sm font-medium text-gray-600 border border-gray-200">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
};
