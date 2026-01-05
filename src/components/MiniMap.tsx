import React, { useMemo } from 'react';
import { CampusNode, getNodesForFloor, campusFloors } from '@/data/campusData';

interface MiniMapProps {
    currentFloor: number;
    path: CampusNode[];
    viewBox: { x: number; y: number; width: number; height: number };
    userLocation: string | null;
    onViewportClick: (x: number, y: number) => void;
}

export const MiniMap: React.FC<MiniMapProps> = React.memo(({
    currentFloor,
    path,
    viewBox,
    userLocation,
    onViewportClick,
}) => {
    const floorNodes = useMemo(() => getNodesForFloor(currentFloor), [currentFloor]);
    const floorName = campusFloors.find(f => f.id === currentFloor)?.name || 'Ground';

    // Calculate viewport indicator dimensions
    const viewportIndicator = useMemo(() => {
        const mapWidth = 800;
        const mapHeight = 650;
        const miniWidth = 150;
        const miniHeight = 120;

        return {
            x: (viewBox.x / mapWidth) * miniWidth,
            y: (viewBox.y / mapHeight) * miniHeight,
            width: (viewBox.width / mapWidth) * miniWidth,
            height: (viewBox.height / mapHeight) * miniHeight,
        };
    }, [viewBox]);

    const pathOnFloor = useMemo(() =>
        path.filter(node => node.floor === currentFloor),
        [path, currentFloor]
    );

    const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 800;
        const y = ((e.clientY - rect.top) / rect.height) * 650;
        onViewportClick(x, y);
    };

    return (
        <div className="absolute bottom-20 right-4 z-20 group">
            <div className="bg-card/95 backdrop-blur-sm rounded-xl shadow-card border border-border overflow-hidden transition-all duration-300 hover:scale-105">
                <div className="px-2 py-1 bg-muted/50 border-b border-border">
                    <span className="text-[10px] font-medium text-muted-foreground">{floorName}</span>
                </div>
                <svg
                    viewBox="0 0 150 120"
                    className="w-[150px] h-[120px] cursor-pointer"
                    onClick={handleClick}
                >
                    {/* Background */}
                    <rect width="150" height="120" fill="hsl(var(--muted))" opacity="0.3" />

                    {/* Building outline */}
                    <rect
                        x="10"
                        y="12"
                        width="130"
                        height="90"
                        rx="4"
                        fill="hsl(var(--card))"
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                    />

                    {/* Nodes as dots */}
                    {floorNodes.map(node => (
                        <circle
                            key={node.id}
                            cx={(node.x / 800) * 150}
                            cy={(node.y / 650) * 120}
                            r={node.type === 'room' ? 2 : 1}
                            fill={
                                node.id === userLocation
                                    ? 'hsl(var(--primary))'
                                    : node.type === 'room'
                                        ? 'hsl(var(--muted-foreground))'
                                        : 'hsl(var(--border))'
                            }
                            opacity={node.type === 'room' ? 0.8 : 0.4}
                        />
                    ))}

                    {/* Path */}
                    {pathOnFloor.length >= 2 && (
                        <polyline
                            points={pathOnFloor.map(n =>
                                `${(n.x / 800) * 150},${(n.y / 650) * 120}`
                            ).join(' ')}
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            strokeLinecap="round"
                            opacity="0.8"
                        />
                    )}

                    {/* Viewport indicator */}
                    <rect
                        x={Math.max(0, viewportIndicator.x)}
                        y={Math.max(0, viewportIndicator.y)}
                        width={Math.min(150, viewportIndicator.width)}
                        height={Math.min(120, viewportIndicator.height)}
                        fill="hsl(var(--primary))"
                        fillOpacity="0.15"
                        stroke="hsl(var(--primary))"
                        strokeWidth="1.5"
                        rx="2"
                        className="transition-all duration-150"
                    />
                </svg>
            </div>
        </div>
    );
});

MiniMap.displayName = 'MiniMap';
