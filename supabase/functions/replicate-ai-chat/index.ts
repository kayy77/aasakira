
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN')
    if (!REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not configured')
    }

    const { prompt, model = 'meta/llama-2-70b-chat', max_tokens = 500, temperature = 0.7 } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('🤖 Creating Replicate prediction with prompt:', prompt.substring(0, 100) + '...')

    // Create prediction
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: model === 'meta/llama-2-70b-chat' 
          ? 'f4e2de70d66816a838a89eeeb621910adffb0dd0baba3976c96980970978018d'
          : model,
        input: {
          prompt: prompt,
          max_new_tokens: max_tokens,
          temperature: temperature,
          top_p: 0.9,
          repetition_penalty: 1.15,
          system_prompt: "You are a helpful, harmless, and honest assistant."
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Replicate API error:', errorText)
      throw new Error(`Replicate API error: ${response.status} ${errorText}`)
    }

    const prediction = await response.json()
    console.log('✅ Prediction created:', prediction.id)
    
    // Poll for completion (with timeout)
    const maxWaitTime = 45000 // 45 seconds
    const startTime = Date.now()
    let currentPrediction = prediction
    
    while (currentPrediction.status !== 'succeeded' && currentPrediction.status !== 'failed') {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('AI response timeout - please try again')
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        },
      })
      
      if (statusResponse.ok) {
        currentPrediction = await statusResponse.json()
        console.log('Status check:', currentPrediction.status)
      }
    }

    if (currentPrediction.status === 'failed') {
      throw new Error(`Generation failed: ${currentPrediction.error}`)
    }

    console.log('✅ AI response generated successfully')

    return new Response(
      JSON.stringify({ 
        output: currentPrediction.output,
        status: currentPrediction.status,
        id: currentPrediction.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in replicate-ai-chat function:', error)
    return new Response(
      JSON.stringify({ 
        error: (error instanceof Error ? error.message : String(error)) || 'Internal server error',
        status: 'error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
