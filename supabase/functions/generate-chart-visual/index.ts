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

    const { prompt, model = 'black-forest-labs/flux-schnell', parameters = {} } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create prediction
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: model === 'black-forest-labs/flux-schnell' 
          ? 'f2ab8a5569a8f1e85d9d9c5a0e8d4e0f3a5a5a5a' 
          : model,
        input: {
          prompt: prompt,
          width: parameters.width || 1024,
          height: parameters.height || 768,
          num_inference_steps: parameters.num_inference_steps || 4,
          guidance_scale: parameters.guidance_scale || 3.5,
          output_format: 'webp',
          output_quality: 80,
          ...parameters
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Replicate API error:', errorText)
      throw new Error(`Replicate API error: ${response.status} ${errorText}`)
    }

    const prediction = await response.json()
    
    // Wait for completion (with timeout)
    const maxWaitTime = 60000 // 60 seconds
    const startTime = Date.now()
    
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('Generation timeout')
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        },
      })
      
      const statusData = await statusResponse.json()
      if (statusData.status === 'succeeded' || statusData.status === 'failed') {
        Object.assign(prediction, statusData)
        break
      }
    }

    if (prediction.status === 'failed') {
      throw new Error(`Generation failed: ${prediction.error}`)
    }

    return new Response(
      JSON.stringify({ 
        output: prediction.output,
        status: prediction.status,
        id: prediction.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate-chart-visual function:', error)
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