/**
 * Singapore LTA DataMall compliant types and bus arrival tracker models.
 */

export type BusOperator = 'SBST' | 'SMRT' | 'TTS' | 'GAS';

export type BusLoad = 'SEA' | 'SDA' | 'LSD'; // Seats Available, Standing Available, Limited Standing
export type BusType = 'SD' | 'DD' | 'BD'; // Single Deck, Double Deck, Bendy
export type BusFeature = 'WAB' | ''; // Wheelchair Accessible Bus

export interface NextBusInfo {
  OriginCode: string;
  DestinationCode: string;
  EstimatedArrival: string; // ISO 8601 string
  Latitude: string | number;
  Longitude: string | number;
  VisitNumber: string;
  Load: BusLoad;
  Feature: BusFeature;
  Type: BusType;
  // Computed & dynamic telemetry
  Speed?: number; // km/h
  LiveDistanceMeters?: number;
  AccuracyConfidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  DelaySeconds?: number;
}

export interface BusServiceArrival {
  ServiceNo: string;
  Operator: BusOperator;
  NextBus: NextBusInfo;
  NextBus2?: NextBusInfo;
  NextBus3?: NextBusInfo;
  // Computed values
  category?: 'Trunk' | 'Feeder' | 'Express' | 'City Direct';
  destinationDescription?: string;
}

export interface BusArrivalResponse {
  BusStopCode: string;
  Services: BusServiceArrival[];
}

export interface BusStop {
  BusStopCode: string;
  RoadName: string;
  Description: string;
  Latitude: number;
  Longitude: number;
  Services: string[];
  DistanceMeters?: number;
}

export interface BusRouteStop {
  BusStopCode: string;
  RoadName: string;
  Description: string;
  StopSequence: number;
  DistanceKm: number;
  Latitude: number;
  Longitude: number;
}

export interface BusServiceRoute {
  ServiceNo: string;
  Operator: BusOperator;
  Direction: 1 | 2;
  OriginCode: string;
  OriginDesc: string;
  DestinationCode: string;
  DestinationDesc: string;
  Category: 'Trunk' | 'Feeder' | 'Express' | 'City Direct';
  Stops: BusRouteStop[];
  PathCoordinates: [number, number][]; // [lat, lng] pairs for polyline
}

export interface LiveBusLocation {
  id: string;
  serviceNo: string;
  operator: BusOperator;
  type: BusType;
  load: BusLoad;
  feature: BusFeature;
  latitude: number;
  longitude: number;
  heading: number; // degrees 0-360
  speedKmh: number;
  nextStopCode: string;
  nextStopName: string;
  etaSeconds: number;
}

export interface TrafficCondition {
  mode: 'normal' | 'peak' | 'rain';
  label: string;
  delayMultiplier: number;
  description: string;
}
