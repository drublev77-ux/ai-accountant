# 👨‍💻 Developer Information

## Google Developer Profile

**Profile URL:** https://developers.google.com/profile/u/100148187671076782653?hl=ru&utm_source=developer.android.com

**User ID:** 100148187671076782653

---

## 📱 Project Information

### App Details
- **App ID:** `com.aiaccountant.app`
- **Name:** AI Accountant
- **Platform:** Android (Capacitor)

### Technology Stack
- **Frontend:** React 19 + TypeScript + Vite
- **Mobile:** Capacitor 8
- **UI:** Tailwind CSS 4 + shadcn/ui
- **Routing:** TanStack Router
- **State:** TanStack Query + Zustand

---

## 🔄 Automatic Sync Status

### Current Setup
✅ **Git Sync** - Auto-commit on changes
✅ **Android Studio Sync** - Bidirectional sync every 5s
✅ **Capacitor Sync** - Auto `npx cap sync android`

### Monitoring
```bash
npm run sync:watch &  # Running in background
```

### Logs
```bash
tail -f unified-sync.log
```

---

## 🚀 Quick Commands

### Development
```bash
npm run dev                  # Start dev server (port 3000)
npm run check:safe          # TypeScript + ESLint check
npm run build               # Production build
```

### Mobile Development
```bash
npm run mobile:android      # Quick Android build
npm run cap:sync            # Manual Capacitor sync
npm run cap:open:android    # Open in Android Studio
```

### Sync Management
```bash
npm run sync                # One-time full sync
npm run sync:watch          # Auto-sync (background)
npm run sync:status         # Check sync status
```

---

## 📂 Project Structure

```
vite-template/
├── src/
│   ├── routes/              # TanStack Router routes
│   │   └── index.tsx        # Main app entry
│   ├── components/          # React components
│   │   └── ui/              # shadcn/ui components (40+)
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilities
│   └── assets/              # Static assets
│
├── android/                 # Capacitor Android project
│   └── app/src/             # Android app source
│
├── public/                  # Public assets
│
├── unified-sync.sh          # Main sync script
├── android-studio-sync-simple.sh  # AS sync (no rsync)
└── unified-sync.log         # Sync logs
```

---

## 🔧 Configuration Files

### Capacitor
- `capacitor.config.json` - Main Capacitor config
- `capacitor.config.ts` - TypeScript config

### Build
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript settings
- `biome.json` - Code formatting

### Sync
- `.android-studio-sync.conf` - Auto-generated AS sync config

---

## 📱 Android Publishing

### Google Play Console
Use your Google Developer account to publish the app:
https://play.google.com/console

### Build for Production
```bash
# 1. Build web assets
npm run build

# 2. Sync with Capacitor
npm run cap:sync

# 3. Open in Android Studio
npm run cap:open:android

# 4. In Android Studio:
#    Build → Generate Signed Bundle / APK
```

---

## 🔗 Important Links

### Google Services
- **Developer Profile:** [View Profile](https://developers.google.com/profile/u/100148187671076782653?hl=ru&utm_source=developer.android.com)
- **Play Console:** [console.play.google.com](https://play.google.com/console)
- **Firebase Console:** [console.firebase.google.com](https://console.firebase.google.com)

### Documentation
- **Capacitor:** [capacitorjs.com](https://capacitorjs.com)
- **React:** [react.dev](https://react.dev)
- **Vite:** [vitejs.dev](https://vitejs.dev)
- **shadcn/ui:** [ui.shadcn.com](https://ui.shadcn.com)

---

## 🎯 Next Steps

### To Deploy to Google Play:

1. **Setup Firebase** (optional but recommended)
   - Create Firebase project
   - Add Android app
   - Download `google-services.json`

2. **Configure Signing**
   - Generate keystore
   - Configure in Android Studio

3. **Build Release APK/AAB**
   - Open in Android Studio
   - Build → Generate Signed Bundle

4. **Upload to Play Console**
   - Create app listing
   - Upload AAB
   - Complete store listing
   - Submit for review

---

## 📝 Notes

- **Auto-sync is running** - Changes sync every 5 seconds
- **Git remote not configured** - Add GitHub remote for cloud backup
- **Capacitor dist warning** - Normal until you run `npm run build`

---

_Last updated: 12 December 2025, 10:40 UTC_
