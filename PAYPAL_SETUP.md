# PayPal Integration Setup Guide

This application includes a secure PayPal integration for processing payments. Follow these steps to configure it for production use.

## 🔐 Security Features

✅ **Client-side SDK only** - No sensitive credentials in frontend code
✅ **Sandbox & Production modes** - Test before going live
✅ **Order verification** - PayPal handles payment capture
✅ **No card data storage** - PCI DSS compliant by design
✅ **Purchase verification** - Local storage tracks purchase status

## 📋 Setup Steps

### 1. Create a PayPal Business Account

1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Sign up for a PayPal Business account (if you don't have one)
3. Log into the Developer Dashboard

### 2. Get Your Client ID

1. Navigate to **Dashboard** → **My Apps & Credentials**
2. Choose **Sandbox** for testing or **Live** for production
3. Click **Create App** or select an existing app
4. Copy your **Client ID** (this is safe to use in frontend code)
5. **NEVER use or expose your Secret Key in frontend code**

### 3. Configure the Application

Open `index.html` and replace `YOUR_CLIENT_ID` with your actual PayPal Client ID:

```html
<!-- BEFORE (line 19) -->
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD&disable-funding=credit,card" defer></script>

<!-- AFTER -->
<script src="https://www.paypal.com/sdk/js?client-id=AeXYZ123...&currency=USD&disable-funding=credit,card" defer></script>
```

### 4. Sandbox Testing (Development)

For testing, use a **Sandbox Client ID**:

1. In PayPal Developer Dashboard, go to **Sandbox** → **Accounts**
2. Create test buyer and seller accounts
3. Use the Sandbox Client ID in your `index.html`
4. During testing, log in with your sandbox test account credentials

**Sandbox Script:**
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_SANDBOX_CLIENT_ID&currency=USD&disable-funding=credit,card" defer></script>
```

### 5. Production Deployment

For production, switch to your **Live Client ID**:

1. Complete PayPal's verification process
2. Switch to **Live** mode in Developer Dashboard
3. Replace with your Live Client ID
4. Test thoroughly before accepting real payments

**Production Script:**
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_LIVE_CLIENT_ID&currency=USD&disable-funding=credit,card" defer></script>
```

## ⚙️ Customization Options

### Change Currency

Edit the `currency` parameter in `index.html`:

```html
<!-- EUR Example -->
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=EUR&disable-funding=credit,card" defer></script>
```

### Change Price

Edit the `amount` prop in `src/components/PricingPaywall.tsx`:

```tsx
<PayPalButton
  amount="99.00"  // Change this value
  description="AI Accountant - Lifetime Access"
  onSuccess={handlePayPalSuccess}
  onError={handlePayPalError}
  onCancel={handlePayPalCancel}
/>
```

Also update the displayed price in the UI (around line 105-107):

```tsx
<CardTitle className="text-5xl font-bold text-white mb-2">
  $99  {/* Update this */}
</CardTitle>
```

### Enable Credit Cards

To allow credit card payments through PayPal, remove `&disable-funding=credit,card` from the script URL:

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD" defer></script>
```

## 🔍 How It Works

### Payment Flow

1. **User clicks PayPal button** → PayPal popup appears
2. **User logs into PayPal** → Authorizes payment
3. **Order created** → PayPal generates Order ID
4. **Payment captured** → PayPal processes the payment
5. **Success callback** → App receives payment confirmation
6. **Local storage updated** → User's purchase is saved
7. **App unlocked** → User gets full access

### Security Model

- **Frontend**: Only Client ID (public, safe to expose)
- **Backend**: Secret Key stays on PayPal servers (never exposed)
- **Verification**: PayPal handles all payment verification
- **No PCI Compliance Needed**: PayPal handles all card data

### Data Storage

Purchase information is stored in `localStorage`:

```javascript
localStorage.setItem('app_purchased', 'true');           // Purchase status
localStorage.setItem('purchase_platform', 'paypal');     // Platform used
localStorage.setItem('purchase_date', new Date().toISOString()); // Purchase timestamp
localStorage.setItem('purchase_order_id', details.id);   // PayPal Order ID
```

## 🚨 Important Security Notes

### ✅ DO:
- Use Client ID in frontend code (it's designed for this)
- Test with Sandbox mode before going live
- Keep your PayPal Secret Key secure on backend servers only
- Verify payments through PayPal's API on your backend (for production)
- Use HTTPS in production

### ❌ DON'T:
- Never expose your PayPal Secret Key
- Never hardcode real payment credentials in git repositories
- Never skip testing in Sandbox mode
- Never process payments without proper error handling

## 🛡️ Production Best Practices

For production-grade applications, consider adding:

1. **Backend Verification**: Verify PayPal transactions on your server
2. **Database Storage**: Store purchase records in a secure database
3. **Webhook Integration**: Use PayPal webhooks for payment notifications
4. **Receipt Generation**: Email purchase receipts to customers
5. **Refund Handling**: Implement refund processing
6. **Fraud Detection**: Monitor suspicious transaction patterns

## 📚 Additional Resources

- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [JavaScript SDK Reference](https://developer.paypal.com/sdk/js/reference/)
- [Integration Guide](https://developer.paypal.com/docs/checkout/)
- [Sandbox Testing Guide](https://developer.paypal.com/docs/api-basics/sandbox/)

## 🆘 Troubleshooting

**PayPal button not showing?**
- Check that Client ID is correct
- Open browser console for errors
- Verify script is loading (Network tab)

**"Invalid Client ID" error?**
- Make sure you're using the right Client ID (Sandbox vs Live)
- Check for typos in the Client ID

**Payment not completing?**
- Check browser console for errors
- Verify `onSuccess` callback is being called
- Test with Sandbox account first

---

**Need help?** Contact PayPal Developer Support or check the [PayPal Developer Community](https://www.paypal-community.com/t5/Developer-Community/ct-p/developer)
