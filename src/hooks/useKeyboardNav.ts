import { useCallback, useEffect } from 'react';

interface KeyboardNavOptions {
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onPanUp?: () => void;
    onPanDown?: () => void;
    onPanLeft?: () => void;
    onPanRight?: () => void;
    onReset?: () => void;
    onFloorUp?: () => void;
    onFloorDown?: () => void;
    onNavigate?: () => void;
    enabled?: boolean;
}

export const useKeyboardNav = ({
    onZoomIn,
    onZoomOut,
    onPanUp,
    onPanDown,
    onPanLeft,
    onPanRight,
    onReset,
    onFloorUp,
    onFloorDown,
    onNavigate,
    enabled = true,
}: KeyboardNavOptions) => {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!enabled) return;

        // Don't capture if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case '+':
            case '=':
                e.preventDefault();
                onZoomIn?.();
                break;
            case '-':
            case '_':
                e.preventDefault();
                onZoomOut?.();
                break;
            case 'ArrowUp':
                if (e.shiftKey) {
                    e.preventDefault();
                    onFloorUp?.();
                } else {
                    e.preventDefault();
                    onPanUp?.();
                }
                break;
            case 'ArrowDown':
                if (e.shiftKey) {
                    e.preventDefault();
                    onFloorDown?.();
                } else {
                    e.preventDefault();
                    onPanDown?.();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                onPanLeft?.();
                break;
            case 'ArrowRight':
                e.preventDefault();
                onPanRight?.();
                break;
            case 'r':
            case 'R':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    onReset?.();
                }
                break;
            case 'Enter':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    onNavigate?.();
                }
                break;
            case 'Escape':
                e.preventDefault();
                onReset?.();
                break;
        }
    }, [enabled, onZoomIn, onZoomOut, onPanUp, onPanDown, onPanLeft, onPanRight, onReset, onFloorUp, onFloorDown, onNavigate]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};

// Keyboard shortcuts help text
export const KEYBOARD_SHORTCUTS = [
    { key: '+/-', action: 'Zoom in/out' },
    { key: '↑↓←→', action: 'Pan map' },
    { key: 'Shift+↑↓', action: 'Change floor' },
    { key: 'R', action: 'Reset view' },
    { key: 'Ctrl+Enter', action: 'Navigate' },
    { key: 'Esc', action: 'Cancel' },
];
