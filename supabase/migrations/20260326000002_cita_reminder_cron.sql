-- Enable pg_cron and pg_net extensions (already enabled in most Supabase projects)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing schedule if re-running this migration
SELECT cron.unschedule('cita-reminder-diario')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cita-reminder-diario'
);

-- Schedule cita-reminder Edge Function daily at 16:00 UTC (10:00 AM Guatemala, UTC-6)
-- IMPORTANT: Replace <SUPABASE_SERVICE_ROLE_KEY> with the value from:
--   Supabase Dashboard → Settings → API → service_role key
SELECT cron.schedule(
  'cita-reminder-diario',
  '0 16 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://usmjxdoboaxpbmuoproo.supabase.co/functions/v1/cita-reminder',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer <SUPABASE_SERVICE_ROLE_KEY>"}'::jsonb,
      body    := '{}'::jsonb
    ) AS request_id;
  $$
);
