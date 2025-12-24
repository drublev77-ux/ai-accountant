# ⚡ Quick Start - Automatic Deployment

Get your app deployed in 5 minutes!

## 🚀 Option 1: GitHub Pages Only (Free & Easy)

**Perfect for:** Static sites, no backend needed

### Steps:
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository **Settings → Pages**
   - Source: **GitHub Actions**
   - Save

3. **Done!**
   - Check **Actions** tab for deployment status
   - Your site will be live at: `https://your-username.github.io/your-repo/`

**No secrets needed!** GitHub Pages deployment works out of the box.

---

## 🌐 Option 2: Vercel or Netlify (Production Ready)

**Perfect for:** Professional deployments, custom domains, edge functions

### Quick Setup:

#### Vercel
1. **Create Vercel Account** at [vercel.com](https://vercel.com)
2. **Import Repository** (GitHub integration)
3. **Get Tokens:**
   - Settings → Tokens → Create Token
   - Copy: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
4. **Add to GitHub:**
   - Repository Settings → Secrets → Actions
   - Add all three secrets
5. **Push to main** - Auto-deploys!

#### Netlify
1. **Create Netlify Account** at [netlify.com](https://netlify.com)
2. **Create Site** (link your repo)
3. **Get Tokens:**
   - User Settings → Applications → New access token
   - Site Settings → General → Site ID
4. **Add to GitHub:**
   - Repository Settings → Secrets → Actions
   - Add: `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`
5. **Push to main** - Auto-deploys!

---

## 🎯 What Happens on Push to Main?

```
Push to main
     ↓
✅ TypeScript type check
✅ ESLint validation
✅ Production build
     ↓
🚀 Deploy to all platforms
```

**Time:** ~5-7 minutes total

---

## 📊 Check Deployment Status

1. Go to **Actions** tab
2. Click latest workflow run
3. See deployment URLs in Summary

---

## 🔧 Manual Deployment (Alternative)

```bash
# Build locally
npm run build

# Deploy to Vercel
npm run deploy:vercel

# Deploy to Netlify
npm run deploy:netlify

# Deploy to both
npm run deploy:all
```

---

## 🆘 Troubleshooting

### "Workflow not running"
- Ensure you pushed to `main` branch
- Check Actions tab for any errors
- Verify `.github/workflows/auto-deploy.yml` exists

### "Deployment failed"
- Check secrets are configured
- Run `npm run check:safe` locally first
- Review workflow logs in Actions tab

### "GitHub Pages 404"
- Enable Pages: Settings → Pages → Source: GitHub Actions
- Wait a few minutes for DNS propagation

---

## 💡 Pro Tips

1. **Test locally first:** Always run `npm run check:safe` before pushing
2. **Use preview deployments:** Create PR to test before merging
3. **Monitor build times:** Check Actions tab for performance
4. **Custom domains:** Configure in Vercel/Netlify dashboard

---

## 📚 More Info

- Full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Workflow details: [.github/workflows/README.md](./.github/workflows/README.md)
- Platform docs: [Vercel](https://vercel.com/docs) | [Netlify](https://docs.netlify.com) | [GitHub Pages](https://docs.github.com/pages)

---

**That's it!** Your app deploys automatically on every push to main. 🎉
