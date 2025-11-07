# Razorpay Live Credentials Setup

## ⚠️ IMPORTANT: Using Firebase Cloud Functions

This project now uses **Firebase Cloud Functions** instead of a backend server for Razorpay payment processing. See `FIREBASE_FUNCTIONS_SETUP.md` for complete setup instructions.

## Credentials

**Live Key ID:** `rzp_live_RckdrRyNNy8thO`  
**Live Key Secret:** `wzVq4ZV7Q0vw0IIpFyJkZjRj`

## Quick Setup

### 1. Frontend Configuration (.env file)

Create a `.env` file in the root directory with:

```env
VITE_RAZORPAY_KEY_ID=rzp_live_RckdrRyNNy8thO
```

**Note:** The `.env` file is already in `.gitignore` and will not be committed to the repository.

### 2. Firebase Cloud Functions Setup

The Key Secret is stored securely in Firebase Cloud Functions. Follow these steps:

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Set Razorpay credentials in Firebase**:
   ```bash
   firebase functions:config:set razorpay.key_id="rzp_live_RckdrRyNNy8thO"
   firebase functions:config:set razorpay.key_secret="wzVq4ZV7Q0vw0IIpFyJkZjRj"
   ```

4. **Deploy Functions**:
   ```bash
   cd functions
   npm install
   npm run build
   firebase deploy --only functions
   ```

For detailed instructions, see `FIREBASE_FUNCTIONS_SETUP.md`.

### 3. Security Notes

⚠️ **IMPORTANT:**
- Never commit the `.env` file to version control
- Never expose `RAZORPAY_KEY_SECRET` in frontend code
- The Key Secret is stored securely in Firebase Cloud Functions
- All payment operations (order creation, verification) happen server-side via Cloud Functions

### 4. Testing

After setting up:
1. Deploy Firebase Functions (see step 2 above)
2. Create `.env` file with `VITE_RAZORPAY_KEY_ID`
3. Restart your development server
4. Test the payment flow in the PaymentPage component

### 5. Current Status

✅ Frontend configuration updated in `env.example`  
✅ Payment service updated to use Firebase Cloud Functions  
✅ Firebase Functions created for order creation and payment verification  
✅ Live Razorpay credentials configured

The payment gateway is now configured for production use with Firebase Cloud Functions.

