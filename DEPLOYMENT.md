# 🚀 Deployment Guide

Complete guide for automatic deployment to Vercel, Netlify, and GitHub Pages with Sentry error tracking.

## 📋 Table of Contents

- [Automatic Deployment](#automatic-deployment)
- [Platform Setup](#platform-setup)
- [GitHub Secrets Configuration](#github-secrets-configuration)
- [Manual Deployment](#manual-deployment)
- [Deployment Status](#deployment-status)

---

## 🔄 Automatic Deployment

Every push to the `main` branch automatically triggers deployment to:

- ✅ **Vercel** - Primary production deployment
- ✅ **Netlify** - Secondary production deployment
- ✅ **GitHub Pages** - Static hosting

The workflow validates code, runs type checking and linting before deploying.

### Workflow Steps

1. **Validate & Build** - TypeScript check, ESLint, production build
2. **Deploy to Vercel** - Fast global CDN deployment
3. **Deploy to Netlify** - Alternative hosting with edge functions
4. **Deploy to GitHub Pages** - Free static hosting

---

## 🛠️ Platform Setup

### Vercel Setup

1. Create account at [vercel.com](https://vercel.com)
2. Import your repository
3. Get your tokens from Vercel dashboard:
   - Go to Settings → Tokens
   - Create a new token
   - Copy: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### Netlify Setup

1. Create account at [netlify.com](https://netlify.com)
2. Create a new site (link your repository)
3. Get your tokens from Netlify dashboard:
   - Go to User Settings → Applications
   - Create a new access token
   - Copy: `NETLIFY_AUTH_TOKEN`
   - Get `NETLIFY_SITE_ID` from Site Settings → General

### GitHub Pages Setup

1. Go to repository Settings → Pages
2. Source: GitHub Actions
3. No additional configuration needed - already configured!

### Sentry Setup (Optional - Error Tracking)

1. Create account at [sentry.io](https://sentry.io)
2. Create a new project
3. Get your DSN from: Settings → Projects → [Your Project] → Client Keys (DSN)
4. Create auth token for source map uploads

---

## 🔐 GitHub Secrets Configuration

Add these secrets to your repository:

**Repository Settings → Secrets and variables → Actions → New repository secret**

### Required Secrets

#### Vercel
```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<your-project-id>
```

#### Netlify
```
NETLIFY_AUTH_TOKEN=<your-netlify-token>
NETLIFY_SITE_ID=<your-site-id>
```

#### Sentry (Optional)
```
SENTRY_DSN=<your-sentry-dsn>
SENTRY_AUTH_TOKEN=<your-sentry-auth-token>
```

#### Android (Optional - for mobile builds)
```
ANDROID_KEYSTORE_BASE64=<base64-encoded-keystore>
ANDROID_KEYSTORE_PASSWORD=<keystore-password>
ANDROID_KEY_PASSWORD=<key-password>
ANDROID_KEY_ALIAS=<key-alias>
```

---

## ⚙️ Detailed Configuration Steps

### 1. Sentry Setup (Optional)

#### Get Your Sentry DSN
1. Go to [https://sentry.io/settings/](https://sentry.io/settings/)
2. Navigate to: **Projects** → **[Your Project]** → **Settings** → **Client Keys (DSN)**
3. Copy your DSN (format: `https://xxxxx@sentry.io/xxxxx`)

#### Get Sentry Auth Token
1. Go to [https://sentry.io/settings/account/api/auth-tokens/](https://sentry.io/settings/account/api/auth-tokens/)
2. Click **Create New Token**
3. Name: "Vercel Deployment"
4. Required scopes:
   - `project:releases`
   - `project:write`
   - `org:read`
5. Copy the token

### 2. Environment Configuration

#### Local Development
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add your Sentry DSN
VITE_SENTRY_DSN=https://your-actual-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-sentry-auth-token
VITE_ENVIRONMENT=development
```

#### Production (Vercel)
```bash
# Set environment variables in Vercel
vercel env add VITE_SENTRY_DSN
# Paste your Sentry DSN when prompted

vercel env add SENTRY_AUTH_TOKEN
# Paste your Sentry auth token when prompted

vercel env add VITE_ENVIRONMENT
# Enter: production
```

---

## 📦 Manual Deployment

You can also deploy manually using npm scripts:

### Deploy to Vercel
```bash
npm run deploy:vercel
```

### Deploy to Netlify
```bash
npm run deploy:netlify
```

### Deploy to Both
```bash
npm run deploy:all
```

### Build Only
```bash
npm run build
```

### Preview Deployments

```bash
# Vercel preview
npm run preview:vercel

# Netlify preview
npm run preview:netlify
```

---

## 📊 Deployment Status

### Check Deployment Status

1. Go to the **Actions** tab in your repository
2. Click on the latest workflow run
3. View deployment URLs in the summary

### Workflow Triggers

- **Automatic:** Push to `main` branch
- **Manual:** Go to Actions → Auto Deploy to Production → Run workflow

### Build Artifacts

Build artifacts are saved for 7 days and can be downloaded from the Actions tab.

---

### 3. Build and Test Locally

#### Test Build Locally
```bash
# Install dependencies
npm install

# Run type checking and linting
npm run check:safe

# Build the project
npm run build

# Preview the build
npm run serve
```

---

## 🔧 Troubleshooting

### Deployment Fails

1. **Check secrets:** Ensure all required secrets are configured
2. **Check build:** Run `npm run check:safe` locally
3. **Check logs:** View detailed logs in Actions tab

### Vercel Deployment Issues

```bash
# Test Vercel locally
npx vercel

# Deploy to production
npx vercel --prod
```

### Netlify Deployment Issues

```bash
# Test Netlify locally
npx netlify dev

# Deploy to production
npx netlify deploy --prod
```

### GitHub Pages Not Working

1. Enable Pages in repository settings
2. Set source to "GitHub Actions"
3. Ensure workflow has `pages: write` permission

---

## 🎯 Environment Variables

Configure these in your deployment platform:

### Production Variables
- `VITE_SENTRY_DSN` - Sentry error tracking
- `VITE_ENVIRONMENT` - Set to "production"
- `SENTRY_AUTH_TOKEN` - Sentry upload token

### Vercel
Add in `vercel.json` or Vercel dashboard under Environment Variables

### Netlify
Add in `netlify.toml` or Netlify dashboard under Site Settings → Environment Variables

---

## 🔄 Continuous Deployment Flow

```
┌─────────────────┐
│  Push to main   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Run CI Tests   │
│  Type Check     │
│  Lint           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build Project  │
└────────┬────────┘
         │
    ┌────┴────┬────────────┬──────────────┐
    ▼         ▼            ▼              ▼
┌────────┐ ┌─────────┐ ┌────────────┐ ┌─────────┐
│ Vercel │ │ Netlify │ │ GitHub     │ │ Android │
│        │ │         │ │ Pages      │ │ (AAB)   │
└────────┘ └─────────┘ └────────────┘ └─────────┘
```

---

## 💡 Tips

1. **Use Preview Deployments:** Test changes on preview URLs before merging
2. **Monitor Build Times:** GitHub Actions provides build time analytics
3. **Cache Dependencies:** npm caching is already configured
4. **Review Deploy Previews:** Check deployment summaries in Actions tab

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [GitHub Pages Documentation](https://docs.github.com/pages)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)

---

## ✅ Quick Start Checklist

- [ ] Repository pushed to GitHub
- [ ] GitHub Pages enabled (Settings → Pages → Source: GitHub Actions)
- [ ] Vercel account created (optional)
- [ ] Netlify account created (optional)
- [ ] GitHub secrets configured (for Vercel/Netlify)
- [ ] Push to `main` branch triggers automatic deployment
- [ ] Check Actions tab for deployment status
- [ ] Visit deployment URLs

---

**Need help?** Check the workflow logs in the Actions tab or create an issue.
