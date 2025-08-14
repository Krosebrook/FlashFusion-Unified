import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImageRequest {
  prompt: string;
  model?: string;
  size?: string;
  quality?: string;
  style?: string;
  n?: number;
  user_id?: string;
}

interface ImageResponse {
  id: string;
  url: string;
  prompt: string;
  model: string;
  size: string;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT token
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const requestData: ImageRequest = await req.json()
    
    // Validate request
    if (!requestData.prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: prompt' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Generate image with OpenAI DALL-E
    const imageResponse = await generateWithDALLE(requestData)

    // Save to database
    const { data: imageRecord, error: dbError } = await supabaseClient
      .from('generated_images')
      .insert({
        user_id: user.id,
        prompt: requestData.prompt,
        image_url: imageResponse.url,
        model: imageResponse.model,
        size: imageResponse.size,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error('Failed to save image record:', dbError)
      // Continue anyway, return the generated image
    }

    return new Response(JSON.stringify(imageResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Image generation error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Image generation failed',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function generateWithDALLE(request: ImageRequest): Promise<ImageResponse> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: request.model || 'dall-e-3',
      prompt: request.prompt,
      size: request.size || '1024x1024',
      quality: request.quality || 'standard',
      style: request.style || 'vivid',
      n: request.n || 1,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI DALL-E error: ${error}`)
  }

  const data = await response.json()
  
  if (!data.data || data.data.length === 0) {
    throw new Error('No image generated')
  }

  return {
    id: crypto.randomUUID(),
    url: data.data[0].url,
    prompt: request.prompt,
    model: request.model || 'dall-e-3',
    size: request.size || '1024x1024',
    timestamp: new Date().toISOString(),
  }
}

/* To deploy this function:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Login: supabase login
 * 3. Link to your project: supabase link --project-ref your-project-ref
 * 4. Set secrets:
 *    supabase secrets set OPENAI_API_KEY=your_openai_key
 * 5. Deploy: supabase functions deploy generate-image
 * 6. Create the generated_images table:
 *    CREATE TABLE generated_images (
 *      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *      prompt TEXT NOT NULL,
 *      image_url TEXT NOT NULL,
 *      model TEXT NOT NULL,
 *      size TEXT NOT NULL,
 *      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 *    );
 */