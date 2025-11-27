# Resend + Vercel Cron Setup

This guide shows how to configure Resend (email service) to send daily birthday reminder emails and how to schedule the job on Vercel.

Files added by this project:
- `src/app/api/cron/birthday-notifications/route.ts` — scheduled endpoint that fetches birthdays and sends the email using Resend.
- `vercel.json` — contains the cron schedule for automatic daily runs.
- `src/components/emails/birthday-notification.tsx` — HTML email template generator.

---

## 1) Sign up for Resend and get API key

1. Create a Resend account: https://resend.com
2. Open **API Keys**: https://resend.com/api-keys
3. Create a new API key and copy it. Keep it secret.

Notes:
- For production you should verify your sending domain with Resend (recommended). For initial testing you can use Resend's test or default behavior, but verify per Resend docs.

## 2) Add required environment variables (local & Vercel)

Create or update your `.env.local` file with the following (do NOT commit this file):

```env
# Supabase (already required by the app)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Resend (email provider)
RESEND_API_KEY=re_xxx_your_resend_api_key

# Where to deliver birthday reminders
ADMIN_EMAIL=admin@example.com

# Secret used to authenticate cron requests
# Generate a strong random string:
#   openssl rand -base64 32
CRON_SECRET=your_random_secret_here
```

Now add the same variables in your Vercel Project settings: **Settings → Environment Variables**. Add each variable for the environments you need (Preview, Production). The variables to add:

- `RESEND_API_KEY` (value: your Resend API key)
- `ADMIN_EMAIL` (value: the admin's email to receive reminders)
- `CRON_SECRET` (value: the random secret string)

Also ensure your Supabase variables are present in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

After adding variables in Vercel, redeploy your project.

## 3) How the cron endpoint is protected

The endpoint `GET /api/cron/birthday-notifications` expects an `Authorization` header:

```
Authorization: Bearer <CRON_SECRET>
```

This prevents public access to the cron route. When configuring an automated request you must include that header.

> Note: Some schedulers (or Vercel's dashboard) allow you to configure custom headers for scheduled requests. If your scheduler cannot add headers, use an external scheduler (GitHub Actions / GitHub Workflow, or an external cron service) that can call the endpoint with the header.

## 4) Vercel Cron (recommended)

The repository includes a `vercel.json` with the cron entry. Example (already added):

```json
{
  "crons": [
    {
      "path": "/api/cron/birthday-notifications",
      "schedule": "0 6 * * *"
    }
  ]
}
```

This config schedules the endpoint to run daily at 06:00 UTC. However, as noted above, the built-in scheduled request may not let you add a custom header. There are two ways to ensure the cron request includes the `Authorization` header:

Option A — Configure the cron via **Vercel Dashboard** (if the UI supports custom headers):
- Open your Vercel Project → Settings → Cron Jobs (or Scheduled Functions)
- Create or edit the job for `/api/cron/birthday-notifications`
- Set schedule to `0 6 * * *` (or whichever time you prefer)
- If the UI allows adding headers, add:
  - `Authorization: Bearer <CRON_SECRET>`

Option B — Use an external scheduler that supports custom headers (recommended if Vercel UI doesn't support headers):
- Use GitHub Actions, GitHub Workflow, or any external cron service to call the endpoint with the Authorization header.

Example GitHub Action (simple workflow) that runs daily and calls the endpoint with header:

```yaml
# .github/workflows/cron-birthday-notifications.yml
name: Birthday Notifications Cron
on:
  schedule:
    - cron: '0 6 * * *' # every day at 06:00 UTC

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Call birthday notifications endpoint
        run: |
          curl -s -X GET "https://your-project-url.vercel.app/api/cron/birthday-notifications" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

If using GitHub Actions, add `CRON_SECRET` as a repository secret and `secrets.CRON_SECRET` will be used.

## 5) Test the cron endpoint locally

Start your dev server:

```bash
npm run dev
```

Trigger the endpoint with `curl` and the header (example):

```bash
curl -X GET http://localhost:3000/api/cron/birthday-notifications \
  -H "Authorization: Bearer your_random_secret_here"
```

If everything is configured correctly you should see a JSON response indicating whether an email was sent or that no birthdays were found.

## 6) Testing email delivery

- Make sure `ADMIN_EMAIL` is set to an address you control.
- For initial testing, check the response from `/api/cron/birthday-notifications` for success details.
- Check the email inbox (and spam folder) for the birthday reminder email.
- If Resend requires domain verification, either verify your domain or use the Resend test instructions to send from their sandbox/test mode.

## 7) Troubleshooting

- `401 Unauthorized` from cron endpoint:
  - Ensure the `Authorization` header is present and the value matches `CRON_SECRET` exactly.
  - If using Vercel Cron and you cannot attach headers, use GitHub Actions or another external scheduler.

- Email not being sent:
  - Verify `RESEND_API_KEY` is set and correct in Vercel.
  - Check Resend dashboard for any errors or delivery issues.
  - Confirm `ADMIN_EMAIL` is a valid address.

- No birthdays found:
  - Confirm your Supabase `members` table has `date_of_birth` values and the server can access your Supabase instance (check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

## 8) Security notes

- Never commit `.env.local` or API keys to source control.
- Use secrets management in Vercel and GitHub Actions for cron secrets.
- Rotate your `RESEND_API_KEY` periodically if needed.

## 9) Optional improvements

- Add rich text or templating for the email (e.g., MJML, Handlebars) for more control.
- Send SMS reminders via a provider (Twilio) in addition to email.
- Add an admin UI to toggle notifications, preview the scheduled email, or trigger a manual send.

---

If you'd like, I can:
- Add the GitHub Action workflow file to this repo that triggers the endpoint daily with the header (recommended if Vercel cron cannot attach headers).
- Help you verify domain setup with Resend and test a real email send.

Which option do you prefer for scheduling: Vercel Cron (try to add header in the dashboard) or a GitHub Action that calls the endpoint with the header? 
