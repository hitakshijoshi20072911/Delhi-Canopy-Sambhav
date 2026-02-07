// Mock data for DelhiCanopy AI Command Center

export interface KPIData {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  icon: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface WardData {
  id: number;
  name: string;
  greenCover: number;
  heatIndex: number;
  riskScore: number;
  treeLoss: number;
  co2Absorption: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface AlertData {
  id: string;
  type: 'tree_loss' | 'heat_spike' | 'risk_alert' | 'plantation_needed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ward: string;
  message: string;
  timestamp: string;
  coordinates: [number, number];
}

export interface AIInsight {
  id: string;
  category: string;
  insight: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  actionRequired: boolean;
}

export const kpiData: KPIData[] = [
  {
    label: 'Total Green Cover',
    value: 21.4,
    unit: '%',
    trend: 'down',
    trendValue: -2.3,
    icon: 'TreeDeciduous',
    status: 'warning'
  },
  {
    label: 'Heat Stress Index',
    value: 78,
    unit: '/100',
    trend: 'up',
    trendValue: 5.2,
    icon: 'Thermometer',
    status: 'critical'
  },
  {
    label: 'High Risk Wards',
    value: 47,
    unit: 'zones',
    trend: 'up',
    trendValue: 8,
    icon: 'AlertTriangle',
    status: 'critical'
  },
  {
    label: 'CO₂ Absorption',
    value: 2847,
    unit: 'tons/yr',
    trend: 'down',
    trendValue: -156,
    icon: 'Wind',
    status: 'warning'
  },
  {
    label: 'Tree Loss Alerts',
    value: 23,
    unit: 'last 24h',
    trend: 'up',
    trendValue: 7,
    icon: 'TreePine',
    status: 'critical'
  }
];

export const wardData: WardData[] = [
  { id: 1, name: 'Rohini Zone', greenCover: 28, heatIndex: 72, riskScore: 45, treeLoss: 12, co2Absorption: 340, priority: 'medium' },
  { id: 2, name: 'Shahdara North', greenCover: 15, heatIndex: 89, riskScore: 82, treeLoss: 34, co2Absorption: 120, priority: 'critical' },
  { id: 3, name: 'Central Delhi', greenCover: 12, heatIndex: 91, riskScore: 88, treeLoss: 45, co2Absorption: 89, priority: 'critical' },
  { id: 4, name: 'South Delhi', greenCover: 35, heatIndex: 65, riskScore: 32, treeLoss: 8, co2Absorption: 520, priority: 'low' },
  { id: 5, name: 'Dwarka', greenCover: 22, heatIndex: 78, riskScore: 56, treeLoss: 19, co2Absorption: 280, priority: 'medium' },
  { id: 6, name: 'Najafgarh', greenCover: 42, heatIndex: 58, riskScore: 28, treeLoss: 5, co2Absorption: 680, priority: 'low' },
  { id: 7, name: 'Karol Bagh', greenCover: 9, heatIndex: 94, riskScore: 91, treeLoss: 52, co2Absorption: 67, priority: 'critical' },
  { id: 8, name: 'Sadar Bazaar', greenCover: 8, heatIndex: 95, riskScore: 93, treeLoss: 61, co2Absorption: 54, priority: 'critical' },
  { id: 9, name: 'Narela', greenCover: 48, heatIndex: 52, riskScore: 22, treeLoss: 3, co2Absorption: 780, priority: 'low' },
  { id: 10, name: 'Mehrauli', greenCover: 31, heatIndex: 68, riskScore: 38, treeLoss: 11, co2Absorption: 410, priority: 'medium' },
];

export const recentAlerts: AlertData[] = [
  {
    id: 'ALT-001',
    type: 'tree_loss',
    severity: 'critical',
    ward: 'Karol Bagh',
    message: 'Illegal felling detected: 12 mature trees removed near Ajmal Khan Road',
    timestamp: '2024-01-15T08:32:00Z',
    coordinates: [28.6519, 77.1886]
  },
  {
    id: 'ALT-002',
    type: 'heat_spike',
    severity: 'high',
    ward: 'Central Delhi',
    message: 'Surface temperature spike: 48°C recorded in Connaught Place zone',
    timestamp: '2024-01-15T11:45:00Z',
    coordinates: [28.6315, 77.2167]
  },
  {
    id: 'ALT-003',
    type: 'risk_alert',
    severity: 'high',
    ward: 'Shahdara North',
    message: 'Heat vulnerability index exceeds 85: Urgent cooling intervention needed',
    timestamp: '2024-01-15T09:15:00Z',
    coordinates: [28.6823, 77.2878]
  },
  {
    id: 'ALT-004',
    type: 'plantation_needed',
    severity: 'medium',
    ward: 'Dwarka',
    message: 'Green deficit zone identified: Sector 12 requires 200+ tree plantation',
    timestamp: '2024-01-15T07:20:00Z',
    coordinates: [28.5921, 77.0460]
  },
  {
    id: 'ALT-005',
    type: 'tree_loss',
    severity: 'critical',
    ward: 'Sadar Bazaar',
    message: 'Unauthorized construction clearing: 8 heritage trees at risk',
    timestamp: '2024-01-15T06:45:00Z',
    coordinates: [28.6571, 77.2078]
  },
];

export const aiInsights: AIInsight[] = [
  {
    id: 'INS-001',
    category: 'Heat Analysis',
    insight: 'Ward 32 shows 67% vegetation deficiency and extreme surface heat. Urgent plantation intervention required within 30 days.',
    confidence: 94,
    priority: 'high',
    actionRequired: true
  },
  {
    id: 'INS-002',
    category: 'Trend Prediction',
    insight: 'AI model predicts 15% increase in urban heat islands by 2025 if current deforestation rate continues.',
    confidence: 87,
    priority: 'high',
    actionRequired: true
  },
  {
    id: 'INS-003',
    category: 'Resource Optimization',
    insight: 'Optimal plantation zones identified in Dwarka Sector 21 - 340 trees can reduce local temperature by 2.1°C.',
    confidence: 91,
    priority: 'medium',
    actionRequired: false
  },
  {
    id: 'INS-004',
    category: 'Pattern Detection',
    insight: 'Illegal tree felling pattern detected: 78% incidents occur between 2-5 AM in construction zones.',
    confidence: 89,
    priority: 'high',
    actionRequired: true
  },
];

export const monthlyHeatData = [
  { month: 'Jan', avgTemp: 18, heatIndex: 32, greenCover: 22.1 },
  { month: 'Feb', avgTemp: 22, heatIndex: 38, greenCover: 22.0 },
  { month: 'Mar', avgTemp: 29, heatIndex: 52, greenCover: 21.8 },
  { month: 'Apr', avgTemp: 36, heatIndex: 68, greenCover: 21.6 },
  { month: 'May', avgTemp: 42, heatIndex: 85, greenCover: 21.4 },
  { month: 'Jun', avgTemp: 44, heatIndex: 92, greenCover: 21.2 },
  { month: 'Jul', avgTemp: 38, heatIndex: 78, greenCover: 21.5 },
  { month: 'Aug', avgTemp: 35, heatIndex: 72, greenCover: 21.8 },
  { month: 'Sep', avgTemp: 34, heatIndex: 68, greenCover: 21.6 },
  { month: 'Oct', avgTemp: 30, heatIndex: 55, greenCover: 21.5 },
  { month: 'Nov', avgTemp: 24, heatIndex: 42, greenCover: 21.4 },
  { month: 'Dec', avgTemp: 19, heatIndex: 35, greenCover: 21.4 },
];

export const plantationRecommendations = [
  {
    ward: 'Ward 19 - Karol Bagh',
    priority: 'HIGH',
    requiredTrees: 340,
    heatReduction: 2.1,
    carbonOffset: 480,
    urgencyIndex: 91,
    landType: 'Mixed Urban',
    estimatedCost: '₹12.5L'
  },
  {
    ward: 'Ward 32 - Shahdara',
    priority: 'CRITICAL',
    requiredTrees: 520,
    heatReduction: 3.2,
    carbonOffset: 720,
    urgencyIndex: 96,
    landType: 'Industrial',
    estimatedCost: '₹18.2L'
  },
  {
    ward: 'Ward 8 - Central',
    priority: 'HIGH',
    requiredTrees: 280,
    heatReduction: 1.8,
    carbonOffset: 390,
    urgencyIndex: 87,
    landType: 'Commercial',
    estimatedCost: '₹9.8L'
  },
];

export const delhiGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Central Delhi', heatIndex: 91, greenCover: 12 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[77.2, 28.62], [77.24, 28.62], [77.24, 28.66], [77.2, 28.66], [77.2, 28.62]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'South Delhi', heatIndex: 65, greenCover: 35 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[77.18, 28.52], [77.28, 28.52], [77.28, 28.58], [77.18, 28.58], [77.18, 28.52]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'North Delhi', heatIndex: 78, greenCover: 22 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[77.18, 28.7], [77.26, 28.7], [77.26, 28.76], [77.18, 28.76], [77.18, 28.7]]]
      }
    },
  ]
};
