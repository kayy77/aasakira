// Shared cTrader Open API client (JSON over WebSocket, port 5036).
export const PT = {
  APP_AUTH_REQ: 2100, APP_AUTH_RES: 2101, ACC_AUTH_REQ: 2102, ACC_AUTH_RES: 2103,
  NEW_ORDER_REQ: 2106, AMEND_SLTP_REQ: 2110, CLOSE_POSITION_REQ: 2111, SYMBOLS_LIST_REQ: 2114, SYMBOLS_LIST_RES: 2115,
  SYMBOL_BY_ID_REQ: 2116, SYMBOL_BY_ID_RES: 2117, EXECUTION_EVENT: 2126, ORDER_ERROR: 2132,
  ERROR_RES: 2142, HEARTBEAT: 51,
};

export class OpenApi {
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

export type CtraderSession = { api: OpenApi; ctid: number; live: boolean };

/** Loads the user's cTrader link, refreshes the token if needed, and opens an authenticated session. */
export async function openCtraderSession(supabase: any, userId: string, opts: { allowLive: boolean }): Promise<CtraderSession> {
  const { data: conn } = await supabase.from("ctrader_connections").select("*").eq("user_id", userId).maybeSingle();
  if (!conn) throw new Error("No linked cTrader account");
  const clientId = Deno.env.get("CTRADER_CLIENT_ID");
  const clientSecret = Deno.env.get("CTRADER_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("cTrader app credentials missing");

  let accessToken = conn.access_token as string;
  if (new Date(conn.expires_at) <= new Date()) {
    const r = await fetch("https://openapi.ctrader.com/apps/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: conn.refresh_token, client_id: clientId, client_secret: clientSecret }),
    });
    if (!r.ok) throw new Error("cTrader login expired — please reconnect");
    const t = await r.json();
    accessToken = t.access_token ?? t.accessToken;
    await supabase.from("ctrader_connections").update({
      access_token: accessToken, refresh_token: t.refresh_token ?? t.refreshToken ?? conn.refresh_token,
      expires_at: new Date(Date.now() + (t.expires_in ?? t.expiresIn ?? 2592000) * 1000).toISOString(),
    }).eq("user_id", userId);
  }

  const accounts: any[] = Array.isArray(conn.accounts) ? conn.accounts : [];
  const isLive = (a: any) => a.live === true || a.isLive === true;
  const acc = opts.allowLive ? accounts[0] : accounts.find((a) => !isLive(a));
  if (!acc) throw new Error(opts.allowLive ? "No cTrader trading account found" : "No cTrader demo account linked (live copying is switched off)");
  const ctid = Number(acc.accountId);
  const live = isLive(acc);
  const api = new OpenApi(live ? "live.ctraderapi.com" : "demo.ctraderapi.com");
  await api.open();
  await api.send(PT.APP_AUTH_REQ, { clientId, clientSecret }, [PT.APP_AUTH_RES]);
  await api.send(PT.ACC_AUTH_REQ, { ctidTraderAccountId: ctid, accessToken }, [PT.ACC_AUTH_RES]);
  return { api, ctid, live };
}

export async function resolveSymbol(s: CtraderSession, symbol: string) {
  const list = await s.api.send(PT.SYMBOLS_LIST_REQ, { ctidTraderAccountId: s.ctid }, [PT.SYMBOLS_LIST_RES]);
  const want = symbol.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const sym = (list.symbol ?? []).find((x: any) => String(x.symbolName).toUpperCase().replace(/[^A-Z0-9]/g, "") === want);
  if (!sym) throw new Error(`${symbol} isn't available on this account`);
  const detail = await s.api.send(PT.SYMBOL_BY_ID_REQ, { ctidTraderAccountId: s.ctid, symbolId: [sym.symbolId] }, [PT.SYMBOL_BY_ID_RES]);
  const lotSize = Number(detail.symbol?.[0]?.lotSize ?? 10000000);
  const step = Number(detail.symbol?.[0]?.stepVolume ?? 1);
  return { symbolId: sym.symbolId, toVolume: (lots: number) => Math.max(step, Math.round((lots * lotSize) / step) * step) };
}

export async function marketOrder(s: CtraderSession, p: { symbol: string; side: "BUY" | "SELL"; lots: number; sl?: number | null; tp?: number | null; label: string; comment?: string }) {
  const sym = await resolveSymbol(s, p.symbol);
  const exec = await s.api.send(PT.NEW_ORDER_REQ, {
    ctidTraderAccountId: s.ctid, symbolId: sym.symbolId, orderType: 1, tradeSide: p.side === "BUY" ? 1 : 2,
    volume: sym.toVolume(p.lots), label: p.label, ...(p.comment ? { comment: p.comment } : {}),
  }, [PT.EXECUTION_EVENT], 15000);
  const positionId = exec.position?.positionId ?? exec.order?.positionId;
  const fillPrice = exec.deal?.executionPrice ?? exec.position?.price ?? null;
  let sltpError: string | null = null;
  if (positionId && (p.sl || p.tp)) {
    await amendSltp(s, positionId, p.sl, p.tp).catch((e) => { sltpError = e.message; });
  }
  return { positionId: positionId ? String(positionId) : null, fillPrice: fillPrice != null ? Number(fillPrice) : null, sltpError };
}

export function amendSltp(s: CtraderSession, positionId: string | number, sl?: number | null, tp?: number | null) {
  return s.api.send(PT.AMEND_SLTP_REQ, {
    ctidTraderAccountId: s.ctid, positionId: Number(positionId), ...(sl ? { stopLoss: sl } : {}), ...(tp ? { takeProfit: tp } : {}),
  }, [PT.EXECUTION_EVENT]);
}

export async function closePosition(s: CtraderSession, positionId: string | number, symbol: string, lots: number) {
  const sym = await resolveSymbol(s, symbol);
  const exec = await s.api.send(PT.CLOSE_POSITION_REQ, {
    ctidTraderAccountId: s.ctid, positionId: Number(positionId), volume: sym.toVolume(lots),
  }, [PT.EXECUTION_EVENT], 15000);
  return { fillPrice: exec.deal?.executionPrice != null ? Number(exec.deal.executionPrice) : null };
}
