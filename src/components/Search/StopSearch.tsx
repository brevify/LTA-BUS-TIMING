import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  Building,
  Check,
  Compass,
  MapPin,
  Navigation,
  Search,
  X,
} from 'lucide-react';
import { BusStop } from '../../types/bus';

interface StopSearchProps {
  stops: BusStop[];
  selectedStop: BusStop | null;
  onSelectStop: (stop: BusStop) => void;
  favorites: string[];
  userLocation: { lat: number; lng: number } | null;
  onRequestLocation: () => void;
}

type TabType = 'all' | 'favorites' | 'nearby';

const POPULAR_HUBS = [
  { label: 'Bugis', query: 'Bugis' },
  { label: 'Orchard Rd', query: 'Orchard' },
  { label: 'Marina Bay', query: 'Marina' },
  { label: 'Dhoby Ghaut', query: 'Dhoby Ghaut' },
  { label: 'Changi Airport', query: 'Changi' },
  { label: 'Tampines', query: 'Tampines' },
  { label: 'Jurong East', query: 'Jurong' },
  { label: 'Woodlands', query: 'Woodlands' },
];

export const StopSearch: React.FC<StopSearchProps> = ({
  stops,
  selectedStop,
  onSelectStop,
  favorites,
  userLocation,
  onRequestLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const filteredStops = useMemo(() => {
    let result = stops;

    // Filter by tab
    if (activeTab === 'favorites') {
      result = result.filter((s) => favorites.includes(s.BusStopCode));
    } else if (activeTab === 'nearby' && userLocation) {
      result = [...result].sort(
        (a, b) => (a.DistanceMeters || 999999) - (b.DistanceMeters || 999999)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.BusStopCode.toLowerCase().includes(q) ||
          s.Description.toLowerCase().includes(q) ||
          s.RoadName.toLowerCase().includes(q) ||
          s.Services.some((svc) => svc.toLowerCase() === q || `bus ${svc}`.includes(q))
      );
    }

    return result;
  }, [stops, favorites, activeTab, userLocation, searchQuery]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Stop Code (e.g. 01012), Road, or Bus No..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-9 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all ${
            activeTab === 'all'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Stops ({stops.length})
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'favorites'
              ? 'bg-slate-800 text-amber-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Favorites ({favorites.length})
        </button>

        <button
          onClick={() => {
            if (!userLocation) onRequestLocation();
            setActiveTab('nearby');
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'nearby'
              ? 'bg-slate-800 text-sky-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          Nearby
        </button>
      </div>

      {/* Popular Hubs Quick Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
        {POPULAR_HUBS.map((hub) => (
          <button
            key={hub.label}
            onClick={() => setSearchQuery(hub.query)}
            className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 whitespace-nowrap transition-colors shrink-0"
          >
            {hub.label}
          </button>
        ))}
      </div>

      {/* Stop List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredStops.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No bus stops match your criteria.
          </div>
        ) : (
          filteredStops.map((stop) => {
            const isSelected = selectedStop?.BusStopCode === stop.BusStopCode;
            const isFav = favorites.includes(stop.BusStopCode);

            return (
              <div
                key={stop.BusStopCode}
                onClick={() => onSelectStop(stop)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500/50 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {stop.BusStopCode}
                      </span>
                      {stop.DistanceMeters !== undefined && (
                        <span className="text-[10px] text-sky-400 font-mono">
                          {stop.DistanceMeters < 1000
                            ? `${stop.DistanceMeters}m`
                            : `${(stop.DistanceMeters / 1000).toFixed(1)}km`}
                        </span>
                      )}
                      {isFav && <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400" />}
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100 mt-0.5">
                      {stop.Description}
                    </h4>
                    <p className="text-xs text-slate-400">{stop.RoadName}</p>
                  </div>
                </div>

                {/* Services pills */}
                <div className="flex flex-wrap items-center gap-1 mt-2.5">
                  {stop.Services.map((svc) => (
                    <span
                      key={svc}
                      className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                    >
                      {svc}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
