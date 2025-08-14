import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface ImageGenerationRequest {
  positivePrompt: string;
  model?: string;
  width?: number;
  height?: number;
  numberResults?: number;
  negativePrompt?: string;
  steps?: number;
  cfgScale?: number;
}

interface RunwarePayload {
  taskType: string;
  apiKey?: string;
  taskUUID?: string;
  positivePrompt?: string;
  negativePrompt?: string;
  model?: string;
  width?: number;
  height?: number;
  numberResults?: number;
  outputFormat?: string;
  CFGScale?: number;
  scheduler?: string;
  strength?: number;
  steps?: number;
}

interface RateLimitRecord {
  request_count: number;
  window_start: string;
}

interface UserActivityData {
  prompt: string;
  model: string;
  dimensions: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Verify JWT and extract user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        error: 'Unauthorized - No token provided'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client to verify token
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response(JSON.stringify({
        error: 'Server configuration error'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({
        error: 'Unauthorized - Invalid token'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Rate limiting check - improved with better error handling
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: rateData, error: rateError } = await supabase
      .from('api_rate_limits')
      .select('request_count, window_start')
      .eq('user_id', user.id)
      .eq('endpoint', 'generate-image')
      .gte('window_start', oneHourAgo)
      .maybeSingle();

    if (rateError) {
      console.error('Rate limit check error:', rateError);
    }

    const currentRequests = rateData?.request_count || 0;
    const rateLimit = 50; // requests per hour

    if (currentRequests >= rateLimit) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded - 50 requests per hour',
        resetTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      }), {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil((Date.now() + 60 * 60 * 1000) / 1000).toString()
        }
      });
    }

    const RUNWARE_API_KEY = Deno.env.get('RUNWARE_API_KEY');
    if (!RUNWARE_API_KEY) {
      console.error('RUNWARE_API_KEY is not set');
      return new Response(JSON.stringify({
        error: 'API key not configured'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }

    // Parse and validate request body
    let requestBody: ImageGenerationRequest;
    try {
      requestBody = await req.json();
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Invalid JSON in request body'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    const { 
      positivePrompt, 
      model = "runware:100@1", 
      width = 1024, 
      height = 1024, 
      numberResults = 1,
      negativePrompt = "",
      steps = 4,
      cfgScale = 1
    } = requestBody;

    // Enhanced validation
    if (!positivePrompt || typeof positivePrompt !== 'string' || positivePrompt.trim().length === 0) {
      return new Response(JSON.stringify({
        error: 'Valid positivePrompt is required'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    // Validate dimensions
    if (width < 256 || width > 2048 || height < 256 || height > 2048) {
      return new Response(JSON.stringify({
        error: 'Width and height must be between 256 and 2048 pixels'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    // Validate number of results
    if (numberResults < 1 || numberResults > 4) {
      return new Response(JSON.stringify({
        error: 'numberResults must be between 1 and 4'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    // Enhanced content moderation
    const blockedTerms = [
      'nude', 'nsfw', 'explicit', 'pornographic', 'sexual',
      'naked', 'erotic', 'adult', 'xxx', 'porn',
      'violence', 'blood', 'gore', 'death', 'killing',
      'hate', 'racist', 'terrorism', 'drugs', 'illegal'
    ];
    
    const lowerPrompt = positivePrompt.toLowerCase();
    const violatingTerms = blockedTerms.filter(term => lowerPrompt.includes(term));
    
    if (violatingTerms.length > 0) {
      console.log(`Content policy violation detected for user ${user.id}:`, violatingTerms);
      
      // Log the violation
      await supabase.from('content_violations').insert({
        user_id: user.id,
        content_type: 'image_prompt',
        content: positivePrompt,
        violation_terms: violatingTerms,
        created_at: new Date().toISOString()
      });

      return new Response(JSON.stringify({
        error: 'Content policy violation detected',
        violatingTerms: violatingTerms
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log(`Generating image for user ${user.id} with prompt:`, positivePrompt.substring(0, 100) + '...');

    // Create the payload for Runware API with enhanced parameters
    const payload: RunwarePayload[] = [
      {
        taskType: "authentication",
        apiKey: RUNWARE_API_KEY
      },
      {
        taskType: "imageInference",
        taskUUID: crypto.randomUUID(),
        positivePrompt: positivePrompt.trim(),
        negativePrompt: negativePrompt.trim(),
        model,
        width,
        height,
        numberResults,
        outputFormat: "WEBP",
        CFGScale: cfgScale,
        scheduler: "FlowMatchEulerDiscreteScheduler",
        strength: 0.8,
        steps
      }
    ];

    console.log('Sending request to Runware API...');
    
    // Add timeout and retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'FlashFusion-ImageGenerator/1.0'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Runware API error:', response.status, errorText);
        
        // Log API failures
        await supabase.from('api_failures').insert({
          user_id: user.id,
          api_provider: 'runware',
          error_code: response.status,
          error_message: errorText,
          request_data: { prompt: positivePrompt, model, width, height },
          created_at: new Date().toISOString()
        });

        return new Response(JSON.stringify({
          error: 'Image generation failed',
          details: `API returned ${response.status}`,
          retryAfter: response.status === 429 ? '60' : undefined
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            ...(response.status === 429 && { 'Retry-After': '60' })
          },
          status: response.status === 429 ? 429 : 500
        });
      }

      const result = await response.json();
      console.log('Runware API response received');

      // Find the image inference result
      const imageResult = result.data?.find((item: any) => item.taskType === 'imageInference');
      
      if (!imageResult || !imageResult.imageURL) {
        console.error('No image URL in response:', result);
        return new Response(JSON.stringify({
          error: 'No image generated',
          details: 'API did not return a valid image'
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 500
        });
      }

      // Update rate limiting with upsert
      const now = new Date().toISOString();
      const { error: rateLimitError } = await supabase
        .from('api_rate_limits')
        .upsert({
          user_id: user.id,
          endpoint: 'generate-image',
          request_count: currentRequests + 1,
          window_start: rateData?.window_start || now,
          updated_at: now
        }, {
          onConflict: 'user_id,endpoint'
        });

      if (rateLimitError) {
        console.error('Rate limit update error:', rateLimitError);
      }

      // Log the successful generation with more details
      const { error: activityError } = await supabase.from('user_activity').insert({
        user_id: user.id,
        activity_type: 'image_generated',
        activity_data: {
          prompt: positivePrompt,
          model,
          dimensions: `${width}x${height}`,
          steps,
          cfgScale,
          seed: imageResult.seed,
          cost: imageResult.cost || 0,
          generation_time: Date.now() - Date.parse(now)
        } as UserActivityData,
        created_at: now
      });

      if (activityError) {
        console.error('Activity logging error:', activityError);
      }

      // Return the successful result with enhanced metadata
      return new Response(JSON.stringify({
        success: true,
        data: {
          imageURL: imageResult.imageURL,
          imageUUID: imageResult.imageUUID,
          prompt: positivePrompt,
          seed: imageResult.seed,
          NSFWContent: imageResult.NSFWContent || false,
          cost: imageResult.cost || 0,
          model,
          dimensions: { width, height },
          parameters: { steps, cfgScale }
        },
        metadata: {
          generatedAt: now,
          userId: user.id,
          requestsRemaining: rateLimit - (currentRequests + 1)
        }
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': (rateLimit - (currentRequests + 1)).toString()
        },
        status: 200
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('Request timeout');
        return new Response(JSON.stringify({
          error: 'Request timeout - image generation took too long',
          timeout: 30000
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 504
        });
      }
      
      throw fetchError; // Re-throw other fetch errors
    }

  } catch (error) {
    console.error('Error in generate-image function:', error);
    
    return new Response(JSON.stringify({
      error: 'An unexpected error occurred',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});

// Export for potential testing
export { serve };