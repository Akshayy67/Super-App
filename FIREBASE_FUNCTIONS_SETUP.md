# Firebase Cloud Functions Setup for Razorpay

This guide will help you set up Firebase Cloud Functions to handle Razorpay payment processing without needing a separate backend server.

## Prerequisites

1. Firebase project already set up
2. Firebase CLI installed: `npm install -g firebase-tools`
3. Node.js 18 or higher

## Step 1: Install Dependencies

Navigate to the `functions` directory and install dependencies:

```bash
cd functions
npm install
```

## Step 2: Set Up Firebase Functions Configuration

### Option A: Using Firebase CLI (Recommended)

1. Login to Firebase:
```bash
firebase login
```

2. Initialize Firebase Functions (if not already done):
```bash
firebase init functions
```

3. Set Razorpay credentials using Firebase CLI:
```bash
firebase functions:config:set razorpay.key_id="rzp_live_RckdrRyNNy8thO"
firebase functions:config:set razorpay.key_secret="wzVq4ZV7Q0vw0IIpFyJkZjRj"
```

### Option B: Using Environment Variables

Alternatively, you can set environment variables in the Firebase Console:

1. Go to Firebase Console → Functions → Configuration
2. Add the following environment variables:
   - `RAZORPAY_KEY_ID` = `rzp_live_RckdrRyNNy8thO`
   - `RAZORPAY_KEY_SECRET` = `wzVq4ZV7Q0vw0IIpFyJkZjRj`

## Step 3: Build and Deploy Functions

1. Build the TypeScript functions:
```bash
cd functions
npm run build
```

2. Deploy to Firebase:
```bash
firebase deploy --only functions
```

Or deploy specific functions:
```bash
firebase deploy --only functions:createRazorpayOrder,functions:verifyRazorpayPayment
```

## Step 4: Verify Deployment

After deployment, you'll see URLs like:
```
✔  functions[createRazorpayOrder(us-central1)]: Successful create operation.
✔  functions[verifyRazorpayPayment(us-central1)]: Successful create operation.
```

## Step 5: Update Frontend Dependencies

Make sure your frontend has `firebase` package installed:

```bash
npm install firebase
```

The `firebase/functions` module is included in the main `firebase` package.

## Step 6: Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Navigate to the payment page and try making a test payment
3. Check Firebase Functions logs:
```bash
firebase functions:log
```

## Functions Overview

### `createRazorpayOrder`
- **Purpose**: Creates a Razorpay order
- **Authentication**: Required (user must be logged in)
- **Input**: `{ amount, currency, planType, userId, userEmail }`
- **Output**: `{ success, orderId, amount, currency }`

### `verifyRazorpayPayment`
- **Purpose**: Verifies payment signature and updates user premium status
- **Authentication**: Required (user must be logged in)
- **Input**: `{ paymentId, orderId, signature, planType, userId }`
- **Output**: `{ success, verified }`
- **Side Effect**: Updates `premium_users` collection in Firestore

## Security Notes

✅ **Secure**: 
- Key Secret is stored server-side only
- Functions require authentication
- User ID is verified against authenticated user
- Payment signatures are cryptographically verified

⚠️ **Important**:
- Never expose `RAZORPAY_KEY_SECRET` in frontend code
- Always verify user authentication in functions
- Use Firebase Security Rules to protect Firestore data

## Troubleshooting

### Function not found error
- Make sure functions are deployed: `firebase deploy --only functions`
- Check function names match exactly: `createRazorpayOrder` and `verifyRazorpayPayment`

### Authentication errors
- Ensure user is logged in before calling functions
- Check Firebase Auth is properly initialized

### Payment verification fails
- Verify Razorpay credentials are correctly set
- Check function logs: `firebase functions:log`
- Ensure signature verification logic is correct

### Build errors
- Make sure TypeScript is installed: `npm install -g typescript`
- Check Node.js version: `node --version` (should be 18+)
- Run `npm install` in functions directory

## Local Development

To test functions locally:

1. Start Firebase emulators:
```bash
firebase emulators:start --only functions
```

2. Update your frontend to use local functions (if needed):
```typescript
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

if (import.meta.env.DEV) {
  const functions = getFunctions(app);
  connectFunctionsEmulator(functions, "localhost", 5001);
}
```

## Cost Considerations

Firebase Cloud Functions pricing:
- **Free Tier**: 2 million invocations/month
- **Paid**: $0.40 per million invocations after free tier
- Each payment creates 2 function calls (create order + verify payment)

For most applications, the free tier should be sufficient.

## Next Steps

1. ✅ Deploy functions to Firebase
2. ✅ Test payment flow
3. ✅ Monitor function logs
4. ✅ Set up billing alerts (optional)
5. ✅ Configure Firestore security rules for `premium_users` collection

## Support

If you encounter issues:
1. Check Firebase Functions logs
2. Verify environment variables are set
3. Ensure Razorpay credentials are correct
4. Check Firestore security rules allow function writes

