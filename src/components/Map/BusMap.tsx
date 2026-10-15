import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { BusStop, BusServiceRoute, LiveBusLocation } from '../../types/bus';
import { getLoadDetails, getBusTypeDetails } from '../../services/predictionEngine';
import { OPERATOR_META } from '../../services/ltaData';

interface BusMapProps {
  stops: BusStop[];
  selectedStop: BusStop | null;
  onSelectStop: (stop: BusStop) => void;
  liveBuses: LiveBusLocation[];
  activeRoute: BusServiceRoute | null;
  userLocation: { lat: number; lng: number } | null;
  selectedBusId: string | null;
  onSelectBus: (bus: LiveBusLocation | null) => void;
}

export const BusMap: React.FC<BusMapProps> = ({
  stops,
  selectedStop,
  onSelectStop,
  liveBuses,
  activeRoute,
  userLocation,
  selectedBusId,
  onSelectBus,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const stopMarkersRef = useRef<Record<string, L.Marker>>({});
  const busMarkersRef = useRef<Record<string, L.Marker>>({});
  const polylineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Singapore
    const initialLat = selectedStop ? selectedStop.Latitude : 1.30064;
    const initialLng = selectedStop ? selectedStop.Longitude : 103.85611;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: false,
    });

    // Dark Matter / Positron CartoDB tiles for high-contrast transit map
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update stops markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers that no longer exist
    Object.keys(stopMarkersRef.current).forEach((code) => {
      if (!stops.some((s) => s.BusStopCode === code)) {
        stopMarkersRef.current[code].remove();
        delete stopMarkersRef.current[code];
      }
    });

    stops.forEach((stop) => {
      const isSelected = selectedStop?.BusStopCode === stop.BusStopCode;

      const stopHtml = `
        <div class="relative group cursor-pointer flex flex-col items-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 ${
            isSelected
              ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30 scale-110 shadow-lg'
              : 'bg-slate-900 text-emerald-400 border border-slate-700 hover:scale-105 shadow-md'
          }">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6v6"></path>
              <path d="M16 6v6"></path>
              <rect width="16" height="16" x="4" y="3" rx="2"></rect>
              <path d="M4 11h16"></path>
              <path d="M8 15h.01"></path>
              <path d="M16 15h.01"></path>
            </svg>
          </div>
          <div class="mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold whitespace-nowrap ${
            isSelected ? 'bg-slate-900 text-emerald-400 border border-emerald-500/40 shadow-sm' : 'bg-slate-900/90 text-slate-300 border border-slate-800'
          }">
            ${stop.BusStopCode}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-bus-stop-icon',
        html: stopHtml,
        iconSize: [36, 48],
        iconAnchor: [18, 24],
        popupAnchor: [0, -24],
      });

      if (stopMarkersRef.current[stop.BusStopCode]) {
        stopMarkersRef.current[stop.BusStopCode].setIcon(customIcon);
        stopMarkersRef.current[stop.BusStopCode].setLatLng([stop.Latitude, stop.Longitude]);
      } else {
        const marker = L.marker([stop.Latitude, stop.Longitude], { icon: customIcon });
        marker.on('click', () => {
          onSelectStop(stop);
        });
        marker.addTo(map);
        stopMarkersRef.current[stop.BusStopCode] = marker;
      }
    });
  }, [stops, selectedStop, onSelectStop]);

  // Update Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (activeRoute && activeRoute.PathCoordinates.length > 0) {
      const poly = L.polyline(activeRoute.PathCoordinates, {
        color: '#10b981', // Emerald transit line
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: undefined,
      }).addTo(map);

      polylineRef.current = poly;
      map.fitBounds(poly.getBounds(), { padding: [50, 50], maxZoom: 16 });
    }
  }, [activeRoute]);

  // Update Live Bus Fleet Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear stale bus markers
    const currentBusIds = new Set(liveBuses.map((b) => b.id));
    Object.keys(busMarkersRef.current).forEach((id) => {
      if (!currentBusIds.has(id)) {
        busMarkersRef.current[id].remove();
        delete busMarkersRef.current[id];
      }
    });

    liveBuses.forEach((bus) => {
      const load = getLoadDetails(bus.load);
      const busType = getBusTypeDetails(bus.type);
      const isSelected = selectedBusId === bus.id;
      const opMeta = OPERATOR_META[bus.operator] || { color: '#10b981' };

      const busHtml = `
        <div class="relative cursor-pointer transition-transform duration-300 group">
          <div class="flex items-center gap-1 px-2 py-1 rounded-lg text-white font-mono text-xs font-bold shadow-xl border ${
            isSelected
              ? 'ring-4 ring-emerald-400 bg-slate-900 border-emerald-400 scale-110'
              : 'bg-slate-950/95 border-slate-700 hover:border-slate-500'
          }">
            <div class="w-2 h-2 rounded-full" style="background-color: ${load.color};" title="${load.label}"></div>
            <span class="text-[12px] tracking-tight font-extrabold text-white">${bus.serviceNo}</span>
            ${
              bus.type === 'DD'
                ? '<span class="text-[9px] bg-slate-800 text-sky-400 px-1 rounded font-mono">DD</span>'
                : bus.type === 'BD'
                ? '<span class="text-[9px] bg-slate-800 text-amber-400 px-1 rounded font-mono">BD</span>'
                : ''
            }
          </div>
          <!-- Vehicle heading arrow -->
          <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-slate-900 mx-auto -mt-0.5"></div>
        </div>
      `;

      const busIcon = L.divIcon({
        className: 'custom-live-bus-marker',
        html: busHtml,
        iconSize: [64, 32],
        iconAnchor: [32, 28],
      });

      if (busMarkersRef.current[bus.id]) {
        busMarkersRef.current[bus.id].setIcon(busIcon);
        busMarkersRef.current[bus.id].setLatLng([bus.latitude, bus.longitude]);
      } else {
        const marker = L.marker([bus.latitude, bus.longitude], { icon: busIcon, zIndexOffset: 500 });
        marker.on('click', () => {
          onSelectBus(bus);
        });
        marker.addTo(map);
        busMarkersRef.current[bus.id] = marker;
      }
    });
  }, [liveBuses, selectedBusId, onSelectBus]);

  // Center on Selected Stop
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedStop) return;

    map.flyTo([selectedStop.Latitude, selectedStop.Longitude], 16, {
      duration: 0.8,
    });
  }, [selectedStop]);

  // User location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation) {
      const userHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
          <div class="absolute -inset-1 bg-blue-400/30 rounded-full animate-ping"></div>
        </div>
      `;
      const userIcon = L.divIcon({
        className: 'custom-user-location',
        html: userHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(map);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userLocation]);

  return (
    <div className="relative w-full h-full min-h-[360px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Legend Overlay */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-2 text-xs flex items-center gap-4 text-slate-300 shadow-lg pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Seats</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span>Standing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
          <span>Limited</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 border-l border-slate-700 pl-3">
          <span className="font-mono text-[10px] bg-slate-800 text-sky-400 px-1 rounded">DD</span>
          <span>Double Deck</span>
        </div>
      </div>
    </div>
  );
};
