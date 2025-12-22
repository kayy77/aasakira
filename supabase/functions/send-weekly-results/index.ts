import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeeklyStats {
  total_pips: number;
  total_trades: number;
  wins: number;
  losses: number;
  partials: number;
  break_even: number;
  best_trade: number;
  worst_trade: number;
  start_date: string;
  end_date: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-weekly-results function invoked");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    console.log(`Fetching trades from ${startDateStr} to ${endDateStr}`);

    // Fetch weekly stats from active_trades
    const { data: trades, error: tradesError } = await supabase
      .from("active_trades")
      .select("*")
      .in("status", ["CLOSED", "STOPPED_OUT"])
      .gte("closed_at", startDateStr)
      .lte("closed_at", endDateStr);

    if (tradesError) {
      console.error("Error fetching trades:", tradesError);
      throw new Error(`Failed to fetch trades: ${tradesError.message}`);
    }

    console.log(`Found ${trades?.length || 0} closed trades this week`);

    // If no trades, exit early
    if (!trades || trades.length === 0) {
      console.log("No trades this week, skipping email send");
      return new Response(
        JSON.stringify({ message: "No trades this week, email not sent" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate stats
    let totalPips = 0;
    let wins = 0;
    let losses = 0;
    let partials = 0;
    let breakEven = 0;
    let bestTrade = -Infinity;
    let worstTrade = Infinity;

    for (const trade of trades) {
      const pips = trade.pips_realized || 0;
      totalPips += pips;

      if (pips > bestTrade) bestTrade = pips;
      if (pips < worstTrade) worstTrade = pips;

      const outcome = trade.outcome?.toUpperCase();
      if (outcome === "WIN") wins++;
      else if (outcome === "LOSS") losses++;
      else if (outcome === "PARTIAL") {
        partials++;
        // Partials count as wins for pips but are tracked separately
      } else if (outcome === "BE") breakEven++;
    }

    const stats: WeeklyStats = {
      total_pips: Math.round(totalPips * 10) / 10,
      total_trades: trades.length,
      wins,
      losses,
      partials,
      break_even: breakEven,
      best_trade: bestTrade === -Infinity ? 0 : Math.round(bestTrade * 10) / 10,
      worst_trade: worstTrade === Infinity ? 0 : Math.round(worstTrade * 10) / 10,
      start_date: startDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      end_date: endDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    };

    console.log("Weekly stats:", stats);

    // Fetch subscribed users with emails
    const { data: users, error: usersError } = await supabase
      .from("user_profiles")
      .select("email, username")
      .eq("weekly_email_enabled", true)
      .not("email", "is", null);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    console.log(`Found ${users?.length || 0} subscribed users`);

    if (!users || users.length === 0) {
      console.log("No subscribed users, skipping email send");
      return new Response(
        JSON.stringify({ message: "No subscribed users, email not sent" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format pips with sign
    const pipsDisplay = stats.total_pips >= 0 ? `+${stats.total_pips}` : `${stats.total_pips}`;
    const pipsEmoji = stats.total_pips >= 0 ? "📈" : "📉";

    // Send emails to each user
    const emailResults = [];
    for (const user of users) {
      if (!user.email) continue;

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 20px;">
  <div style="max-width: 500px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; padding: 32px; border: 1px solid #333;">
    
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: #22c55e20; color: #22c55e; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">WEEKLY RECAP</span>
    </div>
    
    <h1 style="text-align: center; font-size: 18px; color: #a855f7; margin-bottom: 8px;">@aasakira.ai Results</h1>
    
    <p style="text-align: center; color: #888; font-size: 14px; margin-bottom: 32px;">
      ${stats.start_date} → ${stats.end_date}
    </p>
    
    <div style="text-align: center; margin-bottom: 32px;">
      <span style="font-size: 48px; font-weight: bold; color: ${stats.total_pips >= 0 ? '#22c55e' : '#ef4444'};">${pipsDisplay}</span>
      <span style="font-size: 24px; color: #888;"> Pips</span>
    </div>
    
    <div style="display: flex; justify-content: space-around; text-align: center; margin-bottom: 32px; border-top: 1px solid #333; border-bottom: 1px solid #333; padding: 20px 0;">
      <div>
        <p style="font-size: 24px; font-weight: bold; color: #fff; margin: 0;">${stats.total_trades}</p>
        <p style="font-size: 12px; color: #888; margin: 4px 0 0 0;">Trades</p>
      </div>
      <div>
        <p style="font-size: 24px; font-weight: bold; color: #22c55e; margin: 0;">${stats.wins}</p>
        <p style="font-size: 12px; color: #888; margin: 4px 0 0 0;">Wins</p>
      </div>
      <div>
        <p style="font-size: 24px; font-weight: bold; color: #ef4444; margin: 0;">${stats.losses}</p>
        <p style="font-size: 12px; color: #888; margin: 4px 0 0 0;">Losses</p>
      </div>
      <div>
        <p style="font-size: 24px; font-weight: bold; color: #f59e0b; margin: 0;">${stats.partials}</p>
        <p style="font-size: 12px; color: #888; margin: 4px 0 0 0;">Partials</p>
      </div>
    </div>
    
    <div style="background-color: #0a0a0a; border-radius: 8px; padding: 16px; margin-bottom: 32px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #888;">Best Trade</span>
        <span style="color: #22c55e; font-weight: 600;">+${stats.best_trade} pips</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: #888;">Worst Trade</span>
        <span style="color: #ef4444; font-weight: 600;">${stats.worst_trade} pips</span>
      </div>
    </div>
    
    <div style="text-align: center; margin-bottom: 24px;">
      <p style="color: #888; font-size: 14px; margin-bottom: 16px;">Join us live this week 👇</p>
      <a href="https://t.me/+E3IYiJSGNqkxNTdk" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #ec4899); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Join the FREE Telegram Group
      </a>
    </div>
    
    <p style="text-align: center; color: #555; font-size: 11px; margin-top: 32px;">
      Past performance does not guarantee future results.<br>
      Trading involves substantial risk of loss.
    </p>
    
  </div>
</body>
</html>
      `;

      try {
        const emailResponse = await resend.emails.send({
          from: "Aasakira <results@aasakira.ai>",
          to: [user.email],
          subject: `Weekly Results — ${pipsDisplay} Pips ${pipsEmoji}`,
          html: emailHtml,
        });

        console.log(`Email sent to ${user.email}:`, emailResponse);
        emailResults.push({ email: user.email, success: true, response: emailResponse });
      } catch (emailError: any) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
        emailResults.push({ email: user.email, success: false, error: emailError.message });
      }
    }

    const successCount = emailResults.filter((r) => r.success).length;
    const failCount = emailResults.filter((r) => !r.success).length;

    console.log(`Email send complete: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        message: "Weekly results emails sent",
        stats,
        emails_sent: successCount,
        emails_failed: failCount,
        results: emailResults,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-weekly-results function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
