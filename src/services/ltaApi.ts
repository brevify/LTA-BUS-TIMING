import {
  BusArrivalResponse,
  BusLoad,
  BusOperator,
  BusServiceArrival,
  BusStop,
  BusType,
  LiveBusLocation,
  NextBusInfo,
} from '../types/bus';
import { BUS_ROUTES, SINGAPORE_BUS_STOPS } from './ltaData';
import { getDistanceMeters } from './predictionEngine';

export interface BackendConfig {
  useCustomBackend: boolean;
  backendBaseUrl: string; // e.g. '/api/lta' or 'http://localhost:5000/api'
  ltaAccountKey: string; // Optional LTA API key for direct or proxied requests
}

const STORAGE_KEY = 'sg_bus_backend_config';

export function getBackendConfig(): BackendConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read backend config from localStorage', e);
  }
  return {
    useCustomBackend: false,
    backendBaseUrl: '/api/busarrival',
    ltaAccountKey: '',
  };
}

export function saveBackendConfig(config: BackendConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Could not save backend config to localStorage', e);
  }
}

// Internal simulation state to make bus movements continuous and realistic
interface SimulatedVehicleState {
  id: string;
  serviceNo: string;
  operator: BusOperator;
  type: BusType;
  load: BusLoad;
  targetStopCode: string;
  etaSeconds: number;
  lat: number;
  lng: number;
  bearing: number;
  speedKmh: number;
}

// In-memory active bus fleet simulation
let simulatedFleet: SimulatedVehicleState[] = [];
let lastTickTime = Date.now();

// Seed initial fleet for all routes
function initSimulationFleet() {
  if (simulatedFleet.length > 0) return;

  const fleet: SimulatedVehicleState[] = [];
  const operators: BusOperator[] = ['SBST', 'SMRT', 'TTS', 'GAS'];
  const loads: BusLoad[] = ['SEA', 'SEA', 'SDA', 'SDA', 'LSD'];
  const types: BusType[] = ['DD', 'DD', 'SD', 'BD'];

  Object.values(BUS_ROUTES).forEach((route) => {
    // Generate 3 active buses along the route path
    const path = route.PathCoordinates;
    if (!path || path.length < 2) return;

    for (let i = 0; i < 3; i++) {
      const pathIndex = Math.floor((path.length / 3) * i + Math.random() * (path.length / 3));
      const clampedIndex = Math.min(pathIndex, path.length - 1);
      const coord = path[clampedIndex];
      const nextCoord = path[Math.min(clampedIndex + 1, path.length - 1)];

      fleet.push({
        id: `SG-BUS-${route.ServiceNo}-${1000 + Math.floor(Math.random() * 9000)}`,
        serviceNo: route.ServiceNo,
        operator: route.Operator || operators[Math.floor(Math.random() * operators.length)],
        type: types[Math.floor(Math.random() * types.length)],
        load: loads[Math.floor(Math.random() * loads.length)],
        targetStopCode: route.Stops[Math.min(i * 2, route.Stops.length - 1)]?.BusStopCode || '01012',
        etaSeconds: 120 + i * 360 + Math.floor(Math.random() * 120),
        lat: coord[0],
        lng: coord[1],
        bearing: 45 + Math.random() * 90,
        speedKmh: 24 + Math.random() * 16,
      });
    }
  });

  simulatedFleet = fleet;
}

// Advance simulation continuously every second
export function stepSimulation(deltaSeconds: number = 1, delayMultiplier: number = 1.0) {
  initSimulationFleet();

  simulatedFleet.forEach((bus) => {
    // Reduce ETA
    bus.etaSeconds = Math.max(0, bus.etaSeconds - deltaSeconds / delayMultiplier);

    // If bus arrived, reset to next headway (e.g. 8-14 mins behind)
    if (bus.etaSeconds <= 0) {
      bus.etaSeconds = 480 + Math.floor(Math.random() * 400);
      // Maybe swap crowd load
      const loads: BusLoad[] = ['SEA', 'SDA', 'LSD'];
      bus.load = loads[Math.floor(Math.random() * loads.length)];
    }

    // Move bus slightly toward stop
    const route = BUS_ROUTES[bus.serviceNo];
    if (route && route.PathCoordinates.length > 1) {
      // Small jitter/forward movement
      const step = 0.00008 * (bus.speedKmh / 30) * deltaSeconds;
      bus.lat += (Math.random() - 0.48) * step;
      bus.lng += (Math.random() - 0.48) * step;
    }
  });
}

/**
 * Fetch list of all LTA bus stops.
 * Seamlessly switches between custom backend or high-fidelity Singapore dataset.
 */
export async function getBusStops(): Promise<BusStop[]> {
  const config = getBackendConfig();

  if (config.useCustomBackend && config.backendBaseUrl) {
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (config.ltaAccountKey) {
        headers['AccountKey'] = config.ltaAccountKey;
      }
      const res = await fetch(`${config.backendBaseUrl}/BusStops`, { headers });
      if (res.ok) {
        const data = await res.json();
        // Support standard LTA DataMall { value: [...] } format
        const items = data.value || data;
        if (Array.isArray(items) && items.length > 0) {
          return items.map((s: any) => ({
            BusStopCode: s.BusStopCode || s.code,
            RoadName: s.RoadName || s.road,
            Description: s.Description || s.name,
            Latitude: Number(s.Latitude || s.lat),
            Longitude: Number(s.Longitude || s.lng),
            Services: s.Services || ['7', '14', '65'],
          }));
        }
      }
    } catch (err) {
      console.warn('Backend fetch failed, falling back to local Singapore dataset:', err);
    }
  }

  // Built-in dataset fallback
  return SINGAPORE_BUS_STOPS;
}

/**
 * Fetch real-time bus arrivals for a specific bus stop code.
 */
export async function getBusArrivals(
  busStopCode: string,
  delayMultiplier: number = 1.0
): Promise<BusArrivalResponse> {
  const config = getBackendConfig();

  // If user configured a backend server
  if (config.useCustomBackend && config.backendBaseUrl) {
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (config.ltaAccountKey) {
        headers['AccountKey'] = config.ltaAccountKey;
      }
      let url = config.backendBaseUrl;
      const sep = url.includes('?') ? '&' : '?';
      if (url.includes('BusArrival') || url.includes('busarrival')) {
        url = `${url}${sep}BusStopCode=${encodeURIComponent(busStopCode)}`;
      } else {
        url = `${url.replace(/\/+$/, '')}/busarrival${sep}BusStopCode=${encodeURIComponent(busStopCode)}`;
      }
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.Services && Array.isArray(data.Services)) {
          return data;
        }
      } else {
        console.warn(`Backend responded with ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.warn('Custom backend error, fallback to real-time simulation:', err);
    }
  }

  // High-fidelity Singapore LTA simulation
  initSimulationFleet();
  const stop = SINGAPORE_BUS_STOPS.find((s) => s.BusStopCode === busStopCode);
  const now = Date.now();
  const servicesList = stop?.Services || ['7', '14', '65', '190'];

  const servicesArrivals: BusServiceArrival[] = servicesList.map((svcNo, index) => {
    const route = BUS_ROUTES[svcNo];
    const operator = route?.Operator || (index % 2 === 0 ? 'SBST' : 'SMRT');

    // Find any existing active buses for this service
    const matchingBuses = simulatedFleet.filter((b) => b.serviceNo === svcNo);
    const primaryBus = matchingBuses[0];

    // Seed realistic arrival times based on stop and service
    const baseOffsetSeconds = ((index * 137 + (primaryBus ? primaryBus.etaSeconds : 180)) % 720) * delayMultiplier;
    const eta1Seconds = Math.max(15, Math.round(baseOffsetSeconds));
    const eta2Seconds = Math.round(eta1Seconds + (420 + index * 90) * delayMultiplier);
    const eta3Seconds = Math.round(eta2Seconds + (600 + index * 80) * delayMultiplier);

    const stopLat = stop?.Latitude || 1.30064;
    const stopLng = stop?.Longitude || 103.85611;

    // Simulate real GPS location within 300m - 4km along road
    const dist1 = Math.max(150, Math.round(eta1Seconds * 7.5)); // ~27 km/h average
    const bus1Lat = stopLat - 0.0018 * (eta1Seconds / 180);
    const bus1Lng = stopLng - 0.0015 * (eta1Seconds / 180);

    const bus2Lat = stopLat - 0.0055 * (eta2Seconds / 450);
    const bus2Lng = stopLng - 0.0045 * (eta2Seconds / 450);

    const loads: BusLoad[] = ['SEA', 'SDA', 'LSD'];
    const types: BusType[] = ['SD', 'DD', 'BD'];

    const nextBus: NextBusInfo = {
      OriginCode: route?.OriginCode || '01012',
      DestinationCode: route?.DestinationCode || '02089',
      EstimatedArrival: new Date(now + eta1Seconds * 1000).toISOString(),
      Latitude: bus1Lat.toFixed(5),
      Longitude: bus1Lng.toFixed(5),
      VisitNumber: '1',
      Load: primaryBus?.load || loads[index % 3],
      Feature: 'WAB',
      Type: primaryBus?.type || types[index % 2],
      Speed: Math.round(20 + ((index * 7) % 22)),
      LiveDistanceMeters: dist1,
      AccuracyConfidence: 'HIGH',
      DelaySeconds: delayMultiplier > 1 ? Math.round((delayMultiplier - 1) * 120) : 0,
    };

    const nextBus2: NextBusInfo = {
      OriginCode: route?.OriginCode || '01012',
      DestinationCode: route?.DestinationCode || '02089',
      EstimatedArrival: new Date(now + eta2Seconds * 1000).toISOString(),
      Latitude: bus2Lat.toFixed(5),
      Longitude: bus2Lng.toFixed(5),
      VisitNumber: '1',
      Load: loads[(index + 1) % 3],
      Feature: 'WAB',
      Type: types[(index + 1) % 2],
      Speed: 28,
      LiveDistanceMeters: Math.round(eta2Seconds * 8.2),
      AccuracyConfidence: 'HIGH',
    };

    const nextBus3: NextBusInfo = {
      OriginCode: route?.OriginCode || '01012',
      DestinationCode: route?.DestinationCode || '02089',
      EstimatedArrival: new Date(now + eta3Seconds * 1000).toISOString(),
      Latitude: (stopLat - 0.012).toFixed(5),
      Longitude: (stopLng - 0.009).toFixed(5),
      VisitNumber: '1',
      Load: loads[(index + 2) % 3],
      Feature: 'WAB',
      Type: 'DD',
      Speed: 30,
      LiveDistanceMeters: Math.round(eta3Seconds * 8.5),
      AccuracyConfidence: 'MEDIUM',
    };

    return {
      ServiceNo: svcNo,
      Operator: operator,
      NextBus: nextBus,
      NextBus2: nextBus2,
      NextBus3: nextBus3,
      category: route?.Category || 'Trunk',
      destinationDescription: route?.DestinationDesc || 'Kampong Bahru Ter',
    };
  });

  return {
    BusStopCode: busStopCode,
    Services: servicesArrivals,
  };
}

/**
 * Fetch all real-time bus locations in Singapore currently active.
 */
export async function getLiveBusFleet(selectedStopCode?: string, selectedService?: string): Promise<LiveBusLocation[]> {
  initSimulationFleet();

  const stop = selectedStopCode ? SINGAPORE_BUS_STOPS.find((s) => s.BusStopCode === selectedStopCode) : null;
  const stopLat = stop?.Latitude || 1.30064;
  const stopLng = stop?.Longitude || 103.85611;

  return simulatedFleet
    .filter((bus) => {
      if (selectedService && bus.serviceNo !== selectedService) return false;
      return true;
    })
    .map((bus) => {
      return {
        id: bus.id,
        serviceNo: bus.serviceNo,
        operator: bus.operator,
        type: bus.type,
        load: bus.load,
        feature: 'WAB',
        latitude: bus.lat,
        longitude: bus.lng,
        heading: bus.bearing,
        speedKmh: bus.speedKmh,
        nextStopCode: bus.targetStopCode,
        nextStopName: stop?.Description || 'Approaching Stop',
        etaSeconds: bus.etaSeconds,
      };
    });
}
