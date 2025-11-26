# Quick Start Guide

## ⚡ Get Your Church Directory Running in 5 Minutes

### Step 1: Set Up Supabase (2 minutes)

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Name it "church-directory"
   - Choose a database password and region
   - Wait for setup to complete (~2 minutes)

2. **Run the Database Migration**
   - In Supabase dashboard, click SQL Editor (⚡ icon)
   - Click "New Query"
   - Copy and paste the contents of `supabase/migrations/001_create_members_table.sql`
   - Click "Run"

3. **Create Storage Bucket**
   - Click Storage (📁 icon)
   - Click "Create a new bucket"
   - Name: `member-photos`
   - Check "Public bucket"
   - Click "Create bucket"
   - Go to "Policies" tab and click "New Policy"
   - Select templates:
     - "Allow authenticated users to upload"
     - "Allow public read access"

4. **Create Your Admin User**
   - Click Authentication (👤 icon)
   - Click "Add user" → "Create new user"
   - Enter your email and password
   - Check "Auto Confirm User"
   - Click "Create user"

5. **Get Your API Keys**
   - Click Settings (⚙️) → API
   - Copy:
     - Project URL
     - Anon/Public Key

### Step 2: Configure Your App (1 minute)

1. **Create Environment File**
   ```bash
   # In your project root, create .env.local
   ```

2. **Add Your Supabase Keys**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=paste-your-project-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-your-anon-key-here
   ```

### Step 3: Run the App (1 minute)

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

### Step 4: Log In & Start Using! (1 minute)

1. Open [http://localhost:3000](http://localhost:3000)
2. Log in with the email and password you created in Supabase
3. You're in! Start adding members 🎉

---

## 📝 What You Can Do Now

✅ **Add Members**: Click "Add Member" to add your first church member
✅ **Upload Photos**: Upload profile pictures for each member
✅ **View Birthdays**: Dashboard shows today's and upcoming birthdays
✅ **Search Members**: Easily search by name, phone, or email
✅ **Edit & Delete**: Manage member information as needed

---

## 🚀 Deploy to Vercel (Optional - 2 minutes)

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables (same as .env.local)
5. Click "Deploy"

Your church directory is now live! 🌐

---

## 📚 Need More Help?

- **Full Setup Guide**: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Complete Documentation**: See [README.md](./README.md)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

## 🎯 Common First Steps

1. **Add your first member** with all their details
2. **Test the birthday feature** by adding members with birthdays today or this week
3. **Try the search** on the members page
4. **Edit a member** to see how updates work
5. **Upload a profile picture** to see the image storage in action

Enjoy your new Church Member Directory! 🙏
