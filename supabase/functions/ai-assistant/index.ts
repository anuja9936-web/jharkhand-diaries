import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ChatRequestBody {
  action: 'chat' | 'itinerary' | 'recommendations' | 'provider_writer' | 'admin_insights';
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  prompt?: string;
  userLocation?: string;
  context?: {
    destinations?: Array<{ name: string; slug: string; district: string; category: string; description?: string }>;
    offerings?: Array<{ name: string; kind: string; district: string; price?: number }>;
    alerts?: Array<{ title: string; district: string; description: string; severity: string }>;
    itineraryInput?: {
      days: number;
      startLocation: string;
      budgetTier: string;
      travellerType: string;
      interests: string[];
      travelIntensity: string;
    };
    providerInput?: {
      kind: string;
      title: string;
      district: string;
      keyHighlights: string;
    };
    adminInput?: {
      totalDestinations: number;
      totalProviders: number;
      totalOfferings: number;
      pendingFeedbackCount: number;
    };
  };
}

const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    const groqModel = Deno.env.get('GROQ_MODEL') || DEFAULT_GROQ_MODEL;

    if (!groqApiKey) {
      return new Response(
        JSON.stringify({
          error: 'GROQ_API_KEY is not configured in Supabase Edge Function secrets.',
          code: 'GROQ_KEY_MISSING',
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body: ChatRequestBody = await req.json().catch(() => ({ action: 'chat' }));
    const action = body.action || 'chat';

    // System prompt grounding
    const baseSystemPrompt = `You are "Johar AI — Jharkhand Tourism Assistant", the official AI travel intelligence guide for the state of Jharkhand, India (celebrated for its 24 districts, waterfalls, Betla National Park, Dalma Wildlife Sanctuary, Netarhat hill station, Patratu Valley, Baidyanath Jyotirlinga Dham, Sohrai GI-tagged mural art, and rich tribal heritage).

CRITICAL CONVERSATIONAL & GROUNDING RULES:
1. NATURAL-LANGUAGE INTENT HANDLING:
   - Accurately understand travel duration, starting locations, group styles, budgets, and themes from user queries.
   - If the user asks for short-duration trips (e.g. "where can I go for a 3 hour journey", "half day trip", "places near me") and their starting location is NOT specified or known from conversation context, ask a concise, friendly follow-up question:
     "Sure! I can suggest a few great short trips in Jharkhand. Where will you be starting from — Ranchi, Jamshedpur, Deoghar, Dhanbad, or another location?"
   - If the starting location is known (e.g. "from Ranchi", "near Jamshedpur"), directly recommend realistic excursions within that travel duration (approximate travel time & distance, e.g. "~45 mins drive / 35 km").
   - If the user asks about waterfalls, tribal arts, pilgrimage, or wildlife, recommend authentic destinations matching those categories from the dataset.
2. GROUNDING & ANTI-HALLUCINATION:
   - Ground your recommendations in authentic Jharkhand geography across its 24 districts.
   - Use only verified destinations, stays, and experiences provided in the context whenever available.
   - If travel times are approximate, explicitly state that they are approximate. Never invent fake transport or non-existent hotels.
   - If an inquiry asks about places outside Jharkhand, politely clarify and offer Jharkhand counterparts.
3. TONE & CULTURAL RESPECT:
   - Warm, knowledgeable, and hospitable with the traditional Jharkhandi greeting "Johar!".
   - Emphasize responsible eco-tourism and cultural respect for tribal heritage and sacred groves (Sarna Sthal).
   - Mention active government safety advisories if applicable.`;

    let messagesToSend: Array<{ role: string; content: string }> = [];
    let responseFormat: Record<string, string> | undefined = undefined;

    if (action === 'chat') {
      const userMessages = body.messages || [{ role: 'user', content: body.prompt || 'Johar!' }];
      const locationContext = body.userLocation ? `\nUser's Current Location/Gateway: ${body.userLocation}` : '';
      const contextSummary = body.context
        ? `\n\nAVAILABLE VERIFIED CONTEXT:\nDestinations: ${JSON.stringify(body.context.destinations || [])}\nOfferings & Stays: ${JSON.stringify(body.context.offerings || [])}\nActive Safety Alerts: ${JSON.stringify(body.context.alerts || [])}`
        : '';

      messagesToSend = [
        {
          role: 'system',
          content: `${baseSystemPrompt}\n\nYou are having a conversational travel discovery chat. Provide rich, formatted markdown advice with bullet points for attractions, travel time estimates, cultural notes, and local cuisine.${locationContext}${contextSummary}`,
        },
        ...userMessages,
      ];
    } else if (action === 'itinerary') {
      const input = body.context?.itineraryInput || {
        days: 3,
        startLocation: 'Ranchi',
        budgetTier: 'moderate',
        travellerType: 'couple',
        interests: ['waterfall', 'eco', 'culture'],
        travelIntensity: 'balanced',
      };

      const contextSummary = body.context
        ? `\n\nREAL VERIFIED DATA TO PICK FROM:\nDestinations: ${JSON.stringify(body.context.destinations || [])}\nStays: ${JSON.stringify(body.context.offerings?.filter((o) => o.kind === 'stay') || [])}\nActive Alerts: ${JSON.stringify(body.context.alerts || [])}`
        : '';

      messagesToSend = [
        {
          role: 'system',
          content: `${baseSystemPrompt}
You are an expert itinerary curator for Jharkhand. Generate a day-by-day travel itinerary strictly matching the user's parameters.
Return ONLY valid JSON matching this exact JSON Schema (no markdown code blocks, just raw JSON):
{
  "title": "string",
  "summary": "string",
  "daysCount": number,
  "startLocation": "string",
  "travellerType": "string",
  "travelIntensity": "string",
  "estimatedTotalBudget": {
    "min": number,
    "max": number,
    "currency": "INR"
  },
  "days": [
    {
      "dayNumber": number,
      "title": "string",
      "theme": "string",
      "district": "string",
      "schedule": [
        {
          "timeSlot": "Morning" | "Afternoon" | "Evening",
          "title": "string",
          "description": "string",
          "destinationSlug": "string (slug from context if matching)",
          "activityType": "sightseeing" | "adventure" | "culture" | "dining" | "relaxation",
          "durationHours": number
        }
      ],
      "recommendedStayName": "string",
      "recommendedTransportName": "string",
      "dayBudgetEstimate": number,
      "localTips": ["string"]
    }
  ],
  "activeAdvisories": ["string"],
  "curatorNote": "string"
}${contextSummary}`,
        },
        {
          role: 'user',
          content: `Create a ${input.days}-day itinerary starting from ${input.startLocation} for ${input.travellerType} travelers with a ${input.budgetTier} budget, ${input.travelIntensity} pace, and interests in: ${input.interests.join(', ')}.`,
        },
      ];
      responseFormat = { type: 'json_object' };
    } else if (action === 'provider_writer') {
      const input = body.context?.providerInput || {
        kind: 'stay',
        title: 'Netarhat Eco Stay',
        district: 'Latehar',
        keyHighlights: 'pine forest views, organic food',
      };

      messagesToSend = [
        {
          role: 'system',
          content: `${baseSystemPrompt}
You are an expert tourism copywriter helping verified local Jharkhand service providers create compelling, SEO-optimized, authentic listings for their offerings (${input.kind}).
Return ONLY valid JSON with this exact structure:
{
  "enhancedTitle": "string",
  "shortDescription": "string (1-2 sentences for cards)",
  "detailedDescription": "string (2-3 paragraphs showcasing local culture, comfort, and authenticity)",
  "amenitiesOrHighlights": ["string", "string", "string", "string"],
  "safetyNotes": "string"
}`,
        },
        {
          role: 'user',
          content: `Generate listing content for a ${input.kind} titled "${input.title}" located in ${input.district} with highlights: "${input.keyHighlights}".`,
        },
      ];
      responseFormat = { type: 'json_object' };
    } else if (action === 'admin_insights') {
      const input = body.context?.adminInput || {
        totalDestinations: 24,
        totalProviders: 18,
        totalOfferings: 42,
        pendingFeedbackCount: 3,
      };

      messagesToSend = [
        {
          role: 'system',
          content: `${baseSystemPrompt}
You are a strategic tourism governance AI analyst for the Department of Tourism, Government of Jharkhand.
Analyze the administrative summary and return ONLY valid JSON with this structure:
{
  "insights": [
    {
      "category": "growth" | "eco_alert" | "artisan" | "demand",
      "title": "string",
      "insight": "string",
      "actionRecommendation": "string",
      "urgency": "high" | "medium" | "low"
    }
  ]
}`,
        },
        {
          role: 'user',
          content: `Analyze Jharkhand tourism dashboard data: Total Destinations: ${input.totalDestinations}, Registered Providers: ${input.totalProviders}, Published Offerings: ${input.totalOfferings}, Pending Feedback: ${input.pendingFeedbackCount}.`,
        },
      ];
      responseFormat = { type: 'json_object' };
    }

    // Call Groq API via standard OpenAI-compatible endpoint
    const groqPayload: Record<string, unknown> = {
      model: groqModel,
      messages: messagesToSend,
      temperature: action === 'itinerary' || action === 'admin_insights' ? 0.2 : 0.6,
      max_tokens: 2048,
    };

    if (responseFormat) {
      groqPayload.response_format = responseFormat;
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify(groqPayload),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('[Groq Edge Function] API error:', groqResponse.status, errorText);

      return new Response(
        JSON.stringify({
          error: `Groq API returned status ${groqResponse.status}`,
          details: errorText,
          code: 'GROQ_API_ERROR',
        }),
        {
          status: groqResponse.status === 429 ? 429 : 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const groqData = await groqResponse.json();
    const assistantContent = groqData.choices?.[0]?.message?.content || '';

    return new Response(
      JSON.stringify({
        success: true,
        action,
        model: groqModel,
        content: assistantContent,
        usage: groqData.usage,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Groq Edge Function] Unexpected error:', errorMsg);

    return new Response(
      JSON.stringify({
        error: 'Internal server error processing AI request',
        details: errorMsg,
        code: 'INTERNAL_ERROR',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
