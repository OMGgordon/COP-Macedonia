# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in project details:
   - Name: `church-directory` (or your preferred name)
   - Database Password: (generate a strong password and save it)
   - Region: Choose closest to your location
5. Click "Create new project" and wait for setup to complete

## 2. Get Your API Keys

1. In your Supabase project dashboard, click on the ⚙️ Settings icon
2. Go to "API" section
3. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

## 3. Set Up Environment Variables

1. In your Next.js project root, create a `.env.local` file
2. Add the following (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Run Database Migration

1. In Supabase dashboard, go to the SQL Editor (lightning icon ⚡)
2. Click "New Query"
3. Copy and paste the contents of `supabase/migrations/001_create_members_table.sql`
4. Click "Run" or press `Ctrl/Cmd + Enter`
5. You should see "Success. No rows returned"

## 5. Set Up Storage Bucket

1. In Supabase dashboard, go to Storage (folder icon 📁)
2. Click "Create a new bucket"
3. Enter bucket details:
   - Name: `member-photos`
   - Public bucket: ✅ **Enable** (so photos can be accessed via URL)
4. Click "Create bucket"

### Configure Bucket Policies

1. Click on the `member-photos` bucket
2. Go to "Policies" tab
3. Click "New Policy"
4. For **INSERT**: Create policy for authenticated users
   ```sql
   (bucket_id = 'member-photos' AND auth.role() = 'authenticated')
   ```
5. For **SELECT**: Create policy to allow public read access
   ```sql
   (bucket_id = 'member-photos')
   ```
6. For **UPDATE**: Create policy for authenticated users
   ```sql
   (bucket_id = 'member-photos' AND auth.role() = 'authenticated')
   ```
7. For **DELETE**: Create policy for authenticated users
   ```sql
   (bucket_id = 'member-photos' AND auth.role() = 'authenticated')
   ```

Or use the Supabase UI policy templates for "Allow authenticated users to upload" and "Allow public read access"

## 6. Create Admin User

1. In Supabase dashboard, go to Authentication (👤 icon)
2. Click "Add user" → "Create new user"
3. Enter:
   - Email: your admin email
   - Password: create a strong password
   - Auto Confirm User: ✅ Enable
4. Click "Create user"

You can now use this email/password to log into the app!

## 7. Verify Setup

Your Supabase is now configured with:
- ✅ `members` table with all required fields
- ✅ Row Level Security enabled (authenticated users only)
- ✅ `member-photos` storage bucket for profile pictures
- ✅ At least one admin user account

You're ready to start the Next.js development server and log in!
