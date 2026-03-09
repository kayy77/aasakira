
CREATE OR REPLACE FUNCTION public.calculate_trade_pips(
  p_direction text,
  p_entry numeric,
  p_pair text,
  p_target numeric
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
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
    multiplier := 10;
  ELSIF p_pair ILIKE '%BTC%' THEN
    multiplier := 0.1;
  ELSIF p_pair ILIKE '%NAS100%'
     OR p_pair ILIKE '%US30%'
     OR p_pair ILIKE '%SPX500%'
     OR p_pair ILIKE '%US500%'
  THEN
    multiplier := 1;
  ELSE
    multiplier := 10000;
  END IF;

  IF dir IN ('BUY', 'LONG') THEN
    diff := p_target - p_entry;
  ELSE
    diff := p_entry - p_target;
  END IF;

  RETURN round((diff * multiplier)::numeric, 1);
END;
$$;
