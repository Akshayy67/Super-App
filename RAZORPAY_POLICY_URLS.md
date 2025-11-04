# Razorpay Policy Pages - URLs for Verification

## Required Policy Pages

Add these URLs to your Razorpay merchant dashboard:

### 1. **Terms and Conditions**
```
https://www.super-app.tech/policies/terms-and-conditions.html
```

### 2. **Privacy Policy**
```
https://www.super-app.tech/policies/privacy-policy.html
```

### 3. **Cancellation & Refunds**
```
https://www.super-app.tech/policies/cancellation-refund.html
```

### 4. **Shipping**
```
https://www.super-app.tech/policies/shipping.html
```

### 5. **Contact Us**
```
https://www.super-app.tech/policies/contact-us.html
```

---

## File Locations

All policy pages are created in:
```
public/policies/
├── terms-and-conditions.html
├── privacy-policy.html
├── cancellation-refund.html
├── shipping.html
└── contact-us.html
```

---

## Deployment Steps

### 1. **Upload Files**
Ensure all HTML files in `public/policies/` are deployed to your hosting:
- If using Vercel/Netlify: Files are automatically included
- If using custom hosting: Upload the `public/policies/` folder to your web root

### 2. **Verify URLs**
After deployment, verify each URL is accessible:
- Open each URL in a browser
- Ensure pages load correctly
- Check that all links work

### 3. **Add to Razorpay**
1. Log in to Razorpay Dashboard
2. Go to **Settings** → **Policy Pages** (or Account Settings)
3. Add each URL from the list above
4. Click **Verify** for each page
5. Wait for verification (usually takes a few minutes)

---

## Quick Verification Checklist

- [ ] All 5 HTML files are in `public/policies/` folder
- [ ] Files are deployed to https://www.super-app.tech
- [ ] Each URL is accessible in browser
- [ ] URLs added to Razorpay dashboard
- [ ] All pages verified in Razorpay

---

## Notes

- **Shipping Policy:** Since this is a digital SaaS platform, the shipping policy explains that no physical products are shipped and all services are delivered digitally.

- **Contact Email:** All policies reference `support@super-app.tech` - update this if your support email is different.

- **Last Updated Dates:** All policies show "January 2025" - update as needed when you make changes.

---

## Troubleshooting

### If Razorpay shows "Page not valid":

1. **Check URL Accessibility:**
   - Open URL in incognito/private browser
   - Ensure no login required
   - Check for 404 errors

2. **Verify HTML Format:**
   - Ensure pages are valid HTML
   - Check for proper meta tags
   - Verify no JavaScript blocking

3. **Check Content:**
   - Pages must contain relevant policy content
   - Must be accessible without authentication
   - Should be properly formatted

4. **Wait for Verification:**
   - Razorpay verification can take 5-30 minutes
   - Refresh the dashboard after waiting

---

## Alternative: Use Razorpay's Policy Generator

If your pages still don't verify, you can use Razorpay's built-in policy page generator:
1. In Razorpay dashboard, click "Create using Razorpay"
2. Fill in the forms
3. Razorpay will host the pages for you
4. Faster account activation

---

*After adding these URLs and verifying them, your Razorpay account activation should proceed smoothly.*

