-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule heartbeat monitoring every minute
SELECT cron.schedule(
  'heartbeat-monitor-every-minute',
  '* * * * *', -- every minute
  $$
  SELECT net.http_post(
    url := 'https://tnfxxtnfpoavnsabjrii.supabase.co/functions/v1/heartbeat-monitor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZnh4dG5mcG9hdm5zYWJqcmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMTIwNzYsImV4cCI6MjA2Nzg4ODA3Nn0.0JbXi8IRlBNr-UEpPEFIQ8Q4ivxrKLpgKxahOrXjNkE"}'::jsonb,
    body := '{"action": "check"}'::jsonb
  ) as request_id;
  $$
);

-- Schedule data verification every 5 minutes
SELECT cron.schedule(
  'data-verification-every-5min',
  '*/5 * * * *', -- every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://tnfxxtnfpoavnsabjrii.supabase.co/functions/v1/data-verification-engine',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZnh4dG5mcG9hdm5zYWJqcmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMTIwNzYsImV4cCI6MjA2Nzg4ODA3Nn0.0JbXi8IRlBNr-UEpPEFIQ8Q4ivxrKLpgKxahOrXjNkE"}'::jsonb,
    body := '{"action": "cross-check"}'::jsonb
  ) as request_id;
  $$
);

-- Schedule multi-provider refresh every 15 minutes
SELECT cron.schedule(
  'multi-provider-refresh-every-15min',
  '*/15 * * * *', -- every 15 minutes
  $$
  SELECT net.http_post(
    url := 'https://tnfxxtnfpoavnsabjrii.supabase.co/functions/v1/multi-provider-economic-fetch',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZnh4dG5mcG9hdm5zYWJqcmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMTIwNzYsImV4cCI6MjA2Nzg4ODA3Nn0.0JbXi8IRlBNr-UEpPEFIQ8Q4ivxrKLpgKxahOrXjNkE"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Create a view to monitor cron job status
CREATE OR REPLACE VIEW public.cron_job_status AS
SELECT 
  jobname,
  schedule,
  active,
  jobid,
  database,
  username,
  command,
  nodename
FROM cron.job
WHERE jobname IN ('heartbeat-monitor-every-minute', 'data-verification-every-5min', 'multi-provider-refresh-every-15min');

-- Grant access to the view
GRANT SELECT ON public.cron_job_status TO anon, authenticated;