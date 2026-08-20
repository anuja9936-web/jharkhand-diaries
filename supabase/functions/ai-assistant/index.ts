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

CRITICAL GROUNDING RULES:
1. Ground your knowledge ONLY in authentic Jharkhand geography, 24 districts, culture, and provided context.
2. NEVER hallucinate non-existent hotels, imaginary prices, or fake destinations.
3. If an inquiry asks about places outside Jharkhand or unavailable services, politely clarify and redirect to Jharkhand destinations.
4. Keep a warm, respectful, and enthusiastic tone starting with or honoring the traditional Jharkhandi greeting "Johar!".
5. Always highlight eco-tourism guidelines and respect for indigenous tribal traditions (Sarna Sthal, Sacred Groves).
6. Mention active government safety advisories if relevant.`;

    let messagesToSend: Array<{ role: string; content: string }> = [];
    let responseFormat: Record<string, string> | undefined = undefined;

    if (action === 'chat') {
      const userMessages = body.messages || [{ role: 'user', content: body.prompt || 'Johar!' }];
      const contextSummary = body.context
        ? `\n\nAVAILABLE VERIFIED CONTEXT:\nDestinations: ${JSON.stringify(body.context.destinations || [])}\nOfferings & Stays: ${JSON.stringify(body.context.offerings || [])}\nActive Safety Alerts: ${JSON.stringify(body.context.alerts || [])}`
        : '';

      messagesToSend = [
        {
          role: 'system',
          content: `${baseSystemPrompt}\n\nYou are having a conversational travel discovery chat. Provide rich, insightful, formatted markdown advice with bullet points for attractions, cultural context, cuisine (Dhuska, Rugra, Arsa), and travel tips.${contextSummary}`,
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
