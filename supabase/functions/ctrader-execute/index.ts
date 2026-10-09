// Places real market orders on a linked cTrader account via the cTrader Open API (JSON over WebSocket).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

const Body = z.object({
  journalEntryId: z.string().uuid(),
  accountId: z.string().min(1).optional(),
  symbol: z.string().trim().min(2).max(20),
  side: z.enum(["BUY", "SELL"]),
  lots: z.number().positive().max(100),
  stopLoss: z.number().positive().nullable().optional(),
  takeProfit: z.number().positive().nullable().optional(),
});

// Open API payload types
const PT = {
  APP_AUTH_REQ: 2100, APP_AUTH_RES: 2101, ACC_AUTH_REQ: 2102, ACC_AUTH_RES: 2103,
  NEW_ORDER_REQ: 2106, AMEND_SLTP_REQ: 2110, SYMBOLS_LIST_REQ: 2114, SYMBOLS_LIST_RES: 2115,
  SYMBOL_BY_ID_REQ: 2116, SYMBOL_BY_ID_RES: 2117, EXECUTION_EVENT: 2126, ORDER_ERROR: 2132,
  ERROR_RES: 2142, HEARTBEAT: 51,
};

class OpenApi {
  private ws!: WebSocket;
  private waiters: { types: number[]; resolve: (m: any) => void; reject: (e: Error) => void }[] = [];
  private seq = 0;
  constructor(private host: string) {}
  open() {
    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(`wss://${this.host}:5036`);
      this.ws.onopen = () => resolve();
      this.ws.onerror = () => reject(new Error("Could not reach cTrader"));
      this.ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.payloadType === PT.HEARTBEAT) return;
        const isErr = msg.payloadType === PT.ERROR_RES || msg.payloadType === PT.ORDER_ERROR;
        const i = this.waiters.findIndex((w) => isErr || w.types.includes(msg.payloadType));
        if (i < 0) return;
        const [w] = this.waiters.splice(i, 1);
        if (isErr) w.reject(new Error(msg.payload?.description || msg.payload?.errorCode || "cTrader rejected the request"));
        else w.resolve(msg.payload);
      };
    });
  }
  send(payloadType: number, payload: Record<string, unknown>, expect: number[], timeoutMs = 10000) {
    return new Promise<any>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("cTrader timed out")), timeoutMs);
      this.waiters.push({ types: expect, resolve: (m) => { clearTimeout(t); resolve(m); }, reject: (e) => { clearTimeout(t); reject(e); } });
      this.ws.send(JSON.stringify({ clientMsgId: `m${++this.seq}`, payloadType, payload }));
    });
  }
  close() { try { this.ws.close(); } catch { /* ignore */ } }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return json({ error: "Unauthorized" }, 401);
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
  const b = parsed.data;

  const { data: entry } = await supabase.from("journal_entries").select("id,user_id").eq("id", b.journalEntryId).maybeSingle();
  if (!entry || entry.user_id !== user.id) return json({ error: "Journal trade not found" }, 404);

  const { data: conn } = await supabase.from("ctrader_connections").select("*").eq("user_id", user.id).maybeSingle();
  if (!conn) return json({ error: "Link your cTrader account first" }, 400);

  const clientId = Deno.env.get("CTRADER_CLIENT_ID");
  const clientSecret = Deno.env.get("CTRADER_CLIENT_SECRET");
  if (!clientId || !clientSecret) return json({ error: "cTrader app credentials missing" }, 500);

  let accessToken = conn.access_token as string;
  if (new Date(conn.expires_at) <= new Date()) {
    const r = await fetch("https://openapi.ctrader.com/apps/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: conn.refresh_token, client_id: clientId, client_secret: clientSecret }),
    });
    if (!r.ok) return json({ error: "cTrader login expired — please reconnect" }, 401);
    const t = await r.json();
    accessToken = t.access_token ?? t.accessToken;
    await supabase.from("ctrader_connections").update({
      access_token: accessToken, refresh_token: t.refresh_token ?? t.refreshToken ?? conn.refresh_token,
      expires_at: new Date(Date.now() + (t.expires_in ?? t.expiresIn ?? 2592000) * 1000).toISOString(),
    }).eq("user_id", user.id);
  }

  const accounts: any[] = Array.isArray(conn.accounts) ? conn.accounts : [];
  const acc = b.accountId ? accounts.find((a) => String(a.accountId) === b.accountId) : accounts[0];
  if (!acc) return json({ error: "No cTrader trading account found" }, 400);
  const ctid = Number(acc.accountId);
  const live = acc.live === true || acc.isLive === true;
  const api = new OpenApi(live ? "live.ctraderapi.com" : "demo.ctraderapi.com");

  const log = (level: string, message: string, context: Record<string, unknown>) =>
    supabase.from("execution_logs").insert({ user_id: user.id, level, message, context }).then(() => {}, () => {});

  try {
    await api.open();
    await api.send(PT.APP_AUTH_REQ, { clientId, clientSecret }, [PT.APP_AUTH_RES]);
    await api.send(PT.ACC_AUTH_REQ, { ctidTraderAccountId: ctid, accessToken }, [PT.ACC_AUTH_RES]);

    const list = await api.send(PT.SYMBOLS_LIST_REQ, { ctidTraderAccountId: ctid }, [PT.SYMBOLS_LIST_RES]);
    const want = b.symbol.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const sym = (list.symbol ?? []).find((s: any) => String(s.symbolName).toUpperCase().replace(/[^A-Z0-9]/g, "") === want);
    if (!sym) throw new Error(`${b.symbol} isn't available on this account`);

    const detail = await api.send(PT.SYMBOL_BY_ID_REQ, { ctidTraderAccountId: ctid, symbolId: [sym.symbolId] }, [PT.SYMBOL_BY_ID_RES]);
    const lotSize = Number(detail.symbol?.[0]?.lotSize ?? 10000000); // in cents of units
    const step = Number(detail.symbol?.[0]?.stepVolume ?? 1);
    const volume = Math.max(step, Math.round((b.lots * lotSize) / step) * step);

    const exec = await api.send(PT.NEW_ORDER_REQ, {
      ctidTraderAccountId: ctid, symbolId: sym.symbolId, orderType: 1, tradeSide: b.side === "BUY" ? 1 : 2,
      volume, label: "AASAKIRA Journal", comment: b.journalEntryId.slice(0, 8),
    }, [PT.EXECUTION_EVENT], 15000);

    const positionId = exec.position?.positionId ?? exec.order?.positionId;
    const fillPrice = exec.deal?.executionPrice ?? exec.position?.price ?? null;

    if (positionId && (b.stopLoss || b.takeProfit)) {
      await api.send(PT.AMEND_SLTP_REQ, {
        ctidTraderAccountId: ctid, positionId,
        ...(b.stopLoss ? { stopLoss: b.stopLoss } : {}), ...(b.takeProfit ? { takeProfit: b.takeProfit } : {}),
      }, [PT.EXECUTION_EVENT]).catch((e) => log("warn", `SL/TP not set: ${e.message}`, { positionId }));
    }

    await supabase.from("journal_entries").update({
      broker_position_id: positionId ? String(positionId) : null, broker_account_id: String(ctid), executed_via: "ctrader",
      ...(fillPrice ? { entry_price: fillPrice } : {}),
    }).eq("id", b.journalEntryId);
    await log("info", `cTrader ${b.side} ${b.lots} ${b.symbol} filled`, { positionId, fillPrice, ctid, live });
    return json({ success: true, positionId, fillPrice, live });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await log("error", `cTrader order failed: ${message}`, { symbol: b.symbol, ctid });
    return json({ error: message }, 502);
  } finally {
    api.close();
  }
});
