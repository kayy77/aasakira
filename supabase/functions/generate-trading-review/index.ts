import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const AI_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const MODEL = 'google/gemini-3-flash-preview';

interface Body { period?: 'daily' | 'weekly' }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const userId = userData.user.id;

    const body = (await req.json().catch(() => ({}))) as Body;
    const period = body.period === 'weekly' ? 'weekly' : 'daily';
    const sinceDays = period === 'weekly' ? 7 : 1;
    const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();

    // Pull recent trades from trade_history (broker-synced) with fallback to active_trades
    const svc = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: history } = await svc
      .from('trade_history')
      .select('symbol, side, lots, open_price, close_price, open_time, close_time, pips, profit, comment')
      .eq('user_id', userId)
      .gte('close_time', since)
      .order('close_time', { ascending: false })
      .limit(100);

    let trades: any[] = history ?? [];
    if (trades.length === 0) {
      const { data: active } = await svc
        .from('active_trades')
        .select('pair, direction, entry_price, stop_loss, take_profits, status, outcome, pips_realized, created_at')
        .eq('user_id', userId)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(100);
      trades = active ?? [];
    }

    if (trades.length === 0) {
      return json({
        insight: {
          kind: `review_${period}`,
          title: `${period === 'weekly' ? 'Weekly' : 'Daily'} Review`,
          body: `No trades in the last ${sinceDays === 1 ? '24 hours' : '7 days'} yet. Once you sync your broker or trade signals, your AI review will appear here.`,
          score: null,
          metadata: { trades: 0 },
          created_at: new Date().toISOString(),
        },
        generated: false,
      });
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) return json({ error: 'AI not configured' }, 500);

    const system = `You are AASAKIRA's trading intelligence engine. Analyse the user's recent trades and produce a ${period} performance review.
Return STRICT JSON only, with keys: title (string, short), summary (string, 3-5 sentences, plain-english coaching), best_market (string), worst_market (string), win_rate (number 0-100), avg_rr (number, 1 decimal), risk_notes (string), recommendation (string), score (number 0-100).
Do NOT wrap in markdown. Do NOT invent trades. If data is thin, say so honestly.`;

    const userPrompt = `Trades (${trades.length}) since ${since}:\n${JSON.stringify(trades).slice(0, 12000)}`;

    const aiRes = await fetch(AI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': apiKey,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      if (aiRes.status === 429) return json({ error: 'Rate limit — try again shortly.' }, 429);
      if (aiRes.status === 402) return json({ error: 'AI credits exhausted. Add credits in workspace settings.' }, 402);
      return json({ error: `AI error: ${errText.slice(0, 200)}` }, 500);
    }

    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content ?? '{}';
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = { summary: content }; }

    const insight = {
      user_id: userId,
      kind: `review_${period}`,
      title: parsed.title ?? `${period === 'weekly' ? 'Weekly' : 'Daily'} Review`,
      body: parsed.summary ?? '',
      score: Number.isFinite(Number(parsed.score)) ? Number(parsed.score) : null,
      metadata: {
        best_market: parsed.best_market ?? null,
        worst_market: parsed.worst_market ?? null,
        win_rate: parsed.win_rate ?? null,
        avg_rr: parsed.avg_rr ?? null,
        risk_notes: parsed.risk_notes ?? null,
        recommendation: parsed.recommendation ?? null,
        trades: trades.length,
        period,
      },
    };

    const { data: saved, error: insErr } = await svc
      .from('ai_insights')
      .insert(insight)
      .select()
      .single();

    if (insErr) {
      return json({ error: `DB error: ${insErr.message}` }, 500);
    }

    return json({ insight: saved, generated: true });
  } catch (e) {
    return json({ error: (e as Error).message ?? 'Unknown error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}