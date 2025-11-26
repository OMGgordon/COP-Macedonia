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
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Get these values from your Supabase project settings (Settings → API).

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
5. Click "Deploy"

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

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

## Future Enhancements

Potential features to add:

- [ ] Email birthday reminders (using Supabase Edge Functions)
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
