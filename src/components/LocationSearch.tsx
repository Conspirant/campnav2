import React, { useState, useRef, useEffect, useMemo } from 'react';
import { getSelectableLocations } from '@/data/campusData';
import { Search, X, Star, Clock, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { fuzzyMatch } from '@/hooks/useSearchHistory';

interface LocationSearchProps {
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  label: React.ReactNode;
  recentDestinations?: { id: string; name: string }[];
  favorites?: { id: string; name: string }[];
  onToggleFavorite?: (id: string, name: string) => void;
  isFavorite?: (id: string) => boolean;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search location...',
  label,
  recentDestinations = [],
  favorites = [],
  onToggleFavorite,
  isFavorite,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const locations = getSelectableLocations();
  const selectedLocation = locations.find(loc => loc.id === value);

  // Fuzzy search with scoring
  const filteredLocations = useMemo(() => {
    if (!query.trim()) return locations;

    return locations
      .map(loc => ({
        ...loc,
        score: fuzzyMatch(query, loc.name)
      }))
      .filter(loc => loc.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [query, locations]);

  // Group by type (room, outdoor, entrance)
  const groupedLocations = useMemo(() => {
    return filteredLocations.reduce((acc, loc) => {
      const category = loc.type === 'outdoor' ? 'Outdoor' 
        : loc.type === 'entrance' ? 'Entrances'
        : loc.type === 'room' ? 'Rooms'
        : 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(loc);
      return acc;
    }, {} as Record<string, typeof locations>);
  }, [filteredLocations]);

  // Show favorites and recent when no query
  const showQuickAccess = !query.trim() && (favorites.length > 0 || recentDestinations.length > 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  const handleSelect = (id: string) => {
    onChange(id);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(i => Math.min(i + 1, filteredLocations.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredLocations[highlightIndex]) {
        handleSelect(filteredLocations[highlightIndex].id);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setQuery('');
    inputRef.current?.focus();
  };

  const handleFavoriteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    onToggleFavorite?.(id, name);
  };

  return (
    <div ref={containerRef} className="relative space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        {label}
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={isOpen ? query : (selectedLocation?.name || '')}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setQuery('');
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 pr-9 bg-background border-border"
          aria-label="Search locations"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        {(value || query) && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-72 overflow-y-auto"
          role="listbox"
        >
          {/* Quick Access: Favorites & Recent */}
          {showQuickAccess && (
            <>
              {favorites.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0 flex items-center gap-1.5">
                    <Star className="w-3 h-3 fill-current" />
                    Favorites
                  </div>
                  {favorites.map(fav => (
                    <button
                      key={`fav-${fav.id}`}
                      onClick={() => handleSelect(fav.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className={fav.id === value ? 'text-primary font-medium' : 'text-foreground'}>
                        {fav.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {recentDestinations.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Recent
                  </div>
                  {recentDestinations.slice(0, 5).map(recent => (
                    <button
                      key={`recent-${recent.id}`}
                      onClick={() => handleSelect(recent.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className={recent.id === value ? 'text-primary font-medium' : 'text-foreground'}>
                        {recent.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t border-border" />
            </>
          )}

          {filteredLocations.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center flex flex-col items-center gap-2">
              <MapPin className="w-8 h-8 opacity-30" />
              No locations found
            </div>
          ) : (
            Object.entries(groupedLocations).map(([category, locs]) => (
              <div key={category}>
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                  {category}
                </div>
                {locs.map((loc) => {
                  const globalIndex = filteredLocations.findIndex(l => l.id === loc.id);
                  const locName = locations.find(l => l.id === loc.id)?.name || loc.name;
                  return (
                    <button
                      key={loc.id}
                      onClick={() => handleSelect(loc.id)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between group ${globalIndex === highlightIndex ? 'bg-muted' : ''
                        } ${loc.id === value ? 'text-primary font-medium' : 'text-foreground'}`}
                      role="option"
                      aria-selected={loc.id === value}
                    >
                      <span>{locName}</span>
                      {onToggleFavorite && (
                        <button
                          onClick={(e) => handleFavoriteClick(e, loc.id, locName)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted-foreground/10 rounded"
                          aria-label={isFavorite?.(loc.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star
                            className={`w-4 h-4 transition-colors ${isFavorite?.(loc.id)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-muted-foreground hover:text-amber-500'
                              }`}
                          />
                        </button>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
