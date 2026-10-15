import { BusLoad, BusType, NextBusInfo, TrafficCondition } from '../types/bus';

export const TRAFFIC_PRESETS: TrafficCondition[] = [
  {
    mode: 'normal',
    label: 'Clear Transit Flow',
    delayMultiplier: 1.0,
    description: 'Normal traffic flow with standard signal cycles',
  },
  {
    mode: 'peak',
    label: 'Peak Hour Rush',
    delayMultiplier: 1.35,
    description: 'Heavy arterial congestion and extended bus bay dwelling',
  },
  {
    mode: 'rain',
    label: 'Monsoon Rain / Wet',
    delayMultiplier: 1.55,
    description: 'Reduced vehicle speeds and wet pavement caution',
  },
];

/**
 * Calculates distance in meters between two lat/lng coordinates (Haversine formula).
 */
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Calculate bearing angle in degrees (0 = North, 90 = East, etc.)
 */
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin((lon2 - lon1) * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180));
  const x =
    Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
    Math.sin(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.cos((lon2 - lon1) * (Math.PI / 180));
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Parse an ISO arrival string into seconds remaining relative to currentTime.
 */
export function getRemainingSeconds(estimatedArrivalIso: string, currentTime: Date = new Date()): number {
  if (!estimatedArrivalIso) return 0;
  const arrivalDate = new Date(estimatedArrivalIso);
  const diffMs = arrivalDate.getTime() - currentTime.getTime();
  return Math.max(0, Math.round(diffMs / 1000));
}

/**
 * Format remaining seconds into a crisp Singapore transit display label:
 * e.g., "Arr" for <= 45s, "1m", "4m", "15m".
 */
export function formatArrivalEta(remainingSeconds: number): {
  label: string;
  isArriving: boolean;
  minutes: number;
} {
  if (remainingSeconds <= 45) {
    return { label: 'Arr', isArriving: true, minutes: 0 };
  }
  const minutes = Math.ceil(remainingSeconds / 60);
  return { label: `${minutes}m`, isArriving: false, minutes };
}

/**
 * Formats arrival time in 24-hr clock time (HH:mm) in Singapore SGT timezone.
 */
export function formatClockTime(isoString: string): string {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Singapore',
  });
}

/**
 * Human readable information for bus load.
 */
export function getLoadDetails(load: BusLoad): {
  label: string;
  shortLabel: string;
  color: string;
  badgeClass: string;
  barWidthPercent: number;
} {
  switch (load) {
    case 'SEA':
      return {
        label: 'Seats Available',
        shortLabel: 'Seats',
        color: '#10b981', // emerald-500
        badgeClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
        barWidthPercent: 33,
      };
    case 'SDA':
      return {
        label: 'Standing Available',
        shortLabel: 'Standing',
        color: '#f59e0b', // amber-500
        badgeClass: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
        barWidthPercent: 66,
      };
    case 'LSD':
      return {
        label: 'Limited Standing',
        shortLabel: 'Crowded',
        color: '#ef4444', // red-500
        badgeClass: 'text-red-400 bg-red-950/60 border-red-500/30',
        barWidthPercent: 95,
      };
    default:
      return {
        label: 'Unknown',
        shortLabel: '--',
        color: '#64748b',
        badgeClass: 'text-slate-400 bg-slate-900 border-slate-700',
        barWidthPercent: 0,
      };
  }
}

/**
 * Human readable bus deck type.
 */
export function getBusTypeDetails(type: BusType): {
  name: string;
  shortCode: string;
  iconType: 'single' | 'double' | 'bendy';
} {
  switch (type) {
    case 'DD':
      return { name: 'Double Deck', shortCode: 'DD', iconType: 'double' };
    case 'BD':
      return { name: 'Bendy (Articulated)', shortCode: 'BD', iconType: 'bendy' };
    case 'SD':
    default:
      return { name: 'Single Deck', shortCode: 'SD', iconType: 'single' };
  }
}
