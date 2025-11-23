import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Lightweight KYC/ID detection (only reject obvious personal documents)
const BLOCKED_KEYWORDS = [
  'Passport', 'Driver License', 'ID Card', 'Birth Certificate',
  'Social Security', 'Citizenship', 'Visa', 'Issued by', 'Nationality'
];

// Simple check to reject obvious KYC documents (but don't block trading screenshots)
function isObviousKYCDocument(text: string): boolean {
  if (!text || text.length < 20) return false;
  
  const lowerText = text.toLowerCase();
  let blockedHits = 0;
  
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      blockedHits++;
    }
  }
  
  // Only reject if we have strong evidence it's a KYC doc (3+ hits)
  return blockedHits >= 3;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    
    console.log('📥 Received image data, length:', imageData?.length || 0);
    
    if (!imageData) {
      throw new Error('No image data provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Prepare the image for vision analysis
    const base64Image = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData;

    console.log('🔍 Starting AI vision analysis (Gemini 2.5 Flash)...');

    // Single-pass analysis: extract all trades in one call
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image and extract ALL trades/positions visible.

IMPORTANT: This could be from ANY trading platform:
- MetaTrader 4/5 (MT4/MT5)
- cTrader
- Deriv
- Binance
- TradingView
- Mobile broker apps
- Or any other platform

For EACH trade/position you find, extract:
- Pair/Symbol (e.g., EURUSD, XAUUSD, BTCUSD, etc.)
- Direction: "Buy" or "Sell" (will be normalized to LONG/SHORT)
- Entry Price (exact number)
- Exit Price (if closed)
- Lot Size / Volume (if visible)
- Profit/Loss in USD (if visible)
- Date/Time (if visible)

EXTRACTION RULES:
1. Extract ALL trades you can see (not just one)
2. Handle various formats: tables, lists, cards, mobile views
3. Normalize pairs: EUR/USD → EURUSD, XAU/USD → XAUUSD
4. If image quality is low, extract what you can and mark confidence as lower
5. If this is NOT a trading screenshot (e.g., passport, random photo), return: {"is_trading_screenshot": false, "reason": "description"}

Return ONLY valid JSON (no markdown):
{
  "is_trading_screenshot": true,
  "platform": "MT4" | "MT5" | "cTrader" | "Deriv" | "Binance" | "Other",
  "trades": [
    {
      "pair": "EURUSD",
      "direction": "Buy",
      "entry_price": 1.0850,
      "exit_price": 1.0920,
      "lot_size": 0.1,
      "pnl": 70.00,
      "confidence": 95
    }
  ]
}

If NO trades found but image looks trading-related, return empty trades array.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ]
      })
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('❌ AI analysis failed:', analysisResponse.status, errorText);
      throw new Error(`AI analysis failed: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    const content = analysisData.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('📊 AI Response:', content);

    // Parse the JSON response
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (e) {
      console.error('⚠️ Failed to parse AI response:', e);
      throw new Error('Could not parse AI response. Try uploading a clearer screenshot.');
    }

    // Check if it's a trading screenshot
    if (result.is_trading_screenshot === false) {
      console.log('❌ Not a trading screenshot:', result.reason);
      
      // Additional KYC check
      const textContent = content.toLowerCase();
      if (isObviousKYCDocument(textContent)) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'kyc_document',
            userMessage: '⚠️ This appears to be a personal ID document. Please upload a broker trade history or order confirmation instead.'
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'not_trading_screenshot',
          userMessage: result.reason || 'This doesn\'t appear to be a broker trading screenshot. Please upload trade history, order confirmation, or position summary.'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate trades array
    if (!result.trades || !Array.isArray(result.trades) || result.trades.length === 0) {
      console.log('❌ No trades found in screenshot');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'no_trades_found',
          userMessage: 'Could not find any trade information in the screenshot. Make sure the trade details (pair, entry, direction) are clearly visible.'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`✅ Found ${result.trades.length} trade(s) in screenshot`);

    // Process and normalize all trades
    const normalizedTrades = result.trades.map((trade: any, index: number) => {
      console.log(`🔄 Processing trade ${index + 1}:`, trade);
      
      // Normalize direction
      let direction = trade.direction?.toUpperCase() || 'LONG';
      if (direction === 'BUY') direction = 'LONG';
      if (direction === 'SELL') direction = 'SHORT';
      
      // Normalize pair
      let pair = trade.pair?.replace(/[\/\s]/g, '').toUpperCase() || 'UNKNOWN';
      
      // Validate required fields
      if (!trade.entry_price) {
        console.warn(`⚠️ Trade ${index + 1} missing entry_price`);
      }
      
      return {
        pair,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price,
        direction,
        lot_size: trade.lot_size,
        pnl: trade.pnl,
        strategy: trade.strategy,
        confidence: trade.confidence || 80
      };
    });

    // Filter out trades with missing critical data
    const validTrades = normalizedTrades.filter((t: any) => t.pair && t.entry_price && t.direction);
    
    if (validTrades.length === 0) {
      console.log('❌ No valid trades after normalization');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'incomplete_data',
          userMessage: 'Could not extract complete trade information. Make sure pair, entry price, and buy/sell direction are clearly visible.'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`✅ Successfully extracted ${validTrades.length} valid trade(s)`);
    
    // For single trade, return as object (backward compatibility)
    // For multiple trades, return as array
    const tradeData = validTrades.length === 1 ? validTrades[0] : validTrades;
    const avgConfidence = validTrades.reduce((sum: number, t: any) => sum + (t.confidence || 80), 0) / validTrades.length;

    return new Response(
      JSON.stringify({ 
        success: true,
        tradeData,
        metadata: {
          confidence: Math.round(avgConfidence),
          platform: result.platform || 'unknown',
          tradeCount: validTrades.length,
          extractedAt: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error analyzing screenshot:', error);
    
    // Provide user-friendly error messages
    let userMessage = 'Failed to analyze screenshot. ';
    if (error instanceof Error) {
      if (error.message.includes('LOVABLE_API_KEY')) {
        userMessage += 'AI service not configured. Please contact support.';
      } else if (error.message.includes('Could not extract')) {
        userMessage += error.message;
      } else if (error.message.includes('Incomplete')) {
        userMessage += 'Could not find all required trade information. Make sure your screenshot shows the pair, entry price, and buy/sell direction clearly.';
      } else {
        userMessage += 'Please try uploading a clearer screenshot showing your trade details.';
      }
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        userMessage
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
