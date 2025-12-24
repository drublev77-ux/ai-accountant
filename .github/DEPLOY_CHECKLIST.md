# ✅ GitHub Pages Deployment Checklist

## Before First Deploy

- [ ] Create GitHub repository at https://github.com/new
- [ ] Name: `vite-template` (or custom name)
- [ ] DO NOT create README, .gitignore, or LICENSE
- [ ] Push code to GitHub:
  ```bash
  git add .
  git commit -m "Initial commit: AI Accountant with optimizations"
  git remote add origin https://github.com/YOUR_USERNAME/vite-template.git
  git push -u origin main
  ```

## Enable GitHub Pages

- [ ] Go to repository **Settings** → **Pages**
- [ ] Under **Source**, select: `GitHub Actions`
- [ ] Click **Save**

## Verify Deployment

- [ ] Go to **Actions** tab
- [ ] Wait for workflow to complete (2-3 minutes)
- [ ] Green checkmark ✅ appears
- [ ] Site is live at: `https://YOUR_USERNAME.github.io/vite-template/`

## Post-Deployment Checks

- [ ] Site loads without errors
- [ ] Routing works (navigation between pages)
- [ ] Assets load (images, icons, styles)
- [ ] No console errors
- [ ] Mobile responsive

## For Custom Repository Name

If your repo is not `vite-template`:

- [ ] Update `package.json` line 11:
  ```json
  "serve:gh-pages": "vite preview --base /YOUR_REPO_NAME/",
  ```

## Troubleshooting

**404 Error:**
- Check Settings → Pages → Source is `GitHub Actions`
- Verify repo name matches in `package.json`

**Workflow Not Running:**
- Settings → Actions → General
- Set Workflow permissions to `Read and write permissions`

**Build Fails:**
```bash
npm run check:safe
npm run build:gh-pages
```

## Next Deployments

Every `git push` to `main` automatically deploys!

```bash
git add .
git commit -m "Update features"
git push
```

---

**Full documentation:** See `GITHUB_DEPLOY.md`
