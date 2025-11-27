# Church Member Directory

An admin-only web application for managing church member information with birthday reminders. Built with Next.js, shadcn/ui, and Supabase.

## Features

✨ **Member Management**
- Add, edit, view, and delete member profiles
- Upload and manage profile pictures
- Store comprehensive member information (name, gender, DOB, phone, email, address)

🎂 **Birthday Reminders**
- Dashboard displays today's birthdays
- View upcoming birthdays (next 7 days)
- Automatic age calculation
- Birthday notifications with contact information
- **Automated Email Notifications** - Daily email reminders sent to admin with today's and upcoming birthdays

🔐 **Admin-Only Access**
- Secure authentication with Supabase Auth
- Protected routes with middleware
- Admin-only interface (no public pages)

📱 **Modern UI/UX**
- Responsive design for mobile, tablet, and desktop
- Clean, intuitive interface using shadcn/ui components
- Real-time search and filtering
- Image upload with preview

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** shadcn/ui + Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Email Service:** Resend (birthday notifications)
- **Cron Jobs:** Vercel Cron (daily email automation)
- **Form Validation:** React Hook Form + Zod
- **Date Handling:** date-fns
- **Icons:** Lucide React
- **Deployment:** Vercel

## Prerequisites

- Node.js 18+ and npm
- A Supabase account ([sign up free](https://supabase.com))
- A Vercel account for deployment (optional)

## Setup Instructions

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Set Up Supabase

Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create a Supabase project
- Run the database migration
- Set up the storage bucket
- Create an admin user

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Resend Configuration (for email notifications)
RESEND_API_KEY=your-resend-api-key

# Admin Email for Birthday Notifications
ADMIN_EMAIL=your-admin-email@example.com

# Cron Job Security (generate with: openssl rand -base64 32)
CRON_SECRET=your-random-secret
```

**Getting the values:**
- Supabase values: From your Supabase project (Settings → API)
- Resend API key: Sign up at [resend.com](https://resend.com), then get API key from [resend.com/api-keys](https://resend.com/api-keys)
- Admin email: The email address where birthday notifications will be sent
- Cron secret: Generate with `openssl rand -base64 32` (or any random string)

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you'll be redirected to the login page.

### 5. Log In

Use the admin email and password you created in Supabase to log in.

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/           # Protected dashboard routes
│   │   ├── dashboard/         # Main dashboard with birthday reminders
│   │   └── members/           # Member management pages
│   │       ├── page.tsx       # Member list
│   │       ├── new/           # Add member form
│   │       └── [id]/          # Member detail and edit
│   └── login/                 # Login page
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── navigation.tsx         # Main navigation
│   ├── logout-button.tsx      # Logout functionality
│   └── ...                    # Other components
└── lib/
    ├── supabase/              # Supabase client configuration
    │   ├── client.ts          # Browser client
    │   ├── server.ts          # Server client
    │   └── middleware.ts      # Auth middleware
    ├── birthdays.ts           # Birthday calculation utilities
    ├── types.ts               # TypeScript types
    └── utils.ts               # Utility functions
```

## Key Features Explained

### Birthday Logic

The app calculates birthdays entirely on the client/server (no cron jobs needed):

- **Today's Birthdays:** Matches current day and month with member DOB
- **Upcoming Birthdays:** Finds birthdays in the next 7 days, handling month/year boundaries
- **Age Calculation:** Automatically calculates age from date of birth

See `src/lib/birthdays.ts` for implementation.

### Authentication Flow

1. All routes except `/login` are protected by middleware
2. Unauthenticated users are redirected to `/login`
3. After login, users are redirected to `/dashboard`
4. Session is managed automatically by Supabase

### Image Upload

Profile pictures are uploaded to Supabase Storage (`member-photos` bucket):
1. User selects an image
2. Image is uploaded to Supabase Storage on form submit
3. Public URL is stored in the `profile_picture_url` field
4. Images are displayed using the public URL

## Database Schema

The `members` table includes:

- `id` (UUID, primary key)
- `full_name` (text, required)
- `gender` (text, optional)
- `date_of_birth` (date, required)
- `phone` (text, required)
- `email` (text, optional)
- `address` (text, optional)
- `profile_picture_url` (text, optional)
- `created_at` / `updated_at` (timestamptz, auto-managed)

See `supabase/migrations/001_create_members_table.sql` for the full schema.

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`
   - `CRON_SECRET`
5. Click "Deploy"

**Note:** The Vercel Cron job for birthday email notifications will automatically run daily at 6 AM UTC once deployed.

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add RESEND_API_KEY
vercel env add ADMIN_EMAIL
vercel env add CRON_SECRET

# Deploy to production
vercel --prod
```

## Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Troubleshooting

### "No members found" after login
- Verify the database migration ran successfully in Supabase
- Check Row Level Security policies are set up correctly

### Profile pictures not uploading
- Ensure the `member-photos` bucket exists in Supabase Storage
- Verify bucket policies allow authenticated users to upload
- Check bucket is set to "Public"

### Authentication issues
- Double-check environment variables are set correctly
- Ensure the admin user exists in Supabase Auth
- Clear browser cookies and try again

## Email Notifications

The app automatically sends daily birthday reminder emails to the admin:

- **Schedule:** Every day at 6:00 AM UTC
- **Content:** Lists members with birthdays today and upcoming birthdays (next 7 days)
- **Powered by:** Resend email service + Vercel Cron Jobs
- **Setup:** Configure `RESEND_API_KEY` and `ADMIN_EMAIL` environment variables

### Testing Email Notifications Locally

You can manually trigger the cron job endpoint:

```bash
curl -X GET http://localhost:3000/api/cron/birthday-notifications \
  -H "Authorization: Bearer your-cron-secret"
```

## Future Enhancements

Potential features to add:

- [x] Email birthday reminders (implemented with Resend + Vercel Cron)
- [ ] Export member list to CSV/PDF
- [ ] Attendance tracking
- [ ] Groups/ministries organization
- [ ] SMS notifications for birthdays
- [ ] Multi-admin support with role-based access
- [ ] Member self-service portal

## License

MIT

## Support

For issues or questions:
1. Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for setup help
2. Review the [Next.js documentation](https://nextjs.org/docs)
3. Check [Supabase documentation](https://supabase.com/docs)
