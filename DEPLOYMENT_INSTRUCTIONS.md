# AI Accountant - Deployment Instructions

This guide will help you deploy the AI Accountant project to GitHub Pages, Vercel, and Netlify.

## ✅ Project Status

- ✅ Git repository initialized
- ✅ All files committed
- ✅ Project builds successfully
- ✅ GitHub Actions workflows configured
- ✅ Vercel configuration ready
- ✅ Netlify configuration ready

## 📋 Deployment Steps

### 1. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `ai-accountant`
3. Description: "AI-powered accounting assistant with multi-platform deployment"
4. Make it **Public** (required for free GitHub Pages)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### 2. Push Code to GitHub

Run these commands in your terminal (replace `drublev77-ux` with your GitHub username if different):

```bash
cd /home/user/vite-template
git remote add origin https://github.com/drublev77-ux/ai-accountant.git
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository: https://github.com/drublev77-ux/ai-accountant
2. Click **Settings** → **Pages** (left sidebar)
3. Under "Source", select **GitHub Actions**
4. The deployment will start automatically
5. Your site will be available at: `https://drublev77-ux.github.io/ai-accountant/`

### 4. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Sign in with GitHub
3. Import your repository: `drublev77-ux/ai-accountant`
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**
6. Your site will be available at: `https://ai-accountant-[random].vercel.app`

#### Option B: Using GitHub Actions (Automatic)

1. Get your Vercel tokens:
   - Go to https://vercel.com/account/tokens
   - Create a new token
   - Copy the token

2. Get your Vercel Project ID and Org ID:
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   ```
   - Note the Project ID and Org ID from `.vercel/project.json`

3. Add GitHub Secrets:
   - Go to https://github.com/drublev77-ux/ai-accountant/settings/secrets/actions
   - Click **New repository secret**
   - Add these secrets:
     - `VERCEL_TOKEN`: Your Vercel token
     - `VERCEL_ORG_ID`: Your Org ID
     - `VERCEL_PROJECT_ID`: Your Project ID

4. Push to trigger deployment:
   ```bash
   git commit --allow-empty -m "Trigger Vercel deployment"
   git push
   ```

### 5. Deploy to Netlify

#### Option A: Using Netlify Dashboard (Recommended)

1. Go to https://app.netlify.com/start
2. Sign in with GitHub
3. Click **Import from Git** → **GitHub**
4. Select repository: `drublev77-ux/ai-accountant`
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 20
6. Click **Deploy site**
7. Your site will be available at: `https://[random-name].netlify.app`
8. You can customize the subdomain in Site settings

#### Option B: Using GitHub Actions (Automatic)

1. Get your Netlify tokens:
   - Go to https://app.netlify.com/user/applications#personal-access-tokens
   - Create a new token
   - Copy the token

2. Get your Netlify Site ID:
   - Create a new site on Netlify (can be empty)
   - Go to Site settings → General
   - Copy the **Site ID**

3. Add GitHub Secrets:
   - Go to https://github.com/drublev77-ux/ai-accountant/settings/secrets/actions
   - Add these secrets:
     - `NETLIFY_AUTH_TOKEN`: Your Netlify token
     - `NETLIFY_SITE_ID`: Your Site ID

4. Push to trigger deployment:
   ```bash
   git commit --allow-empty -m "Trigger Netlify deployment"
   git push
   ```

## 🎉 Deployment URLs

After completing the steps above, your app will be available at:

1. **GitHub Pages**: `https://drublev77-ux.github.io/ai-accountant/`
2. **Vercel**: `https://ai-accountant-[random].vercel.app`
3. **Netlify**: `https://[random-name].netlify.app`

## 🔧 Troubleshooting

### GitHub Pages not working?

- Make sure the repository is **Public**
- Check the Actions tab for build errors
- Ensure GitHub Pages is set to "GitHub Actions" source

### Vercel build failing?

- Check that Node version is 20
- Verify build command is `npm run build`
- Check build logs in Vercel dashboard

### Netlify build failing?

- Add environment variable: `NODE_VERSION=20`
- Verify publish directory is `dist`
- Check deploy logs in Netlify dashboard

## 📝 Next Steps

1. **Custom Domain**: Add your own domain in Vercel/Netlify settings
2. **Environment Variables**: Add any API keys in platform settings
3. **Analytics**: Enable analytics in Vercel/Netlify
4. **Monitoring**: Set up error tracking and performance monitoring

## 🔐 Security Notes

- All deployment configurations include security headers
- HTTPS is enabled by default on all platforms
- Keep your tokens and secrets secure
- Never commit `.env` files with sensitive data

---

Generated with [Claude Code](https://claude.com/claude-code)
