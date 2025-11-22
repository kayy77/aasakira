import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Trading platform keywords for validation
const TRADING_KEYWORDS = [
  'MT4', 'MT5', 'MetaTrader', 'cTrader', 'TradingView',
  'Order', 'Buy', 'Sell', 'Long', 'Short',
  'SL', 'TP', 'Stop Loss', 'Take Profit',
  'Lot', 'Volume', 'Entry', 'Exit',
  'Profit', 'Loss', 'P/L', 'PNL',
  'Balance', 'Equity', 'Margin',
  'Ticket', 'Position', 'Trade',
  'EUR', 'USD', 'GBP', 'JPY', 'XAU', 'BTC', 'ETH',
  'EURUSD', 'GBPUSD', 'USDJPY', 'GOLD', 'XAUUSD'
];

// Non-trading content keywords (to reject KYC/ID documents)
const BLOCKED_KEYWORDS = [
  'Passport', 'Driver', 'License', 'ID Card', 'Birth Certificate',
  'Social Security', 'Identity', 'Citizenship', 'Visa',
  'Date of Birth', 'DOB', 'Nationality', 'Issued by'
];

function validateTradingScreenshot(text: string): { valid: boolean; reason?: string; confidence: number } {
  if (!text || text.length < 20) {
    return { valid: false, reason: 'Image text too short - may not be a valid screenshot', confidence: 0 };
  }

  const lowerText = text.toLowerCase();
  
  // Check for blocked content (KYC/IDs)
  let blockedHits = 0;
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      blockedHits++;
    }
  }
  
  if (blockedHits >= 2) {
    return { 
      valid: false, 
      reason: '⚠️ This appears to be a personal ID document, not a trading screenshot. Please upload broker trade history instead.', 
      confidence: 0 
    };
  }

  // Check for trading keywords
  let tradingHits = 0;
  for (const keyword of TRADING_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      tradingHits++;
    }
  }

  const confidence = Math.min(100, (tradingHits / 5) * 100);

  if (tradingHits < 2) {
    return { 
      valid: false, 
      reason: 'This doesn\'t appear to be a broker trading screenshot. Please upload a trade history, order confirmation, or position summary from your broker.', 
      confidence 
    };
  }

  return { valid: true, confidence };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    
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

    console.log('🔍 Step 1: Performing initial AI vision scan...');

    // First pass: Quick validation and text extraction
    const validationResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
                text: `Is this a trading/broker screenshot? Extract ALL visible text and trading-related information. 
Return JSON:
{
  "is_trading_screenshot": true/false,
  "platform": "name if visible",
  "visible_text": "all text you can see",
  "contains_trades": true/false
}`
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

    if (!validationResponse.ok) {
      throw new Error(`AI validation failed: ${validationResponse.status}`);
    }

    const validationData = await validationResponse.json();
    const validationContent = validationData.choices?.[0]?.message?.content;
    
    console.log('📝 Validation response:', validationContent);

    let validationResult;
    try {
      const jsonMatch = validationContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        validationResult = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.log('⚠️ Could not parse validation JSON, proceeding with text check');
    }

    // Perform keyword validation on extracted text
    const extractedText = validationResult?.visible_text || validationContent || '';
    const validation = validateTradingScreenshot(extractedText);

    if (!validation.valid) {
      console.log('❌ Screenshot validation failed:', validation.reason);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: validation.reason,
          userMessage: validation.reason,
          confidence: validation.confidence
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`✅ Screenshot validated (confidence: ${validation.confidence}%)`);
    console.log('🔍 Step 2: Extracting detailed trade information...');

    // Second pass: Detailed trade extraction
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
                text: `This is a VERIFIED trading screenshot. Extract precise trade information:

REQUIRED FIELDS:
- Currency pair (normalize: EUR/USD → EURUSD, XAU/USD → XAUUSD, BTC/USD → BTCUSD)
- Entry price (exact number)
- Direction (must be exactly "LONG" or "SHORT")

OPTIONAL FIELDS (extract if visible):
- Exit price
- Lot size / Volume
- Profit/Loss (in USD if possible, convert from pips if needed)
- Strategy/setup notes
- Order type (market/limit/stop)

VALIDATION RULES:
1. Pair must be valid forex/crypto/commodity (e.g., EURUSD, XAUUSD, BTCUSD)
2. Prices must be realistic for that instrument
3. Direction must be LONG or SHORT (not Buy/Sell)
4. If P/L is shown, extract the final USD amount

Return ONLY valid JSON (no markdown, no extra text):
{
  "pair": "EURUSD",
  "entry_price": 1.0850,
  "exit_price": 1.0920,
  "direction": "LONG",
  "lot_size": 0.1,
  "pnl": 70.00,
  "strategy": "Breakout",
  "confidence": 95
}

If any required field is missing or unclear, include "confidence": <percentage> to indicate certainty.`
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI extraction error:', response.status, errorText);
      throw new Error(`AI extraction failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('📊 Extraction response:', content);

    // Parse the JSON response
    let tradeData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        tradeData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (e) {
      console.error('⚠️ Failed to parse AI response:', e);
      throw new Error('Could not parse trade data from image. Try uploading a clearer screenshot.');
    }

    // Validate required fields
    if (!tradeData.pair || !tradeData.entry_price || !tradeData.direction) {
      console.error('❌ Missing required fields:', tradeData);
      throw new Error('Could not extract complete trade information. Make sure pair, entry price, and direction are visible in the screenshot.');
    }

    // Normalize direction
    if (tradeData.direction) {
      const dir = tradeData.direction.toUpperCase();
      if (dir === 'BUY') tradeData.direction = 'LONG';
      if (dir === 'SELL') tradeData.direction = 'SHORT';
    }

    // Normalize pair (remove slashes, ensure uppercase)
    if (tradeData.pair) {
      tradeData.pair = tradeData.pair.replace(/[\/\s]/g, '').toUpperCase();
    }

    // Validate pair format (basic check)
    if (tradeData.pair && !/^[A-Z]{6,8}$/.test(tradeData.pair)) {
      console.log('⚠️ Unusual pair format:', tradeData.pair);
    }

    // Add metadata
    const confidence = tradeData.confidence || validation.confidence;
    delete tradeData.confidence; // Remove from tradeData

    console.log('✅ Successfully extracted trade data:', tradeData);
    console.log(`📈 Extraction confidence: ${confidence}%`);

    return new Response(
      JSON.stringify({ 
        success: true,
        tradeData,
        metadata: {
          confidence,
          validation: validation.valid ? 'passed' : 'failed',
          platform: validationResult?.platform || 'unknown',
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
