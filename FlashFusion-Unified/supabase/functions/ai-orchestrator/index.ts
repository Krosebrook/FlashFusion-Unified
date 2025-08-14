import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIRequest {
  model: string;
  prompt: string;
  context?: string;
  temperature?: number;
  max_tokens?: number;
  user_id?: string;
}

interface AIResponse {
  id: string;
  response: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
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

    const requestData: AIRequest = await req.json()
    
    // Validate request
    if (!requestData.prompt || !requestData.model) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: prompt and model' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Prepare AI request based on model
    let aiResponse: AIResponse;

    switch (requestData.model.toLowerCase()) {
      case 'claude':
      case 'anthropic':
        aiResponse = await callClaude(requestData);
        break;
      case 'gpt':
      case 'openai':
        aiResponse = await callOpenAI(requestData);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unsupported model: ${requestData.model}` }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
    }

    // Log the interaction
    const { error: logError } = await supabaseClient
      .from('ai_interactions')
      .insert({
        user_id: user.id,
        model: requestData.model,
        prompt: requestData.prompt,
        response: aiResponse.response,
        tokens_used: aiResponse.usage.total_tokens,
        context: requestData.context,
        created_at: new Date().toISOString(),
      })

    if (logError) {
      console.error('Failed to log AI interaction:', logError)
    }

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('AI Orchestrator error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
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

async function callClaude(request: AIRequest): Promise<AIResponse> {
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
  
  if (!anthropicApiKey) {
    throw new Error('Anthropic API key not configured')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: request.max_tokens || 1000,
      temperature: request.temperature || 0.7,
      messages: [
        {
          role: 'user',
          content: request.context 
            ? `Context: ${request.context}\n\nPrompt: ${request.prompt}` 
            : request.prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${error}`)
  }

  const data = await response.json()
  
  return {
    id: data.id,
    response: data.content[0].text,
    model: 'claude-3-sonnet',
    usage: {
      prompt_tokens: data.usage.input_tokens,
      completion_tokens: data.usage.output_tokens,
      total_tokens: data.usage.input_tokens + data.usage.output_tokens,
    },
    timestamp: new Date().toISOString(),
  }
}

async function callOpenAI(request: AIRequest): Promise<AIResponse> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      max_tokens: request.max_tokens || 1000,
      temperature: request.temperature || 0.7,
      messages: [
        {
          role: 'user',
          content: request.context 
            ? `Context: ${request.context}\n\nPrompt: ${request.prompt}` 
            : request.prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  
  return {
    id: data.id,
    response: data.choices[0].message.content,
    model: data.model,
    usage: {
      prompt_tokens: data.usage.prompt_tokens,
      completion_tokens: data.usage.completion_tokens,
      total_tokens: data.usage.total_tokens,
    },
    timestamp: new Date().toISOString(),
  }
}

/* To deploy this function:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Login: supabase login
 * 3. Link to your project: supabase link --project-ref your-project-ref
 * 4. Set secrets:
 *    supabase secrets set ANTHROPIC_API_KEY=your_anthropic_key
 *    supabase secrets set OPENAI_API_KEY=your_openai_key
 * 5. Deploy: supabase functions deploy ai-orchestrator
 */