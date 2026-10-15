import React, { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  CloudRain,
  Compass,
  Filter,
  Navigation,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { BusArrivalResponse, BusStop, TrafficCondition } from '../../types/bus';
import { ServiceCard } from './ServiceCard';
import { TRAFFIC_PRESETS } from '../../services/predictionEngine';

interface BusStopDetailProps {
  stop: BusStop;
  arrivals: BusArrivalResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  currentTime: Date;
  isFavorite: boolean;
  onToggleFavorite: (stopCode: string) => void;
  trafficCondition: TrafficCondition;
  onChangeTrafficCondition: (cond: TrafficCondition) => void;
  onViewRoute: (serviceNo: string) => void;
  onTrackBus: (lat: number, lng: number, serviceNo: string) => void;
  activeAlarms: Record<string, boolean>;
  onToggleAlarm: (serviceNo: string, etaMinutes: number) => void;
  refreshSecondsLeft: number;
}

export const BusStopDetail: React.FC<BusStopDetailProps> = ({
  stop,
  arrivals,
  isLoading,
  onRefresh,
  currentTime,
  isFavorite,
  onToggleFavorite,
  trafficCondition,
  onChangeTrafficCondition,
  onViewRoute,
  onTrackBus,
  activeAlarms,
  onToggleAlarm,
  refreshSecondsLeft,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const services = arrivals?.Services || [];
  const filteredServices = services.filter((s) =>
    s.ServiceNo.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Bus Stop Banner Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                STOP {stop.BusStopCode}
              </span>
              {stop.DistanceMeters !== undefined && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-sky-400" />
                  {stop.DistanceMeters < 1000
                    ? `${stop.DistanceMeters}m away`
                    : `${(stop.DistanceMeters / 1000).toFixed(1)}km away`}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1.5 tracking-tight">
              {stop.Description}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">{stop.RoadName}</p>
          </div>

          {/* Favorite & Refresh */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(stop.BusStopCode)}
              title={isFavorite ? 'Remove from favorites' : 'Save bus stop'}
              className={`p-2.5 rounded-xl border transition-all ${
                isFavorite
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700'
              }`}
            >
              {isFavorite ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh live arrivals"
              className="px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center gap-2 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="font-mono text-[11px] text-slate-400">{refreshSecondsLeft}s</span>
            </button>
          </div>
        </div>

        {/* Traffic Simulation & Prediction Condition Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">Traffic Model:</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {TRAFFIC_PRESETS.map((preset) => {
              const isActive = trafficCondition.mode === preset.mode;
              return (
                <button
                  key={preset.mode}
                  onClick={() => onChangeTrafficCondition(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset.mode === 'rain' && <CloudRain className="w-3 h-3 inline mr-1 text-sky-400" />}
                  {preset.label.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter / Search within Stop */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={`Filter ${services.length} services (e.g. 190, 65)...`}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
        </div>
      </div>

      {/* Services Arrival List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {isLoading && services.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
            <p className="text-sm">Retrieving real-time LTA bus predictions...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-10 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-6">
            <Filter className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm font-medium">No matching bus services found</p>
            <p className="text-slate-600 text-xs mt-1">
              Try searching a different service number or reset the filter.
            </p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <ServiceCard
              key={service.ServiceNo}
              service={service}
              currentTime={currentTime}
              onViewRoute={onViewRoute}
              onTrackBus={onTrackBus}
              isAlarmSet={!!activeAlarms[service.ServiceNo]}
              onToggleAlarm={onToggleAlarm}
            />
          ))
        )}
      </div>
    </div>
  );
};
