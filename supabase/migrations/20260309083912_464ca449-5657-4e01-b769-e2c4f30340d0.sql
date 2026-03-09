
-- Fix BTCUSD trade pips
UPDATE active_trades SET 
  take_profits = (
    SELECT jsonb_agg(
      CASE 
        WHEN (tp->>'hit')::boolean THEN
          jsonb_set(tp, '{pips}', to_jsonb(calculate_trade_pips(direction, entry_price, pair, (tp->>'price')::numeric)))
        ELSE tp
      END ORDER BY (tp->>'level')::int
    ) FROM jsonb_array_elements(take_profits) tp
  ),
  pips_realized = (
    SELECT COALESCE(SUM(calculate_trade_pips(direction, entry_price, pair, (tp->>'price')::numeric)), 0)
    FROM jsonb_array_elements(take_profits) tp
    WHERE (tp->>'hit')::boolean
  )
WHERE pair ILIKE '%BTC%';
