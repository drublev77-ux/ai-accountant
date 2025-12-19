# 🚀 GitHub Actions Automation Dashboard

A modern, production-ready dashboard for monitoring and managing GitHub Actions workflows with integrated Sentry error tracking.

![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![Sentry](https://img.shields.io/badge/Sentry-Integrated-red)

## ✨ Features

### 🎯 Workflow Management
- **Real-time Monitoring** - Track all GitHub Actions workflows in one dashboard
- **Auto-refresh** - Automatic updates every 30 seconds
- **Advanced Filtering** - Filter by workflow type and status
- **Search Functionality** - Quick search across workflow names
- **Workflow Triggers** - Manual workflow execution controls

### 📊 Dashboard Features
- **Workflow Cards** - Visual overview of all workflows
  - Build Android AAB
  - CodeQL Security Scanning
  - Dependabot Updates
  - Deploy to GitHub Pages
- **Run History** - Detailed execution logs with:
  - Status badges (success/failure/running/queued)
  - Duration tracking
  - Branch and commit information
  - Actor and event type
- **Statistics Dashboard** - Aggregated metrics for all workflows

### 🔧 Technical Features
- **TypeScript** - Full type safety
- **React 19** - Latest React features
- **TanStack Router** - File-based routing
- **Tailwind CSS v4** - Modern styling
- **shadcn/ui** - Beautiful UI components
- **Sentry Integration** - Error tracking and performance monitoring

## 🏗️ Architecture

```
vite-template/
├── src/
│   ├── routes/
│   │   └── index.tsx          # Main dashboard component
│   ├── components/ui/          # shadcn/ui components
│   ├── main.tsx               # App entry + Sentry init
│   └── styles.css             # Global styles
├── .env.example               # Environment template
├── .env.local                 # Local configuration (gitignored)
├── vite.config.js             # Vite + Sentry plugin config
├── vercel.json                # Vercel deployment config
├── QUICKSTART.md              # Quick start guide
└── DEPLOYMENT.md              # Detailed deployment guide
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Sentry account (free tier works)
- Vercel account (optional, for deployment)

### 1. Clone & Install
```bash
git clone <your-repo>
cd vite-template
npm install
```

### 2. Configure Sentry
```bash
# Copy environment template
cp .env.example .env.local

# Get your Sentry DSN from:
# https://sentry.io/settings/projects/[your-project]/keys/

# Edit .env.local and add your DSN
VITE_SENTRY_DSN=https://your-dsn@sentry.io/your-project
```

### 3. Build & Deploy
```bash
# Build the project
npm run build

# View bundle analysis
start dist/stats.html  # Windows
open dist/stats.html   # macOS
xdg-open dist/stats.html  # Linux

# Deploy to Vercel
npm run deploy:vercel
```

**🎉 That's it!** See [QUICKSTART.md](./QUICKSTART.md) for more details.

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Production build with Sentry |
| `npm run check:safe` | TypeScript check + ESLint + format |
| `npm run serve` | Preview production build |
| `npm run deploy:vercel` | Deploy to Vercel |
| `npm run deploy:netlify` | Deploy to Netlify |
| `npm run deploy:all` | Build and deploy everywhere |

## 🛠️ Tech Stack

### Core
- **React 19** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 7** - Build tool
- **TanStack Router** - Routing
- **TanStack Query** - State management

### UI & Styling
- **Tailwind CSS v4** - Utility-first CSS
- **shadcn/ui** - Component library
- **Lucide React** - Icon library
- **Radix UI** - Headless components

### Monitoring & Analytics
- **Sentry** - Error tracking & performance
- **Web Vitals** - Performance metrics

### DevOps
- **Vercel** - Deployment platform
- **Rollup Visualizer** - Bundle analysis
- **Biome** - Linting & formatting

## 📊 Bundle Size

After building, view the interactive bundle analysis:

```bash
# The build automatically generates dist/stats.html
npm run build

# Open the analysis (choose your OS)
start dist/stats.html        # Windows
open dist/stats.html         # macOS
xdg-open dist/stats.html     # Linux
```

Current optimizations:
- ✅ Code splitting by vendor
- ✅ Tree shaking enabled
- ✅ Console logs removed in production
- ✅ Terser minification
- ✅ Gzip/Brotli compression

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SENTRY_DSN` | Yes | Sentry Data Source Name |
| `SENTRY_AUTH_TOKEN` | Optional* | For source map uploads |
| `VITE_ENVIRONMENT` | No | Environment name (production/staging) |

*Required for production source maps

### Sentry Setup

1. **Get DSN**
   - Go to [Sentry Dashboard](https://sentry.io)
   - Settings → Projects → Your Project → Client Keys
   - Copy the DSN

2. **Get Auth Token** (for source maps)
   - Settings → Account → API → Auth Tokens
   - Create token with scopes: `project:releases`, `project:write`

3. **Configure locally**
   ```bash
   cp .env.example .env.local
   # Add your DSN to .env.local
   ```

4. **Configure Vercel**
   ```bash
   vercel env add VITE_SENTRY_DSN
   vercel env add SENTRY_AUTH_TOKEN
   ```

## 📈 Features in Detail

### Auto-refresh Toggle
Enable automatic workflow status updates every 30 seconds:
```typescript
const [autoRefresh, setAutoRefresh] = useState(false);
```

### Advanced Filtering
Filter workflows by:
- Workflow type (Build, CodeQL, Dependabot, Deploy)
- Status (success, failure, running, queued)
- Search query (name/description)

### Workflow Triggers
Manually trigger workflows with one click:
```typescript
const triggerWorkflow = async (workflowName: string) => {
  // GitHub API integration ready
  // Just add your token!
};
```

### Real-time Updates
Mock data currently, but ready for GitHub API:
```typescript
// TODO: Replace with GitHub API
const response = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/actions/runs`
);
```

## 🚀 Automatic Deployment

### ✨ Push-to-Deploy Workflow

Every push to the `main` branch automatically deploys to:
- ✅ **Vercel** - Global CDN hosting
- ✅ **Netlify** - Edge functions support
- ✅ **GitHub Pages** - Free static hosting

**No manual steps required!** Just push your code.

```bash
git add .
git commit -m "Your changes"
git push origin main

# 🎉 Automatic deployment triggered!
# Check the Actions tab for deployment status
```

### 🔧 Setup (One-time)

1. **Enable GitHub Pages**
   - Settings → Pages → Source: GitHub Actions

2. **Add Deployment Secrets** (optional for Vercel/Netlify)
   - Settings → Secrets → Actions
   - Add: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
   - Add: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`

3. **Push to main** - Deployment starts automatically!

### 📊 Check Deployment Status

- Go to **Actions** tab in your repository
- Click on the latest workflow run
- View deployment URLs in the summary

### Manual Deployment

```bash
# Deploy to Vercel
npm run deploy:vercel

# Deploy to Netlify
npm run deploy:netlify

# Deploy to both
npm run deploy:all
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed configuration.

## 🐛 Troubleshooting

### Build Fails
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Sentry Not Working
- Check DSN format: `https://xxx@sentry.io/xxx`
- Verify environment variable is loaded
- Check browser console for initialization

### Type Errors
```bash
npm run check:safe
```

## 📚 Documentation

- [Quick Start Guide](./QUICKSTART.md) - Get running in 5 minutes
- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [Project Instructions](./CLAUDE.md) - Development guidelines

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Run `npm run check:safe` before committing
4. Commit your changes
5. Push to the branch
6. Open a Pull Request

## 📄 License

MIT License - feel free to use this project however you'd like!

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful component library
- **TanStack** - Amazing React tools
- **Sentry** - Best-in-class error tracking
- **Vercel** - Seamless deployment

## 📞 Support

- 📖 [Documentation](./DEPLOYMENT.md)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
