import React, { useState, useMemo } from 'react';
import { locations, quickDestinations, destinationCategories } from '@/data/campusData';
import { Search, MapPin, ChevronDown, ChevronRight } from 'lucide-react';

interface DestinationPickerProps {
  selectedDestination: string | null;
  onSelect: (locationId: string) => void;
  disabled?: boolean;
  mode?: 'start' | 'destination';
}

export const DestinationPicker: React.FC<DestinationPickerProps> = ({
  selectedDestination,
  onSelect,
  disabled,
  mode = 'destination',
}) => {
  const isStartMode = mode === 'start';
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Quick Access');

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return locations.filter(
      loc =>
        loc.type !== 'entrance' &&
        (loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.shortName?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const selectedLocation = locations.find(l => l.id === selectedDestination);

  const handleSelectLocation = (id: string) => {
    onSelect(id);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Quick Access Chips */}
      <div className="flex flex-wrap gap-2">
        {quickDestinations.map(dest => (
          <button
            key={dest.id}
            onClick={() => onSelect(dest.id)}
            disabled={disabled}
            className={`destination-chip flex items-center gap-2 ${selectedDestination === dest.id ? 'active' : ''
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-sm">{dest.icon}</span>
            <span>{dest.label}</span>
          </button>
        ))}
      </div>

      {/* Search & Browse Dropdown */}
      <div className="relative">
        <button
          className={`campus-card w-full p-4 flex items-center gap-3 text-left transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer'
            }`}
          onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{isStartMode ? 'Start Location' : 'Destination'}</p>
            {selectedLocation ? (
              <p className="font-semibold text-foreground truncate">{selectedLocation.name}</p>
            ) : (
              <p className="text-muted-foreground">{isStartMode ? 'Choose start point...' : 'Choose where to go...'}</p>
            )}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
              }`}
          />
        </button>

        {/* Dropdown Panel */}
        {
          isDropdownOpen && !disabled && (
            <div className="absolute top-full left-0 right-0 mt-2 campus-card-elevated p-3 z-50 max-h-80 overflow-hidden flex flex-col animate-scale-in">
              {/* Search Input */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search all locations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="search-input"
                  autoFocus
                />
              </div>

              {/* Results */}
              <div className="overflow-y-auto flex-1 -mx-1 px-1">
                {filteredLocations ? (
                  // Search Results
                  <div className="space-y-1">
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map(loc => (
                        <button
                          key={loc.id}
                          onClick={() => handleSelectLocation(loc.id)}
                          className={`location-item ${selectedDestination === loc.id ? 'selected' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base">{loc.icon}</span>
                            <div>
                              <div className="font-medium text-sm">{loc.name}</div>
                              {loc.block && (
                                <div className="text-xs text-muted-foreground capitalize">{loc.block} Block</div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        No locations found
                      </div>
                    )}
                  </div>
                ) : (
                  // Category Browser
                  <div className="space-y-1">
                    {destinationCategories.map(category => (
                      <div key={category.name}>
                        <button
                          onClick={() => setExpandedCategory(
                            expandedCategory === category.name ? null : category.name
                          )}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors"
                        >
                          <span className="font-semibold text-sm">{category.name}</span>
                          <ChevronRight
                            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expandedCategory === category.name ? 'rotate-90' : ''
                              }`}
                          />
                        </button>

                        {expandedCategory === category.name && (
                          <div className="ml-2 border-l-2 border-muted pl-2 space-y-0.5 mt-1 animate-fade-up">
                            {category.items.map(item => (
                              <button
                                key={item.id}
                                onClick={() => handleSelectLocation(item.id)}
                                className={`location-item ${selectedDestination === item.id ? 'selected' : ''}`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-sm">{item.icon}</span>
                                  <span className="font-medium text-sm">{item.label}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        }
      </div >
    </div >
  );
};
