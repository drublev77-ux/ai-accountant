# 🚀 Deployment Guide - AI Accountant App

This guide provides step-by-step instructions for deploying your AI Accountant application to popular hosting services.

## 📋 Table of Contents

1. [Vercel Deployment](#vercel-deployment)
2. [Netlify Deployment](#netlify-deployment)
3. [GitHub Pages Deployment](#github-pages-deployment)
4. [Environment Variables](#environment-variables)
5. [Build Verification](#build-verification)

---

## 🔷 Vercel Deployment

**Vercel** is the recommended hosting platform for Vite + React applications. It offers automatic builds, instant deployments, and excellent performance.

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Create Vercel Account**
   - Visit [vercel.com](https://vercel.com)
   - Sign up with GitHub, GitLab, or Bitbucket

2. **Import Your Project**
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Authorize Vercel to access your repository
   - Select your project repository

3. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables** (if needed)
   - Click "Environment Variables"
   - Add `TENANT_ID` if using multi-tenant setup

5. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes for build completion
   - Your app will be live at `https://your-app.vercel.app`

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Automatic Deployments

Every push to your main branch will automatically deploy to production. Pull requests get preview deployments.

**Vercel Configuration:** `vercel.json` (already configured)

### Security Headers Configured:
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Cache-Control for static assets (1 year)

---

## 🔶 Netlify Deployment

**Netlify** is another excellent option with similar features to Vercel.

### Method 1: Deploy via Netlify Dashboard

1. **Create Netlify Account**
   - Visit [netlify.com](https://netlify.com)
   - Sign up with GitHub, GitLab, or Bitbucket

2. **Import Your Project**
   - Click "Add new site" → "Import an existing project"
   - Select Git provider and authorize Netlify
   - Choose your repository

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `20`

4. **Add Environment Variables** (if needed)
   - Go to Site Settings → Environment Variables
   - Add `TENANT_ID` if using multi-tenant setup

5. **Deploy**
   - Click "Deploy site"
   - Your app will be live at `https://your-app.netlify.app`

### Method 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# Or deploy manually
netlify deploy --prod
```

### Automatic Deployments

Every push to your main branch triggers automatic deployment.

**Netlify Configuration:** `netlify.toml` (already configured)

### Security Headers Configured:
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Cache-Control for static assets (1 year)

---

## 🔹 GitHub Pages Deployment

For free static hosting on GitHub:

### Step 1: Install gh-pages

```bash
npm install --save-dev gh-pages
```

### Step 2: Update package.json

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://<username>.github.io/<repository-name>"
}
```

### Step 3: Update vite.config.js

```javascript
export default defineConfig({
  base: '/<repository-name>/',
  // ... rest of config
})
```

### Step 4: Deploy

```bash
npm run deploy
```

Your app will be live at `https://<username>.github.io/<repository-name>`

---

## 🔐 Environment Variables

If your app uses environment variables, configure them in your hosting platform:

### Vercel
- Dashboard: Project Settings → Environment Variables
- CLI: Use `.env` file or `vercel env` command

### Netlify
- Dashboard: Site Settings → Environment Variables
- CLI: Use `.env` file or `netlify env:set`

### GitHub Pages
- Use GitHub Secrets for build-time variables
- Go to Repository Settings → Secrets and Variables → Actions

### Common Variables

```bash
# Multi-tenant setup (if needed)
TENANT_ID=your-tenant-id

# API endpoints (if needed)
VITE_API_URL=https://api.yourapp.com

# Payment credentials (use production keys)
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx
VITE_PAYPAL_CLIENT_ID=your-production-client-id
```

---

## ✅ Build Verification

Before deploying, verify your build works locally:

### Step 1: Run Type Checking

```bash
npm run check:safe
```

### Step 2: Build the Project

```bash
npm run build
```

### Step 3: Preview Production Build

```bash
npm run serve
```

Visit `http://localhost:4173` to test the production build.

### Expected Output

```
✓ built in 15s
✓ 150 chunks transformed
dist/index.html                   1.20 kB
dist/assets/index-abc123.css      45.2 kB
dist/assets/index-xyz789.js      425.8 kB
```

---

## 🎯 Quick Start Summary

### Fastest Deployment (Vercel)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

### Custom Domain Setup

**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

**Netlify:**
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Update DNS records as instructed

---

## 🔍 Troubleshooting

### Build Fails

- Check Node version (requires Node 20+)
- Run `npm install` to ensure dependencies are installed
- Run `npm run check:safe` locally first
- Check build logs for specific errors

### Blank Page After Deployment

- Check browser console for errors
- Verify `base` path in `vite.config.js`
- Ensure routing redirects are configured

### 404 Errors on Page Refresh

- Verify redirect rules are configured:
  - Vercel: Check `vercel.json`
  - Netlify: Check `netlify.toml`

### Environment Variables Not Working

- Use `VITE_` prefix for runtime variables
- Rebuild after adding variables
- Check variable names match exactly

---

## 📊 Performance Optimization

Both Vercel and Netlify automatically provide:

✅ **CDN distribution** (global edge network)
✅ **Automatic HTTPS** (SSL certificates)
✅ **Gzip/Brotli compression**
✅ **HTTP/2 support**
✅ **Automatic asset caching**
✅ **DDoS protection**

---

## 🎉 Success!

Once deployed, your AI Accountant app will be:

- **Live 24/7** with 99.9% uptime
- **Globally distributed** via CDN
- **Automatically updated** on every push
- **Secured with HTTPS**
- **Optimized for performance**

Share your live URL with users and start accepting payments! 💳

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **GitHub Pages**: https://pages.github.com

For payment integration issues, see `PAYPAL_SETUP.md`.
