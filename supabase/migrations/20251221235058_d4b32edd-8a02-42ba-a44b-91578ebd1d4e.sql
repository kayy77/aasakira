-- Recompute and persist pips for active_trades (supports XAUUSD pip rules) and auto-classify outcomes

-- 1) Pip calculation helper
CREATE OR REPLACE FUNCTION public.calculate_trade_pips(
  p_entry numeric,
  p_target numeric,
  p_direction text,
  p_pair text
)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  diff numeric;
  multiplier numeric := 10000;
  dir text := upper(coalesce(p_direction, ''));
BEGIN
  IF p_entry IS NULL OR p_target IS NULL THEN
    RETURN NULL;
  END IF;

  -- Pip multipliers
  IF p_pair ILIKE '%JPY%' THEN
    multiplier := 100;
  ELSIF p_pair ILIKE '%XAU%' THEN
    multiplier := 10; -- XAUUSD: 0.1 move = 1 pip
  ELSIF p_pair ILIKE '%NAS100%'
     OR p_pair ILIKE '%US30%'
     OR p_pair ILIKE '%SPX500%'
     OR p_pair ILIKE '%US500%'
  THEN
    multiplier := 1;
  ELSE
    multiplier := 10000;
  END IF;

  -- Direction normalization
  IF dir IN ('BUY', 'LONG') THEN
    diff := p_target - p_entry;
  ELSE
    diff := p_entry - p_target;
  END IF;

  RETURN round((diff * multiplier)::numeric, 1);
END;
$$;

-- 2) Trigger function to persist TP pips + total realized pips and set outcome
CREATE OR REPLACE FUNCTION public.active_trades_compute_pips()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  tp_item jsonb;
  new_tps jsonb := '[]'::jsonb;
  level_int int;
  price_num numeric;
  hit_bool boolean;
  pips_num numeric;
  total_pips numeric := 0;
  tps_count int := 0;
  tps_hit int := 0;
BEGIN
  IF NEW.entry_price IS NULL THEN
    RETURN NEW;
  END IF;

  -- Prefer NEW.take_profits if present
  IF NEW.take_profits IS NOT NULL
     AND jsonb_typeof(NEW.take_profits) = 'array'
     AND jsonb_array_length(NEW.take_profits) > 0
  THEN
    FOR tp_item IN SELECT * FROM jsonb_array_elements(NEW.take_profits) LOOP
      level_int := nullif(tp_item->>'level', '')::int;
      price_num := nullif(tp_item->>'price', '')::numeric;
      hit_bool := coalesce((tp_item->>'hit')::boolean, false);
      pips_num := public.calculate_trade_pips(NEW.entry_price, price_num, NEW.direction, NEW.pair);

      new_tps := new_tps || jsonb_build_array(
        jsonb_build_object(
          'level', level_int,
          'price', price_num,
          'hit', hit_bool,
          'pips', CASE WHEN hit_bool THEN pips_num ELSE NULL END
        )
      );

      tps_count := tps_count + 1;
      IF hit_bool AND pips_num IS NOT NULL THEN
        tps_hit := tps_hit + 1;
        total_pips := total_pips + pips_num;
      END IF;
    END LOOP;

    NEW.take_profits := new_tps;
  ELSE
    -- Build take_profits from legacy columns
    IF NEW.tp1 IS NOT NULL THEN
      tps_count := tps_count + 1;
      hit_bool := coalesce(NEW.tp1_hit, false);
      pips_num := public.calculate_trade_pips(NEW.entry_price, NEW.tp1, NEW.direction, NEW.pair);
      new_tps := new_tps || jsonb_build_array(
        jsonb_build_object('level', 1, 'price', NEW.tp1, 'hit', hit_bool, 'pips', CASE WHEN hit_bool THEN pips_num ELSE NULL END)
      );
      IF hit_bool AND pips_num IS NOT NULL THEN
        tps_hit := tps_hit + 1;
        total_pips := total_pips + pips_num;
      END IF;
    END IF;

    IF NEW.tp2 IS NOT NULL THEN
      tps_count := tps_count + 1;
      hit_bool := coalesce(NEW.tp2_hit, false);
      pips_num := public.calculate_trade_pips(NEW.entry_price, NEW.tp2, NEW.direction, NEW.pair);
      new_tps := new_tps || jsonb_build_array(
        jsonb_build_object('level', 2, 'price', NEW.tp2, 'hit', hit_bool, 'pips', CASE WHEN hit_bool THEN pips_num ELSE NULL END)
      );
      IF hit_bool AND pips_num IS NOT NULL THEN
        tps_hit := tps_hit + 1;
        total_pips := total_pips + pips_num;
      END IF;
    END IF;

    IF NEW.tp3 IS NOT NULL THEN
      tps_count := tps_count + 1;
      hit_bool := coalesce(NEW.tp3_hit, false);
      pips_num := public.calculate_trade_pips(NEW.entry_price, NEW.tp3, NEW.direction, NEW.pair);
      new_tps := new_tps || jsonb_build_array(
        jsonb_build_object('level', 3, 'price', NEW.tp3, 'hit', hit_bool, 'pips', CASE WHEN hit_bool THEN pips_num ELSE NULL END)
      );
      IF hit_bool AND pips_num IS NOT NULL THEN
        tps_hit := tps_hit + 1;
        total_pips := total_pips + pips_num;
      END IF;
    END IF;

    IF tps_count > 0 THEN
      NEW.take_profits := new_tps;
    END IF;
  END IF;

  -- Persist pips_realized
  IF tps_hit > 0 THEN
    NEW.pips_realized := total_pips;
  ELSE
    -- Pure SL loss (no TP hits)
    IF upper(coalesce(NEW.status, '')) IN ('STOPPED_OUT', 'SL_HIT')
       AND NEW.stop_loss IS NOT NULL
    THEN
      NEW.pips_realized := public.calculate_trade_pips(NEW.entry_price, NEW.stop_loss, NEW.direction, NEW.pair);
    END IF;
  END IF;

  -- Outcome classification (only set when missing)
  IF NEW.outcome IS NULL THEN
    IF upper(coalesce(NEW.status, '')) IN ('STOPPED_OUT', 'SL_HIT') THEN
      NEW.outcome := CASE WHEN tps_hit > 0 THEN 'PARTIAL' ELSE 'LOSS' END;
    ELSIF upper(coalesce(NEW.status, '')) = 'CLOSED' THEN
      IF tps_count > 0 AND tps_hit = tps_count THEN
        NEW.outcome := 'WIN';
      ELSIF tps_hit > 0 THEN
        NEW.outcome := 'PARTIAL';
      ELSIF coalesce(NEW.be_activated, false) THEN
        NEW.outcome := 'BE';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 3) Trigger
DROP TRIGGER IF EXISTS trg_active_trades_compute_pips ON public.active_trades;
CREATE TRIGGER trg_active_trades_compute_pips
BEFORE INSERT OR UPDATE ON public.active_trades
FOR EACH ROW
EXECUTE FUNCTION public.active_trades_compute_pips();

-- 4) Backfill current + historical rows (fires trigger)
UPDATE public.active_trades
SET updated_at = updated_at
WHERE (pips_realized IS NULL OR pips_realized = 0)
  AND entry_price IS NOT NULL
  AND (coalesce(tp1_hit, false) OR coalesce(tp2_hit, false) OR coalesce(tp3_hit, false));

UPDATE public.active_trades
SET updated_at = updated_at
WHERE (pips_realized IS NULL OR pips_realized = 0)
  AND entry_price IS NOT NULL
  AND stop_loss IS NOT NULL
  AND upper(coalesce(status, '')) IN ('STOPPED_OUT', 'SL_HIT')
  AND (NOT coalesce(tp1_hit, false) AND NOT coalesce(tp2_hit, false) AND NOT coalesce(tp3_hit, false));
