# ⚡ Quick Start - Real Estate Agent App

Get up and running in 5 minutes.

## 📋 Before You Start

You'll need:
1. **Supabase account** (free) - for PostgreSQL database
2. **Clerk account** (free) - for authentication
3. **Node.js** 18+ installed

## 🚀 5-Minute Setup

### 1️⃣ Get Database URL from Supabase

```
1. Go to supabase.com
2. Create new project or open existing
3. Settings → Database → Connection string
4. Copy the URI (starts with postgresql://)
5. Replace [YOUR-PASSWORD] with your DB password
```

### 2️⃣ Configure .env.local

```bash
# Copy the example file
cp .env.example .env.local

# Then edit .env.local and fill in:
# - DATABASE_URL (from Supabase)
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (from Clerk)
# - CLERK_SECRET_KEY (from Clerk)
```

### 3️⃣ Run Setup Script

```bash
./setup.sh
```

This automatically:
- Installs dependencies
- Sets up database
- Runs migrations

### 4️⃣ Start Development

```bash
npm run dev
```

Visit: **http://localhost:3003**

Done! 🎉

---

## 📚 Need More Help?

- **Full Setup Guide**: Read `SETUP.md`
- **Environment Variables**: See `.env.example`
- **Troubleshooting**: Check `SETUP.md` troubleshooting section

---

## 🔗 Useful Resources

| Resource | Link |
|----------|------|
| **Supabase** | https://supabase.com |
| **Clerk** | https://clerk.com |
| **Vercel** | https://vercel.com |
| **Next.js Docs** | https://nextjs.org |
| **Prisma Docs** | https://prisma.io |

---

## 💡 Common Commands

```bash
# Start development server
npm run dev

# View database with GUI
npm run prisma:studio

# Create database backup
npm run prisma:migrate

# Build for production
npm build

# Run linting
npm run lint
```

---

## ❌ Having Issues?

**Database connection error?**
- Double-check DATABASE_URL in .env.local
- Verify password is correct
- Ensure Supabase project is running

**Can't sign in?**
- Check Clerk API keys in .env.local
- Verify keys match your Clerk app

**Port 3003 already in use?**
```bash
npm run dev -- -p 3004  # Use different port
```

More troubleshooting in `SETUP.md` →

---

**Ready to deploy?** See `SETUP.md` for Vercel deployment instructions.
