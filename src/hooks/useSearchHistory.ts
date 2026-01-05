import { useState, useEffect, useCallback } from 'react';

interface SearchHistoryItem {
    id: string;
    name: string;
    timestamp: number;
}

interface FavoriteItem {
    id: string;
    name: string;
}

const RECENT_KEY = 'campusnav-recent';
const FAVORITES_KEY = 'campusnav-favorites';
const MAX_RECENT = 5;

export const useSearchHistory = () => {
    const [recentDestinations, setRecentDestinations] = useState<SearchHistoryItem[]>([]);
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const storedRecent = localStorage.getItem(RECENT_KEY);
            const storedFavorites = localStorage.getItem(FAVORITES_KEY);

            if (storedRecent) {
                setRecentDestinations(JSON.parse(storedRecent));
            }
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error('Error loading search history:', error);
        }
    }, []);

    // Add to recent destinations
    const addToRecent = useCallback((id: string, name: string) => {
        setRecentDestinations(prev => {
            // Remove if already exists
            const filtered = prev.filter(item => item.id !== id);
            // Add to front
            const updated = [{ id, name, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT);
            localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    // Toggle favorite
    const toggleFavorite = useCallback((id: string, name: string) => {
        setFavorites(prev => {
            const exists = prev.some(item => item.id === id);
            const updated = exists
                ? prev.filter(item => item.id !== id)
                : [...prev, { id, name }];
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    // Check if location is favorited
    const isFavorite = useCallback((id: string) => {
        return favorites.some(item => item.id === id);
    }, [favorites]);

    // Clear all recent
    const clearRecent = useCallback(() => {
        setRecentDestinations([]);
        localStorage.removeItem(RECENT_KEY);
    }, []);

    return {
        recentDestinations,
        favorites,
        addToRecent,
        toggleFavorite,
        isFavorite,
        clearRecent,
    };
};

// Fuzzy search scoring function
export const fuzzyMatch = (query: string, text: string): number => {
    if (!query) return 1;

    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    // Exact match
    if (textLower === queryLower) return 100;

    // Starts with query
    if (textLower.startsWith(queryLower)) return 90;

    // Contains query as word
    if (textLower.includes(' ' + queryLower) || textLower.includes(queryLower + ' ')) return 80;

    // Contains query
    if (textLower.includes(queryLower)) return 70;

    // Fuzzy character matching
    let queryIndex = 0;
    let matchScore = 0;
    let consecutiveBonus = 0;

    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
        if (textLower[i] === queryLower[queryIndex]) {
            matchScore += 10 + consecutiveBonus;
            consecutiveBonus += 5;
            queryIndex++;
        } else {
            consecutiveBonus = 0;
        }
    }

    // Return score only if all query chars were found
    if (queryIndex === queryLower.length) {
        return Math.min(60, matchScore);
    }

    return 0;
};
