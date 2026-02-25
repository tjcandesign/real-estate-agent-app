# Real Estate Agent App - Setup Guide

Complete setup guide for getting the Real Estate Agent Assistant running locally and deploying to production.

## 🚀 Quick Start (5 minutes)

### 1. Get Your Database URL from Supabase

1. Visit [supabase.com](https://supabase.com)
2. Create a new project (or use existing):
   - Name: `real-estate-agent-app`
   - Choose your region
   - Save the database password
3. Go to **Settings → Database → Connection string**
4. Copy the full connection string (starts with `postgresql://`)

### 2. Configure Environment Variables

```bash
cd /Users/tjcichecki/real-estate-agent-app
```

Create/update `.env.local` with:

```env
# Database (from Supabase)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...your_key...
CLERK_SECRET_KEY=sk_test_...your_secret...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/agents/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/agents/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/agents/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/agents/onboarding

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3003
```

### 3. Run Automated Setup

```bash
./setup.sh
```

This will:
- ✅ Install dependencies
- ✅ Generate Prisma client
- ✅ Create database schema
- ✅ Run migrations

### 4. Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3003**

---

## 📚 Detailed Steps

### Step 1: Create Supabase Project

**What is Supabase?**
- PostgreSQL database hosting
- Real-time API
- Free tier available

**How to set up:**

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Fill in details:
   - **Name**: `real-estate-agent-app` (or your choice)
   - **Database Password**: Create strong password (save it!)
   - **Region**: Choose closest to your location
4. Wait 2-3 minutes for database creation
5. Once ready, click on your project

### Step 2: Get Connection String

1. In Supabase dashboard, go to **Settings → Database**
2. Find **Connection string** section
3. Look for the **URI** tab
4. Copy the entire connection string
5. Replace `[YOUR-PASSWORD]` with your database password

Example format:
```
postgresql://postgres:your_password@db.project-id.supabase.co:5432/postgres
```

### Step 3: Environment Setup

1. Navigate to your project:
   ```bash
   cd /Users/tjcichecki/real-estate-agent-app
   ```

2. Open `.env.local` in your text editor

3. Update with your values:
   - `DATABASE_URL` - From Supabase
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
   - `CLERK_SECRET_KEY` - From Clerk dashboard
   - Leave other values as-is

4. Save the file

### Step 4: Install & Initialize

**Option A: Using automated script (recommended)**
```bash
./setup.sh
```

**Option B: Manual steps**
```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Create database schema and run migrations
npm run prisma:migrate
```

When prompted to create your first migration, press Enter to confirm.

### Step 5: Start Development

```bash
npm run dev
```

Open [http://localhost:3003](http://localhost:3003) in your browser.

---

## 🔑 Getting Clerk API Keys

The Real Estate Agent app uses Clerk for authentication.

### Option 1: Use Existing Clerk Instance
If you already have Clerk set up:
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys**
4. Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

### Option 2: Create New Clerk Instance
1. Go to [clerk.com](https://clerk.com)
2. Sign up or log in
3. Create new application
4. Choose "Next.js" as framework
5. Follow the setup guide
6. Copy API keys to `.env.local`

---

## 🗄️ Database Management

### View Your Database with Prisma Studio

```bash
npm run prisma:studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555) where you can:
- View all tables and data
- Create/edit/delete records
- Manage relationships

### Understanding the Database Schema

The app includes these main tables:

- **Agents** - Real estate agents
- **Clients** - Client records
- **ClientPreferences** - Client property preferences
- **ChecklistTemplate** - Reusable checklist templates
- **ChecklistTemplateItem** - Items in templates
- **DocumentChecklist** - Client-specific checklists
- **ClientOnboardingLink** - QR code links for client signup
- **AuditLog** - Record of all actions

### Run Migrations

If you update `prisma/schema.prisma`:

```bash
npm run prisma:migrate
```

This creates a new migration file and applies changes to your database.

---

## 🚀 Deployment to Vercel

### Prerequisites
- GitHub account with code pushed
- Vercel account
- Environment variables ready

### Deploy Steps

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/real-estate-agent-app.git
   git branch -M main
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com)**

3. **Click "New Project"**

4. **Select your GitHub repository**

5. **Add Environment Variables**
   - `DATABASE_URL` - Your Supabase connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk key
   - `CLERK_SECRET_KEY` - Your Clerk secret
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - `/agents/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - `/agents/sign-up`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` - `/agents/dashboard`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` - `/agents/onboarding`
   - `NEXT_PUBLIC_APP_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

6. **Click Deploy**

7. **Update `NEXT_PUBLIC_APP_URL`**
   - After first deployment, update this to your actual Vercel URL
   - Go to Vercel Settings → Environment Variables
   - Update the value with your deployment URL

---

## ✅ Verify Setup

After setup, verify everything works:

- [ ] Server starts: `npm run dev`
- [ ] Can access: `http://localhost:3003`
- [ ] Sign in page loads: `http://localhost:3003/agents/sign-in`
- [ ] Can view database: `npm run prisma:studio`
- [ ] No database errors in console

---

## 🆘 Troubleshooting

### "DATABASE_URL not found"
- Check `.env.local` exists in project root
- Ensure DATABASE_URL line is not commented out
- Restart development server: `npm run dev`

### "Cannot connect to database"
- Verify DATABASE_URL is correct (copy from Supabase again)
- Check password is correct (replace [YOUR-PASSWORD])
- Ensure Supabase project is running
- Test connection: `npm run prisma:studio`

### "Clerk authentication not working"
- Verify API keys in `.env.local`
- Check Clerk dashboard for API keys
- Ensure keys are for the correct application
- Restart dev server after updating keys

### "Migration failed"
- Check database is accessible
- Verify DATABASE_URL is correct
- Run: `npx prisma migrate reset` (⚠️ deletes all data)
- Then run: `npm run prisma:migrate`

### "Port 3003 already in use"
```bash
# Find and kill process using port 3003
lsof -i :3003
kill -9 <PID>

# Or use different port
npm run dev -- -p 3004
```

---

## 📞 Support

If you encounter issues:

1. Check the error message carefully
2. Review this setup guide
3. Check environment variables
4. Restart the dev server
5. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

---

## 🎉 You're All Set!

Your Real Estate Agent app is ready to develop. Start with:

```bash
npm run dev
```

Then visit [http://localhost:3003](http://localhost:3003) and begin building! 🚀
