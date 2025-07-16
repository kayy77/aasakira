
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignalEmailRequest {
  email: string;
  signal: {
    symbol: string;
    type: string;
    confidence: number;
    entry: number;
    stopLoss: number;
    takeProfit: number;
    rr: number;
    origin: any;
    tradeType: string;
    riskLevel: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, signal }: SignalEmailRequest = await req.json();
    
    console.log('📧 Processing signal email for:', email, 'Signal:', signal.symbol);

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    // Count frameworks that passed
    const frameworksPassed = Object.values(signal.origin).filter(Boolean).length;
    const confidenceLevel = signal.confidence >= 90 ? 'PREMIUM' : 
                           signal.confidence >= 80 ? 'HIGH' : 
                           signal.confidence >= 70 ? 'MEDIUM' : 'STANDARD';

    // Generate branded HTML email with embedded styling
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Aasakira AI Signal</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              margin: 0;
              padding: 0;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
              color: #ffffff;
              line-height: 1.6;
            }
            
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
              border: 2px solid #ec4899;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(236, 72, 153, 0.3);
            }
            
            .header {
              background: linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%);
              padding: 24px;
              text-align: center;
            }
            
            .logo {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
              color: #ffffff;
            }
            
            .subtitle {
              font-size: 14px;
              opacity: 0.9;
              margin: 0;
            }
            
            .signal-card {
              background: linear-gradient(135deg, #1e1e2e 0%, #2d2d3a 100%);
              margin: 24px;
              border-radius: 12px;
              border: 1px solid rgba(236, 72, 153, 0.3);
              overflow: hidden;
            }
            
            .signal-header {
              background: linear-gradient(90deg, rgba(236, 72, 153, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
              padding: 20px;
              text-align: center;
              border-bottom: 1px solid rgba(236, 72, 153, 0.2);
            }
            
            .signal-pair {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 8px;
              color: ${signal.type === 'BUY' ? '#10b981' : '#ef4444'};
            }
            
            .signal-type {
              display: inline-block;
              padding: 6px 16px;
              background: ${signal.type === 'BUY' ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #ef4444, #dc2626)'};
              border-radius: 20px;
              font-weight: 600;
              font-size: 14px;
              text-transform: uppercase;
            }
            
            .badges {
              display: flex;
              justify-content: center;
              gap: 12px;
              margin-top: 16px;
              flex-wrap: wrap;
            }
            
            .badge {
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
              text-transform: uppercase;
            }
            
            .confidence-badge {
              background: linear-gradient(90deg, #f59e0b, #d97706);
              color: #ffffff;
            }
            
            .frameworks-badge {
              background: linear-gradient(90deg, #8b5cf6, #7c3aed);
              color: #ffffff;
            }
            
            .trade-details {
              padding: 24px;
            }
            
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 20px;
            }
            
            .detail-item {
              background: rgba(255, 255, 255, 0.05);
              padding: 16px;
              border-radius: 8px;
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .detail-label {
              font-size: 12px;
              color: #9ca3af;
              text-transform: uppercase;
              font-weight: 500;
              margin-bottom: 4px;
            }
            
            .detail-value {
              font-size: 18px;
              font-weight: 600;
              color: #ffffff;
              font-family: 'Monaco', 'Menlo', monospace;
            }
            
            .rr-highlight {
              grid-column: span 2;
              background: linear-gradient(90deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2));
              border: 1px solid rgba(16, 185, 129, 0.3);
              text-align: center;
            }
            
            .rr-highlight .detail-value {
              font-size: 24px;
              color: #10b981;
            }
            
            .metadata {
              background: rgba(0, 0, 0, 0.3);
              padding: 16px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .metadata-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              font-size: 12px;
              color: #9ca3af;
            }
            
            .cta-section {
              padding: 24px;
              text-align: center;
              background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1));
              border-top: 1px solid rgba(236, 72, 153, 0.2);
            }
            
            .cta-button {
              display: inline-block;
              padding: 16px 32px;
              background: linear-gradient(90deg, #ec4899, #8b5cf6);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 8px;
              transition: transform 0.2s;
            }
            
            .cta-button:hover {
              transform: translateY(-2px);
            }
            
            .footer {
              background: rgba(0, 0, 0, 0.5);
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #9ca3af;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .social-links {
              margin-top: 16px;
            }
            
            .social-links a {
              color: #ec4899;
              text-decoration: none;
              margin: 0 8px;
            }
            
            @media (max-width: 600px) {
              .container {
                margin: 16px;
                border-radius: 12px;
              }
              
              .details-grid {
                grid-template-columns: 1fr;
              }
              
              .rr-highlight {
                grid-column: span 1;
              }
              
              .metadata-grid {
                grid-template-columns: 1fr;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="logo">⛩️ AASAKIRA AI</div>
              <p class="subtitle">Premium Trading Signal Generated</p>
            </div>
            
            <!-- Signal Card -->
            <div class="signal-card">
              <div class="signal-header">
                <div class="signal-pair">${signal.symbol}</div>
                <div class="signal-type">${signal.type}</div>
                <div class="badges">
                  <span class="badge confidence-badge">${signal.confidence}% Confidence</span>
                  <span class="badge frameworks-badge">${frameworksPassed}/6 Confluence</span>
                </div>
              </div>
              
              <div class="trade-details">
                <div class="details-grid">
                  <div class="detail-item">
                    <div class="detail-label">Entry Price</div>
                    <div class="detail-value">${signal.entry.toFixed(signal.symbol.includes('JPY') ? 3 : 5)}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">Stop Loss</div>
                    <div class="detail-value">${signal.stopLoss.toFixed(signal.symbol.includes('JPY') ? 3 : 5)}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">Take Profit</div>
                    <div class="detail-value">${signal.takeProfit.toFixed(signal.symbol.includes('JPY') ? 3 : 5)}</div>
                  </div>
                  
                  <div class="detail-item rr-highlight">
                    <div class="detail-label">Risk/Reward Ratio</div>
                    <div class="detail-value">${signal.rr.toFixed(1)}:1</div>
                  </div>
                </div>
              </div>
              
              <div class="metadata">
                <div class="metadata-grid">
                  <div><strong>Trade Type:</strong> ${signal.tradeType.charAt(0).toUpperCase() + signal.tradeType.slice(1)}</div>
                  <div><strong>Risk Level:</strong> ${signal.riskLevel.charAt(0).toUpperCase() + signal.riskLevel.slice(1)}</div>
                  <div><strong>Confidence Level:</strong> ${confidenceLevel}</div>
                  <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            <!-- CTA Section -->
            <div class="cta-section">
              <h3 style="margin-top: 0; color: #ec4899;">🚀 Ready to Trade?</h3>
              <p style="margin-bottom: 20px; color: #d1d5db;">
                This premium signal was generated by our Enhanced Multi-Intelligence Core. 
                Remember to manage your risk and follow your trading plan.
              </p>
              <a href="https://your-app-url.com/signals" class="cta-button">
                📊 View in Dashboard
              </a>
              <a href="https://your-app-url.com/education" class="cta-button">
                🎓 Learn More
              </a>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p>
                <strong>⛩️ Powered by Aasakira AI</strong><br>
                Advanced trading intelligence with Japanese precision.
              </p>
              <p style="margin: 8px 0; font-size: 11px;">
                <em>Disclaimer: Trading involves risk. Past performance is not indicative of future results. 
                Always conduct your own analysis and manage risk appropriately.</em>
              </p>
              <div class="social-links">
                <a href="#">📧 Contact</a>
                <a href="#">🐦 Twitter</a>
                <a href="#">💬 Discord</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Aasakira AI <signals@aasakira-ai.com>',
        to: [email],
        subject: `📈 ${signal.symbol} ${signal.type} Signal - ${signal.confidence}% Confidence | Aasakira AI`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('❌ Resend API error:', emailResult);
      throw new Error(`Resend API error: ${emailResult.message}`);
    }

    console.log('✅ Signal email sent successfully:', emailResult.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResult.id,
        message: 'Signal email sent successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Error in send-signal-email function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send signal email' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
