# Vercel Deployment Guide - Real Estate Agent App

Complete step-by-step guide to deploy the Real Estate Agent Assistant to Vercel.

## Prerequisites

✅ GitHub repository created and pushed: https://github.com/tjcandesign/real-estate-agent-app.git
✅ Supabase database configured and running
✅ Clerk authentication credentials ready

## Step-by-Step Deployment

### 1. Go to Vercel Dashboard

Visit: https://vercel.com/dashboard

### 2. Create New Project

- Click **"Add New..."** → **"Project"**
- Select **"Import Git Repository"**
- Search for and select: `real-estate-agent-app`
- Click **"Import"**

### 3. Configure Project Settings

**Basic Settings:**
- **Project Name**: `real-estate-agent-app` (or your preference)
- **Framework**: Select **"Next.js"** (auto-detected)
- **Root Directory**: `./` (default)

**Don't click Deploy yet!** → Go to Environment Variables first

### 4. Add Environment Variables

In the Vercel dashboard, find the **"Environment Variables"** section and add:

| Variable Name | Value |
|---|---|
| `DATABASE_URL` | `postgresql://postgres:$WqKYtbz3%404wpKe@db.wqpffqvczjsjkwyojhzz.supabase.co:5432/postgres` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_Z2xvcmlvdXMtaG9ybmV0LTExLmNsZXJrLmFjY291bnRzLmRldiQ` |
| `CLERK_SECRET_KEY` | `sk_test_dU26TOdNqlkTYkh8p8iiNtaR2f84aaZlVfS5Kcl6DR` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/agents/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/agents/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/agents/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/agents/onboarding` |
| `NEXT_PUBLIC_APP_URL` | (Leave blank for now - we'll update after deployment) |

### 5. Deploy

Click **"Deploy"** and wait for deployment to complete (2-5 minutes).

You'll see:
- ✅ Build successful
- ✅ Deployment complete
- 🔗 Your live URL (e.g., `https://real-estate-agent-app.vercel.app`)

### 6. Update NEXT_PUBLIC_APP_URL

After successful deployment:

1. Go to **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_APP_URL`
3. Update the value to your deployment URL:
   ```
   https://real-estate-agent-app.vercel.app
   ```
   (Replace with your actual Vercel URL)
4. Save changes

5. Go to **Deployments** and click **"Redeploy"** on the latest deployment
   - This redeploys with the updated `NEXT_PUBLIC_APP_URL`

### 7. Verify Deployment

Visit your deployment URL:
- Open: `https://your-app.vercel.app/agents/sign-in`
- You should see the Agent Pro login page
- Try signing in with your Clerk credentials

---

## 🎯 Key Vercel Features

### Analytics
- **Settings** → **Analytics** - Monitor performance and usage

### Logs
- **Deployments** → **Logs** - View build and runtime logs
- **Functions** - Monitor serverless function performance

### Domains
- **Settings** → **Domains** - Add custom domain
  - Example: `agent-pro.yourdomain.com`

### Auto-Redeployment
- Vercel automatically redeploys when you push to GitHub main branch

---

## 🆘 Troubleshooting

### Build Fails
1. Check **Deployments** → **Logs** for error messages
2. Verify all environment variables are set
3. Check DATABASE_URL is correct

### 500 Error on Page Load
- Usually a database connection issue
- Verify DATABASE_URL in environment variables
- Check Supabase project is running

### Authentication Not Working
- Verify Clerk API keys are correct
- Check NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY
- Ensure Clerk application is active

### QR Code Not Generating
- Verify NEXT_PUBLIC_APP_URL is set to your deployment URL
- Redeploy after updating this variable

---

## 📊 Post-Deployment Checklist

- [ ] Visit your deployment URL
- [ ] Sign in with Clerk
- [ ] View dashboard at `/agents/dashboard`
- [ ] Test QR code generation on Clients page
- [ ] Check database connection works
- [ ] Monitor initial performance

---

## 🚀 Next Steps

1. **Custom Domain** (Optional)
   - Go to **Settings** → **Domains**
   - Add your custom domain

2. **SSL Certificate** (Automatic)
   - Vercel automatically provides free SSL
   - All HTTPS by default

3. **Monitoring**
   - Set up error alerts in **Settings**
   - Enable analytics

4. **Scaling**
   - Vercel auto-scales - no configuration needed

---

## 📞 Support Links

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Clerk Docs**: https://clerk.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

## 💡 Pro Tips

- Use `vercel --prod` CLI to deploy from your local machine
- Enable "Preview Deployments" to test PRs before merging
- Use Environment Variables for different stages (production/staging)
- Monitor build time in Analytics

Your Real Estate Agent app is now live! 🎉
