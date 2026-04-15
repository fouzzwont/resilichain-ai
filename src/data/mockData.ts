export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type TransportMode = 'sea' | 'road' | 'rail' | 'air';
export type ShipmentStatus = 'in-transit' | 'at-port' | 'customs-hold' | 'delivered' | 'delayed' | 'at-warehouse';

export interface Shipment {
  id: string;
  cargo: string;
  productType: string;
  origin: string;
  destination: string;
  route: string;
  mode: TransportMode;
  carrier: string;
  supplier: string;
  departureTime: string;
  plannedEta: string;
  predictedEta: string;
  currentLocation: string;
  status: ShipmentStatus;
  temperatureFlag: boolean;
  customsFlag: boolean;
  riskScore: number;
  disruptionProbability: number;
  predictedDelayHours: number;
  disruptionCause: string;
  businessImpact: string;
  recommendedAction: string;
  confidenceLevel: number;
  region: string;
}

export interface Alert {
  id: string;
  severity: RiskLevel;
  title: string;
  description: string;
  timestamp: string;
  affectedShipments: string[];
  route: string;
  cause: string;
  businessImpact: string;
  status: 'active' | 'acknowledged' | 'resolved';
  recommendedAction: string;
}

export interface Carrier {
  id: string;
  name: string;
  performanceScore: number;
  avgDelay: number;
  incidentCount: number;
  onTimeRate: number;
  reliabilityTrend: 'improving' | 'stable' | 'declining';
  lanes: string[];
  riskLevel: RiskLevel;
}

export interface Supplier {
  id: string;
  name: string;
  reliabilityScore: number;
  riskLevel: RiskLevel;
  region: string;
  alternates: string[];
  incidentCount: number;
}

const carriers: Carrier[] = [
  { id: 'CR-001', name: 'Maersk Line', performanceScore: 87, avgDelay: 4.2, incidentCount: 3, onTimeRate: 91, reliabilityTrend: 'stable', lanes: ['Asia-Europe', 'Asia-Americas'], riskLevel: 'low' },
  { id: 'CR-002', name: 'MSC Mediterranean', performanceScore: 82, avgDelay: 6.1, incidentCount: 5, onTimeRate: 86, reliabilityTrend: 'declining', lanes: ['Europe-Africa', 'Asia-Europe'], riskLevel: 'medium' },
  { id: 'CR-003', name: 'CMA CGM', performanceScore: 79, avgDelay: 7.8, incidentCount: 7, onTimeRate: 83, reliabilityTrend: 'declining', lanes: ['Asia-Americas', 'Intra-Asia'], riskLevel: 'medium' },
  { id: 'CR-004', name: 'Hapag-Lloyd', performanceScore: 91, avgDelay: 2.5, incidentCount: 1, onTimeRate: 94, reliabilityTrend: 'improving', lanes: ['Europe-Americas', 'Asia-Europe'], riskLevel: 'low' },
  { id: 'CR-005', name: 'Evergreen Marine', performanceScore: 74, avgDelay: 9.3, incidentCount: 9, onTimeRate: 78, reliabilityTrend: 'declining', lanes: ['Intra-Asia', 'Asia-Americas'], riskLevel: 'high' },
  { id: 'CR-006', name: 'BlueDart Express', performanceScore: 88, avgDelay: 3.1, incidentCount: 2, onTimeRate: 92, reliabilityTrend: 'improving', lanes: ['Domestic India', 'South Asia'], riskLevel: 'low' },
  { id: 'CR-007', name: 'DHL Global Forwarding', performanceScore: 85, avgDelay: 5.0, incidentCount: 4, onTimeRate: 89, reliabilityTrend: 'stable', lanes: ['Europe-Asia', 'Americas-Europe'], riskLevel: 'low' },
  { id: 'CR-008', name: 'Yang Ming Marine', performanceScore: 71, avgDelay: 11.2, incidentCount: 11, onTimeRate: 74, reliabilityTrend: 'declining', lanes: ['Intra-Asia', 'Asia-Europe'], riskLevel: 'high' },
];

const suppliers: Supplier[] = [
  { id: 'SP-001', name: 'TechParts Global', reliabilityScore: 92, riskLevel: 'low', region: 'East Asia', alternates: ['ChipSource Ltd'], incidentCount: 1 },
  { id: 'SP-002', name: 'RawMat Industries', reliabilityScore: 78, riskLevel: 'medium', region: 'South Asia', alternates: ['MetalWorks Co'], incidentCount: 4 },
  { id: 'SP-003', name: 'ChemSupply AG', reliabilityScore: 65, riskLevel: 'high', region: 'Europe', alternates: ['PharmaSource Inc'], incidentCount: 8 },
  { id: 'SP-004', name: 'AgriExport Ltd', reliabilityScore: 84, riskLevel: 'low', region: 'South America', alternates: ['FarmDirect Co'], incidentCount: 2 },
  { id: 'SP-005', name: 'TextileMfg Co', reliabilityScore: 58, riskLevel: 'high', region: 'Southeast Asia', alternates: ['FabricWorld Ltd'], incidentCount: 10 },
  { id: 'SP-006', name: 'AutoComp Inc', reliabilityScore: 88, riskLevel: 'low', region: 'East Asia', alternates: ['DriveShaft Ltd'], incidentCount: 2 },
];

const shipments: Shipment[] = [
  { id: 'SH-2401', cargo: 'Semiconductor Wafers', productType: 'Electronics', origin: 'Shanghai, CN', destination: 'Rotterdam, NL', route: 'Shanghai → Singapore → Suez → Rotterdam', mode: 'sea', carrier: 'Maersk Line', supplier: 'TechParts Global', departureTime: '2026-04-10T08:00:00Z', plannedEta: '2026-04-28T14:00:00Z', predictedEta: '2026-04-29T22:00:00Z', currentLocation: 'Singapore Strait', status: 'in-transit', temperatureFlag: false, customsFlag: false, riskScore: 42, disruptionProbability: 35, predictedDelayHours: 32, disruptionCause: 'Port congestion at Singapore', businessImpact: 'Moderate — production line delay possible', recommendedAction: 'Monitor Singapore port updates; pre-clear Rotterdam customs', confidenceLevel: 82, region: 'Asia-Europe' },
  { id: 'SH-2402', cargo: 'Pharmaceutical APIs', productType: 'Pharmaceuticals', origin: 'Mumbai, IN', destination: 'New York, US', route: 'Mumbai → Colombo → Cape Town → New York', mode: 'sea', carrier: 'MSC Mediterranean', supplier: 'RawMat Industries', departureTime: '2026-04-08T06:00:00Z', plannedEta: '2026-04-30T10:00:00Z', predictedEta: '2026-05-03T18:00:00Z', currentLocation: 'Cape Town Port', status: 'at-port', temperatureFlag: true, customsFlag: true, riskScore: 78, disruptionProbability: 72, predictedDelayHours: 80, disruptionCause: 'Customs documentation delay + cold chain risk', businessImpact: 'High — regulatory compliance at risk, $2.4M cargo value', recommendedAction: 'Expedite customs clearance; activate temperature monitoring protocol; notify FDA compliance team', confidenceLevel: 88, region: 'Asia-Americas' },
  { id: 'SH-2403', cargo: 'Auto Components', productType: 'Automotive', origin: 'Nagoya, JP', destination: 'Chennai, IN', route: 'Nagoya → Busan → Chennai', mode: 'sea', carrier: 'Evergreen Marine', supplier: 'AutoComp Inc', departureTime: '2026-04-12T10:00:00Z', plannedEta: '2026-04-22T08:00:00Z', predictedEta: '2026-04-22T12:00:00Z', currentLocation: 'South China Sea', status: 'in-transit', temperatureFlag: false, customsFlag: false, riskScore: 18, disruptionProbability: 12, predictedDelayHours: 4, disruptionCause: 'Minor weather deviation', businessImpact: 'Low — within acceptable range', recommendedAction: 'No action required; continue monitoring', confidenceLevel: 91, region: 'Intra-Asia' },
  { id: 'SH-2404', cargo: 'Organic Cotton Bales', productType: 'Textiles', origin: 'Dhaka, BD', destination: 'Hamburg, DE', route: 'Chittagong → Colombo → Suez → Hamburg', mode: 'sea', carrier: 'CMA CGM', supplier: 'TextileMfg Co', departureTime: '2026-04-06T04:00:00Z', plannedEta: '2026-04-24T16:00:00Z', predictedEta: '2026-04-28T02:00:00Z', currentLocation: 'Suez Canal', status: 'delayed', temperatureFlag: false, customsFlag: true, riskScore: 85, disruptionProbability: 80, predictedDelayHours: 82, disruptionCause: 'Suez Canal congestion + carrier reliability issues', businessImpact: 'Critical — buyer penalty clause triggers at 72h delay', recommendedAction: 'Negotiate delay penalty waiver; explore air freight for partial cargo; alert buyer', confidenceLevel: 76, region: 'Asia-Europe' },
  { id: 'SH-2405', cargo: 'Industrial Chemicals', productType: 'Chemicals', origin: 'Basel, CH', destination: 'São Paulo, BR', route: 'Basel → Genoa → Santos', mode: 'sea', carrier: 'Hapag-Lloyd', supplier: 'ChemSupply AG', departureTime: '2026-04-11T12:00:00Z', plannedEta: '2026-04-25T08:00:00Z', predictedEta: '2026-04-25T10:00:00Z', currentLocation: 'Mid-Atlantic', status: 'in-transit', temperatureFlag: true, customsFlag: false, riskScore: 22, disruptionProbability: 15, predictedDelayHours: 2, disruptionCause: 'None detected', businessImpact: 'Negligible', recommendedAction: 'Continue standard monitoring', confidenceLevel: 95, region: 'Europe-Americas' },
  { id: 'SH-2406', cargo: 'Coffee Beans (Arabica)', productType: 'Agriculture', origin: 'Santos, BR', destination: 'Antwerp, BE', route: 'Santos → Dakar → Antwerp', mode: 'sea', carrier: 'MSC Mediterranean', supplier: 'AgriExport Ltd', departureTime: '2026-04-09T07:00:00Z', plannedEta: '2026-04-23T12:00:00Z', predictedEta: '2026-04-24T20:00:00Z', currentLocation: 'Dakar Port', status: 'at-port', temperatureFlag: true, customsFlag: false, riskScore: 55, disruptionProbability: 48, predictedDelayHours: 32, disruptionCause: 'Port congestion at Dakar + humidity concerns', businessImpact: 'Moderate — quality degradation risk if delayed further', recommendedAction: 'Prioritize loading at Dakar; activate humidity monitoring; prepare quality inspection at Antwerp', confidenceLevel: 79, region: 'Americas-Europe' },
  { id: 'SH-2407', cargo: 'Lithium-ion Battery Cells', productType: 'Electronics', origin: 'Shenzhen, CN', destination: 'Los Angeles, US', route: 'Shenzhen → Yokohama → Los Angeles', mode: 'sea', carrier: 'Yang Ming Marine', supplier: 'TechParts Global', departureTime: '2026-04-07T09:00:00Z', plannedEta: '2026-04-21T16:00:00Z', predictedEta: '2026-04-25T04:00:00Z', currentLocation: 'Pacific Ocean — 2100km from LA', status: 'delayed', temperatureFlag: true, customsFlag: true, riskScore: 91, disruptionProbability: 88, predictedDelayHours: 84, disruptionCause: 'Carrier engine issue + hazmat customs pre-clearance required', businessImpact: 'Critical — EV production line shutdown risk, $5.8M at stake', recommendedAction: 'Activate backup carrier for next batch; expedite hazmat clearance; notify production planning team', confidenceLevel: 85, region: 'Asia-Americas' },
  { id: 'SH-2408', cargo: 'Steel Coils', productType: 'Metals', origin: 'Pohang, KR', destination: 'Houston, US', route: 'Busan → Panama → Houston', mode: 'sea', carrier: 'Maersk Line', supplier: 'RawMat Industries', departureTime: '2026-04-05T11:00:00Z', plannedEta: '2026-04-22T09:00:00Z', predictedEta: '2026-04-22T14:00:00Z', currentLocation: 'Panama Canal', status: 'in-transit', temperatureFlag: false, customsFlag: false, riskScore: 30, disruptionProbability: 22, predictedDelayHours: 5, disruptionCause: 'Minor Panama Canal queue', businessImpact: 'Low', recommendedAction: 'Standard monitoring', confidenceLevel: 90, region: 'Asia-Americas' },
  { id: 'SH-2409', cargo: 'Medical Devices', productType: 'Healthcare', origin: 'Frankfurt, DE', destination: 'Dubai, AE', route: 'Frankfurt → Dubai (Air)', mode: 'air', carrier: 'DHL Global Forwarding', supplier: 'ChemSupply AG', departureTime: '2026-04-14T15:00:00Z', plannedEta: '2026-04-15T03:00:00Z', predictedEta: '2026-04-15T03:30:00Z', currentLocation: 'In-flight over Turkey', status: 'in-transit', temperatureFlag: true, customsFlag: false, riskScore: 8, disruptionProbability: 5, predictedDelayHours: 0.5, disruptionCause: 'None', businessImpact: 'None', recommendedAction: 'No action needed', confidenceLevel: 97, region: 'Europe-Middle East' },
  { id: 'SH-2410', cargo: 'Frozen Seafood', productType: 'Food & Beverage', origin: 'Ho Chi Minh, VN', destination: 'Osaka, JP', route: 'HCMC → Osaka', mode: 'sea', carrier: 'Evergreen Marine', supplier: 'AgriExport Ltd', departureTime: '2026-04-13T06:00:00Z', plannedEta: '2026-04-18T10:00:00Z', predictedEta: '2026-04-19T18:00:00Z', currentLocation: 'South China Sea', status: 'in-transit', temperatureFlag: true, customsFlag: false, riskScore: 62, disruptionProbability: 55, predictedDelayHours: 32, disruptionCause: 'Typhoon warning in East China Sea + cold chain temperature variance', businessImpact: 'High — spoilage risk, $800K cargo', recommendedAction: 'Activate backup cold chain protocol; consider diversion to alternate port; alert quality team', confidenceLevel: 73, region: 'Intra-Asia' },
  { id: 'SH-2411', cargo: 'Textile Machinery', productType: 'Machinery', origin: 'Milan, IT', destination: 'Colombo, LK', route: 'Genoa → Suez → Colombo', mode: 'sea', carrier: 'Hapag-Lloyd', supplier: 'AutoComp Inc', departureTime: '2026-04-10T14:00:00Z', plannedEta: '2026-04-24T08:00:00Z', predictedEta: '2026-04-24T10:00:00Z', currentLocation: 'Red Sea', status: 'in-transit', temperatureFlag: false, customsFlag: false, riskScore: 15, disruptionProbability: 10, predictedDelayHours: 2, disruptionCause: 'None', businessImpact: 'Negligible', recommendedAction: 'Continue monitoring', confidenceLevel: 94, region: 'Europe-Asia' },
  { id: 'SH-2412', cargo: 'Solar Panels', productType: 'Energy', origin: 'Wuxi, CN', destination: 'Lagos, NG', route: 'Shanghai → Singapore → Mombasa → Lagos', mode: 'sea', carrier: 'CMA CGM', supplier: 'TechParts Global', departureTime: '2026-04-04T08:00:00Z', plannedEta: '2026-04-26T12:00:00Z', predictedEta: '2026-04-30T06:00:00Z', currentLocation: 'Mombasa Port', status: 'at-port', temperatureFlag: false, customsFlag: true, riskScore: 72, disruptionProbability: 65, predictedDelayHours: 90, disruptionCause: 'Customs clearance delay at Mombasa + documentation gap', businessImpact: 'High — installation project delayed, contractual penalty risk', recommendedAction: 'Expedite customs documentation; engage local clearing agent; notify project stakeholders', confidenceLevel: 80, region: 'Asia-Africa' },
  { id: 'SH-2413', cargo: 'Spices (Turmeric)', productType: 'Agriculture', origin: 'Kochi, IN', destination: 'London, UK', route: 'Kochi → Jebel Ali → Felixstowe', mode: 'sea', carrier: 'Maersk Line', supplier: 'RawMat Industries', departureTime: '2026-04-11T05:00:00Z', plannedEta: '2026-04-27T14:00:00Z', predictedEta: '2026-04-28T20:00:00Z', currentLocation: 'Arabian Sea', status: 'in-transit', temperatureFlag: false, customsFlag: false, riskScore: 35, disruptionProbability: 28, predictedDelayHours: 30, disruptionCause: 'Port congestion forecast at Jebel Ali', businessImpact: 'Low-moderate', recommendedAction: 'Pre-book berth slot at Jebel Ali; monitor congestion updates', confidenceLevel: 84, region: 'Asia-Europe' },
  { id: 'SH-2414', cargo: 'EV Motors', productType: 'Automotive', origin: 'Detroit, US', destination: 'Stuttgart, DE', route: 'Detroit → Baltimore → Bremerhaven', mode: 'sea', carrier: 'Hapag-Lloyd', supplier: 'AutoComp Inc', departureTime: '2026-04-13T10:00:00Z', plannedEta: '2026-04-26T08:00:00Z', predictedEta: '2026-04-26T09:00:00Z', currentLocation: 'Baltimore Port', status: 'at-port', temperatureFlag: false, customsFlag: false, riskScore: 12, disruptionProbability: 8, predictedDelayHours: 1, disruptionCause: 'None', businessImpact: 'None', recommendedAction: 'Proceed as planned', confidenceLevel: 96, region: 'Americas-Europe' },
  { id: 'SH-2415', cargo: 'Crude Palm Oil', productType: 'Agriculture', origin: 'Jakarta, ID', destination: 'Rotterdam, NL', route: 'Jakarta → Singapore → Suez → Rotterdam', mode: 'sea', carrier: 'Yang Ming Marine', supplier: 'AgriExport Ltd', departureTime: '2026-04-08T03:00:00Z', plannedEta: '2026-04-26T10:00:00Z', predictedEta: '2026-05-01T16:00:00Z', currentLocation: 'Indian Ocean', status: 'delayed', temperatureFlag: false, customsFlag: true, riskScore: 82, disruptionProbability: 78, predictedDelayHours: 126, disruptionCause: 'Carrier mechanical issue + Suez Canal backlog + EU customs compliance gap', businessImpact: 'Critical — refinery production schedule disrupted', recommendedAction: 'Switch to alternate carrier for future shipments; expedite Suez transit booking; engage EU trade compliance advisor', confidenceLevel: 71, region: 'Asia-Europe' },
  { id: 'SH-2416', cargo: 'Garments (Winter)', productType: 'Textiles', origin: 'Dhaka, BD', destination: 'Chicago, US', route: 'Chittagong → Colombo → New York → Chicago (Rail)', mode: 'sea', carrier: 'CMA CGM', supplier: 'TextileMfg Co', departureTime: '2026-04-03T07:00:00Z', plannedEta: '2026-04-25T12:00:00Z', predictedEta: '2026-04-26T18:00:00Z', currentLocation: 'Colombo Port', status: 'at-port', temperatureFlag: false, customsFlag: false, riskScore: 48, disruptionProbability: 40, predictedDelayHours: 30, disruptionCause: 'Carrier schedule slippage + port congestion', businessImpact: 'Moderate — retail season delivery window narrowing', recommendedAction: 'Confirm onward vessel booking; consider partial air freight for priority SKUs', confidenceLevel: 81, region: 'Asia-Americas' },
  { id: 'SH-2417', cargo: 'Wine Barrels', productType: 'Food & Beverage', origin: 'Bordeaux, FR', destination: 'Tokyo, JP', route: 'Le Havre → Suez → Singapore → Tokyo', mode: 'sea', carrier: 'MSC Mediterranean', supplier: 'ChemSupply AG', departureTime: '2026-04-07T12:00:00Z', plannedEta: '2026-04-29T06:00:00Z', predictedEta: '2026-04-30T14:00:00Z', currentLocation: 'Singapore Strait', status: 'in-transit', temperatureFlag: true, customsFlag: false, riskScore: 38, disruptionProbability: 30, predictedDelayHours: 32, disruptionCause: 'Temperature variance in hold + Singapore port queue', businessImpact: 'Moderate — quality concern for premium cargo', recommendedAction: 'Verify temperature logs; prioritize Singapore discharge', confidenceLevel: 83, region: 'Europe-Asia' },
  { id: 'SH-2418', cargo: 'Mining Equipment', productType: 'Machinery', origin: 'Perth, AU', destination: 'Maputo, MZ', route: 'Fremantle → Durban → Maputo', mode: 'sea', carrier: 'Maersk Line', supplier: 'RawMat Industries', departureTime: '2026-04-12T09:00:00Z', plannedEta: '2026-04-24T14:00:00Z', predictedEta: '2026-04-25T08:00:00Z', currentLocation: 'Durban Port', status: 'at-port', temperatureFlag: false, customsFlag: true, riskScore: 45, disruptionProbability: 38, predictedDelayHours: 18, disruptionCause: 'Customs inspection at Durban', businessImpact: 'Low-moderate — mining ops can absorb 48h delay', recommendedAction: 'Liaise with Durban customs broker; prepare documentation', confidenceLevel: 86, region: 'Oceania-Africa' },
  { id: 'SH-2419', cargo: 'Laptop Computers', productType: 'Electronics', origin: 'Taipei, TW', destination: 'London, UK', route: 'Taipei → Hong Kong → Dubai (Air)', mode: 'air', carrier: 'DHL Global Forwarding', supplier: 'TechParts Global', departureTime: '2026-04-14T22:00:00Z', plannedEta: '2026-04-15T14:00:00Z', predictedEta: '2026-04-15T15:00:00Z', currentLocation: 'Dubai Airport Hub', status: 'in-transit', temperatureFlag: false, customsFlag: false, riskScore: 10, disruptionProbability: 6, predictedDelayHours: 1, disruptionCause: 'None', businessImpact: 'None', recommendedAction: 'No action needed', confidenceLevel: 98, region: 'Asia-Europe' },
  { id: 'SH-2420', cargo: 'Petrochemicals', productType: 'Chemicals', origin: 'Jubail, SA', destination: 'Mumbai, IN', route: 'Jubail → Mumbai', mode: 'sea', carrier: 'BlueDart Express', supplier: 'ChemSupply AG', departureTime: '2026-04-13T08:00:00Z', plannedEta: '2026-04-18T06:00:00Z', predictedEta: '2026-04-19T12:00:00Z', currentLocation: 'Arabian Sea', status: 'in-transit', temperatureFlag: true, customsFlag: false, riskScore: 52, disruptionProbability: 45, predictedDelayHours: 30, disruptionCause: 'Monsoon forecast + port draft restrictions at Mumbai', businessImpact: 'Moderate — refinery input timing affected', recommendedAction: 'Check tidal window at JNPT; prepare for alternate berth', confidenceLevel: 77, region: 'Middle East-Asia' },
  { id: 'SH-2421', cargo: 'Cocoa Beans', productType: 'Agriculture', origin: 'Abidjan, CI', destination: 'Zurich, CH', route: 'Abidjan → Las Palmas → Rotterdam → Zurich (Road)', mode: 'sea', carrier: 'MSC Mediterranean', supplier: 'AgriExport Ltd', departureTime: '2026-04-10T06:00:00Z', plannedEta: '2026-04-22T16:00:00Z', predictedEta: '2026-04-23T04:00:00Z', currentLocation: 'Las Palmas, Canary Islands', status: 'in-transit', temperatureFlag: true, customsFlag: false, riskScore: 40, disruptionProbability: 33, predictedDelayHours: 12, disruptionCause: 'Humidity monitoring alert', businessImpact: 'Low-moderate — chocolate production scheduling', recommendedAction: 'Verify ventilation in container; prepare quality check at Rotterdam', confidenceLevel: 85, region: 'Africa-Europe' },
  { id: 'SH-2422', cargo: 'Aircraft Engine Parts', productType: 'Aerospace', origin: 'Toulouse, FR', destination: 'Singapore, SG', route: 'Toulouse → Dubai → Singapore (Air)', mode: 'air', carrier: 'DHL Global Forwarding', supplier: 'AutoComp Inc', departureTime: '2026-04-15T04:00:00Z', plannedEta: '2026-04-15T18:00:00Z', predictedEta: '2026-04-15T18:30:00Z', currentLocation: 'Toulouse Airport', status: 'at-warehouse', temperatureFlag: false, customsFlag: true, riskScore: 25, disruptionProbability: 18, predictedDelayHours: 0.5, disruptionCause: 'Export license verification pending', businessImpact: 'Low — buffer time available', recommendedAction: 'Confirm export license clearance before loading', confidenceLevel: 92, region: 'Europe-Asia' },
  { id: 'SH-2423', cargo: 'Rice (Basmati)', productType: 'Agriculture', origin: 'Karachi, PK', destination: 'Jeddah, SA', route: 'Karachi → Jeddah', mode: 'sea', carrier: 'Yang Ming Marine', supplier: 'RawMat Industries', departureTime: '2026-04-11T09:00:00Z', plannedEta: '2026-04-16T14:00:00Z', predictedEta: '2026-04-18T08:00:00Z', currentLocation: 'Gulf of Aden', status: 'delayed', temperatureFlag: false, customsFlag: false, riskScore: 68, disruptionProbability: 62, predictedDelayHours: 42, disruptionCause: 'Geopolitical risk in Gulf of Aden + carrier schedule disruption', businessImpact: 'High — Ramadan supply chain timing critical', recommendedAction: 'Consider naval escort corridor; activate backup inventory at Jeddah warehouse', confidenceLevel: 74, region: 'South Asia-Middle East' },
  { id: 'SH-2424', cargo: 'Rubber Sheets', productType: 'Industrial', origin: 'Bangkok, TH', destination: 'Yokohama, JP', route: 'Laem Chabang → Yokohama', mode: 'sea', carrier: 'Evergreen Marine', supplier: 'TextileMfg Co', departureTime: '2026-04-14T07:00:00Z', plannedEta: '2026-04-20T10:00:00Z', predictedEta: '2026-04-21T16:00:00Z', currentLocation: 'East China Sea', status: 'in-transit', temperatureFlag: false, customsFlag: false, riskScore: 44, disruptionProbability: 36, predictedDelayHours: 30, disruptionCause: 'Weather system approaching East China Sea', businessImpact: 'Moderate — tire manufacturing line buffer reducing', recommendedAction: 'Monitor weather updates; pre-alert Yokohama port authority', confidenceLevel: 80, region: 'Intra-Asia' },
];

const alerts: Alert[] = [
  { id: 'AL-001', severity: 'critical', title: 'Battery shipment at risk — carrier engine failure', description: 'SH-2407 (Lithium-ion Battery Cells) experiencing carrier mechanical issues. EV production line shutdown risk with $5.8M exposure.', timestamp: '2026-04-15T08:30:00Z', affectedShipments: ['SH-2407'], route: 'Shenzhen → Yokohama → Los Angeles', cause: 'Carrier mechanical failure', businessImpact: 'Production line shutdown, $5.8M at stake', status: 'active', recommendedAction: 'Activate backup carrier; expedite hazmat customs pre-clearance' },
  { id: 'AL-002', severity: 'critical', title: 'Palm oil shipment — multi-factor disruption', description: 'SH-2415 experiencing carrier mechanical issue, Suez backlog, and EU customs compliance gap. Refinery production at risk.', timestamp: '2026-04-15T07:45:00Z', affectedShipments: ['SH-2415'], route: 'Jakarta → Singapore → Suez → Rotterdam', cause: 'Mechanical + canal congestion + compliance', businessImpact: 'Refinery production schedule disrupted', status: 'active', recommendedAction: 'Switch carrier; expedite Suez booking; engage compliance advisor' },
  { id: 'AL-003', severity: 'high', title: 'Suez Canal congestion affecting textile shipment', description: 'SH-2404 delayed 82+ hours due to Suez congestion combined with CMA CGM reliability issues. Buyer penalty clause at risk.', timestamp: '2026-04-15T06:15:00Z', affectedShipments: ['SH-2404'], route: 'Chittagong → Colombo → Suez → Hamburg', cause: 'Canal congestion + carrier issues', businessImpact: 'Penalty clause triggers at 72h delay', status: 'active', recommendedAction: 'Negotiate penalty waiver; explore partial air freight' },
  { id: 'AL-004', severity: 'high', title: 'Customs delay — pharmaceutical cold chain at risk', description: 'SH-2402 held at Cape Town with customs documentation issues. Cold chain integrity and FDA compliance concerns.', timestamp: '2026-04-15T05:20:00Z', affectedShipments: ['SH-2402'], route: 'Mumbai → Colombo → Cape Town → New York', cause: 'Customs documentation + cold chain', businessImpact: 'Regulatory compliance risk, $2.4M value', status: 'acknowledged', recommendedAction: 'Expedite customs; activate temperature protocol; notify FDA team' },
  { id: 'AL-005', severity: 'high', title: 'Typhoon warning — frozen seafood spoilage risk', description: 'SH-2410 (Frozen Seafood) facing typhoon threat in East China Sea with cold chain variance. $800K cargo at spoilage risk.', timestamp: '2026-04-15T04:10:00Z', affectedShipments: ['SH-2410'], route: 'HCMC → Osaka', cause: 'Typhoon + cold chain variance', businessImpact: 'Spoilage risk, $800K cargo', status: 'active', recommendedAction: 'Activate backup cold chain; consider port diversion' },
  { id: 'AL-006', severity: 'high', title: 'Geopolitical risk — Gulf of Aden disruption', description: 'SH-2423 (Basmati Rice) transiting Gulf of Aden amid heightened security concerns. Ramadan supply timing critical.', timestamp: '2026-04-15T03:45:00Z', affectedShipments: ['SH-2423'], route: 'Karachi → Jeddah', cause: 'Geopolitical instability', businessImpact: 'Ramadan supply chain timing critical', status: 'active', recommendedAction: 'Naval escort corridor; activate backup inventory at Jeddah' },
  { id: 'AL-007', severity: 'medium', title: 'Solar panel customs gap at Mombasa', description: 'SH-2412 held at Mombasa port due to documentation gap. Installation project timeline at risk.', timestamp: '2026-04-15T02:30:00Z', affectedShipments: ['SH-2412'], route: 'Shanghai → Singapore → Mombasa → Lagos', cause: 'Customs documentation gap', businessImpact: 'Installation project delayed', status: 'active', recommendedAction: 'Expedite documentation; engage local clearing agent' },
  { id: 'AL-008', severity: 'medium', title: 'Port congestion forecast — Jebel Ali', description: 'Jebel Ali port congestion expected to affect SH-2413 transit. Pre-booking berth recommended.', timestamp: '2026-04-15T01:00:00Z', affectedShipments: ['SH-2413'], route: 'Kochi → Jebel Ali → Felixstowe', cause: 'Port congestion', businessImpact: 'Low-moderate delivery impact', status: 'acknowledged', recommendedAction: 'Pre-book berth slot; monitor updates' },
  { id: 'AL-009', severity: 'medium', title: 'Weather system approaching East China Sea', description: 'SH-2424 (Rubber Sheets) may face weather delays. Tire manufacturing buffer reducing.', timestamp: '2026-04-14T22:00:00Z', affectedShipments: ['SH-2424'], route: 'Laem Chabang → Yokohama', cause: 'Weather risk', businessImpact: 'Manufacturing line buffer reducing', status: 'active', recommendedAction: 'Monitor weather; pre-alert port authority' },
  { id: 'AL-010', severity: 'low', title: 'Singapore port queue — minor delay expected', description: 'SH-2401 may face 4-6h additional wait at Singapore. No significant business impact.', timestamp: '2026-04-14T20:00:00Z', affectedShipments: ['SH-2401'], route: 'Shanghai → Singapore → Suez → Rotterdam', cause: 'Port congestion', businessImpact: 'Minimal', status: 'resolved', recommendedAction: 'Monitor; pre-clear Rotterdam customs' },
  { id: 'AL-011', severity: 'medium', title: 'Monsoon forecast affecting Mumbai port operations', description: 'SH-2420 (Petrochemicals) may face port draft restrictions at JNPT Mumbai due to approaching monsoon.', timestamp: '2026-04-14T18:30:00Z', affectedShipments: ['SH-2420'], route: 'Jubail → Mumbai', cause: 'Weather — monsoon', businessImpact: 'Refinery input timing affected', status: 'active', recommendedAction: 'Check tidal window; prepare alternate berth' },
  { id: 'AL-012', severity: 'medium', title: 'Carrier schedule slippage at Colombo', description: 'SH-2416 (Winter Garments) facing CMA CGM schedule delays at Colombo. Retail season window narrowing.', timestamp: '2026-04-14T16:00:00Z', affectedShipments: ['SH-2416'], route: 'Chittagong → Colombo → New York → Chicago', cause: 'Carrier schedule slippage', businessImpact: 'Retail delivery window narrowing', status: 'active', recommendedAction: 'Confirm vessel booking; consider partial air freight' },
];

export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  params: { port?: string; region?: string; carrier?: string; route?: string };
}

const scenarioTemplates: ScenarioTemplate[] = [
  { id: 'SC-01', name: 'Chennai Port Closure', description: 'Simulate a 72-hour closure of Chennai port due to cyclone warning', icon: '🌀', params: { port: 'Chennai' } },
  { id: 'SC-02', name: 'Suez Canal Blockage', description: 'Simulate 5-day Suez Canal blockage affecting all transiting vessels', icon: '🚢', params: { route: 'Suez' } },
  { id: 'SC-03', name: 'Carrier Fleet Breakdown', description: 'Simulate Yang Ming Marine fleet-wide mechanical issues', icon: '⚙️', params: { carrier: 'Yang Ming Marine' } },
  { id: 'SC-04', name: 'Customs Strike — EU Ports', description: 'Simulate customs worker strike across major EU ports for 48 hours', icon: '✊', params: { region: 'Europe' } },
  { id: 'SC-05', name: 'Fuel Price Surge (+40%)', description: 'Simulate sudden 40% fuel cost increase affecting all sea freight', icon: '⛽', params: {} },
  { id: 'SC-06', name: 'Supplier Shutdown — TextileMfg Co', description: 'Simulate complete shutdown of TextileMfg Co operations', icon: '🏭', params: { region: 'Southeast Asia' } },
  { id: 'SC-07', name: 'Typhoon — Western Pacific', description: 'Simulate Category 4 typhoon disrupting Western Pacific sea lanes', icon: '🌊', params: { region: 'Intra-Asia' } },
  { id: 'SC-08', name: 'Gulf of Aden Closure', description: 'Simulate complete closure of Gulf of Aden shipping corridor', icon: '⚠️', params: { route: 'Gulf of Aden' } },
];

export const getRiskColor = (level: RiskLevel) => {
  switch (level) {
    case 'low': return 'risk-low';
    case 'medium': return 'risk-medium';
    case 'high': return 'risk-high';
    case 'critical': return 'risk-critical';
  }
};

export const getRiskBgClass = (score: number): string => {
  if (score >= 75) return 'risk-critical';
  if (score >= 50) return 'risk-high';
  if (score >= 25) return 'risk-medium';
  return 'risk-low';
};

export const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
};

export const getStatusLabel = (status: ShipmentStatus) => {
  const labels: Record<ShipmentStatus, string> = {
    'in-transit': 'In Transit',
    'at-port': 'At Port',
    'customs-hold': 'Customs Hold',
    'delivered': 'Delivered',
    'delayed': 'Delayed',
    'at-warehouse': 'At Warehouse',
  };
  return labels[status];
};

export { shipments, alerts, carriers, suppliers, scenarioTemplates };
