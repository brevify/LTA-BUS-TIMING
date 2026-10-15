import { BusStop, BusServiceRoute, BusOperator } from '../types/bus';

// Accurate coordinates of representative Singapore Bus Stops
export const SINGAPORE_BUS_STOPS: BusStop[] = [
  // Bugis & Central
  {
    BusStopCode: '01012',
    RoadName: 'Victoria St',
    Description: 'Bugis Stn Exit A',
    Latitude: 1.30064,
    Longitude: 103.85611,
    Services: ['7', '14', '36', '65', '190', '851'],
  },
  {
    BusStopCode: '01059',
    RoadName: 'Victoria St',
    Description: 'Opp Bugis Junction',
    Latitude: 1.29953,
    Longitude: 103.85489,
    Services: ['7', '65', '147', '166', '174', '851'],
  },
  {
    BusStopCode: '04121',
    RoadName: 'Bras Basah Rd',
    Description: 'Raffles Hotel',
    Latitude: 1.29524,
    Longitude: 103.85382,
    Services: ['14', '36', '106', '166', '174'],
  },
  {
    BusStopCode: '01013',
    RoadName: 'Victoria St',
    Description: 'Bugis Stn Exit B',
    Latitude: 1.30129,
    Longitude: 103.85728,
    Services: ['7', '14', '36', '65', '147', '851'],
  },

  // Orchard & Dhoby Ghaut Corridor
  {
    BusStopCode: '08057',
    RoadName: 'Orchard Rd',
    Description: 'Dhoby Ghaut Stn',
    Latitude: 1.29918,
    Longitude: 103.84589,
    Services: ['7', '14', '36', '65', '106', '174', '190'],
  },
  {
    BusStopCode: '08058',
    RoadName: 'Orchard Rd',
    Description: 'Plaza Singapura',
    Latitude: 1.30058,
    Longitude: 103.84462,
    Services: ['7', '36', '65', '106', '190'],
  },
  {
    BusStopCode: '09048',
    RoadName: 'Orchard Rd',
    Description: 'Somerset Stn',
    Latitude: 1.30095,
    Longitude: 103.83842,
    Services: ['7', '14', '36', '65', '106', '174', '190'],
  },
  {
    BusStopCode: '09022',
    RoadName: 'Orchard Rd',
    Description: 'Orchard Stn / Lucky Plaza',
    Latitude: 1.30438,
    Longitude: 103.83358,
    Services: ['7', '14', '36', '65', '106', '174', '190'],
  },
  {
    BusStopCode: '09111',
    RoadName: 'Orchard Rd',
    Description: 'Delfi Orchard / Opp Forum',
    Latitude: 1.30689,
    Longitude: 103.82855,
    Services: ['7', '36', '106', '174', '190'],
  },

  // Marina Bay & Downtown CBD
  {
    BusStopCode: '03239',
    RoadName: 'Marina Blvd',
    Description: 'Marina Bay Financial Ctr',
    Latitude: 1.27964,
    Longitude: 103.85422,
    Services: ['97', '106', '133', '970'],
  },
  {
    BusStopCode: '03509',
    RoadName: 'Bayfront Ave',
    Description: 'Marina Bay Sands Theatre',
    Latitude: 1.28549,
    Longitude: 103.85892,
    Services: ['97', '106', '133'],
  },
  {
    BusStopCode: '03011',
    RoadName: 'Collyer Quay',
    Description: 'Ocean Financial Ctr',
    Latitude: 1.28312,
    Longitude: 103.85244,
    Services: ['10', '70', '100', '106', '196'],
  },
  {
    BusStopCode: '03071',
    RoadName: 'Church St',
    Description: 'OCBC Centre',
    Latitude: 1.28475,
    Longitude: 103.84992,
    Services: ['186', '190', '970'],
  },

  // Chinatown & Outram
  {
    BusStopCode: '05013',
    RoadName: 'Eu Tong Sen St',
    Description: 'Chinatown Stn Exit C',
    Latitude: 1.28389,
    Longitude: 103.84411,
    Services: ['147', '166', '190', '851', '970'],
  },
  {
    BusStopCode: '05022',
    RoadName: 'New Bridge Rd',
    Description: 'Opp Chinatown Stn',
    Latitude: 1.28479,
    Longitude: 103.84491,
    Services: ['147', '190', '851', '960'],
  },
  {
    BusStopCode: '10018',
    RoadName: 'Outram Rd',
    Description: 'Outram Park Stn Exit 7',
    Latitude: 1.28188,
    Longitude: 103.83915,
    Services: ['174', '190', '851', '960'],
  },

  // HarbourFront & South
  {
    BusStopCode: '14141',
    RoadName: 'Telok Blangah Rd',
    Description: 'VivoCity / HarbourFront Stn',
    Latitude: 1.26442,
    Longitude: 103.82255,
    Services: ['10', '30', '65', '97', '100', '143', '166'],
  },
  {
    BusStopCode: '14119',
    RoadName: 'Telok Blangah Rd',
    Description: 'Opp VivoCity',
    Latitude: 1.26555,
    Longitude: 103.82191,
    Services: ['10', '30', '65', '97', '143', '166'],
  },

  // East Hub: Tampines & Bedok
  {
    BusStopCode: '76141',
    RoadName: 'Tampines Ave 4',
    Description: 'Tampines Stn / Int',
    Latitude: 1.35332,
    Longitude: 103.94528,
    Services: ['65', '67', '168', '291', '293'],
  },
  {
    BusStopCode: '76131',
    RoadName: 'Tampines Ave 4',
    Description: 'Opp Tampines Stn',
    Latitude: 1.35245,
    Longitude: 103.94412,
    Services: ['65', '67', '168'],
  },
  {
    BusStopCode: '84039',
    RoadName: 'New Upper Changi Rd',
    Description: 'Bedok Stn Exit B',
    Latitude: 1.32412,
    Longitude: 103.93045,
    Services: ['7', '14', '67', '222', '225'],
  },

  // Changi Airport
  {
    BusStopCode: '95029',
    RoadName: 'PTB2 Basement',
    Description: 'Changi Airport PTB2',
    Latitude: 1.35712,
    Longitude: 103.98823,
    Services: ['36', '110', '858'],
  },

  // West Hub: Jurong East & Clementi
  {
    BusStopCode: '28009',
    RoadName: 'Jurong Gateway Rd',
    Description: 'Jurong East Int',
    Latitude: 1.33315,
    Longitude: 103.74229,
    Services: ['66', '78', '97', '105', '143', '197'],
  },
  {
    BusStopCode: '28201',
    RoadName: 'Jurong Gateway Rd',
    Description: 'Opp JEM / Jurong East Stn',
    Latitude: 1.33385,
    Longitude: 103.74312,
    Services: ['97', '143', '197'],
  },
  {
    BusStopCode: '17179',
    RoadName: 'Commonwealth Ave West',
    Description: 'Clementi Stn Exit A',
    Latitude: 1.31518,
    Longitude: 103.76512,
    Services: ['14', '106', '147', '166', '174'],
  },

  // North Hub: Woodlands & Ang Mo Kio
  {
    BusStopCode: '46009',
    RoadName: 'Woodlands Sq',
    Description: 'Woodlands Integrated Transport Hub',
    Latitude: 1.43689,
    Longitude: 103.78652,
    Services: ['168', '858', '900', '960', '969'],
  },
  {
    BusStopCode: '54261',
    RoadName: 'Ang Mo Kio Ave 3',
    Description: 'Ang Mo Kio Int',
    Latitude: 1.36942,
    Longitude: 103.84972,
    Services: ['73', '133', '166', '262', '265'],
  },
];

// Rich Route Path Data with actual Singapore GeoJSON points along roads
export const BUS_ROUTES: Record<string, BusServiceRoute> = {
  '190': {
    ServiceNo: '190',
    Operator: 'SMRT',
    Direction: 1,
    OriginCode: '44009',
    OriginDesc: 'Choa Chu Kang Int',
    DestinationCode: '02089',
    DestinationDesc: 'Kampong Bahru Ter',
    Category: 'Express',
    Stops: [
      { BusStopCode: '09111', RoadName: 'Orchard Rd', Description: 'Delfi Orchard', StopSequence: 22, DistanceKm: 14.2, Latitude: 1.30689, Longitude: 103.82855 },
      { BusStopCode: '09022', RoadName: 'Orchard Rd', Description: 'Orchard Stn / Lucky Plaza', StopSequence: 23, DistanceKm: 14.9, Latitude: 1.30438, Longitude: 103.83358 },
      { BusStopCode: '09048', RoadName: 'Orchard Rd', Description: 'Somerset Stn', StopSequence: 24, DistanceKm: 15.6, Latitude: 1.30095, Longitude: 103.83842 },
      { BusStopCode: '08058', RoadName: 'Orchard Rd', Description: 'Plaza Singapura', StopSequence: 25, DistanceKm: 16.3, Latitude: 1.30058, Longitude: 103.84462 },
      { BusStopCode: '08057', RoadName: 'Orchard Rd', Description: 'Dhoby Ghaut Stn', StopSequence: 26, DistanceKm: 16.6, Latitude: 1.29918, Longitude: 103.84589 },
      { BusStopCode: '01012', RoadName: 'Victoria St', Description: 'Bugis Stn Exit A', StopSequence: 28, DistanceKm: 17.8, Latitude: 1.30064, Longitude: 103.85611 },
      { BusStopCode: '03071', RoadName: 'Church St', Description: 'OCBC Centre', StopSequence: 31, DistanceKm: 19.5, Latitude: 1.28475, Longitude: 103.84992 },
      { BusStopCode: '05013', RoadName: 'Eu Tong Sen St', Description: 'Chinatown Stn Exit C', StopSequence: 33, DistanceKm: 20.8, Latitude: 1.28389, Longitude: 103.84411 },
      { BusStopCode: '10018', RoadName: 'Outram Rd', Description: 'Outram Park Stn Exit 7', StopSequence: 35, DistanceKm: 21.7, Latitude: 1.28188, Longitude: 103.83915 },
    ],
    PathCoordinates: [
      [1.3853, 103.7444],
      [1.3702, 103.7621],
      [1.3512, 103.7915], // BKE to PIE
      [1.3325, 103.8211], // Whitley Rd
      [1.3150, 103.8272], // Stevens Rd
      [1.30689, 103.82855], // Delfi Orchard
      [1.30438, 103.83358], // Orchard Stn
      [1.30095, 103.83842], // Somerset
      [1.30058, 103.84462], // Plaza Sing
      [1.29918, 103.84589], // Dhoby Ghaut
      [1.2982, 103.8512], // Bras Basah
      [1.30064, 103.85611], // Bugis Stn
      [1.2915, 103.8530], // City Hall / Hill St
      [1.28475, 103.84992], // Church St
      [1.28389, 103.84411], // Chinatown
      [1.28188, 103.83915], // Outram Park
      [1.2780, 103.8360], // Kampong Bahru
    ],
  },
  '65': {
    ServiceNo: '65',
    Operator: 'SBST',
    Direction: 1,
    OriginCode: '76141',
    OriginDesc: 'Tampines Int',
    DestinationCode: '14141',
    DestinationDesc: 'HarbourFront Int',
    Category: 'Trunk',
    Stops: [
      { BusStopCode: '76141', RoadName: 'Tampines Ave 4', Description: 'Tampines Stn / Int', StopSequence: 1, DistanceKm: 0.0, Latitude: 1.35332, Longitude: 103.94528 },
      { BusStopCode: '01012', RoadName: 'Victoria St', Description: 'Bugis Stn Exit A', StopSequence: 24, DistanceKm: 15.2, Latitude: 1.30064, Longitude: 103.85611 },
      { BusStopCode: '08057', RoadName: 'Orchard Rd', Description: 'Dhoby Ghaut Stn', StopSequence: 27, DistanceKm: 16.9, Latitude: 1.29918, Longitude: 103.84589 },
      { BusStopCode: '09048', RoadName: 'Orchard Rd', Description: 'Somerset Stn', StopSequence: 29, DistanceKm: 17.8, Latitude: 1.30095, Longitude: 103.83842 },
      { BusStopCode: '09022', RoadName: 'Orchard Rd', Description: 'Orchard Stn / Lucky Plaza', StopSequence: 31, DistanceKm: 18.6, Latitude: 1.30438, Longitude: 103.83358 },
      { BusStopCode: '14141', RoadName: 'Telok Blangah Rd', Description: 'VivoCity / HarbourFront Stn', StopSequence: 42, DistanceKm: 26.4, Latitude: 1.26442, Longitude: 103.82255 },
    ],
    PathCoordinates: [
      [1.35332, 103.94528], // Tampines
      [1.3410, 103.9180], // Bedok Reservoir
      [1.3280, 103.8890], // Ubi / MacPherson
      [1.3180, 103.8640], // Kallang Bahru
      [1.30064, 103.85611], // Bugis
      [1.29918, 103.84589], // Dhoby Ghaut
      [1.30095, 103.83842], // Somerset
      [1.30438, 103.83358], // Orchard
      [1.2920, 103.8260], // River Valley / Paterson
      [1.2800, 103.8230], // Lower Delta
      [1.26442, 103.82255], // HarbourFront
    ],
  },
  '36': {
    ServiceNo: '36',
    Operator: 'TTS',
    Direction: 1,
    OriginCode: '95029',
    OriginDesc: 'Changi Airport PTB2',
    DestinationCode: '95029',
    DestinationDesc: 'Changi Airport (Loop via Orchard)',
    Category: 'Express',
    Stops: [
      { BusStopCode: '95029', RoadName: 'PTB2 Basement', Description: 'Changi Airport PTB2', StopSequence: 1, DistanceKm: 0.0, Latitude: 1.35712, Longitude: 103.98823 },
      { BusStopCode: '01012', RoadName: 'Victoria St', Description: 'Bugis Stn Exit A', StopSequence: 18, DistanceKm: 19.4, Latitude: 1.30064, Longitude: 103.85611 },
      { BusStopCode: '04121', RoadName: 'Bras Basah Rd', Description: 'Raffles Hotel', StopSequence: 20, DistanceKm: 20.3, Latitude: 1.29524, Longitude: 103.85382 },
      { BusStopCode: '08057', RoadName: 'Orchard Rd', Description: 'Dhoby Ghaut Stn', StopSequence: 22, DistanceKm: 21.8, Latitude: 1.29918, Longitude: 103.84589 },
      { BusStopCode: '09048', RoadName: 'Orchard Rd', Description: 'Somerset Stn', StopSequence: 24, DistanceKm: 22.7, Latitude: 1.30095, Longitude: 103.83842 },
      { BusStopCode: '09022', RoadName: 'Orchard Rd', Description: 'Orchard Stn / Lucky Plaza', StopSequence: 26, DistanceKm: 23.5, Latitude: 1.30438, Longitude: 103.83358 },
    ],
    PathCoordinates: [
      [1.35712, 103.98823], // Airport
      [1.3200, 103.9500], // ECP Express
      [1.3020, 103.8900], // Marine Parade
      [1.2940, 103.8640], // Nicoll Highway
      [1.30064, 103.85611], // Bugis
      [1.29524, 103.85382], // Raffles Hotel
      [1.29918, 103.84589], // Dhoby Ghaut
      [1.30095, 103.83842], // Somerset
      [1.30438, 103.83358], // Orchard Stn
      [1.30689, 103.82855], // Delfi
      [1.2970, 103.8360], // River Valley
      [1.28549, 103.85892], // Marina Bay Sands
      [1.35712, 103.98823], // Return ECP to Airport
    ],
  },
  '106': {
    ServiceNo: '106',
    Operator: 'TTS',
    Direction: 1,
    OriginCode: '43009',
    OriginDesc: 'Bukit Batok Int',
    DestinationCode: '02181',
    DestinationDesc: 'Shenton Way Ter',
    Category: 'Trunk',
    Stops: [
      { BusStopCode: '17179', RoadName: 'Commonwealth Ave West', Description: 'Clementi Stn Exit A', StopSequence: 12, DistanceKm: 6.8, Latitude: 1.31518, Longitude: 103.76512 },
      { BusStopCode: '09022', RoadName: 'Orchard Rd', Description: 'Orchard Stn / Lucky Plaza', StopSequence: 28, DistanceKm: 16.5, Latitude: 1.30438, Longitude: 103.83358 },
      { BusStopCode: '09048', RoadName: 'Orchard Rd', Description: 'Somerset Stn', StopSequence: 30, DistanceKm: 17.3, Latitude: 1.30095, Longitude: 103.83842 },
      { BusStopCode: '08057', RoadName: 'Orchard Rd', Description: 'Dhoby Ghaut Stn', StopSequence: 32, DistanceKm: 18.2, Latitude: 1.29918, Longitude: 103.84589 },
      { BusStopCode: '04121', RoadName: 'Bras Basah Rd', Description: 'Raffles Hotel', StopSequence: 34, DistanceKm: 19.3, Latitude: 1.29524, Longitude: 103.85382 },
      { BusStopCode: '03239', RoadName: 'Marina Blvd', Description: 'Marina Bay Financial Ctr', StopSequence: 38, DistanceKm: 21.8, Latitude: 1.27964, Longitude: 103.85422 },
    ],
    PathCoordinates: [
      [1.3490, 103.7490], // Bukit Batok
      [1.31518, 103.76512], // Clementi
      [1.3080, 103.7920], // Dover / Buona Vista
      [1.3040, 103.8180], // Holland Rd / Napier
      [1.30438, 103.83358], // Orchard
      [1.30095, 103.83842], // Somerset
      [1.29918, 103.84589], // Dhoby Ghaut
      [1.29524, 103.85382], // Raffles Hotel
      [1.28549, 103.85892], // Marina Bay Sands
      [1.27964, 103.85422], // MBFC
    ],
  },
  '7': {
    ServiceNo: '7',
    Operator: 'SBST',
    Direction: 1,
    OriginCode: '84009',
    OriginDesc: 'Bedok Int',
    DestinationCode: '17009',
    DestinationDesc: 'Clementi Int',
    Category: 'Trunk',
    Stops: [
      { BusStopCode: '84039', RoadName: 'New Upper Changi Rd', Description: 'Bedok Stn Exit B', StopSequence: 2, DistanceKm: 0.8, Latitude: 1.32412, Longitude: 103.93045 },
      { BusStopCode: '01012', RoadName: 'Victoria St', Description: 'Bugis Stn Exit A', StopSequence: 19, DistanceKm: 12.4, Latitude: 1.30064, Longitude: 103.85611 },
      { BusStopCode: '08057', RoadName: 'Orchard Rd', Description: 'Dhoby Ghaut Stn', StopSequence: 22, DistanceKm: 14.1, Latitude: 1.29918, Longitude: 103.84589 },
      { BusStopCode: '09048', RoadName: 'Orchard Rd', Description: 'Somerset Stn', StopSequence: 24, DistanceKm: 15.0, Latitude: 1.30095, Longitude: 103.83842 },
      { BusStopCode: '09022', RoadName: 'Orchard Rd', Description: 'Orchard Stn / Lucky Plaza', StopSequence: 26, DistanceKm: 15.8, Latitude: 1.30438, Longitude: 103.83358 },
      { BusStopCode: '17179', RoadName: 'Commonwealth Ave West', Description: 'Clementi Stn Exit A', StopSequence: 39, DistanceKm: 25.1, Latitude: 1.31518, Longitude: 103.76512 },
    ],
    PathCoordinates: [
      [1.32412, 103.93045], // Bedok
      [1.3180, 103.8980], // Geylang
      [1.30064, 103.85611], // Bugis
      [1.29918, 103.84589], // Dhoby Ghaut
      [1.30095, 103.83842], // Somerset
      [1.30438, 103.83358], // Orchard
      [1.3020, 103.8050], // Holland Rd
      [1.31518, 103.76512], // Clementi
    ],
  },
  '960': {
    ServiceNo: '960',
    Operator: 'SMRT',
    Direction: 1,
    OriginCode: '46009',
    OriginDesc: 'Woodlands Integrated Transport Hub',
    DestinationCode: '02089',
    DestinationDesc: 'Marina Centre Ter',
    Category: 'Trunk',
    Stops: [
      { BusStopCode: '46009', RoadName: 'Woodlands Sq', Description: 'Woodlands Integrated Transport Hub', StopSequence: 1, DistanceKm: 0.0, Latitude: 1.43689, Longitude: 103.78652 },
      { BusStopCode: '01012', RoadName: 'Victoria St', Description: 'Bugis Stn Exit A', StopSequence: 28, DistanceKm: 24.5, Latitude: 1.30064, Longitude: 103.85611 },
      { BusStopCode: '05022', RoadName: 'New Bridge Rd', Description: 'Opp Chinatown Stn', StopSequence: 31, DistanceKm: 26.2, Latitude: 1.28479, Longitude: 103.84491 },
      { BusStopCode: '03239', RoadName: 'Marina Blvd', Description: 'Marina Bay Financial Ctr', StopSequence: 35, DistanceKm: 28.3, Latitude: 1.27964, Longitude: 103.85422 },
    ],
    PathCoordinates: [
      [1.43689, 103.78652], // Woodlands
      [1.3850, 103.7710], // BKE Expressway
      [1.3320, 103.8200], // Whitley Rd
      [1.3140, 103.8510], // Bukit Timah / Rochor
      [1.30064, 103.85611], // Bugis
      [1.28479, 103.84491], // Chinatown
      [1.27964, 103.85422], // MBFC
    ],
  },
  '147': {
    ServiceNo: '147',
    Operator: 'SBST',
    Direction: 1,
    OriginCode: '17009',
    OriginDesc: 'Clementi Int',
    DestinationCode: '64009',
    DestinationDesc: 'Hougang Central Int',
    Category: 'Trunk',
    Stops: [
      { BusStopCode: '17179', RoadName: 'Commonwealth Ave West', Description: 'Clementi Stn Exit A', StopSequence: 1, DistanceKm: 0.0, Latitude: 1.31518, Longitude: 103.76512 },
      { BusStopCode: '05013', RoadName: 'Eu Tong Sen St', Description: 'Chinatown Stn Exit C', StopSequence: 22, DistanceKm: 13.9, Latitude: 1.28389, Longitude: 103.84411 },
      { BusStopCode: '01059', RoadName: 'Victoria St', Description: 'Opp Bugis Junction', StopSequence: 25, DistanceKm: 15.6, Latitude: 1.29953, Longitude: 103.85489 },
      { BusStopCode: '01013', RoadName: 'Victoria St', Description: 'Bugis Stn Exit B', StopSequence: 26, DistanceKm: 16.0, Latitude: 1.30129, Longitude: 103.85728 },
    ],
    PathCoordinates: [
      [1.31518, 103.76512], // Clementi
      [1.2980, 103.8050], // Queenstown
      [1.28389, 103.84411], // Chinatown
      [1.29953, 103.85489], // Bugis
      [1.3350, 103.8730], // Serangoon
      [1.3710, 103.8920], // Hougang
    ],
  },
};

// Operator color and brand palette
export const OPERATOR_META: Record<BusOperator, { name: string; color: string; badgeBg: string; border: string }> = {
  SBST: {
    name: 'SBS Transit',
    color: '#8338ec', // Purple
    badgeBg: 'bg-purple-950/40 text-purple-300',
    border: 'border-purple-500/30',
  },
  SMRT: {
    name: 'SMRT Buses',
    color: '#ef4444', // Red
    badgeBg: 'bg-red-950/40 text-red-300',
    border: 'border-red-500/30',
  },
  TTS: {
    name: 'Tower Transit',
    color: '#10b981', // Lush Green
    badgeBg: 'bg-emerald-950/40 text-emerald-300',
    border: 'border-emerald-500/30',
  },
  GAS: {
    name: 'Go-Ahead SG',
    color: '#f59e0b', // Amber/Yellow
    badgeBg: 'bg-amber-950/40 text-amber-300',
    border: 'border-amber-500/30',
  },
};
