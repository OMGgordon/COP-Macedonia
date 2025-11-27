# Supabase Cron Setup for Birthday Notifications

This guide shows you how to set up automated daily birthday notifications using Supabase Edge Functions and Cron.

## Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Resend account with API key

## Step 1: Deploy the Edge Function

1. **Login to Supabase CLI:**
   ```bash
   npx supabase login
   ```

2. **Link your project:**
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```
   
   Your project ref is in your Supabase project URL: `https://YOUR_PROJECT_REF.supabase.co`

3. **Set the secrets (environment variables):**
   ```bash
   npx supabase secrets set RESEND_API_KEY=your_resend_api_key_here
   npx supabase secrets set ADMIN_EMAIL=gordonopoku123@gmail.com
   ```

4. **Deploy the function:**
   ```bash
   npx supabase functions deploy birthday-notifications
   ```

## Step 2: Set Up Cron Job in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Extensions**
3. Enable the `pg_cron` extension if not already enabled

4. Go to **SQL Editor** and run this query to create the cron job:

```sql
-- Create a cron job that runs daily at 6:00 AM UTC
select cron.schedule(
  'birthday-notifications-daily',
  '0 6 * * *',
  $$
  select
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/birthday-notifications',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) as request_id;
  $$
);
```

**Replace:**
- `YOUR_PROJECT_REF` with your actual project reference
- `YOUR_ANON_KEY` with your Supabase anon/public key (found in Project Settings → API)

## Step 3: Verify Setup

### Test the function manually:

```bash
npx supabase functions invoke birthday-notifications --project-ref YOUR_PROJECT_REF
```

Or test via HTTP:
```bash
curl -L -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/birthday-notifications' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

## Step 4: View Cron Jobs

To see all scheduled cron jobs:

```sql
SELECT * FROM cron.job;
```

To see cron job execution history:

```sql
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

## Step 5: Update or Delete Cron Job

**To update the schedule:**
```sql
-- First, find the job ID
SELECT jobid, jobname, schedule FROM cron.job;

-- Then update it
SELECT cron.alter_job(
  job_id => YOUR_JOB_ID,
  schedule => '0 8 * * *'  -- New time: 8 AM UTC
);
```

**To delete the cron job:**
```sql
SELECT cron.unschedule('birthday-notifications-daily');
```

## Cron Schedule Format

The schedule uses standard cron syntax: `minute hour day month day-of-week`

Examples:
- `0 6 * * *` - Every day at 6:00 AM UTC
- `0 8 * * *` - Every day at 8:00 AM UTC
- `0 6 * * 1` - Every Monday at 6:00 AM UTC
- `0 6 1 * *` - First day of every month at 6:00 AM UTC

## Troubleshooting

### Check function logs:
```bash
npx supabase functions logs birthday-notifications --project-ref YOUR_PROJECT_REF
```

### Check if cron is running:
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'birthday-notifications-daily')
ORDER BY start_time DESC 
LIMIT 5;
```

### Test with sample data:
Add test members with today's birthday to verify emails are sent correctly.

## Notes

- Times are in UTC, so adjust accordingly for your timezone
- The function only sends emails when there are birthdays today or in the next 7 days
- You can view function execution logs in the Supabase dashboard under Edge Functions
- The Resend free tier allows 100 emails/day

## Benefits of Supabase Cron vs Vercel Cron

✅ No external authentication needed (CRON_SECRET not required)
✅ Everything stays within Supabase ecosystem
✅ Built-in pg_cron is reliable and well-tested
✅ Easy to view logs and execution history via SQL
✅ No need to manage vercel.json configuration
✅ Can test function directly without running dev server
