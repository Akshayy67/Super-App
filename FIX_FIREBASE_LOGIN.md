# Fix Firebase Login - Switch to Correct Account

You're logged into Firebase CLI with the wrong account. Here's how to fix it:

## Step 1: Logout from Current Account

```bash
firebase logout
```

This will log you out of the current Firebase account.

## Step 2: Login with Correct Account

```bash
firebase login
```

This will:
1. Open your browser
2. Ask you to sign in with Google
3. **Make sure you sign in with the account that has access to your Firebase project** (super-app-54ae9)

## Step 3: Verify You're Using the Correct Project

Check which project you're currently using:

```bash
firebase use
```

You should see:
```
Using alias 'default' (super-app-54ae9)
```

If it shows a different project, switch to the correct one:

```bash
firebase use super-app-54ae9
```

Or list all available projects:

```bash
firebase projects:list
```

Then select the correct one:

```bash
firebase use <project-id>
```

## Step 4: Verify Access

Test that you have access to the project:

```bash
firebase projects:list
```

You should see `super-app-54ae9` in the list.

## Alternative: Login with Specific Account

If you want to be more explicit, you can login with a specific account:

```bash
firebase login --no-localhost
```

This will give you a URL to visit and a code to enter. Use this if the browser method doesn't work.

## Troubleshooting

### "Permission denied" errors
- Make sure you're logged in with the account that owns/has access to the Firebase project
- Check Firebase Console to verify which account has access

### "Project not found"
- Verify the project ID: `super-app-54ae9`
- Make sure you're logged in with the correct account
- Check Firebase Console to confirm the project exists

### Still seeing wrong account
1. Clear Firebase CLI cache:
   ```bash
   firebase logout
   rm -rf ~/.config/firebase
   firebase login
   ```
   
   On Windows, the config is usually at:
   ```
   C:\Users\<YourUsername>\AppData\Roaming\firebase
   ```

2. Or manually delete the config folder and login again

## After Fixing Login

Once you're logged in with the correct account:

1. **Set Razorpay credentials:**
   ```bash
   firebase functions:config:set razorpay.key_id="rzp_live_RckdrRyNNy8thO"
   firebase functions:config:set razorpay.key_secret="wzVq4ZV7Q0vw0IIpFyJkZjRj"
   ```

2. **Deploy functions:**
   ```bash
   cd functions
   npm install
   npm run build
   cd ..
   firebase deploy --only functions
   ```

## Quick Commands

```bash
# Logout
firebase logout

# Login (opens browser)
firebase login

# Check current project
firebase use

# List all projects
firebase projects:list

# Switch to specific project
firebase use super-app-54ae9
```

---

**After logging in with the correct account, continue with the deployment steps from `DEPLOY_FUNCTIONS_NOW.md`**

