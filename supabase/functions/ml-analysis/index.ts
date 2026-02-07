import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// ML SIMULATION ENGINES
// ============================================

/**
 * NDVI Computation Engine
 * Simulates satellite-derived vegetation health indices
 */
function computeVegetationHealth(params: {
  redBand: number;
  nirBand: number;
  blueBand?: number;
  previousNDVI?: number;
}): {
  ndvi: number;
  evi: number;
  greenCoverPercent: number;
  vegetationDensity: string;
  changeFromPrevious: number | null;
} {
  const { redBand, nirBand, blueBand = 0.1, previousNDVI } = params;

  // NDVI = (NIR - Red) / (NIR + Red)
  const ndvi = (nirBand - redBand) / (nirBand + redBand + 0.001);
  const clampedNDVI = Math.max(-1, Math.min(1, ndvi));

  // Enhanced Vegetation Index
  const G = 2.5;
  const C1 = 6;
  const C2 = 7.5;
  const L = 1;
  const evi = G * ((nirBand - redBand) / (nirBand + C1 * redBand - C2 * blueBand + L + 0.001));
  const clampedEVI = Math.max(-1, Math.min(1, evi));

  // Convert NDVI to green cover percentage
  const greenCoverPercent = Math.max(0, Math.min(100, ((clampedNDVI + 0.1) / 1.1) * 100));

  // Classify vegetation density
  let vegetationDensity: string;
  if (clampedNDVI < 0.1) vegetationDensity = "barren";
  else if (clampedNDVI < 0.2) vegetationDensity = "sparse";
  else if (clampedNDVI < 0.4) vegetationDensity = "moderate";
  else if (clampedNDVI < 0.6) vegetationDensity = "dense";
  else vegetationDensity = "very_dense";

  const changeFromPrevious = previousNDVI !== undefined ? clampedNDVI - previousNDVI : null;

  return {
    ndvi: Number(clampedNDVI.toFixed(4)),
    evi: Number(clampedEVI.toFixed(4)),
    greenCoverPercent: Number(greenCoverPercent.toFixed(2)),
    vegetationDensity,
    changeFromPrevious: changeFromPrevious !== null ? Number(changeFromPrevious.toFixed(4)) : null,
  };
}

/**
 * Urban Heat Island (UHI) Engine
 * Calculates heat stress from multiple environmental factors
 */
function computeHeatStress(params: {
  landSurfaceTemp: number;
  ambientTemp: number;
  humidity: number;
  greenCoverPercent: number;
  urbanDensity: number;
  ruralReferenceTemp?: number;
}): {
  heatIndex: number;
  uhiIntensity: number;
  thermalComfortIndex: number;
  riskCategory: string;
  mitigationPotential: number;
} {
  const {
    landSurfaceTemp,
    ambientTemp,
    humidity,
    greenCoverPercent,
    urbanDensity,
    ruralReferenceTemp = 28,
  } = params;

  // UHI Intensity calculation
  const uhiIntensity = Math.max(0, landSurfaceTemp - ruralReferenceTemp);

  // Heat stress index (0-100 scale)
  const tempFactor = Math.min(100, Math.max(0, (landSurfaceTemp - 25) * 2.5));
  const humidityFactor = (humidity / 100) * 20;
  const greenMitigation = (greenCoverPercent / 100) * 30;
  const urbanFactor = (urbanDensity / 100) * 15;

  const heatIndex = Math.round(
    Math.min(100, Math.max(0, tempFactor + humidityFactor - greenMitigation + urbanFactor))
  );

  // Thermal comfort index (using simplified UTCI approximation)
  const thermalComfortIndex = Math.min(
    100,
    Math.max(0, 50 + (ambientTemp - 25) * 2 - greenCoverPercent * 0.3 + humidity * 0.1)
  );

  // Risk categorization
  let riskCategory: string;
  if (heatIndex >= 85) riskCategory = "extreme";
  else if (heatIndex >= 70) riskCategory = "high";
  else if (heatIndex >= 50) riskCategory = "moderate";
  else riskCategory = "low";

  // Mitigation potential (how much heat could be reduced with more vegetation)
  const maxGreenCover = 40; // Target 40% green cover
  const potentialGreenGain = Math.max(0, maxGreenCover - greenCoverPercent);
  const mitigationPotential = potentialGreenGain * 0.3; // Each 1% green cover = 0.3°C reduction

  return {
    heatIndex,
    uhiIntensity: Number(uhiIntensity.toFixed(2)),
    thermalComfortIndex: Number(thermalComfortIndex.toFixed(2)),
    riskCategory,
    mitigationPotential: Number(mitigationPotential.toFixed(2)),
  };
}

/**
 * Change Detection Engine
 * Detects vegetation loss by comparing time-series NDVI data
 */
function detectVegetationChange(params: {
  currentNDVI: number;
  previousNDVI: number;
  timeIntervalDays: number;
  threshold?: number;
}): {
  changeType: "loss" | "gain" | "stable";
  changeMagnitude: number;
  changeRate: number;
  alertLevel: string;
  confidence: number;
} {
  const { currentNDVI, previousNDVI, timeIntervalDays, threshold = 0.1 } = params;

  const change = currentNDVI - previousNDVI;
  const changeMagnitude = Math.abs(change);
  const changeRate = (changeMagnitude / timeIntervalDays) * 30; // Monthly rate

  let changeType: "loss" | "gain" | "stable";
  if (change < -threshold) changeType = "loss";
  else if (change > threshold) changeType = "gain";
  else changeType = "stable";

  // Alert level based on change magnitude and rate
  let alertLevel: string;
  if (changeType === "loss" && changeMagnitude > 0.3) alertLevel = "critical";
  else if (changeType === "loss" && changeMagnitude > 0.15) alertLevel = "high";
  else if (changeType === "loss" && changeMagnitude > 0.05) alertLevel = "medium";
  else alertLevel = "low";

  // Confidence based on magnitude (higher magnitude = higher confidence it's real)
  const confidence = Math.min(99, 70 + changeMagnitude * 100);

  return {
    changeType,
    changeMagnitude: Number(changeMagnitude.toFixed(4)),
    changeRate: Number(changeRate.toFixed(4)),
    alertLevel,
    confidence: Number(confidence.toFixed(2)),
  };
}

/**
 * Risk Assessment Engine
 * Combines multiple factors to compute overall risk score
 */
function computeRiskAssessment(params: {
  heatIndex: number;
  greenCoverPercent: number;
  treeLossRate: number;
  populationDensity: number;
  airQualityIndex?: number;
  vulnerabilityScore?: number;
}): {
  overallRiskScore: number;
  heatRiskScore: number;
  vegetationRiskScore: number;
  priority: string;
  riskFactors: Record<string, number>;
  recommendations: string[];
} {
  const {
    heatIndex,
    greenCoverPercent,
    treeLossRate,
    populationDensity,
    airQualityIndex = 150,
    vulnerabilityScore = 50,
  } = params;

  // Individual risk components
  const heatRiskScore = heatIndex;
  const vegetationRiskScore = Math.min(100, (33 - greenCoverPercent) * 3); // Target 33%
  const treeLossRiskScore = Math.min(100, treeLossRate * 5);
  const populationRiskScore = Math.min(100, (populationDensity / 500) * 100);
  const airQualityRiskScore = Math.min(100, (airQualityIndex / 300) * 100);
  const vulnerabilityRiskScore = vulnerabilityScore;

  // Weighted combination
  const overallRiskScore = Math.round(
    heatRiskScore * 0.25 +
      vegetationRiskScore * 0.25 +
      treeLossRiskScore * 0.15 +
      populationRiskScore * 0.15 +
      airQualityRiskScore * 0.1 +
      vulnerabilityRiskScore * 0.1
  );

  // Priority classification
  let priority: string;
  if (overallRiskScore >= 80) priority = "critical";
  else if (overallRiskScore >= 60) priority = "high";
  else if (overallRiskScore >= 40) priority = "medium";
  else priority = "low";

  // Generate recommendations
  const recommendations: string[] = [];
  if (heatRiskScore > 70) recommendations.push("Urgent cooling intervention needed");
  if (vegetationRiskScore > 60) recommendations.push("Priority plantation zone");
  if (treeLossRiskScore > 50) recommendations.push("Enhanced monitoring required");
  if (populationRiskScore > 70) recommendations.push("Focus on high-density public spaces");

  return {
    overallRiskScore,
    heatRiskScore: Math.round(heatRiskScore),
    vegetationRiskScore: Math.round(vegetationRiskScore),
    priority,
    riskFactors: {
      heat: heatRiskScore,
      vegetation: vegetationRiskScore,
      treeLoss: treeLossRiskScore,
      population: populationRiskScore,
      airQuality: airQualityRiskScore,
      vulnerability: vulnerabilityRiskScore,
    },
    recommendations,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace("/ml-analysis", "");

  try {
    // POST /ndvi - Compute NDVI for a ward
    if (path === "/ndvi" && req.method === "POST") {
      const { wardId, redBand, nirBand, blueBand, observationDate } = await req.json();

      // Get previous NDVI for change detection
      const { data: prevNdvi } = await supabase
        .from("ndvi_scores")
        .select("ndvi_value")
        .eq("ward_id", wardId)
        .order("observation_date", { ascending: false })
        .limit(1)
        .single();

      const result = computeVegetationHealth({
        redBand,
        nirBand,
        blueBand,
        previousNDVI: prevNdvi?.ndvi_value,
      });

      // Store result
      const { error } = await supabase.from("ndvi_scores").upsert({
        ward_id: wardId,
        observation_date: observationDate || new Date().toISOString().split("T")[0],
        ndvi_value: result.ndvi,
        evi_value: result.evi,
        green_cover_percent: result.greenCoverPercent,
        vegetation_density: result.vegetationDensity,
        satellite_source: "Sentinel-2",
        confidence_score: 92,
      });

      if (error) throw error;

      // Trigger change detection alert if significant loss
      if (result.changeFromPrevious !== null && result.changeFromPrevious < -0.1) {
        const changeResult = detectVegetationChange({
          currentNDVI: result.ndvi,
          previousNDVI: prevNdvi?.ndvi_value || 0,
          timeIntervalDays: 30,
        });

        if (changeResult.alertLevel !== "low") {
          await supabase.from("alerts").insert({
            ward_id: wardId,
            alert_type: "vegetation_change",
            severity: changeResult.alertLevel as any,
            title: `Vegetation Loss Detected`,
            message: `NDVI dropped by ${(changeResult.changeMagnitude * 100).toFixed(1)}% - possible deforestation`,
            detection_method: "ML-NDVI-Analysis",
            confidence_score: changeResult.confidence,
            metadata: { change: changeResult },
          });
        }
      }

      console.log(`NDVI computed for ward ${wardId}: ${result.ndvi}`);
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /heat-stress - Compute heat stress index
    if (path === "/heat-stress" && req.method === "POST") {
      const { wardId, landSurfaceTemp, ambientTemp, humidity, urbanDensity, observationDate } =
        await req.json();

      // Get current green cover for the ward
      const { data: ndvi } = await supabase
        .from("ndvi_scores")
        .select("green_cover_percent")
        .eq("ward_id", wardId)
        .order("observation_date", { ascending: false })
        .limit(1)
        .single();

      const result = computeHeatStress({
        landSurfaceTemp,
        ambientTemp,
        humidity,
        greenCoverPercent: ndvi?.green_cover_percent || 20,
        urbanDensity,
      });

      // Store result
      const { error } = await supabase.from("heat_indices").upsert({
        ward_id: wardId,
        observation_date: observationDate || new Date().toISOString().split("T")[0],
        land_surface_temp: landSurfaceTemp,
        ambient_temp: ambientTemp,
        humidity,
        heat_index: result.heatIndex,
        uhi_intensity: result.uhiIntensity,
        thermal_comfort_index: result.thermalComfortIndex,
        data_source: "MODIS-LST",
      });

      if (error) throw error;

      // Generate heat spike alert
      if (result.heatIndex >= 85) {
        await supabase.from("alerts").insert({
          ward_id: wardId,
          alert_type: "heat_spike",
          severity: result.heatIndex >= 95 ? "critical" : "high",
          title: `Heat Spike Alert`,
          message: `Heat stress index reached ${result.heatIndex} - ${result.riskCategory} risk level`,
          detection_method: "ML-UHI-Analysis",
          confidence_score: 95,
          metadata: { heatAnalysis: result },
        });
      }

      console.log(`Heat stress computed for ward ${wardId}: ${result.heatIndex}`);
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /risk-assessment - Compute risk assessment
    if (path === "/risk-assessment" && req.method === "POST") {
      const { wardId, populationDensity, treeLossRate, airQualityIndex, assessmentDate } =
        await req.json();

      // Get current metrics
      const { data: ndvi } = await supabase
        .from("ndvi_scores")
        .select("green_cover_percent")
        .eq("ward_id", wardId)
        .order("observation_date", { ascending: false })
        .limit(1)
        .single();

      const { data: heat } = await supabase
        .from("heat_indices")
        .select("heat_index")
        .eq("ward_id", wardId)
        .order("observation_date", { ascending: false })
        .limit(1)
        .single();

      const result = computeRiskAssessment({
        heatIndex: heat?.heat_index || 70,
        greenCoverPercent: ndvi?.green_cover_percent || 20,
        treeLossRate: treeLossRate || 5,
        populationDensity: populationDensity || 15000,
        airQualityIndex: airQualityIndex || 150,
      });

      // Store result
      const { error } = await supabase.from("risk_assessments").upsert({
        ward_id: wardId,
        assessment_date: assessmentDate || new Date().toISOString().split("T")[0],
        overall_risk_score: result.overallRiskScore,
        heat_risk_score: result.heatRiskScore,
        vegetation_risk_score: result.vegetationRiskScore,
        priority: result.priority as any,
        risk_factors: result.riskFactors,
        ai_analysis: result.recommendations.join("; "),
        confidence_score: 90,
      });

      if (error) throw error;

      // Generate risk alert for critical zones
      if (result.priority === "critical") {
        await supabase.from("alerts").insert({
          ward_id: wardId,
          alert_type: "risk_alert",
          severity: "critical",
          title: `Critical Risk Zone`,
          message: `Overall risk score: ${result.overallRiskScore}/100. ${result.recommendations[0] || "Immediate intervention required."}`,
          detection_method: "ML-Risk-Assessment",
          confidence_score: 90,
          metadata: { riskAssessment: result },
        });
      }

      console.log(`Risk assessment computed for ward ${wardId}: ${result.overallRiskScore}`);
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /batch-analysis - Run full analysis for all wards
    if (path === "/batch-analysis" && req.method === "POST") {
      const { data: wards } = await supabase.from("wards").select("id, name");

      const results = [];
      for (const ward of wards || []) {
        // Simulate sensor data with realistic Delhi patterns
        const baseTemp = 28 + Math.random() * 15; // 28-43°C
        const humidity = 40 + Math.random() * 40; // 40-80%
        const urbanDensity = 50 + Math.random() * 50; // 50-100%

        // Simulate NDVI bands
        const redBand = 0.1 + Math.random() * 0.3;
        const nirBand = 0.2 + Math.random() * 0.5;

        // Compute NDVI
        const ndviResult = computeVegetationHealth({ redBand, nirBand });

        // Compute heat stress
        const heatResult = computeHeatStress({
          landSurfaceTemp: baseTemp + 5,
          ambientTemp: baseTemp,
          humidity,
          greenCoverPercent: ndviResult.greenCoverPercent,
          urbanDensity,
        });

        // Compute risk
        const riskResult = computeRiskAssessment({
          heatIndex: heatResult.heatIndex,
          greenCoverPercent: ndviResult.greenCoverPercent,
          treeLossRate: Math.random() * 20,
          populationDensity: 10000 + Math.random() * 30000,
        });

        results.push({
          wardId: ward.id,
          wardName: ward.name,
          ndvi: ndviResult,
          heat: heatResult,
          risk: riskResult,
        });
      }

      console.log(`Batch analysis completed for ${results.length} wards`);
      return new Response(JSON.stringify({ success: true, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /stats - Get ML analysis statistics
    if (path === "/stats" && req.method === "GET") {
      const { data: ndviCount } = await supabase
        .from("ndvi_scores")
        .select("id", { count: "exact", head: true });

      const { data: heatCount } = await supabase
        .from("heat_indices")
        .select("id", { count: "exact", head: true });

      const { data: riskCount } = await supabase
        .from("risk_assessments")
        .select("id", { count: "exact", head: true });

      const { data: alertCount } = await supabase
        .from("alerts")
        .select("id", { count: "exact", head: true });

      return new Response(
        JSON.stringify({
          stats: {
            ndviRecords: ndviCount || 0,
            heatRecords: heatCount || 0,
            riskAssessments: riskCount || 0,
            totalAlerts: alertCount || 0,
            lastUpdated: new Date().toISOString(),
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ML Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
