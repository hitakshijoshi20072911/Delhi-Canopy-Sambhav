// DelhiCanopy API Service Layer
// Connects frontend components to backend Edge Functions

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
};

// ============================================
// DATA API ENDPOINTS
// ============================================

export interface Ward {
  id: string;
  ward_number: number;
  name: string;
  zone: string;
  area_sq_km: number;
  population: number;
  latest_ndvi: number | null;
  green_cover_percent: number;
  heat_index: number;
  land_surface_temp: number;
  risk_score: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Alert {
  id: string;
  ward_id: string;
  alert_type: 'tree_loss' | 'heat_spike' | 'risk_alert' | 'plantation_needed' | 'vegetation_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  location_description: string;
  detected_at: string;
  is_active: boolean;
  confidence_score: number;
  wards?: { name: string };
}

export interface KPI {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  icon: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface AIInsight {
  id: string;
  category: string;
  insight: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  actionRequired: boolean;
}

export interface ClimateTrend {
  month: string;
  avgTemp: number;
  heatIndex: number;
  greenCover: number;
}

export interface PlantationPlan {
  ward: string;
  priority: string;
  requiredTrees: number;
  heatReduction: number;
  carbonOffset: number;
  urgencyIndex: number;
  landType: string;
  estimatedCost: string;
  timeline?: string;
  species?: string[];
  reasoning?: string;
}

// Fetch all wards with latest metrics
export async function fetchWards(): Promise<Ward[]> {
  try {
    const response = await fetch(`${API_BASE}/data-api/wards`, { headers });
    if (!response.ok) throw new Error("Failed to fetch wards");
    const data = await response.json();
    return data.wards || [];
  } catch (error) {
    console.error("Error fetching wards:", error);
    return [];
  }
}

// Fetch detailed ward data
export async function fetchWardDetails(wardId: string): Promise<{
  ward: Ward | null;
  ndvi_history: any[];
  heat_history: any[];
}> {
  try {
    const response = await fetch(`${API_BASE}/data-api/wards/${wardId}`, { headers });
    if (!response.ok) throw new Error("Failed to fetch ward details");
    return await response.json();
  } catch (error) {
    console.error("Error fetching ward details:", error);
    return { ward: null, ndvi_history: [], heat_history: [] };
  }
}

// Fetch recent alerts
export async function fetchAlerts(limit = 20, severity?: string): Promise<Alert[]> {
  try {
    const url = new URL(`${API_BASE}/data-api/alerts`);
    url.searchParams.set("limit", String(limit));
    if (severity) url.searchParams.set("severity", severity);
    
    const response = await fetch(url.toString(), { headers });
    if (!response.ok) throw new Error("Failed to fetch alerts");
    const data = await response.json();
    return data.alerts || [];
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }
}

// Fetch dashboard KPIs
export async function fetchKPIs(): Promise<KPI[]> {
  try {
    const response = await fetch(`${API_BASE}/data-api/kpis`, { headers });
    if (!response.ok) throw new Error("Failed to fetch KPIs");
    const data = await response.json();
    return data.kpis || [];
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    return [];
  }
}

// Fetch AI-generated insights
export async function fetchInsights(): Promise<AIInsight[]> {
  try {
    const response = await fetch(`${API_BASE}/data-api/insights`, { headers });
    if (!response.ok) throw new Error("Failed to fetch insights");
    const data = await response.json();
    return data.insights || [];
  } catch (error) {
    console.error("Error fetching insights:", error);
    return [];
  }
}

// Fetch climate trend data
export async function fetchClimateTrends(months = 12): Promise<ClimateTrend[]> {
  try {
    const response = await fetch(`${API_BASE}/data-api/climate-trends?months=${months}`, { headers });
    if (!response.ok) throw new Error("Failed to fetch climate trends");
    const data = await response.json();
    return data.trends || [];
  } catch (error) {
    console.error("Error fetching climate trends:", error);
    return [];
  }
}

// Fetch GeoJSON for map layers
export async function fetchGeoJSON(layer = "all"): Promise<GeoJSON.FeatureCollection | null> {
  try {
    const response = await fetch(`${API_BASE}/data-api/geojson?layer=${layer}`, { headers });
    if (!response.ok) throw new Error("Failed to fetch GeoJSON");
    return await response.json();
  } catch (error) {
    console.error("Error fetching GeoJSON:", error);
    return null;
  }
}

// ============================================
// ML ANALYSIS ENDPOINTS
// ============================================

export interface NDVIResult {
  ndvi: number;
  evi: number;
  greenCoverPercent: number;
  vegetationDensity: string;
  changeFromPrevious: number | null;
}

export interface HeatStressResult {
  heatIndex: number;
  uhiIntensity: number;
  thermalComfortIndex: number;
  riskCategory: string;
  mitigationPotential: number;
}

export interface RiskAssessmentResult {
  overallRiskScore: number;
  heatRiskScore: number;
  vegetationRiskScore: number;
  priority: string;
  riskFactors: Record<string, number>;
  recommendations: string[];
}

// Compute NDVI for a ward
export async function computeNDVI(wardId: string, params: {
  redBand: number;
  nirBand: number;
  blueBand?: number;
}): Promise<NDVIResult | null> {
  try {
    const response = await fetch(`${API_BASE}/ml-analysis/ndvi`, {
      method: "POST",
      headers,
      body: JSON.stringify({ wardId, ...params }),
    });
    if (!response.ok) throw new Error("Failed to compute NDVI");
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error computing NDVI:", error);
    return null;
  }
}

// Compute heat stress index
export async function computeHeatStress(wardId: string, params: {
  landSurfaceTemp: number;
  ambientTemp: number;
  humidity: number;
  urbanDensity: number;
}): Promise<HeatStressResult | null> {
  try {
    const response = await fetch(`${API_BASE}/ml-analysis/heat-stress`, {
      method: "POST",
      headers,
      body: JSON.stringify({ wardId, ...params }),
    });
    if (!response.ok) throw new Error("Failed to compute heat stress");
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error computing heat stress:", error);
    return null;
  }
}

// Compute risk assessment
export async function computeRiskAssessment(wardId: string, params: {
  populationDensity?: number;
  treeLossRate?: number;
  airQualityIndex?: number;
}): Promise<RiskAssessmentResult | null> {
  try {
    const response = await fetch(`${API_BASE}/ml-analysis/risk-assessment`, {
      method: "POST",
      headers,
      body: JSON.stringify({ wardId, ...params }),
    });
    if (!response.ok) throw new Error("Failed to compute risk assessment");
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error computing risk assessment:", error);
    return null;
  }
}

// Run batch analysis for all wards
export async function runBatchAnalysis(): Promise<{
  success: boolean;
  results: any[];
}> {
  try {
    const response = await fetch(`${API_BASE}/ml-analysis/batch-analysis`, {
      method: "POST",
      headers,
    });
    if (!response.ok) throw new Error("Failed to run batch analysis");
    return await response.json();
  } catch (error) {
    console.error("Error running batch analysis:", error);
    return { success: false, results: [] };
  }
}

// ============================================
// AI PLANNER ENDPOINTS
// ============================================

export interface PlanGenerationResult {
  success: boolean;
  ward: { id: string; name: string };
  analysis: {
    vision: {
      vegetationStatus: string;
      thermalStatus: string;
      coverageGap: number;
      priorityLevel: number;
    };
    correlation: {
      heatVegetationCorrelation: number;
      urbanHeatAmplification: number;
      coolingPotential: number;
      treesPerDegree: number;
    };
  };
  plan: {
    requiredTrees: number;
    estimatedHeatReduction: number;
    estimatedCO2Offset: number;
    estimatedCost: number;
    implementationTimeline: string;
    recommendedSpecies: string[];
    priorityScore: number;
    reasoning: string;
  };
}

// Generate plantation plan for a ward
export async function generatePlantationPlan(wardId: string, params: {
  landType?: string;
  urbanDensity?: number;
}): Promise<PlanGenerationResult | null> {
  try {
    const response = await fetch(`${API_BASE}/ai-planner/generate-plan`, {
      method: "POST",
      headers,
      body: JSON.stringify({ wardId, ...params }),
    });
    if (!response.ok) throw new Error("Failed to generate plan");
    return await response.json();
  } catch (error) {
    console.error("Error generating plan:", error);
    return null;
  }
}

// Fetch all plantation plans
export async function fetchPlantationPlans(limit = 20): Promise<PlantationPlan[]> {
  try {
    const response = await fetch(`${API_BASE}/ai-planner/plans?limit=${limit}`, { headers });
    if (!response.ok) throw new Error("Failed to fetch plans");
    const data = await response.json();
    return data.plans || [];
  } catch (error) {
    console.error("Error fetching plans:", error);
    return [];
  }
}

// Generate plans for all wards
export async function generateAllPlans(): Promise<{ success: boolean; count: number }> {
  try {
    const response = await fetch(`${API_BASE}/ai-planner/generate-all`, {
      method: "POST",
      headers,
    });
    if (!response.ok) throw new Error("Failed to generate all plans");
    const data = await response.json();
    return { success: data.success, count: data.count || 0 };
  } catch (error) {
    console.error("Error generating all plans:", error);
    return { success: false, count: 0 };
  }
}

// Get AI analysis for a ward
export async function getAIAnalysis(wardId: string, analysisType = "comprehensive"): Promise<{
  success: boolean;
  ward: string;
  analysis: string;
} | null> {
  try {
    const response = await fetch(`${API_BASE}/ai-planner/ai-analysis`, {
      method: "POST",
      headers,
      body: JSON.stringify({ wardId, analysisType }),
    });
    if (!response.ok) throw new Error("Failed to get AI analysis");
    return await response.json();
  } catch (error) {
    console.error("Error getting AI analysis:", error);
    return null;
  }
}

// ============================================
// SEED DATA ENDPOINT
// ============================================

export async function seedDatabase(): Promise<{ success: boolean; stats: any }> {
  try {
    const response = await fetch(`${API_BASE}/seed-data`, {
      method: "POST",
      headers,
      body: JSON.stringify({ action: "seed" }),
    });
    if (!response.ok) throw new Error("Failed to seed database");
    return await response.json();
  } catch (error) {
    console.error("Error seeding database:", error);
    return { success: false, stats: null };
  }
}

export async function checkDatabaseStatus(): Promise<{ seeded: boolean; counts: any }> {
  try {
    const response = await fetch(`${API_BASE}/seed-data`, {
      method: "POST",
      headers,
      body: JSON.stringify({ action: "status" }),
    });
    if (!response.ok) throw new Error("Failed to check database status");
    return await response.json();
  } catch (error) {
    console.error("Error checking database status:", error);
    return { seeded: false, counts: {} };
  }
}
