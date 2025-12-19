# ⚡ Quick Start Guide

Get your GitHub Actions Automation Dashboard running in 5 minutes!

## 🚀 Fast Track Setup

### Step 1: Copy Sentry DSN
Go to your Sentry dashboard and copy the DSN:
```
Settings → Client Keys → Copy DSN
```
Example: `https://den-49.sentry.io/onboarding/select-platform/`

### Step 2: Configure Environment
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and paste your DSN
# Replace the placeholder with your actual DSN
nano .env.local  # or use your preferred editor
```

Your `.env.local` should look like:
```env
VITE_SENTRY_DSN=https://YOUR-ACTUAL-DSN@sentry.io/YOUR-PROJECT-ID
SENTRY_AUTH_TOKEN=
VITE_ENVIRONMENT=production
```

### Step 3: Build & Deploy

```bash
# Install dependencies (if not already done)
npm install

# Build the project
npm run build

# Deploy to Vercel
npm run deploy:vercel
```

## 📱 What You'll Get

✅ **GitHub Actions Dashboard** - Monitor all workflows in one place
✅ **Real-time Updates** - Auto-refresh functionality
✅ **Error Tracking** - Sentry integration for production monitoring
✅ **Performance Monitoring** - Track app performance
✅ **Session Replay** - See what users experience

## 🎯 Next Steps

1. **Set up Vercel Environment Variables**
   ```bash
   vercel env add VITE_SENTRY_DSN
   vercel env add SENTRY_AUTH_TOKEN  # Optional, for source maps
   ```

2. **Test Your Deployment**
   - Open your Vercel URL
   - Check Sentry dashboard for events
   - Verify workflows are displaying

3. **Customize for Your Repository**
   - Update repository owner/name in the dashboard
   - Add your GitHub token for API integration
   - Configure workflow triggers

## 🔧 Commands Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Build for production |
| `npm run deploy:vercel` | Deploy to Vercel |
| `npm run check:safe` | Type check & lint |
| `npm run serve` | Preview build locally |

## 📖 Need More Details?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Complete Sentry setup guide
- Troubleshooting tips
- Security best practices
- Advanced configuration

## ❓ Common Issues

**Build fails?**
```bash
rm -rf node_modules dist
npm install
npm run build
```

**Sentry not working?**
- Verify DSN is correct in `.env.local`
- Check browser console for Sentry initialization
- Make sure DSN starts with `https://`

**Can't deploy to Vercel?**
```bash
# Login to Vercel
vercel login

# Try deploying again
vercel --prod
```

---

**Ready to deploy?** Run `npm run build && npm run deploy:vercel` now! 🚀
