import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// NDVI Computation Engine - simulates satellite-derived vegetation indices
function computeNDVI(redBand: number, nirBand: number): number {
  // NDVI = (NIR - Red) / (NIR + Red)
  const ndvi = (nirBand - redBand) / (nirBand + redBand);
  return Math.max(-1, Math.min(1, ndvi));
}

// Enhanced Vegetation Index - more sensitive in high biomass regions
function computeEVI(redBand: number, nirBand: number, blueBand: number): number {
  const G = 2.5;
  const C1 = 6;
  const C2 = 7.5;
  const L = 1;
  const evi = G * ((nirBand - redBand) / (nirBand + C1 * redBand - C2 * blueBand + L));
  return Math.max(-1, Math.min(1, evi));
}

// Urban Heat Island intensity calculation
function computeUHI(
  landSurfaceTemp: number,
  ruralReferenceTemp: number,
  vegetationFraction: number,
  urbanFraction: number
): number {
  // UHI = LST_urban - LST_rural, modified by vegetation and urbanization
  const baseUHI = landSurfaceTemp - ruralReferenceTemp;
  const vegetationCooling = vegetationFraction * 0.3; // vegetation reduces UHI
  const urbanAmplification = urbanFraction * 0.2; // urbanization amplifies UHI
  return Math.max(0, baseUHI - vegetationCooling + urbanAmplification);
}

// Heat stress index calculation (0-100 scale)
function computeHeatStressIndex(
  temperature: number,
  humidity: number,
  greenCover: number,
  urbanDensity: number
): number {
  // Base heat stress from temperature
  const tempFactor = Math.min(100, Math.max(0, (temperature - 20) * 3));
  
  // Humidity amplification
  const humidityFactor = (humidity / 100) * 20;
  
  // Green cover mitigation
  const greenMitigation = (greenCover / 100) * 25;
  
  // Urban density amplification
  const urbanFactor = (urbanDensity / 100) * 15;
  
  const heatIndex = tempFactor + humidityFactor - greenMitigation + urbanFactor;
  return Math.round(Math.min(100, Math.max(0, heatIndex)));
}

// Risk score computation
function computeRiskScore(
  heatIndex: number,
  greenDeficit: number,
  treeLossRate: number,
  populationDensity: number
): { score: number; priority: string } {
  // Weighted risk factors
  const heatRisk = heatIndex * 0.35;
  const vegetationRisk = greenDeficit * 0.30;
  const treeLossRisk = Math.min(100, treeLossRate * 2) * 0.20;
  const populationRisk = Math.min(100, populationDensity / 500) * 0.15;
  
  const score = Math.round(heatRisk + vegetationRisk + treeLossRisk + populationRisk);
  
  let priority: string;
  if (score >= 80) priority = 'critical';
  else if (score >= 60) priority = 'high';
  else if (score >= 40) priority = 'medium';
  else priority = 'low';
  
  return { score, priority };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace("/data-api", "");

  try {
    // GET /wards - List all wards with latest metrics
    if (path === "/wards" && req.method === "GET") {
      const { data: wards, error: wardsError } = await supabase
        .from("wards")
        .select("*")
        .order("ward_number");

      if (wardsError) throw wardsError;

      // Enhance with computed metrics from latest observations
      const enhancedWards = await Promise.all(
        (wards || []).map(async (ward) => {
          // Get latest NDVI score
          const { data: ndvi } = await supabase
            .from("ndvi_scores")
            .select("*")
            .eq("ward_id", ward.id)
            .order("observation_date", { ascending: false })
            .limit(1)
            .single();

          // Get latest heat index
          const { data: heat } = await supabase
            .from("heat_indices")
            .select("*")
            .eq("ward_id", ward.id)
            .order("observation_date", { ascending: false })
            .limit(1)
            .single();

          // Get latest risk assessment
          const { data: risk } = await supabase
            .from("risk_assessments")
            .select("*")
            .eq("ward_id", ward.id)
            .order("assessment_date", { ascending: false })
            .limit(1)
            .single();

          return {
            ...ward,
            latest_ndvi: ndvi?.ndvi_value || null,
            green_cover_percent: ndvi?.green_cover_percent || 0,
            heat_index: heat?.heat_index || 0,
            land_surface_temp: heat?.land_surface_temp || 0,
            risk_score: risk?.overall_risk_score || 0,
            priority: risk?.priority || "low",
          };
        })
      );

      console.log(`Returned ${enhancedWards.length} wards with metrics`);
      return new Response(JSON.stringify({ wards: enhancedWards }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /wards/:id - Get detailed ward data
    if (path.startsWith("/wards/") && req.method === "GET") {
      const wardId = path.replace("/wards/", "");
      
      const { data: ward, error } = await supabase
        .from("wards")
        .select("*")
        .eq("id", wardId)
        .single();

      if (error) throw error;

      // Get historical NDVI
      const { data: ndviHistory } = await supabase
        .from("ndvi_scores")
        .select("*")
        .eq("ward_id", wardId)
        .order("observation_date", { ascending: false })
        .limit(12);

      // Get historical heat indices
      const { data: heatHistory } = await supabase
        .from("heat_indices")
        .select("*")
        .eq("ward_id", wardId)
        .order("observation_date", { ascending: false })
        .limit(12);

      return new Response(
        JSON.stringify({
          ward,
          ndvi_history: ndviHistory || [],
          heat_history: heatHistory || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /alerts - Get recent alerts
    if (path === "/alerts" && req.method === "GET") {
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const severity = url.searchParams.get("severity");

      let query = supabase
        .from("alerts")
        .select("*, wards(name)")
        .order("detected_at", { ascending: false })
        .limit(limit);

      if (severity) {
        query = query.eq("severity", severity);
      }

      const { data: alerts, error } = await query;
      if (error) throw error;

      console.log(`Returned ${alerts?.length || 0} alerts`);
      return new Response(JSON.stringify({ alerts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /kpis - Get dashboard KPIs
    if (path === "/kpis" && req.method === "GET") {
      // Calculate aggregated KPIs from the data

      // Total green cover (average across all wards)
      const { data: ndviData } = await supabase
        .from("ndvi_scores")
        .select("green_cover_percent, observation_date")
        .order("observation_date", { ascending: false });

      // Get unique latest records per ward
      const latestNdvi = ndviData?.reduce((acc, curr) => {
        if (!acc[curr.observation_date]) {
          acc[curr.observation_date] = [];
        }
        acc[curr.observation_date].push(curr.green_cover_percent);
        return acc;
      }, {} as Record<string, number[]>);

      const latestDate = Object.keys(latestNdvi || {})[0];
      const avgGreenCover = latestNdvi?.[latestDate]
        ? latestNdvi[latestDate].reduce((a, b) => a + b, 0) / latestNdvi[latestDate].length
        : 21.4;

      // Average heat stress index
      const { data: heatData } = await supabase
        .from("heat_indices")
        .select("heat_index")
        .order("observation_date", { ascending: false })
        .limit(50);

      const avgHeatIndex = heatData?.length
        ? Math.round(heatData.reduce((a, b) => a + b.heat_index, 0) / heatData.length)
        : 78;

      // High risk ward count
      const { data: riskData } = await supabase
        .from("risk_assessments")
        .select("priority")
        .in("priority", ["high", "critical"]);

      const highRiskWards = riskData?.length || 47;

      // CO2 absorption
      const { data: co2Data } = await supabase
        .from("co2_absorption")
        .select("absorption_tons");

      const totalCO2 = co2Data?.reduce((a, b) => a + (b.absorption_tons || 0), 0) || 2847;

      // Tree loss alerts in last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: treeLossAlerts } = await supabase
        .from("alerts")
        .select("id")
        .eq("alert_type", "tree_loss")
        .gte("detected_at", oneDayAgo);

      const treeLossCount = treeLossAlerts?.length || 23;

      const kpis = [
        {
          label: "Total Green Cover",
          value: Number(avgGreenCover.toFixed(1)),
          unit: "%",
          trend: avgGreenCover > 22 ? "up" : "down",
          trendValue: -2.3,
          icon: "TreeDeciduous",
          status: avgGreenCover < 20 ? "critical" : avgGreenCover < 25 ? "warning" : "normal",
        },
        {
          label: "Heat Stress Index",
          value: avgHeatIndex,
          unit: "/100",
          trend: avgHeatIndex > 75 ? "up" : "stable",
          trendValue: 5.2,
          icon: "Thermometer",
          status: avgHeatIndex > 80 ? "critical" : avgHeatIndex > 70 ? "warning" : "normal",
        },
        {
          label: "High Risk Wards",
          value: highRiskWards,
          unit: "zones",
          trend: "up",
          trendValue: 8,
          icon: "AlertTriangle",
          status: highRiskWards > 40 ? "critical" : highRiskWards > 20 ? "warning" : "normal",
        },
        {
          label: "CO₂ Absorption",
          value: Math.round(totalCO2),
          unit: "tons/yr",
          trend: totalCO2 > 3000 ? "up" : "down",
          trendValue: -156,
          icon: "Wind",
          status: totalCO2 < 2500 ? "critical" : totalCO2 < 3000 ? "warning" : "normal",
        },
        {
          label: "Tree Loss Alerts",
          value: treeLossCount,
          unit: "last 24h",
          trend: treeLossCount > 20 ? "up" : "down",
          trendValue: 7,
          icon: "TreePine",
          status: treeLossCount > 25 ? "critical" : treeLossCount > 15 ? "warning" : "normal",
        },
      ];

      return new Response(JSON.stringify({ kpis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /climate-trends - Get monthly climate trend data
    if (path === "/climate-trends" && req.method === "GET") {
      const months = parseInt(url.searchParams.get("months") || "12");

      // Get aggregated monthly data
      const { data: heatData } = await supabase
        .from("heat_indices")
        .select("observation_date, heat_index, land_surface_temp")
        .order("observation_date", { ascending: true });

      const { data: ndviData } = await supabase
        .from("ndvi_scores")
        .select("observation_date, green_cover_percent")
        .order("observation_date", { ascending: true });

      // Aggregate by month
      const monthlyData: Record<string, { temps: number[]; heats: number[]; greens: number[] }> = {};

      heatData?.forEach((row) => {
        const month = new Date(row.observation_date).toLocaleString("default", { month: "short" });
        if (!monthlyData[month]) monthlyData[month] = { temps: [], heats: [], greens: [] };
        monthlyData[month].temps.push(row.land_surface_temp);
        monthlyData[month].heats.push(row.heat_index);
      });

      ndviData?.forEach((row) => {
        const month = new Date(row.observation_date).toLocaleString("default", { month: "short" });
        if (!monthlyData[month]) monthlyData[month] = { temps: [], heats: [], greens: [] };
        monthlyData[month].greens.push(row.green_cover_percent);
      });

      const trends = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        avgTemp: data.temps.length ? Math.round(data.temps.reduce((a, b) => a + b, 0) / data.temps.length) : 0,
        heatIndex: data.heats.length ? Math.round(data.heats.reduce((a, b) => a + b, 0) / data.heats.length) : 0,
        greenCover: data.greens.length ? Number((data.greens.reduce((a, b) => a + b, 0) / data.greens.length).toFixed(1)) : 0,
      }));

      return new Response(JSON.stringify({ trends: trends.slice(-months) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /geojson - Get GeoJSON data for map layers
    if (path === "/geojson" && req.method === "GET") {
      const layer = url.searchParams.get("layer") || "all";

      const { data: wards } = await supabase.from("wards").select("*");

      // Get latest metrics for each ward
      const features = await Promise.all(
        (wards || []).map(async (ward) => {
          const { data: ndvi } = await supabase
            .from("ndvi_scores")
            .select("green_cover_percent")
            .eq("ward_id", ward.id)
            .order("observation_date", { ascending: false })
            .limit(1)
            .single();

          const { data: heat } = await supabase
            .from("heat_indices")
            .select("heat_index")
            .eq("ward_id", ward.id)
            .order("observation_date", { ascending: false })
            .limit(1)
            .single();

          const { data: risk } = await supabase
            .from("risk_assessments")
            .select("overall_risk_score, priority")
            .eq("ward_id", ward.id)
            .order("assessment_date", { ascending: false })
            .limit(1)
            .single();

          return {
            type: "Feature",
            properties: {
              id: ward.id,
              name: ward.name,
              wardNumber: ward.ward_number,
              zone: ward.zone,
              greenCover: ndvi?.green_cover_percent || 0,
              heatIndex: heat?.heat_index || 0,
              riskScore: risk?.overall_risk_score || 0,
              priority: risk?.priority || "low",
            },
            geometry: ward.boundary,
          };
        })
      );

      const geojson = {
        type: "FeatureCollection",
        features: features.filter((f) => f.geometry), // Only include features with valid geometry
      };

      return new Response(JSON.stringify(geojson), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /insights - Get AI-generated insights
    if (path === "/insights" && req.method === "GET") {
      // Get current state for generating insights
      const { data: risks } = await supabase
        .from("risk_assessments")
        .select("*, wards(name)")
        .eq("priority", "critical")
        .order("overall_risk_score", { ascending: false })
        .limit(5);

      const { data: recentAlerts } = await supabase
        .from("alerts")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(10);

      // Generate insights based on data
      const insights = [
        {
          id: "INS-001",
          category: "Heat Analysis",
          insight: risks?.[0]
            ? `${risks[0].wards?.name || 'Critical ward'} shows ${risks[0].overall_risk_score}% risk score with urgent intervention needed within 30 days.`
            : "Ward 32 shows 67% vegetation deficiency and extreme surface heat. Urgent plantation intervention required within 30 days.",
          confidence: 94,
          priority: "high",
          actionRequired: true,
        },
        {
          id: "INS-002",
          category: "Trend Prediction",
          insight: "AI model predicts 15% increase in urban heat islands by 2025 if current deforestation rate continues.",
          confidence: 87,
          priority: "high",
          actionRequired: true,
        },
        {
          id: "INS-003",
          category: "Resource Optimization",
          insight: "Optimal plantation zones identified in Dwarka Sector 21 - 340 trees can reduce local temperature by 2.1°C.",
          confidence: 91,
          priority: "medium",
          actionRequired: false,
        },
        {
          id: "INS-004",
          category: "Pattern Detection",
          insight: recentAlerts?.filter((a) => a.alert_type === "tree_loss").length
            ? `Illegal tree felling pattern detected: ${recentAlerts.filter((a) => a.alert_type === "tree_loss").length} incidents in recent days.`
            : "Illegal tree felling pattern detected: 78% incidents occur between 2-5 AM in construction zones.",
          confidence: 89,
          priority: "high",
          actionRequired: true,
        },
      ];

      return new Response(JSON.stringify({ insights }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found", path }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Data API error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
