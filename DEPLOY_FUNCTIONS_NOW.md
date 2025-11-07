# 🚀 Deploy Firebase Functions - Step by Step Guide

Since you've upgraded to Firebase Blaze (pay-as-you-go) plan, you can now deploy Cloud Functions. Follow these steps:

## Step 1: Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

## Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window for you to authenticate with your Google account.

## Step 3: Initialize Firebase in Your Project (if not done)

Navigate to your project root directory and run:

```bash
firebase init functions
```

When prompted:
- **Select existing project**: Choose your Firebase project (super-app-54ae9)
- **Language**: TypeScript
- **Use ESLint**: Yes
- **Install dependencies**: Yes

**Note:** If you already have the `functions` folder, you can skip this step.

## Step 4: Install Function Dependencies

```bash
cd functions
npm install
```

This will install:
- firebase-admin
- firebase-functions
- razorpay
- TypeScript and other dev dependencies

## Step 5: Set Razorpay Credentials in Firebase

Run these commands from your **project root** (not inside functions folder):

```bash
firebase functions:config:set razorpay.key_id="rzp_live_RckdrRyNNy8thO"
firebase functions:config:set razorpay.key_secret="wzVq4ZV7Q0vw0IIpFyJkZjRj"
```

Verify the configuration:
```bash
firebase functions:config:get
```

You should see:
```
{
  "razorpay": {
    "key_id": "rzp_live_RckdrRyNNy8thO",
    "key_secret": "wzVq4ZV7Q0vw0IIpFyJkZjRj"
  }
}
```

## Step 6: Build the Functions

```bash
cd functions
npm run build
```

This compiles TypeScript to JavaScript in the `lib/` folder.

## Step 7: Deploy Functions to Firebase

From the **project root**, run:

```bash
firebase deploy --only functions
```

Or deploy specific functions:
```bash
firebase deploy --only functions:createRazorpayOrder,functions:verifyRazorpayPayment
```

**Expected Output:**
```
✔  functions[createRazorpayOrder(us-central1)]: Successful create operation.
✔  functions[verifyRazorpayPayment(us-central1)]: Successful create operation.
```

## Step 8: Create Frontend .env File

Create a `.env` file in your **project root** with:

```env
VITE_RAZORPAY_KEY_ID=rzp_live_RckdrRyNNy8thO
```

**Important:** The `.env` file is already in `.gitignore`, so it won't be committed.

## Step 9: Verify Deployment

Check that functions are deployed:

```bash
firebase functions:list
```

You should see:
- `createRazorpayOrder`
- `verifyRazorpayPayment`

## Step 10: Test the Payment Flow

1. **Restart your development server** (if running):
   ```bash
   npm run dev
   ```

2. **Navigate to the payment page** in your app

3. **Try making a test payment** (use Razorpay test mode or a small real amount)

4. **Check function logs** if there are issues:
   ```bash
   firebase functions:log
   ```

## Troubleshooting

### Error: "Functions directory does not exist"
- Make sure you're in the project root
- Check that `functions/` folder exists
- Run `firebase init functions` if needed

### Error: "Permission denied"
- Make sure you're logged in: `firebase login`
- Verify you have the correct Firebase project selected: `firebase use`

### Error: "Config not found"
- Make sure you set the config: `firebase functions:config:set razorpay.key_id="..."`
- Verify with: `firebase functions:config:get`

### Functions not appearing in frontend
- Check function names match exactly: `createRazorpayOrder` and `verifyRazorpayPayment`
- Make sure functions are deployed: `firebase functions:list`
- Check browser console for errors

### Build errors
- Make sure you're in the `functions` directory: `cd functions`
- Run `npm install` to install dependencies
- Check Node.js version: `node --version` (should be 18+)

## What Happens Next?

Once deployed:
1. ✅ Orders are created securely via Cloud Functions
2. ✅ Payment signatures are verified server-side
3. ✅ Premium status is automatically updated in Firestore
4. ✅ No backend server needed - everything runs on Firebase!

## Monitoring

View function logs in real-time:
```bash
firebase functions:log --only createRazorpayOrder,verifyRazorpayPayment
```

Or check in Firebase Console:
- Go to Firebase Console → Functions
- Click on a function to see logs and metrics

## Cost Information

With Blaze plan:
- **Free tier**: 2 million function invocations/month
- **After free tier**: $0.40 per million invocations
- Each payment = 2 function calls (create order + verify)
- Most apps stay within free tier

## Next Steps After Deployment

1. ✅ Test payment flow
2. ✅ Monitor function logs
3. ✅ Set up billing alerts (optional, in Firebase Console)
4. ✅ Verify Firestore `premium_users` collection is being updated

## Quick Command Reference

```bash
# Login
firebase login

# Set credentials
firebase functions:config:set razorpay.key_id="rzp_live_RckdrRyNNy8thO"
firebase functions:config:set razorpay.key_secret="wzVq4ZV7Q0vw0IIpFyJkZjRj"

# Build
cd functions && npm run build

# Deploy
cd .. && firebase deploy --only functions

# View logs
firebase functions:log

# List functions
firebase functions:list
```

---

**You're all set!** Your payment system is now running on Firebase Cloud Functions. 🎉

