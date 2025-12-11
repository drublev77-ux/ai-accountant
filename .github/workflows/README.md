# GitHub Actions - Automatic Deployment

This workflow automatically deploys your application to Vercel when you push to the main branch.

## 🔐 Required Secrets

To enable automatic deployment, add these secrets to your GitHub repository:

### Step 1: Get Vercel Token

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it: `GitHub Actions`
4. Copy the token

### Step 2: Get Vercel Project Info

Your project is already configured:
- **Project ID:** `prj_wf47Uu7TYt5OrsCjhBmlaI6ckKE3`
- **Org ID:** `team_mTeewqzwaMG7MAQ4rBQPI8AA`

Or get them from `.vercel/project.json`

### Step 3: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add these three secrets:

| Secret Name | Value | Where to Find |
|------------|-------|---------------|
| `VERCEL_TOKEN` | Your Vercel token | Created in Step 1 |
| `VERCEL_ORG_ID` | `team_mTeewqzwaMG7MAQ4rBQPI8AA` | From `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `prj_wf47Uu7TYt5OrsCjhBmlaI6ckKE3` | From `.vercel/project.json` |

## 🚀 How It Works

### Automatic Deployment

- **Push to main/master:** Automatically deploys to production
- **Pull Request:** Creates a preview deployment
- **Type checking:** Runs before deployment
- **Build verification:** Ensures no errors

### Workflow Steps

1. ✅ Checkout code
2. ✅ Setup Node.js 20
3. ✅ Install dependencies
4. ✅ Run type checks and linting
5. ✅ Build project
6. ✅ Deploy to Vercel

## 📊 Workflow Status

Check deployment status:
- Go to your repository → Actions tab
- See all workflow runs and their status
- Click on a run to see detailed logs

## 🔧 Manual Deployment

If you prefer manual deployment:

```bash
# Option 1: Use the deploy script
./deploy.sh

# Option 2: Direct Vercel CLI
vercel --prod

# Option 3: Netlify
netlify deploy --prod --dir=dist
```

## ❌ Disable Automatic Deployment

To disable automatic deployment:
1. Delete or rename `.github/workflows/deploy.yml`
2. Or comment out the workflow file

## 🆘 Troubleshooting

### Workflow Fails

1. Check GitHub Actions logs
2. Verify secrets are set correctly
3. Ensure Vercel project exists
4. Check build passes locally: `npm run build`

### Missing Secrets

Error: `Error: Input required and not supplied: vercel-token`

**Solution:** Add all three required secrets to GitHub (see Step 3 above)

### Build Fails

1. Test locally: `npm run check:safe`
2. Check error logs in Actions tab
3. Verify all dependencies are in `package.json`

## 📞 Support

- **GitHub Actions Docs:** https://docs.github.com/actions
- **Vercel GitHub Integration:** https://vercel.com/docs/git/vercel-for-github
- **Workflow Syntax:** https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
