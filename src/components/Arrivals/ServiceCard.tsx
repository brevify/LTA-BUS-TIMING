import React, { useState } from 'react';
import {
  Bell,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  MapPin,
  Route,
  Zap,
} from 'lucide-react';
import { BusServiceArrival, NextBusInfo } from '../../types/bus';
import {
  formatArrivalEta,
  formatClockTime,
  getBusTypeDetails,
  getLoadDetails,
  getRemainingSeconds,
} from '../../services/predictionEngine';
import { OPERATOR_META } from '../../services/ltaData';

interface ServiceCardProps {
  service: BusServiceArrival;
  currentTime: Date;
  onViewRoute: (serviceNo: string) => void;
  onTrackBus: (busLat: number, busLng: number, serviceNo: string) => void;
  isAlarmSet: boolean;
  onToggleAlarm: (serviceNo: string, etaMinutes: number) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  currentTime,
  onViewRoute,
  onTrackBus,
  isAlarmSet,
  onToggleAlarm,
}) => {
  const [expanded, setExpanded] = useState(false);
  const opMeta = OPERATOR_META[service.Operator] || {
    name: service.Operator,
    color: '#10b981',
    badgeBg: 'bg-emerald-950/40 text-emerald-300',
    border: 'border-emerald-500/30',
  };

  const next1 = service.NextBus;
  const next2 = service.NextBus2;
  const next3 = service.NextBus3;

  const sec1 = getRemainingSeconds(next1?.EstimatedArrival, currentTime);
  const sec2 = next2 ? getRemainingSeconds(next2.EstimatedArrival, currentTime) : null;
  const sec3 = next3 ? getRemainingSeconds(next3.EstimatedArrival, currentTime) : null;

  const eta1 = formatArrivalEta(sec1);
  const eta2 = sec2 !== null ? formatArrivalEta(sec2) : null;
  const eta3 = sec3 !== null ? formatArrivalEta(sec3) : null;

  const load1 = getLoadDetails(next1?.Load || 'SEA');
  const type1 = getBusTypeDetails(next1?.Type || 'SD');

  const handleTrackBusClick = (e: React.MouseEvent, next: NextBusInfo) => {
    e.stopPropagation();
    if (next.Latitude && next.Longitude) {
      onTrackBus(Number(next.Latitude), Number(next.Longitude), service.ServiceNo);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow-md">
      {/* Top Header: Service Number, Operator, Route Info & Quick Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Service Badge */}
          <div
            className="px-3.5 py-1.5 rounded-xl font-mono text-xl font-extrabold tracking-tight text-white flex items-center justify-center min-w-[70px] shadow-inner"
            style={{ backgroundColor: opMeta.color }}
          >
            {service.ServiceNo}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${opMeta.badgeBg} border ${opMeta.border}`}>
                {opMeta.name}
              </span>
              {service.category && (
                <span className="text-[11px] text-slate-400 font-medium">
                  {service.category}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate max-w-[220px] sm:max-w-xs">
              to {service.destinationDescription || 'Terminus'}
            </p>
          </div>
        </div>

        {/* Action buttons: Alert bell & Route view */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleAlarm(service.ServiceNo, eta1.minutes)}
            title={isAlarmSet ? 'Arrival alert active' : 'Notify when bus approaches'}
            className={`p-2 rounded-xl border transition-colors ${
              isAlarmSet
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700/60'
            }`}
          >
            {isAlarmSet ? <Check className="w-4 h-4 text-amber-400" /> : <Bell className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onViewRoute(service.ServiceNo)}
            title="Inspect route stops"
            className="px-2.5 py-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60 flex items-center gap-1.5 text-xs font-medium hover:bg-slate-700/60 transition-colors"
          >
            <Route className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Route</span>
          </button>
        </div>
      </div>

      {/* Primary Arrival Timing Strip: Next 3 Buses */}
      <div className="grid grid-cols-3 gap-2.5 mt-4 pt-3 border-t border-slate-800/80">
        {/* Next Bus 1 (Imminent) */}
        <div
          onClick={(e) => handleTrackBusClick(e, next1)}
          className="bg-slate-950/70 hover:bg-slate-950 rounded-xl p-2.5 border border-slate-800/90 hover:border-slate-700 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Next Bus</span>
            <span className="font-mono">{formatClockTime(next1.EstimatedArrival)}</span>
          </div>

          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span
              className={`font-mono text-2xl font-bold tracking-tight ${
                eta1.isArriving ? 'text-emerald-400 animate-pulse' : 'text-white'
              }`}
            >
              {eta1.label}
            </span>
            {eta1.isArriving && (
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                Now
              </span>
            )}
          </div>

          {/* Load indicator bar */}
          <div className="mt-2">
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${load1.barWidthPercent}%`,
                  backgroundColor: load1.color,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span style={{ color: load1.color }}>{load1.shortLabel}</span>
              <span className="font-mono text-slate-500">{type1.shortCode}</span>
            </div>
          </div>
        </div>

        {/* Next Bus 2 */}
        {next2 ? (
          <div
            onClick={(e) => handleTrackBusClick(e, next2)}
            className="bg-slate-950/40 hover:bg-slate-950 rounded-xl p-2.5 border border-slate-800/60 hover:border-slate-700 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>2nd Bus</span>
              <span className="font-mono text-slate-500">{formatClockTime(next2.EstimatedArrival)}</span>
            </div>

            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="font-mono text-xl font-bold text-slate-200">
                {eta2?.label || '--'}
              </span>
            </div>

            {/* Load indicator */}
            <div className="mt-2">
              {(() => {
                const load2 = getLoadDetails(next2.Load);
                const type2 = getBusTypeDetails(next2.Type);
                return (
                  <>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${load2.barWidthPercent}%`,
                          backgroundColor: load2.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span style={{ color: load2.color }}>{load2.shortLabel}</span>
                      <span className="font-mono text-slate-500">{type2.shortCode}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/20 rounded-xl p-2.5 border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-600">
            No 2nd Bus
          </div>
        )}

        {/* Next Bus 3 */}
        {next3 ? (
          <div className="bg-slate-950/30 rounded-xl p-2.5 border border-slate-800/40">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>3rd Bus</span>
              <span className="font-mono text-slate-500">{formatClockTime(next3.EstimatedArrival)}</span>
            </div>

            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="font-mono text-xl font-bold text-slate-300">
                {eta3?.label || '--'}
              </span>
            </div>

            {/* Load indicator */}
            <div className="mt-2">
              {(() => {
                const load3 = getLoadDetails(next3.Load);
                const type3 = getBusTypeDetails(next3.Type);
                return (
                  <>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${load3.barWidthPercent}%`,
                          backgroundColor: load3.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span style={{ color: load3.color }}>{load3.shortLabel}</span>
                      <span className="font-mono text-slate-500">{type3.shortCode}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/20 rounded-xl p-2.5 border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-600">
            No 3rd Bus
          </div>
        )}
      </div>

      {/* Expanded Telemetry & Live Prediction Details */}
      <div className="mt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors pt-1"
        >
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>
              {next1.LiveDistanceMeters
                ? `${(next1.LiveDistanceMeters / 1000).toFixed(1)} km away · ${next1.Speed || 25} km/h`
                : 'GPS Live Telemetry'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>{expanded ? 'Hide Telemetry' : 'View Details'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {expanded && (
          <div className="mt-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Bus Type</span>
                <span className="font-medium text-slate-200">
                  {type1.name} {next1.Feature === 'WAB' && '· Wheelchair Ramp'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Passenger Capacity</span>
                <span className="font-medium" style={{ color: load1.color }}>
                  {load1.label}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">GPS Coordinates</span>
                <span className="font-mono text-slate-300 text-[11px]">
                  {next1.Latitude}, {next1.Longitude}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Prediction Model</span>
                <span className="text-emerald-400 font-medium">LTA Real-time Signal Feed</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/70 flex justify-end">
              <button
                onClick={(e) => handleTrackBusClick(e, next1)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 flex items-center gap-1.5 text-xs font-semibold transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                Focus Bus on Map
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
