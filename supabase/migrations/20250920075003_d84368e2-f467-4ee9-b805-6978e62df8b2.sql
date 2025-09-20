-- Clean up fake/test data from journal_entries table

-- Delete entry with empty pair (clearly fake test data)
DELETE FROM journal_entries WHERE pair = '' OR pair IS NULL;

-- Delete entries with unrealistic pip values (over 10000 pips)
DELETE FROM journal_entries WHERE result_pips > 10000 OR result_pips < -10000;

-- Delete entries with obviously fake prices (entry_price = 100, exit_price = 99)
DELETE FROM journal_entries WHERE entry_price = 100 AND exit_price = 99;