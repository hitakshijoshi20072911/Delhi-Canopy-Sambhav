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
// DELHI WARD DATA - Realistic Mock Data
// ============================================

const DELHI_WARDS = [
  { ward_number: 1, name: "Narela", zone: "North Delhi", area_sq_km: 42.0, population: 120000, lat: 28.8528, lng: 77.0969 },
  { ward_number: 2, name: "Alipur", zone: "North Delhi", area_sq_km: 35.5, population: 95000, lat: 28.7960, lng: 77.1350 },
  { ward_number: 3, name: "Rohini Zone I", zone: "North West Delhi", area_sq_km: 28.0, population: 180000, lat: 28.7410, lng: 77.0730 },
  { ward_number: 4, name: "Rohini Zone II", zone: "North West Delhi", area_sq_km: 25.0, population: 165000, lat: 28.7280, lng: 77.0980 },
  { ward_number: 5, name: "Shalimar Bagh", zone: "North West Delhi", area_sq_km: 12.0, population: 140000, lat: 28.7190, lng: 77.1540 },
  { ward_number: 6, name: "Wazirpur", zone: "North West Delhi", area_sq_km: 8.5, population: 85000, lat: 28.6970, lng: 77.1650 },
  { ward_number: 7, name: "Model Town", zone: "North Delhi", area_sq_km: 10.0, population: 125000, lat: 28.7150, lng: 77.1920 },
  { ward_number: 8, name: "Sadar Bazaar", zone: "Central Delhi", area_sq_km: 6.2, population: 95000, lat: 28.6571, lng: 77.2078 },
  { ward_number: 9, name: "Chandni Chowk", zone: "Central Delhi", area_sq_km: 5.8, population: 88000, lat: 28.6562, lng: 77.2306 },
  { ward_number: 10, name: "Civil Lines", zone: "North Delhi", area_sq_km: 15.0, population: 75000, lat: 28.6820, lng: 77.2230 },
  { ward_number: 11, name: "Karol Bagh", zone: "Central Delhi", area_sq_km: 7.5, population: 150000, lat: 28.6519, lng: 77.1886 },
  { ward_number: 12, name: "Rajinder Nagar", zone: "Central Delhi", area_sq_km: 6.0, population: 95000, lat: 28.6430, lng: 77.1820 },
  { ward_number: 13, name: "Patel Nagar", zone: "West Delhi", area_sq_km: 8.0, population: 110000, lat: 28.6580, lng: 77.1550 },
  { ward_number: 14, name: "Rajouri Garden", zone: "West Delhi", area_sq_km: 10.5, population: 145000, lat: 28.6490, lng: 77.1220 },
  { ward_number: 15, name: "Dwarka", zone: "South West Delhi", area_sq_km: 58.0, population: 250000, lat: 28.5921, lng: 77.0460 },
  { ward_number: 16, name: "Najafgarh", zone: "South West Delhi", area_sq_km: 68.0, population: 180000, lat: 28.6093, lng: 76.9796 },
  { ward_number: 17, name: "Janakpuri", zone: "West Delhi", area_sq_km: 18.0, population: 195000, lat: 28.6219, lng: 77.0870 },
  { ward_number: 18, name: "Tilak Nagar", zone: "West Delhi", area_sq_km: 7.5, population: 125000, lat: 28.6400, lng: 77.0950 },
  { ward_number: 19, name: "Vikaspuri", zone: "West Delhi", area_sq_km: 12.0, population: 165000, lat: 28.6350, lng: 77.0680 },
  { ward_number: 20, name: "Uttam Nagar", zone: "South West Delhi", area_sq_km: 8.0, population: 180000, lat: 28.6200, lng: 77.0590 },
  { ward_number: 21, name: "Mayapuri", zone: "West Delhi", area_sq_km: 9.0, population: 95000, lat: 28.6380, lng: 77.1180 },
  { ward_number: 22, name: "Connaught Place", zone: "New Delhi", area_sq_km: 4.5, population: 45000, lat: 28.6315, lng: 77.2167 },
  { ward_number: 23, name: "India Gate", zone: "New Delhi", area_sq_km: 8.0, population: 35000, lat: 28.6129, lng: 77.2295 },
  { ward_number: 24, name: "Lodhi Colony", zone: "South Delhi", area_sq_km: 12.0, population: 85000, lat: 28.5918, lng: 77.2273 },
  { ward_number: 25, name: "Defence Colony", zone: "South Delhi", area_sq_km: 10.0, population: 95000, lat: 28.5742, lng: 77.2311 },
  { ward_number: 26, name: "Lajpat Nagar", zone: "South Delhi", area_sq_km: 8.5, population: 120000, lat: 28.5678, lng: 77.2433 },
  { ward_number: 27, name: "Greater Kailash", zone: "South Delhi", area_sq_km: 15.0, population: 110000, lat: 28.5494, lng: 77.2432 },
  { ward_number: 28, name: "Saket", zone: "South Delhi", area_sq_km: 18.0, population: 145000, lat: 28.5244, lng: 77.2090 },
  { ward_number: 29, name: "Mehrauli", zone: "South Delhi", area_sq_km: 25.0, population: 165000, lat: 28.5183, lng: 77.1860 },
  { ward_number: 30, name: "Vasant Kunj", zone: "South Delhi", area_sq_km: 22.0, population: 175000, lat: 28.5275, lng: 77.1547 },
  { ward_number: 31, name: "RK Puram", zone: "South Delhi", area_sq_km: 14.0, population: 135000, lat: 28.5663, lng: 77.1780 },
  { ward_number: 32, name: "Shahdara North", zone: "East Delhi", area_sq_km: 20.0, population: 225000, lat: 28.6823, lng: 77.2878 },
  { ward_number: 33, name: "Shahdara South", zone: "East Delhi", area_sq_km: 18.0, population: 195000, lat: 28.6650, lng: 77.2920 },
  { ward_number: 34, name: "Preet Vihar", zone: "East Delhi", area_sq_km: 12.0, population: 165000, lat: 28.6390, lng: 77.2940 },
  { ward_number: 35, name: "Mayur Vihar", zone: "East Delhi", area_sq_km: 15.0, population: 185000, lat: 28.6093, lng: 77.2937 },
  { ward_number: 36, name: "Patparganj", zone: "East Delhi", area_sq_km: 14.0, population: 155000, lat: 28.6270, lng: 77.3080 },
  { ward_number: 37, name: "Laxmi Nagar", zone: "East Delhi", area_sq_km: 8.5, population: 175000, lat: 28.6357, lng: 77.2786 },
  { ward_number: 38, name: "Vivek Vihar", zone: "East Delhi", area_sq_km: 10.0, population: 145000, lat: 28.6650, lng: 77.3150 },
  { ward_number: 39, name: "Dilshad Garden", zone: "North East Delhi", area_sq_km: 11.0, population: 195000, lat: 28.6830, lng: 77.3190 },
  { ward_number: 40, name: "Seelampur", zone: "North East Delhi", area_sq_km: 6.0, population: 210000, lat: 28.6750, lng: 77.2680 },
  { ward_number: 41, name: "Mustafabad", zone: "North East Delhi", area_sq_km: 8.0, population: 185000, lat: 28.6960, lng: 77.2580 },
  { ward_number: 42, name: "Karawal Nagar", zone: "North East Delhi", area_sq_km: 15.0, population: 175000, lat: 28.7230, lng: 77.2750 },
  { ward_number: 43, name: "Burari", zone: "North Delhi", area_sq_km: 20.0, population: 155000, lat: 28.7590, lng: 77.2010 },
  { ward_number: 44, name: "Timarpur", zone: "North Delhi", area_sq_km: 9.0, population: 95000, lat: 28.7050, lng: 77.2150 },
  { ward_number: 45, name: "Adarsh Nagar", zone: "North Delhi", area_sq_km: 7.5, population: 115000, lat: 28.7180, lng: 77.1700 },
  { ward_number: 46, name: "Okhla", zone: "South East Delhi", area_sq_km: 16.0, population: 175000, lat: 28.5560, lng: 77.2760 },
  { ward_number: 47, name: "Kalkaji", zone: "South East Delhi", area_sq_km: 12.0, population: 145000, lat: 28.5385, lng: 77.2590 },
];

// Generate realistic NDVI and heat data based on ward characteristics
function generateEnvironmentalData(ward: typeof DELHI_WARDS[0]) {
  // Wards with more green space (outer areas)
  const greenZones = ["Najafgarh", "Narela", "Alipur", "Burari", "Mehrauli", "Vasant Kunj"];
  const commercialZones = ["Connaught Place", "Karol Bagh", "Sadar Bazaar", "Chandni Chowk"];
  const industrialZones = ["Mayapuri", "Wazirpur", "Okhla", "Patparganj"];

  let baseGreenCover: number;
  let baseHeatIndex: number;

  if (greenZones.some(z => ward.name.includes(z))) {
    baseGreenCover = 35 + Math.random() * 15; // 35-50%
    baseHeatIndex = 45 + Math.random() * 20; // 45-65
  } else if (commercialZones.some(z => ward.name.includes(z))) {
    baseGreenCover = 8 + Math.random() * 8; // 8-16%
    baseHeatIndex = 80 + Math.random() * 15; // 80-95
  } else if (industrialZones.some(z => ward.name.includes(z))) {
    baseGreenCover = 12 + Math.random() * 10; // 12-22%
    baseHeatIndex = 75 + Math.random() * 15; // 75-90
  } else {
    baseGreenCover = 18 + Math.random() * 15; // 18-33%
    baseHeatIndex = 60 + Math.random() * 25; // 60-85
  }

  // Convert green cover to NDVI (roughly linear relationship)
  const ndvi = (baseGreenCover / 100) * 0.7 + 0.05;
  const evi = ndvi * 0.85;

  // Heat-related calculations
  const landSurfaceTemp = 30 + (baseHeatIndex / 100) * 18; // 30-48°C
  const ambientTemp = landSurfaceTemp - 5 - Math.random() * 3;
  const humidity = 30 + Math.random() * 40;
  const uhiIntensity = (baseHeatIndex - 50) / 10;

  return {
    ndvi: Number(ndvi.toFixed(4)),
    evi: Number(evi.toFixed(4)),
    greenCoverPercent: Number(baseGreenCover.toFixed(2)),
    landSurfaceTemp: Number(landSurfaceTemp.toFixed(2)),
    ambientTemp: Number(ambientTemp.toFixed(2)),
    humidity: Number(humidity.toFixed(2)),
    heatIndex: Math.round(baseHeatIndex),
    uhiIntensity: Number(uhiIntensity.toFixed(2)),
  };
}

// Generate polygon geometry for wards (simplified squares centered on lat/lng)
function generateWardPolygon(lat: number, lng: number, areaSqKm: number) {
  const side = Math.sqrt(areaSqKm) * 0.009; // Approximate degrees for area
  return {
    type: "Polygon",
    coordinates: [[
      [lng - side/2, lat - side/2],
      [lng + side/2, lat - side/2],
      [lng + side/2, lat + side/2],
      [lng - side/2, lat + side/2],
      [lng - side/2, lat - side/2],
    ]],
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();

    if (action === "seed") {
      console.log("Starting database seeding...");

      // Clear existing data
      await supabase.from("alerts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("plantation_plans").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("risk_assessments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("heat_indices").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("ndvi_scores").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("co2_absorption").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("system_metrics").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("wards").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      console.log("Inserting wards...");
      
      // Insert wards with geometry
      const wardsToInsert = DELHI_WARDS.map(ward => ({
        ward_number: ward.ward_number,
        name: ward.name,
        zone: ward.zone,
        area_sq_km: ward.area_sq_km,
        population: ward.population,
        boundary: generateWardPolygon(ward.lat, ward.lng, ward.area_sq_km),
        centroid: { type: "Point", coordinates: [ward.lng, ward.lat] },
      }));

      const { error: wardError } = await supabase.from("wards").insert(wardsToInsert);
      if (wardError) {
        console.error("Ward insert error:", wardError);
        throw wardError;
      }

      // Get inserted ward IDs
      const { data: wards } = await supabase.from("wards").select("id, name, area_sq_km");
      const wardMap = new Map((wards || []).map(w => [w.name, { id: w.id, area: w.area_sq_km }]));

      console.log(`Inserted ${wards?.length} wards`);

      // Generate 12 months of historical data
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(date.toISOString().split("T")[0]);
      }

      console.log("Generating environmental data for each ward...");

      for (const ward of DELHI_WARDS) {
        const wardInfo = wardMap.get(ward.name);
        if (!wardInfo) continue;

        const envData = generateEnvironmentalData(ward);

        // Insert time-series NDVI data with seasonal variation
        const ndviRecords = months.map((date, idx) => {
          const seasonFactor = Math.sin((idx - 3) * Math.PI / 6) * 0.05; // Peak in monsoon
          return {
            ward_id: wardInfo.id,
            observation_date: date,
            ndvi_value: Math.max(-1, Math.min(1, envData.ndvi + seasonFactor + (Math.random() - 0.5) * 0.03)),
            evi_value: Math.max(-1, Math.min(1, envData.evi + seasonFactor * 0.8 + (Math.random() - 0.5) * 0.02)),
            green_cover_percent: Math.max(0, Math.min(100, envData.greenCoverPercent + seasonFactor * 50 + (Math.random() - 0.5) * 3)),
            vegetation_density: envData.greenCoverPercent > 30 ? "dense" : envData.greenCoverPercent > 15 ? "moderate" : "sparse",
            satellite_source: "Sentinel-2",
            confidence_score: 85 + Math.random() * 10,
          };
        });
        await supabase.from("ndvi_scores").insert(ndviRecords);

        // Insert time-series heat data with seasonal variation
        const heatRecords = months.map((date, idx) => {
          const seasonFactor = Math.sin((idx - 1) * Math.PI / 6) * 15; // Peak in summer (May-June)
          return {
            ward_id: wardInfo.id,
            observation_date: date,
            land_surface_temp: envData.landSurfaceTemp + seasonFactor + (Math.random() - 0.5) * 3,
            ambient_temp: envData.ambientTemp + seasonFactor + (Math.random() - 0.5) * 2,
            humidity: Math.max(20, Math.min(95, envData.humidity - seasonFactor * 0.5 + (Math.random() - 0.5) * 10)),
            heat_index: Math.max(0, Math.min(100, Math.round(envData.heatIndex + seasonFactor * 0.5 + (Math.random() - 0.5) * 5))),
            uhi_intensity: envData.uhiIntensity + (Math.random() - 0.5) * 1,
            thermal_comfort_index: 50 + (envData.heatIndex - 50) * 0.6,
            data_source: "MODIS",
          };
        });
        await supabase.from("heat_indices").insert(heatRecords);

        // Insert latest risk assessment
        const riskScore = Math.round(
          envData.heatIndex * 0.35 +
          (33 - envData.greenCoverPercent) * 1.5 +
          Math.random() * 10
        );
        const priority = riskScore >= 80 ? "critical" : riskScore >= 60 ? "high" : riskScore >= 40 ? "medium" : "low";

        await supabase.from("risk_assessments").insert({
          ward_id: wardInfo.id,
          assessment_date: new Date().toISOString().split("T")[0],
          overall_risk_score: Math.min(100, riskScore),
          heat_risk_score: envData.heatIndex,
          vegetation_risk_score: Math.round((33 - envData.greenCoverPercent) * 3),
          priority,
          risk_factors: {
            heat: envData.heatIndex,
            vegetation: (33 - envData.greenCoverPercent) * 3,
            urbanDensity: 50 + Math.random() * 40,
          },
          ai_analysis: `${ward.name} shows ${priority} risk level with ${envData.greenCoverPercent.toFixed(1)}% green cover and heat index of ${envData.heatIndex}.`,
          confidence_score: 90,
        });

        // Insert CO2 absorption data
        const treesEstimate = Math.round(envData.greenCoverPercent * wardInfo.area * 50);
        const co2Absorption = treesEstimate * 0.021; // tons per year

        await supabase.from("co2_absorption").insert({
          ward_id: wardInfo.id,
          observation_date: new Date().toISOString().split("T")[0],
          absorption_tons: co2Absorption,
          tree_count_estimate: treesEstimate,
          carbon_density: co2Absorption / wardInfo.area,
        });
      }

      console.log("Generating alerts...");

      // Generate sample alerts
      const alertTypes: Array<{ type: string; severity: string; messageTemplate: string }> = [
        { type: "tree_loss", severity: "critical", messageTemplate: "Illegal felling detected: {count} mature trees removed near {location}" },
        { type: "tree_loss", severity: "high", messageTemplate: "Vegetation clearing observed: {count} trees at risk in {location}" },
        { type: "heat_spike", severity: "critical", messageTemplate: "Surface temperature spike: {temp}°C recorded in {location}" },
        { type: "heat_spike", severity: "high", messageTemplate: "Heat stress alert: {temp}°C exceeds safe threshold in {location}" },
        { type: "risk_alert", severity: "critical", messageTemplate: "Heat vulnerability index exceeds 85: Urgent cooling intervention needed" },
        { type: "risk_alert", severity: "high", messageTemplate: "Risk score elevated to {score}/100: Enhanced monitoring required" },
        { type: "plantation_needed", severity: "medium", messageTemplate: "Green deficit zone identified: {location} requires {count}+ tree plantation" },
        { type: "vegetation_change", severity: "high", messageTemplate: "NDVI dropped by {percent}% - possible deforestation detected" },
      ];

      const wardIds = Array.from(wardMap.values()).map(w => w.id);
      const wardNames = Array.from(wardMap.keys());

      for (let i = 0; i < 25; i++) {
        const alertDef = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const wardIdx = Math.floor(Math.random() * wardIds.length);
        const hoursAgo = Math.floor(Math.random() * 48);

        const alertDate = new Date();
        alertDate.setHours(alertDate.getHours() - hoursAgo);

        let message = alertDef.messageTemplate
          .replace("{count}", String(Math.floor(5 + Math.random() * 50)))
          .replace("{temp}", String(Math.floor(42 + Math.random() * 10)))
          .replace("{score}", String(Math.floor(75 + Math.random() * 20)))
          .replace("{percent}", String(Math.floor(10 + Math.random() * 25)))
          .replace("{location}", wardNames[wardIdx]);

        const ward = DELHI_WARDS.find(w => w.name === wardNames[wardIdx]);

        await supabase.from("alerts").insert({
          ward_id: wardIds[wardIdx],
          alert_type: alertDef.type,
          severity: alertDef.severity,
          title: `${alertDef.type.replace("_", " ").toUpperCase()} - ${wardNames[wardIdx]}`,
          message,
          location: ward ? { type: "Point", coordinates: [ward.lng + (Math.random() - 0.5) * 0.01, ward.lat + (Math.random() - 0.5) * 0.01] } : null,
          location_description: wardNames[wardIdx],
          detected_at: alertDate.toISOString(),
          is_active: hoursAgo < 24,
          detection_method: "AI-Satellite-Analysis",
          confidence_score: 80 + Math.random() * 15,
          metadata: { source: "automated_detection", model_version: "v2.1" },
        });
      }

      console.log("Inserting system metrics...");

      // Insert system-wide metrics
      const today = new Date().toISOString().split("T")[0];
      const systemMetrics = [
        { metric_name: "total_green_cover", metric_value: 21.4, metric_unit: "%", trend_direction: "down", trend_value: -2.3 },
        { metric_name: "avg_heat_index", metric_value: 78, metric_unit: "index", trend_direction: "up", trend_value: 5.2 },
        { metric_name: "high_risk_wards", metric_value: 47, metric_unit: "count", trend_direction: "up", trend_value: 8 },
        { metric_name: "total_co2_absorption", metric_value: 2847, metric_unit: "tons/yr", trend_direction: "down", trend_value: -156 },
        { metric_name: "tree_loss_24h", metric_value: 23, metric_unit: "count", trend_direction: "up", trend_value: 7 },
        { metric_name: "satellite_coverage", metric_value: 98.5, metric_unit: "%", trend_direction: "stable", trend_value: 0.2 },
        { metric_name: "ai_predictions_accuracy", metric_value: 94.2, metric_unit: "%", trend_direction: "up", trend_value: 1.5 },
      ];

      for (const metric of systemMetrics) {
        await supabase.from("system_metrics").upsert({
          ...metric,
          observation_date: today,
        });
      }

      console.log("Database seeding completed successfully!");

      return new Response(
        JSON.stringify({
          success: true,
          message: "Database seeded successfully",
          stats: {
            wards: DELHI_WARDS.length,
            ndviRecords: DELHI_WARDS.length * 12,
            heatRecords: DELHI_WARDS.length * 12,
            alerts: 25,
            metrics: systemMetrics.length,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "status") {
      const { data: wards } = await supabase.from("wards").select("id", { count: "exact", head: true });
      const { data: ndvi } = await supabase.from("ndvi_scores").select("id", { count: "exact", head: true });
      const { data: heat } = await supabase.from("heat_indices").select("id", { count: "exact", head: true });
      const { data: alerts } = await supabase.from("alerts").select("id", { count: "exact", head: true });

      return new Response(
        JSON.stringify({
          seeded: (wards as any)?.length > 0,
          counts: {
            wards: wards || 0,
            ndviRecords: ndvi || 0,
            heatRecords: heat || 0,
            alerts: alerts || 0,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'seed' or 'status'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Seed data error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
