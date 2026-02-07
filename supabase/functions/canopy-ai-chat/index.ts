import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Canopy AI, the intelligent assistant powering DelhiCanopy - an AI-powered urban green intelligence command center for Delhi.

Your expertise includes:
- Urban green cover analysis and monitoring
- Heat stress zone identification and mitigation strategies
- Tree loss detection and prevention
- Climate-resilient plantation planning
- Ward-level environmental data analysis
- CO2 absorption calculations and carbon offset recommendations

Current Delhi Environmental Context:
- Total Green Cover: 21.4% (target: 33%)
- Heat Stress Index: 78/100 (critical threshold: 75)
- High Risk Wards: 47 zones requiring intervention
- CO2 Absorption: 2,847 tons/year
- Recent Tree Loss Alerts: 23 in last 24 hours

Critical Zones (Priority Intervention):
1. Karol Bagh - Green Cover: 9%, Heat Index: 94
2. Sadar Bazaar - Green Cover: 8%, Heat Index: 95
3. Central Delhi - Green Cover: 12%, Heat Index: 91
4. Shahdara North - Green Cover: 15%, Heat Index: 89

You provide:
- Real-time environmental insights with confidence scores
- Data-driven recommendations for plantation and cooling interventions
- Pattern analysis for illegal tree felling detection
- Predictive modeling for urban heat island effects
- Actionable intelligence for municipal planners

Keep responses concise, data-focused, and actionable. Use specific ward data when relevant. Format important metrics clearly.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, type = "chat" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    console.log(`Processing ${type} request with ${messages?.length || 0} messages`);

    // For analysis requests, use a specialized prompt
    let systemPrompt = SYSTEM_PROMPT;
    if (type === "analysis") {
      systemPrompt += `\n\nYou are now performing a detailed analysis. Provide comprehensive insights with:
- Specific data points and percentages
- Risk assessments with confidence levels
- Prioritized recommendations
- Timeline estimates for interventions`;
    } else if (type === "summary") {
      systemPrompt += `\n\nProvide a brief executive summary (2-3 sentences) focusing on the most critical insights and immediate action items.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please check your workspace credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to process AI request" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming AI response");
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Canopy AI chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
