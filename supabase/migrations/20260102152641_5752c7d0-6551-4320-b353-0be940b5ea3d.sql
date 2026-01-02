-- Fix the XAUUSD SHORT trade to show all TPs hit correctly
-- Entry: 4371, Direction: SHORT, so pips = (entry - tp) * 10 for gold
-- TP1: 4368 = (4371-4368)*10 = 30 pips
-- TP2: 4366 = (4371-4366)*10 = 50 pips  
-- TP3: 4363 = (4371-4363)*10 = 80 pips
-- TP4: 4351 = (4371-4351)*10 = 200 pips (furthest TP hit)

UPDATE active_trades 
SET 
  take_profits = '[
    {"level": 1, "price": 4368, "hit": true, "pips": 30},
    {"level": 2, "price": 4366, "hit": true, "pips": 50},
    {"level": 3, "price": 4363, "hit": true, "pips": 80},
    {"level": 4, "price": 4351, "hit": true, "pips": 200}
  ]'::jsonb,
  pips_realized = 200,
  outcome = 'WIN',
  tp1_hit = true,
  tp2_hit = true,
  tp3_hit = true
WHERE id = '464a3195-5104-4960-bbd9-f1809ed2822c';