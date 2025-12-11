# AI Accountant - Personal Financial Assistant

AI-powered personal accountant for tracking finances, calculating taxes, and managing your money with intelligent insights.

## 🎯 Features

- **Finance Tracking**: Upload bank statements, receipts, and financial documents
- **Tax Calculations**: Automated tax estimation and deductions
- **AI-Powered Insights**: Smart financial recommendations
- **Payment Integration**: Accepts Credit Cards, PayPal, Apple Pay, and Google Pay
- **Secure & Private**: All data processed securely

## 💳 Payment Methods

- **Credit Cards** (Visa, Mastercard, Amex, Discover) via Stripe
- **PayPal** account payments
- **Apple Pay** (Safari/iOS)
- **Google Pay** (Chrome/Android)
- **App Store** purchases (iOS/Android)

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run type checking & linting
npm run check:safe

# Build for production
npm run build

# Preview production build
npm run serve
```

### Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete deployment instructions.

**Quick Deploy:**

```bash
# Deploy to Vercel
npm install -g vercel
vercel --prod

# Deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod
```

## 📁 Project Structure

- `src/routes/index.tsx` - Main application code
- `src/components/` - UI components (PayPal, Stripe, Apple Pay, Google Pay buttons)
- `index.html` - HTML entry point
- `vercel.json` - Vercel deployment config
- `netlify.toml` - Netlify deployment config

## 🔧 Technology Stack

- **React 19** with TypeScript
- **TanStack Router** for routing
- **TanStack Query** for state management
- **Tailwind CSS v4** for styling
- **shadcn/ui** components
- **Stripe** for card payments
- **PayPal SDK** for PayPal/Apple Pay/Google Pay

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[PAYPAL_SETUP.md](./PAYPAL_SETUP.md)** - PayPal integration setup
- **[CLAUDE.md](./CLAUDE.md)** - Development guidelines

## ✅ Build Verification

```bash
npm run check:safe
npm run build
```

## 🌐 Live Demo

Deploy to Vercel or Netlify to get your live URL instantly!

## 📞 Support

For deployment help, see `DEPLOYMENT.md`. For payment setup, see `PAYPAL_SETUP.md`.
