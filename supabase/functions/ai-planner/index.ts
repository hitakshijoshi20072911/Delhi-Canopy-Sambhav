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
// AI PLANTATION STRATEGY ENGINE
// Multi-Agent System Simulation
// ============================================

/**
 * Vision Agent - Analyzes satellite and environmental data
 */
function visionAgentAnalyze(params: {
  ndvi: number;
  greenCoverPercent: number;
  heatIndex: number;
  landSurfaceTemp: number;
}): {
  vegetationStatus: string;
  thermalStatus: string;
  coverageGap: number;
  priorityLevel: number;
} {
  const TARGET_GREEN_COVER = 33; // Delhi's target
  const coverageGap = Math.max(0, TARGET_GREEN_COVER - params.greenCoverPercent);

  let vegetationStatus: string;
  if (params.ndvi < 0.1) vegetationStatus = "critically_low";
  else if (params.ndvi < 0.2) vegetationStatus = "sparse";
  else if (params.ndvi < 0.35) vegetationStatus = "moderate";
  else vegetationStatus = "adequate";

  let thermalStatus: string;
  if (params.heatIndex >= 90) thermalStatus = "extreme_heat";
  else if (params.heatIndex >= 75) thermalStatus = "high_heat";
  else if (params.heatIndex >= 50) thermalStatus = "moderate_heat";
  else thermalStatus = "normal";

  // Priority calculation (0-100)
  const priorityLevel = Math.min(100, Math.round(
    (coverageGap * 2) + (params.heatIndex * 0.3) + ((0.5 - params.ndvi) * 50)
  ));

  return { vegetationStatus, thermalStatus, coverageGap, priorityLevel };
}

/**
 * Correlation Agent - Links heat stress to vegetation deficiency
 */
function correlationAgentAnalyze(params: {
  heatIndex: number;
  greenCoverPercent: number;
  urbanDensity: number;
}): {
  heatVegetationCorrelation: number;
  urbanHeatAmplification: number;
  coolingPotential: number;
  treesPerDegree: number;
} {
  // Empirical correlation: each 1% green cover reduces heat index by ~0.3
  const COOLING_PER_PERCENT = 0.3;
  const TREES_PER_PERCENT = 15; // Approximately 15 trees per 1% coverage in urban area

  const heatVegetationCorrelation = -0.67 + (Math.random() * 0.1); // Negative correlation
  const urbanHeatAmplification = (params.urbanDensity / 100) * 1.5; // °C amplification

  const targetCooling = Math.max(0, (params.heatIndex - 60) * 0.5); // Target comfortable index ~60
  const coolingPotential = targetCooling;
  const greenCoverNeeded = coolingPotential / COOLING_PER_PERCENT;
  const treesPerDegree = TREES_PER_PERCENT / COOLING_PER_PERCENT;

  return {
    heatVegetationCorrelation: Number(heatVegetationCorrelation.toFixed(2)),
    urbanHeatAmplification: Number(urbanHeatAmplification.toFixed(2)),
    coolingPotential: Number(coolingPotential.toFixed(2)),
    treesPerDegree: Math.round(treesPerDegree),
  };
}

/**
 * Strategy Agent - Generates actionable plantation recommendations
 */
function strategyAgentPlan(params: {
  wardName: string;
  wardArea: number;
  landType: string;
  coverageGap: number;
  priorityLevel: number;
  coolingPotential: number;
  urbanDensity: number;
}): {
  requiredTrees: number;
  estimatedHeatReduction: number;
  estimatedCO2Offset: number;
  estimatedCost: number;
  implementationTimeline: string;
  recommendedSpecies: string[];
  priorityScore: number;
  reasoning: string;
} {
  // Tree density calculations based on land type
  const TREES_PER_SQ_KM: Record<string, number> = {
    residential: 500,
    commercial: 300,
    industrial: 200,
    mixed_urban: 400,
    green_zone: 800,
    water_body: 100,
  };

  const treeDensity = TREES_PER_SQ_KM[params.landType] || 400;
  const requiredTrees = Math.round(
    (params.coverageGap / 100) * params.wardArea * treeDensity
  );

  // Heat reduction calculation (empirical: ~2.5°C per 100 trees per sq km)
  const heatReductionPerTree = 0.025 / params.wardArea;
  const estimatedHeatReduction = Math.min(5, requiredTrees * heatReductionPerTree);

  // CO2 offset (average mature tree absorbs ~21 kg CO2/year)
  const CO2_PER_TREE = 0.021; // tons per year
  const estimatedCO2Offset = requiredTrees * CO2_PER_TREE;

  // Cost estimation (average ₹500-1500 per tree including planting and initial care)
  const COST_PER_TREE: Record<string, number> = {
    residential: 800,
    commercial: 1200,
    industrial: 600,
    mixed_urban: 900,
    green_zone: 500,
    water_body: 1000,
  };
  const costPerTree = COST_PER_TREE[params.landType] || 800;
  const estimatedCost = requiredTrees * costPerTree;

  // Timeline based on scale
  let implementationTimeline: string;
  if (requiredTrees > 1000) implementationTimeline = "24-36 months";
  else if (requiredTrees > 500) implementationTimeline = "12-24 months";
  else if (requiredTrees > 200) implementationTimeline = "6-12 months";
  else implementationTimeline = "3-6 months";

  // Species recommendation based on Delhi conditions
  const speciesMap: Record<string, string[]> = {
    residential: ["Neem (Azadirachta indica)", "Peepal (Ficus religiosa)", "Jamun (Syzygium cumini)"],
    commercial: ["Ashoka (Saraca asoca)", "Gulmohar (Delonix regia)", "Amaltas (Cassia fistula)"],
    industrial: ["Arjun (Terminalia arjuna)", "Sheesham (Dalbergia sissoo)", "Khejri (Prosopis cineraria)"],
    mixed_urban: ["Neem", "Peepal", "Banyan (Ficus benghalensis)", "Mango (Mangifera indica)"],
    green_zone: ["Sal (Shorea robusta)", "Teak (Tectona grandis)", "Bamboo (Bambusa)"],
    water_body: ["Willow (Salix)", "Eucalyptus", "Poplar (Populus)"],
  };
  const recommendedSpecies = speciesMap[params.landType] || speciesMap.mixed_urban;

  // Priority score (0-100)
  const priorityScore = Math.round(
    (params.priorityLevel * 0.4) +
    (params.coolingPotential * 5) +
    (params.coverageGap * 1.5) +
    (params.urbanDensity * 0.2)
  );

  // Generate reasoning text
  const reasoning = `${params.wardName} requires ${requiredTrees} trees to address ${params.coverageGap.toFixed(1)}% green cover deficit. ` +
    `This intervention can reduce local temperatures by up to ${estimatedHeatReduction.toFixed(1)}°C and offset ${estimatedCO2Offset.toFixed(0)} tons of CO₂ annually. ` +
    `${params.landType === 'industrial' ? 'Industrial zones prioritize pollution-resistant species. ' : ''}` +
    `Implementation across ${implementationTimeline} with estimated investment of ₹${(estimatedCost / 100000).toFixed(1)}L.`;

  return {
    requiredTrees,
    estimatedHeatReduction: Number(estimatedHeatReduction.toFixed(2)),
    estimatedCO2Offset: Number(estimatedCO2Offset.toFixed(2)),
    estimatedCost,
    implementationTimeline,
    recommendedSpecies,
    priorityScore: Math.min(100, priorityScore),
    reasoning,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace("/ai-planner", "");

  try {
    // POST /generate-plan - Generate plantation plan for a ward
    if (path === "/generate-plan" && req.method === "POST") {
      const { wardId, landType, urbanDensity } = await req.json();

      // Fetch ward data
      const { data: ward, error: wardError } = await supabase
        .from("wards")
        .select("*")
        .eq("id", wardId)
        .single();

      if (wardError) throw new Error("Ward not found");

      // Fetch latest environmental data
      const { data: ndvi } = await supabase
        .from("ndvi_scores")
        .select("*")
        .eq("ward_id", wardId)
        .order("observation_date", { ascending: false })
        .limit(1)
        .single();

      const { data: heat } = await supabase
        .from("heat_indices")
        .select("*")
        .eq("ward_id", wardId)
        .order("observation_date", { ascending: false })
        .limit(1)
        .single();

      // Default values if no data
      const currentNDVI = ndvi?.ndvi_value || 0.15;
      const greenCover = ndvi?.green_cover_percent || 15;
      const heatIndex = heat?.heat_index || 75;
      const landSurfaceTemp = heat?.land_surface_temp || 38;

      // Run multi-agent analysis
      console.log("Running Vision Agent analysis...");
      const visionResult = visionAgentAnalyze({
        ndvi: currentNDVI,
        greenCoverPercent: greenCover,
        heatIndex,
        landSurfaceTemp,
      });

      console.log("Running Correlation Agent analysis...");
      const correlationResult = correlationAgentAnalyze({
        heatIndex,
        greenCoverPercent: greenCover,
        urbanDensity: urbanDensity || 70,
      });

      console.log("Running Strategy Agent planning...");
      const strategyResult = strategyAgentPlan({
        wardName: ward.name,
        wardArea: ward.area_sq_km || 10,
        landType: landType || "mixed_urban",
        coverageGap: visionResult.coverageGap,
        priorityLevel: visionResult.priorityLevel,
        coolingPotential: correlationResult.coolingPotential,
        urbanDensity: urbanDensity || 70,
      });

      // Store the plan
      const { error: planError } = await supabase.from("plantation_plans").upsert({
        ward_id: wardId,
        plan_date: new Date().toISOString().split("T")[0],
        priority_score: strategyResult.priorityScore,
        required_trees: strategyResult.requiredTrees,
        recommended_species: strategyResult.recommendedSpecies,
        land_type: landType || "mixed_urban",
        estimated_heat_reduction: strategyResult.estimatedHeatReduction,
        estimated_co2_offset: strategyResult.estimatedCO2Offset,
        estimated_cost_inr: strategyResult.estimatedCost,
        implementation_timeline: strategyResult.implementationTimeline,
        ai_reasoning: strategyResult.reasoning,
        ai_confidence: 92,
        status: "proposed",
      });

      if (planError) throw planError;

      const response = {
        success: true,
        ward: { id: ward.id, name: ward.name },
        analysis: {
          vision: visionResult,
          correlation: correlationResult,
        },
        plan: strategyResult,
      };

      console.log(`Plan generated for ${ward.name}: ${strategyResult.requiredTrees} trees`);
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /plans - Get all plantation plans
    if (path === "/plans" && req.method === "GET") {
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const priority = url.searchParams.get("priority");

      let query = supabase
        .from("plantation_plans")
        .select("*, wards(name, zone)")
        .order("priority_score", { ascending: false })
        .limit(limit);

      if (priority) {
        query = query.gte("priority_score", priority === "high" ? 70 : priority === "medium" ? 40 : 0);
      }

      const { data: plans, error } = await query;
      if (error) throw error;

      // Format for frontend
      const formattedPlans = (plans || []).map((plan) => ({
        ward: `Ward ${plan.wards?.name || "Unknown"}`,
        priority: plan.priority_score >= 80 ? "CRITICAL" : plan.priority_score >= 60 ? "HIGH" : "MEDIUM",
        requiredTrees: plan.required_trees,
        heatReduction: plan.estimated_heat_reduction,
        carbonOffset: plan.estimated_co2_offset,
        urgencyIndex: plan.priority_score,
        landType: plan.land_type?.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "Mixed Urban",
        estimatedCost: `₹${(plan.estimated_cost_inr / 100000).toFixed(1)}L`,
        timeline: plan.implementation_timeline,
        species: plan.recommended_species,
        reasoning: plan.ai_reasoning,
      }));

      return new Response(JSON.stringify({ plans: formattedPlans }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /generate-all - Generate plans for all wards
    if (path === "/generate-all" && req.method === "POST") {
      const { data: wards } = await supabase.from("wards").select("id, name");

      const results = [];
      for (const ward of wards || []) {
        try {
          // Simulate varied land types
          const landTypes = ["residential", "commercial", "industrial", "mixed_urban"];
          const landType = landTypes[Math.floor(Math.random() * landTypes.length)];
          const urbanDensity = 50 + Math.random() * 50;

          // Get or simulate environmental data
          const { data: ndvi } = await supabase
            .from("ndvi_scores")
            .select("*")
            .eq("ward_id", ward.id)
            .order("observation_date", { ascending: false })
            .limit(1)
            .single();

          const { data: heat } = await supabase
            .from("heat_indices")
            .select("*")
            .eq("ward_id", ward.id)
            .order("observation_date", { ascending: false })
            .limit(1)
            .single();

          const visionResult = visionAgentAnalyze({
            ndvi: ndvi?.ndvi_value || 0.1 + Math.random() * 0.3,
            greenCoverPercent: ndvi?.green_cover_percent || 10 + Math.random() * 30,
            heatIndex: heat?.heat_index || 60 + Math.random() * 35,
            landSurfaceTemp: heat?.land_surface_temp || 35 + Math.random() * 10,
          });

          const correlationResult = correlationAgentAnalyze({
            heatIndex: heat?.heat_index || 70,
            greenCoverPercent: ndvi?.green_cover_percent || 20,
            urbanDensity,
          });

          const strategyResult = strategyAgentPlan({
            wardName: ward.name,
            wardArea: 8 + Math.random() * 15,
            landType,
            coverageGap: visionResult.coverageGap,
            priorityLevel: visionResult.priorityLevel,
            coolingPotential: correlationResult.coolingPotential,
            urbanDensity,
          });

          // Store plan
          await supabase.from("plantation_plans").upsert({
            ward_id: ward.id,
            plan_date: new Date().toISOString().split("T")[0],
            priority_score: strategyResult.priorityScore,
            required_trees: strategyResult.requiredTrees,
            recommended_species: strategyResult.recommendedSpecies,
            land_type: landType,
            estimated_heat_reduction: strategyResult.estimatedHeatReduction,
            estimated_co2_offset: strategyResult.estimatedCO2Offset,
            estimated_cost_inr: strategyResult.estimatedCost,
            implementation_timeline: strategyResult.implementationTimeline,
            ai_reasoning: strategyResult.reasoning,
            ai_confidence: 90,
            status: "proposed",
          });

          results.push({ wardId: ward.id, wardName: ward.name, plan: strategyResult });
        } catch (err) {
          console.error(`Error processing ward ${ward.id}:`, err);
        }
      }

      console.log(`Generated plans for ${results.length} wards`);
      return new Response(JSON.stringify({ success: true, count: results.length, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /ai-analysis - Use LLM for detailed analysis
    if (path === "/ai-analysis" && req.method === "POST") {
      const { wardId, analysisType } = await req.json();
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

      if (!LOVABLE_API_KEY) {
        return new Response(
          JSON.stringify({ error: "AI service not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch ward context
      const { data: ward } = await supabase.from("wards").select("*").eq("id", wardId).single();
      const { data: ndvi } = await supabase
        .from("ndvi_scores")
        .select("*")
        .eq("ward_id", wardId)
        .order("observation_date", { ascending: false })
        .limit(1)
        .single();
      const { data: heat } = await supabase
        .from("heat_indices")
        .select("*")
        .eq("ward_id", wardId)
        .order("observation_date", { ascending: false })
        .limit(1)
        .single();
      const { data: plan } = await supabase
        .from("plantation_plans")
        .select("*")
        .eq("ward_id", wardId)
        .order("plan_date", { ascending: false })
        .limit(1)
        .single();

      const prompt = `As an AI urban planning expert, analyze the following environmental data for ${ward?.name || "this ward"} and provide ${analysisType || "comprehensive"} recommendations:

Environmental Data:
- NDVI Score: ${ndvi?.ndvi_value || "N/A"}
- Green Cover: ${ndvi?.green_cover_percent || "N/A"}%
- Heat Index: ${heat?.heat_index || "N/A"}/100
- Land Surface Temperature: ${heat?.land_surface_temp || "N/A"}°C

Current Plan (if any):
- Required Trees: ${plan?.required_trees || "Not calculated"}
- Expected Heat Reduction: ${plan?.estimated_heat_reduction || "N/A"}°C

Provide a concise analysis with:
1. Current situation assessment
2. Key risks and vulnerabilities
3. Specific intervention recommendations
4. Expected outcomes with timeline

Keep response under 300 words and focus on actionable insights.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are an expert urban environmental planner specializing in climate resilience and green infrastructure." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error("AI analysis failed");
      }

      const aiResult = await response.json();
      const analysis = aiResult.choices?.[0]?.message?.content || "Analysis not available";

      return new Response(
        JSON.stringify({
          success: true,
          ward: ward?.name,
          analysis,
          metadata: {
            model: "gemini-3-flash-preview",
            analysisType,
            timestamp: new Date().toISOString(),
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
    console.error("AI Planner error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
