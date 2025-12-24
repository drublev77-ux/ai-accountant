# 🤖 GitHub Actions Workflows

Automated CI/CD pipelines for building, testing, and deploying your application.

## 📋 Available Workflows

### 🚀 auto-deploy.yml (Primary)
**Automatic deployment to all platforms on push to main**

Deploys to:
- ✅ Vercel
- ✅ Netlify
- ✅ GitHub Pages

**Triggers:** Push to `main` or manual

### 🔨 ci.yml
**Continuous Integration - Build & Type Check**

**Triggers:** Push/PR to `main` or `develop`

### 📱 android-build.yml
**Build Android App Bundle (AAB)**

**Triggers:** Push/PR or manual

### 📄 github-pages.yml
**Standalone GitHub Pages deployment**

**Triggers:** Push to `main` or manual

---

## 🔐 Required Secrets

Add these to: **Settings → Secrets and variables → Actions**

### Vercel (Optional)
```
VERCEL_TOKEN=<your-token>
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<your-project-id>
```

**How to get:**
1. [Vercel Settings](https://vercel.com/account/tokens) → Create Token
2. Project Settings → Get Org ID & Project ID

### Netlify (Optional)
```
NETLIFY_AUTH_TOKEN=<your-token>
NETLIFY_SITE_ID=<your-site-id>
```

**How to get:**
1. [Netlify Settings](https://app.netlify.com/user/applications) → New access token
2. Site Settings → General → Site ID

### Android (Optional - for mobile builds)
```
ANDROID_KEYSTORE_BASE64=<base64-encoded-keystore>
ANDROID_KEYSTORE_PASSWORD=<password>
ANDROID_KEY_PASSWORD=<key-password>
ANDROID_KEY_ALIAS=<alias>
```

---

## 🚀 How It Works

### Automatic Deployment Flow

```
Push to main
     ↓
[Validate & Build]
     ↓
[Deploy in parallel]
 ├─→ Vercel
 ├─→ Netlify
 └─→ GitHub Pages
```

### Workflow Steps

1. ✅ Checkout code
2. ✅ Setup Node.js 22
3. ✅ Install dependencies (with caching)
4. ✅ Run `npm run check:safe` (TypeScript + ESLint)
5. ✅ Build production bundle
6. ✅ Deploy to all configured platforms
7. ✅ Upload build artifacts (7 days retention)

---

## 📊 Monitor Deployments

### Check Status
1. Go to **Actions** tab in repository
2. Click on latest workflow run
3. View deployment URLs in Summary

### Deployment URLs
After successful deployment, find URLs in:
- Workflow run summary
- Deployment comments (if enabled)
- Platform dashboards (Vercel/Netlify)

---

## 🔧 Manual Deployment

```bash
# Deploy to Vercel
npm run deploy:vercel

# Deploy to Netlify
npm run deploy:netlify

# Deploy to both
npm run deploy:all

# Manual workflow trigger
# Go to Actions → auto-deploy → Run workflow
```

---

## 🛠️ Customization

### Disable a Platform

Edit `.github/workflows/auto-deploy.yml` and comment out the job:

```yaml
# deploy-netlify:  # Disabled
#   name: Deploy to Netlify
#   ...
```

### Change Node Version

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22'  # Change here
```

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Test locally first
npm run check:safe
npm run build
```

### Deployment Fails
1. Check secrets are configured correctly
2. Verify platform tokens are valid
3. Review workflow logs in Actions tab

### Missing Secrets Error
```
Error: Input required and not supplied
```
**Solution:** Add required secrets in repository settings

### GitHub Pages Not Working
1. Settings → Pages → Source: GitHub Actions
2. Ensure workflow has `pages: write` permission

---

## 📚 Documentation

- [Main Deployment Guide](../../DEPLOYMENT.md)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)

---

**Need help?** Check [DEPLOYMENT.md](../../DEPLOYMENT.md) or create an issue.
