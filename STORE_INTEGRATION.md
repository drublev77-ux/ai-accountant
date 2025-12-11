# Store Integration Guide

## Overview

AI Accountant has been integrated with multiple app stores and payment platforms:

- ✅ **Google Play Store** - In-App Purchases via Google Play Billing Library
- ✅ **Apple App Store** - In-App Purchases via StoreKit 2
- ✅ **Palm Store** - In-App Purchases via webOS Payment Service
- ✅ **Web Payments** - Stripe, PayPal, Apple Pay, Google Pay

## Architecture

### Service Layer

All store integrations follow a unified architecture:

```
src/services/
├── google-play-iap.ts    # Google Play Billing integration
├── apple-store-iap.ts    # Apple StoreKit integration
├── palm-store-iap.ts     # Palm webOS Payment integration
└── purchase-manager.ts   # Unified purchase manager
```

### Purchase Manager (`purchase-manager.ts`)

The `PurchaseManager` class provides a unified interface for all platforms:

- **Platform Detection** - Automatically detects the current platform
- **Unified API** - Single interface for all store purchases
- **Purchase Verification** - Server-side receipt validation
- **Restore Purchases** - Restore previous purchases across platforms
- **Local Storage Sync** - Persists purchase status

## Features

### 1. Google Play Integration (`google-play-iap.ts`)

**Features:**
- Product querying via Google Play Billing Library
- Purchase flow with receipt generation
- Server-side receipt verification
- Purchase acknowledgement (required by Google)
- Purchase restoration

**Product ID:** `ai_accountant_lifetime_50usd`

**Production Requirements:**
1. Google Play Console setup
2. Product SKU configuration
3. Google Play Billing Library integration (for Android apps)
4. Backend endpoint: `/api/verify-google-play-purchase`

### 2. Apple App Store Integration (`apple-store-iap.ts`)

**Features:**
- Product querying via StoreKit 2
- Purchase flow with transaction handling
- Receipt verification with Apple servers
- Transaction finishing (required by Apple)
- Purchase restoration
- Subscription status checking (future-ready)

**Product ID:** `com.aiaccountant.lifetime.50usd`

**Production Requirements:**
1. App Store Connect setup
2. Product ID configuration
3. StoreKit configuration file
4. Backend endpoint: `/api/verify-apple-receipt`

### 3. Palm Store Integration (`palm-store-iap.ts`)

**Features:**
- Product querying via webOS Payment Service
- Purchase flow for webOS devices
- Receipt verification
- Purchase consumption (for consumables)
- Purchase history and ownership checking

**Product ID:** `aiaccountant_lifetime_access`

**Production Requirements:**
1. Palm Developer Account
2. Product setup in Palm Store Developer Console
3. webOS SDK integration
4. Backend endpoint: `/api/verify-palm-purchase`

### 4. Unified Purchase Manager (`purchase-manager.ts`)

**Features:**
- Platform auto-detection (iOS, Android, webOS, Web)
- Unified purchase flow across all platforms
- Purchase restoration
- Purchase status checking
- Store URL generation

**API:**

```typescript
import { purchaseManager } from '@/services/purchase-manager';

// Initialize
await purchaseManager.initialize();

// Get current platform
const platform = purchaseManager.getPlatform(); // 'googleplay' | 'appstore' | 'palmstore' | 'web'

// Purchase via store
const result = await purchaseManager.purchaseViaStore();
if (result.success) {
  console.log('Purchase successful:', result.purchaseId);
}

// Restore purchases
const restoreResult = await purchaseManager.restorePurchases();

// Check purchase status
const info = purchaseManager.getPurchaseInfo();
if (info.hasPurchase) {
  console.log('Purchased on:', info.platform);
}

// Clear purchase data (testing/logout)
purchaseManager.clearPurchaseData();
```

## UI Components

### PricingPaywall Component

Updated with full store integration:

**Features:**
- Platform detection badge
- Auto-select appropriate payment tab based on platform
- Google Play purchase button
- App Store purchase button
- Palm Store purchase button
- Restore purchases button with loading state
- Fallback to web redirect if IAP not available

**Flow:**
1. Component detects platform on mount
2. Shows appropriate payment options
3. User selects payment method
4. Handles purchase via unified API
5. Displays success message
6. Unlocks app access

## Purchase Flow

### Mobile App Stores (Google Play, App Store, Palm Store)

```
User clicks "Purchase"
  ↓
Purchase Manager detects platform
  ↓
Calls platform-specific IAP service
  ↓
Launches native purchase dialog
  ↓
User completes purchase
  ↓
Receipt generated
  ↓
Backend verifies receipt with store servers
  ↓
Purchase acknowledged/finished
  ↓
App unlocked
  ↓
Purchase info saved to localStorage
```

### Web Payments (Stripe, PayPal, etc.)

```
User clicks payment button
  ↓
Payment provider modal opens
  ↓
User completes payment
  ↓
Payment success callback
  ↓
Purchase info saved to localStorage
  ↓
App unlocked
```

## Backend Requirements

For production deployment, you need server-side receipt validation:

### Google Play Verification Endpoint

```typescript
POST /api/verify-google-play-purchase
Body: {
  productId: string,
  purchaseToken: string,
  receipt: string
}
Response: {
  valid: boolean,
  orderId?: string
}
```

**Implementation:**
- Use Google Play Developer API
- Verify purchase token and receipt
- Check purchase state (0 = purchased)
- Return validation result

### Apple App Store Verification Endpoint

```typescript
POST /api/verify-apple-receipt
Body: {
  receipt: string
}
Response: {
  status: number, // 0 = valid
  receipt?: object
}
```

**Implementation:**
- Use Apple App Store Server API
- Verify receipt with Apple servers
- Production URL: `https://buy.itunes.apple.com/verifyReceipt`
- Sandbox URL: `https://sandbox.itunes.apple.com/verifyReceipt`

### Palm Store Verification Endpoint

```typescript
POST /api/verify-palm-purchase
Body: {
  purchaseId: string,
  purchaseToken: string,
  receipt: string
}
Response: {
  valid: boolean,
  purchaseId?: string
}
```

**Implementation:**
- Use Palm Store API
- Verify purchase token and receipt
- Check purchase status
- Return validation result

## Environment Detection

The system automatically detects the environment:

```typescript
// iOS Detection
- User agent contains: iphone, ipad, ipod
- window.webkit.messageHandlers.StoreKit exists

// Android Detection
- User agent contains: android
- window.AndroidBillingClient exists

// webOS Detection
- User agent contains: webos, web0s, hpwos
- window.PalmSystem exists

// Web Fallback
- None of the above
```

## Testing

### Development Mode

All IAP services have mock implementations for testing:

- Mock product details
- Simulated purchase flows
- Mock receipt generation
- Auto-verified purchases

### Testing Restore Purchases

```typescript
// 1. Complete a purchase
await purchaseManager.purchaseViaStore();

// 2. Clear app data (simulate reinstall)
localStorage.clear();

// 3. Restore purchases
const result = await purchaseManager.restorePurchases();
// Should restore purchase and unlock app
```

### Testing Different Platforms

Use browser developer tools to simulate:

```javascript
// Simulate iOS
Object.defineProperty(navigator, 'userAgent', {
  get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
});

// Simulate Android
Object.defineProperty(navigator, 'userAgent', {
  get: () => 'Mozilla/5.0 (Linux; Android 11)'
});

// Simulate webOS
Object.defineProperty(navigator, 'userAgent', {
  get: () => 'Mozilla/5.0 (Web0S; Linux/SmartTV)'
});
```

## Security Considerations

### Client-Side
- Never trust client-side purchase validation
- Always verify receipts server-side
- Use HTTPS for all API calls
- Implement rate limiting

### Server-Side
- Verify all receipts with official store APIs
- Validate purchase tokens
- Check for duplicate receipts
- Implement webhook listeners for updates
- Store purchase records in database

### Data Storage
- Encrypt sensitive purchase data
- Use secure localStorage alternatives for sensitive info
- Implement purchase verification on app start
- Sync with backend periodically

## Production Deployment Checklist

### Google Play
- [ ] Create app in Google Play Console
- [ ] Configure product SKUs
- [ ] Set up pricing
- [ ] Enable Google Play Billing
- [ ] Integrate Billing Library in Android app
- [ ] Set up receipt verification backend
- [ ] Test with test accounts
- [ ] Submit for review

### Apple App Store
- [ ] Create app in App Store Connect
- [ ] Configure product IDs
- [ ] Set up pricing tiers
- [ ] Create StoreKit configuration file
- [ ] Integrate StoreKit 2
- [ ] Set up receipt verification backend
- [ ] Test with sandbox accounts
- [ ] Submit for review

### Palm Store
- [ ] Create Palm Developer account
- [ ] Register app in Palm Store
- [ ] Configure product details
- [ ] Set up pricing
- [ ] Integrate webOS SDK
- [ ] Set up verification backend
- [ ] Test on webOS emulator
- [ ] Submit for review

### Backend
- [ ] Deploy receipt verification endpoints
- [ ] Set up database for purchase records
- [ ] Implement webhook listeners
- [ ] Configure monitoring and alerts
- [ ] Set up backup verification
- [ ] Test all endpoints
- [ ] Enable rate limiting
- [ ] Add logging and analytics

## Support

### Common Issues

**Issue:** "Store not available"
- **Solution:** Check platform detection, ensure correct environment

**Issue:** "Purchase verification failed"
- **Solution:** Check backend endpoint, verify receipt format

**Issue:** "Restore purchases failed"
- **Solution:** Ensure user has made previous purchase, check receipt storage

**Issue:** "Purchase already owned"
- **Solution:** Check purchase status, implement restore flow

### Contact

For technical support: support@aiaccountant.app

## License

Proprietary - AI Accountant © 2024
