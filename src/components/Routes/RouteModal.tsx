import React from 'react';
import { ArrowRight, CheckCircle2, Compass, MapPin, X } from 'lucide-react';
import { BusServiceRoute, LiveBusLocation } from '../../types/bus';
import { OPERATOR_META } from '../../services/ltaData';

interface RouteModalProps {
  route: BusServiceRoute | null;
  onClose: () => void;
  activeBuses: LiveBusLocation[];
  currentStopCode: string;
  onSelectStopCode: (code: string) => void;
}

export const RouteModal: React.FC<RouteModalProps> = ({
  route,
  onClose,
  activeBuses,
  currentStopCode,
  onSelectStopCode,
}) => {
  if (!route) return null;

  const opMeta = OPERATOR_META[route.Operator] || {
    name: route.Operator,
    color: '#10b981',
    badgeBg: 'bg-emerald-950/40 text-emerald-300',
    border: 'border-emerald-500/30',
  };

  const matchingBuses = activeBuses.filter((b) => b.serviceNo === route.ServiceNo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="px-3.5 py-1.5 rounded-xl font-mono text-xl font-extrabold text-white"
              style={{ backgroundColor: opMeta.color }}
            >
              {route.ServiceNo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${opMeta.badgeBg} border ${opMeta.border}`}>
                  {opMeta.name}
                </span>
                <span className="text-xs text-slate-400">{route.Category}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                <span>{route.OriginDesc}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span>{route.DestinationDesc}</span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Active Fleet Summary */}
        <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{matchingBuses.length} Active Fleet Vehicles Live</span>
          </div>
          <span className="text-slate-500 font-mono">{route.Stops.length} stops mapped</span>
        </div>

        {/* Stops Sequence Timeline */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="relative border-l-2 border-slate-800 ml-4 space-y-6">
            {route.Stops.map((stop, idx) => {
              const isCurrent = stop.BusStopCode === currentStopCode;
              // Check if any bus is currently approaching this stop
              const approachingBus = matchingBuses.find(
                (b) => b.nextStopCode === stop.BusStopCode
              );

              return (
                <div
                  key={stop.BusStopCode}
                  onClick={() => {
                    onSelectStopCode(stop.BusStopCode);
                    onClose();
                  }}
                  className="relative pl-6 cursor-pointer group"
                >
                  {/* Timeline Node */}
                  <div
                    className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 transition-all ${
                      isCurrent
                        ? 'bg-emerald-500 border-white ring-4 ring-emerald-500/30'
                        : approachingBus
                        ? 'bg-amber-500 border-white ring-4 ring-amber-500/30'
                        : 'bg-slate-900 border-slate-700 group-hover:border-emerald-400'
                    }`}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          {stop.BusStopCode}
                        </span>
                        <span className="text-slate-500 text-[10px] font-mono">
                          Seq #{stop.StopSequence} · {stop.DistanceKm} km
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                            Current View
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-sm font-medium mt-0.5 ${
                          isCurrent ? 'text-emerald-400 font-bold' : 'text-slate-200 group-hover:text-white'
                        }`}
                      >
                        {stop.Description}
                      </h4>
                      <p className="text-xs text-slate-400">{stop.RoadName}</p>
                    </div>

                    {approachingBus && (
                      <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 shrink-0">
                        <span>Bus ~{Math.round(approachingBus.etaSeconds / 60)}m</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-medium transition-colors"
          >
            Close Route Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
