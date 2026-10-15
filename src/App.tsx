/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell,
  Bus,
  Compass,
  Database,
  Layers,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  Server,
  Settings,
  Sparkles,
  Wifi,
} from 'lucide-react';

import { BusArrivalResponse, BusServiceRoute, BusStop, LiveBusLocation, TrafficCondition } from './types/bus';
import { BUS_ROUTES } from './services/ltaData';
import {
  getBusArrivals,
  getBusStops,
  getLiveBusFleet,
  stepSimulation,
  getBackendConfig,
} from './services/ltaApi';
import { TRAFFIC_PRESETS, getDistanceMeters } from './services/predictionEngine';
import { BusMap } from './components/Map/BusMap';
import { BusStopDetail } from './components/Arrivals/BusStopDetail';
import { StopSearch } from './components/Search/StopSearch';
import { RouteModal } from './components/Routes/RouteModal';
import { BackendModal } from './components/Settings/BackendModal';

const FAVORITES_STORAGE_KEY = 'sg_bus_favorites_v1';
const AUTO_REFRESH_INTERVAL = 15; // seconds

export default function App() {
  const [stops, setStops] = useState<BusStop[]>([]);
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [arrivals, setArrivals] = useState<BusArrivalResponse | null>(null);
  const [liveBuses, setLiveBuses] = useState<LiveBusLocation[]>([]);
  const [activeRoute, setActiveRoute] = useState<BusServiceRoute | null>(null);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);

  const [isLoadingArrivals, setIsLoadingArrivals] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [refreshCountdown, setRefreshCountdown] = useState(AUTO_REFRESH_INTERVAL);

  const [trafficCondition, setTrafficCondition] = useState<TrafficCondition>(TRAFFIC_PRESETS[0]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['01012', '08057', '03239'];
    } catch {
      return ['01012', '08057'];
    }
  });

  const [activeAlarms, setActiveAlarms] = useState<Record<string, boolean>>({});
  const [alarmToast, setAlarmToast] = useState<{ message: string; serviceNo: string } | null>(null);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'arrivals' | 'map' | 'search'>('arrivals');

  // Load initial bus stops
  useEffect(() => {
    const loadStops = async () => {
      const data = await getBusStops();
      setStops(data);
      if (data.length > 0 && !selectedStop) {
        // Default to Bugis Exit A (01012)
        const initial = data.find((s) => s.BusStopCode === '01012') || data[0];
        setSelectedStop(initial);
      }
    };
    loadStops();
  }, []);

  // Request browser geolocation for nearby stops
  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);

        // Calculate distance for all stops
        setStops((prev) =>
          prev.map((s) => ({
            ...s,
            DistanceMeters: getDistanceMeters(coords.lat, coords.lng, s.Latitude, s.Longitude),
          }))
        );
      },
      (err) => {
        console.warn('Geolocation access denied or timed out:', err);
        // Default to central Singapore (Dhoby Ghaut / Orchard)
        const simulatedUserCoords = { lat: 1.2995, lng: 103.845 };
        setUserLocation(simulatedUserCoords);
        setStops((prev) =>
          prev.map((s) => ({
            ...s,
            DistanceMeters: getDistanceMeters(
              simulatedUserCoords.lat,
              simulatedUserCoords.lng,
              s.Latitude,
              s.Longitude
            ),
          }))
        );
      },
      { timeout: 8000 }
    );
  }, []);

  // Fetch arrivals whenever selected stop or traffic changes
  const fetchArrivalsData = useCallback(async () => {
    if (!selectedStop) return;
    setIsLoadingArrivals(true);
    try {
      const res = await getBusArrivals(
        selectedStop.BusStopCode,
        trafficCondition.delayMultiplier
      );
      setArrivals(res);
      setRefreshCountdown(AUTO_REFRESH_INTERVAL);
    } catch (err) {
      console.error('Failed to fetch bus arrivals:', err);
    } finally {
      setIsLoadingArrivals(false);
    }
  }, [selectedStop, trafficCondition]);

  useEffect(() => {
    fetchArrivalsData();
  }, [fetchArrivalsData]);

  // Master clock & live continuous simulation tick (ticks every 1s)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Advance fleet simulation
      stepSimulation(1, trafficCondition.delayMultiplier);

      // Update live fleet
      getLiveBusFleet(selectedStop?.BusStopCode).then((fleet) => {
        setLiveBuses(fleet);
      });

      // Handle countdown for auto-refresh
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchArrivalsData();
          return AUTO_REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedStop, trafficCondition, fetchArrivalsData]);

  // Check active arrival alarms
  useEffect(() => {
    if (!arrivals) return;

    arrivals.Services.forEach((svc) => {
      if (activeAlarms[svc.ServiceNo]) {
        const est = new Date(svc.NextBus.EstimatedArrival).getTime();
        const diffSec = (est - currentTime.getTime()) / 1000;

        // If bus is within 90 seconds, ring alarm!
        if (diffSec <= 90 && diffSec > 0) {
          setAlarmToast({
            serviceNo: svc.ServiceNo,
            message: `Bus ${svc.ServiceNo} is arriving at ${selectedStop?.Description}!`,
          });
          // Remove alarm once triggered
          setActiveAlarms((prev) => {
            const next = { ...prev };
            delete next[svc.ServiceNo];
            return next;
          });

          // Play polite notification chime
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start();
            osc.stop(ctx.currentTime + 0.45);
          } catch (e) {
            // Audio context policy
          }
        }
      }
    });
  }, [arrivals, currentTime, activeAlarms, selectedStop]);

  // Toggle favorite stop
  const handleToggleFavorite = (stopCode: string) => {
    setFavorites((prev) => {
      const next = prev.includes(stopCode)
        ? prev.filter((c) => c !== stopCode)
        : [...prev, stopCode];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save favorites to localStorage', e);
      }
      return next;
    });
  };

  // Toggle alert on service
  const handleToggleAlarm = (serviceNo: string, etaMinutes: number) => {
    setActiveAlarms((prev) => {
      const next = { ...prev };
      if (next[serviceNo]) {
        delete next[serviceNo];
      } else {
        next[serviceNo] = true;
        setAlarmToast({
          serviceNo,
          message: `Alert set for Bus ${serviceNo}. You'll be notified when it arrives!`,
        });
        setTimeout(() => setAlarmToast(null), 4000);
      }
      return next;
    });
  };

  // View service route modal
  const handleViewRoute = (serviceNo: string) => {
    const route = BUS_ROUTES[serviceNo];
    if (route) {
      setActiveRoute(route);
      setIsRouteModalOpen(true);
    }
  };

  // Track specific bus on map
  const handleTrackBus = (lat: number, lng: number, serviceNo: string) => {
    // Find matching live vehicle
    const bus = liveBuses.find((b) => b.serviceNo === serviceNo);
    if (bus) {
      setSelectedBusId(bus.id);
    }
    // Switch to map view on mobile
    setMobileTab('map');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* =========================================================================
          Top Bar: Strictly conforming to the Universal Top Bar Contract
          Zone 1: Brand title, one line
          Zone 2: 4-5 nav links, single line
          Zone 3: 1 primary action
         ========================================================================= */}
      <header className="flex items-center justify-between gap-8 px-4 sm:px-8 py-3.5 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 font-mono font-black text-base">
            SG
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-white font-mono">
            SG Bus Radar
          </span>
        </div>

        {/* Zone 2: 4 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <button
            onClick={() => setMobileTab('arrivals')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              mobileTab === 'arrivals' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Live Arrivals
          </button>
          <button
            onClick={() => setMobileTab('map')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              mobileTab === 'map' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Interactive Radar
          </button>
          <button
            onClick={() => {
              const route = BUS_ROUTES['190'];
              if (route) {
                setActiveRoute(route);
                setIsRouteModalOpen(true);
              }
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Express Routes
          </button>
          <button
            onClick={handleRequestLocation}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Find Nearby</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsBackendModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-2 shadow-sm"
          >
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Backend Connection</span>
            <span className="sm:hidden">API</span>
          </button>
        </div>
      </header>

      {/* Alarm Toast Notification */}
      {alarmToast && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-slate-900 border border-amber-500/60 rounded-2xl p-4 shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">{alarmToast.message}</p>
            <p className="text-[11px] text-amber-300 font-mono">Arriving in ~1 minute</p>
          </div>
          <button
            onClick={() => setAlarmToast(null)}
            className="text-slate-500 hover:text-slate-300 text-xs px-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =========================================================================
          Main Responsive Viewport
          Desktop: 3-column / 2-column multi-panel layout (Search / Arrivals / Radar Map)
          Mobile: Ergonomic Tab Navigation with bottom-zone controls
         ========================================================================= */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-5 flex flex-col gap-4 overflow-hidden">
        {/* Mobile Tab Selector (only visible on small screens) */}
        <div className="md:hidden flex items-center p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs shrink-0">
          <button
            onClick={() => setMobileTab('arrivals')}
            className={`flex-1 py-2 rounded-xl font-medium transition-all ${
              mobileTab === 'arrivals'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400'
            }`}
          >
            Arrivals & Stops
          </button>
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-2 rounded-xl font-medium transition-all ${
              mobileTab === 'map'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400'
            }`}
          >
            Live Radar Map
          </button>
          <button
            onClick={() => setMobileTab('search')}
            className={`flex-1 py-2 rounded-xl font-medium transition-all ${
              mobileTab === 'search'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400'
            }`}
          >
            Directory
          </button>
        </div>

        {/* Master Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[500px] h-[calc(100vh-125px)]">
          {/* Left Column: Bus Stop Search & Hub Directory (3 cols on desktop) */}
          <section
            className={`lg:col-span-3 h-full flex flex-col ${
              mobileTab === 'search' ? 'block' : 'hidden lg:flex'
            }`}
          >
            <StopSearch
              stops={stops}
              selectedStop={selectedStop}
              onSelectStop={(stop) => {
                setSelectedStop(stop);
                setMobileTab('arrivals');
              }}
              favorites={favorites}
              userLocation={userLocation}
              onRequestLocation={handleRequestLocation}
            />
          </section>

          {/* Middle Column: Live Arrival Monitor for Selected Stop (4 cols on desktop) */}
          <section
            className={`lg:col-span-4 h-full flex flex-col ${
              mobileTab === 'arrivals' ? 'block' : 'hidden lg:flex'
            }`}
          >
            {selectedStop ? (
              <BusStopDetail
                stop={selectedStop}
                arrivals={arrivals}
                isLoading={isLoadingArrivals}
                onRefresh={fetchArrivalsData}
                currentTime={currentTime}
                isFavorite={favorites.includes(selectedStop.BusStopCode)}
                onToggleFavorite={handleToggleFavorite}
                trafficCondition={trafficCondition}
                onChangeTrafficCondition={setTrafficCondition}
                onViewRoute={handleViewRoute}
                onTrackBus={handleTrackBus}
                activeAlarms={activeAlarms}
                onToggleAlarm={handleToggleAlarm}
                refreshSecondsLeft={refreshCountdown}
              />
            ) : (
              <div className="h-full flex items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center">
                <p className="text-slate-400 text-sm">Select a bus stop to view real-time arrivals</p>
              </div>
            )}
          </section>

          {/* Right Column: Interactive Singapore Radar Map & Fleet Visualizer (5 cols on desktop) */}
          <section
            className={`lg:col-span-5 h-full flex flex-col relative ${
              mobileTab === 'map' ? 'block' : 'hidden lg:flex'
            }`}
          >
            <BusMap
              stops={stops}
              selectedStop={selectedStop}
              onSelectStop={(stop) => setSelectedStop(stop)}
              liveBuses={liveBuses}
              activeRoute={activeRoute}
              userLocation={userLocation}
              selectedBusId={selectedBusId}
              onSelectBus={(bus) => {
                if (bus) {
                  setSelectedBusId(bus.id);
                  const stop = stops.find((s) => s.BusStopCode === bus.nextStopCode);
                  if (stop) setSelectedStop(stop);
                }
              }}
            />

            {/* Floating Map Actions (Clear Route, Presets) */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
              {activeRoute && (
                <button
                  onClick={() => setActiveRoute(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/95 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold shadow-lg backdrop-blur-sm transition-colors flex items-center gap-1.5"
                >
                  <span>Clear Route {activeRoute.ServiceNo}</span>
                </button>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Route Inspector Modal */}
      <RouteModal
        route={activeRoute}
        onClose={() => setIsRouteModalOpen(false)}
        activeBuses={liveBuses}
        currentStopCode={selectedStop?.BusStopCode || ''}
        onSelectStopCode={(code) => {
          const target = stops.find((s) => s.BusStopCode === code);
          if (target) setSelectedStop(target);
        }}
      />

      {/* Backend & LTA DataMall Connection Modal */}
      <BackendModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        onConfigUpdated={() => {
          fetchArrivalsData();
        }}
      />
    </div>
  );
}
