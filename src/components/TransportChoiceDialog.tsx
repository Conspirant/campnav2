import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TransportChoiceDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onChoose: (choice: 'stairs' | 'lift') => void;
    fromFloor: number;
    toFloor: number;
}

const floorNames = ['Ground Floor', 'First Floor', 'Second Floor'];

export const TransportChoiceDialog: React.FC<TransportChoiceDialogProps> = ({
    isOpen,
    onClose,
    onChoose,
    fromFloor,
    toFloor,
}) => {
    const isGoingUp = toFloor > fromFloor;
    const floorDiff = Math.abs(toFloor - fromFloor);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl text-center">How would you like to go?</DialogTitle>
                    <DialogDescription className="text-center">
                        {floorNames[fromFloor]} → {floorNames[toFloor]}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-6">
                    {/* Stairs Option */}
                    <Button
                        variant="outline"
                        className="h-auto flex-col gap-3 p-6 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950"
                        onClick={() => onChoose('stairs')}
                    >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                                <path d="M4 20h4v-4h4v-4h4v-4h4V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M4 20V16M8 16V12M12 12V8M16 8V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-lg">Stairs</p>
                            <p className="text-xs text-muted-foreground">
                                {isGoingUp ? '🚶‍♂️ Walk up' : '🚶‍♂️ Walk down'} {floorDiff} floor{floorDiff > 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">~{floorDiff * 30}s</p>
                        </div>
                    </Button>

                    {/* Lift Option */}
                    <Button
                        variant="outline"
                        className="h-auto flex-col gap-3 p-6 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950"
                        onClick={() => onChoose('lift')}
                    >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-lg">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                                <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                                <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="2" />
                                <path d="M8 10l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 14l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-lg">Elevator</p>
                            <p className="text-xs text-muted-foreground">
                                🛗 Quick ride
                            </p>
                            <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">~{15 + floorDiff * 5}s</p>
                        </div>
                    </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                    Choose how you'd like to travel between floors
                </p>
            </DialogContent>
        </Dialog>
    );
};
