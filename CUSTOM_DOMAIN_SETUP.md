# Custom Domain Setup Guide for super-app.tech

## 🌐 **Domain Connection Steps**

### **1. Vercel Dashboard Setup**

- ✅ Go to Vercel Dashboard → Your Project → Settings → Domains
- ✅ Add `super-app.tech`
- ✅ Add `www.super-app.tech`
- ✅ Note down the DNS records Vercel provides

### **2. DNS Configuration at Domain Registrar**

**Add these EXACT records to your domain registrar DNS settings:**

```
Record Type: A
Name: @ (or root/blank)
Value: 216.198.79.1
TTL: 3600

Record Type: CNAME
Name: www
Value: bab1a32c18d69043.vercel-dns-017.com
TTL: 3600
```

### **3. Firebase Authorization (IMPORTANT!)**

- ✅ Go to Firebase Console → Authentication → Settings → Authorized domains
- ✅ Add `super-app.tech`
- ✅ Add `www.super-app.tech`

### **4. Common Domain Registrars DNS Setup**

#### **Namecheap:**

1. Login → Domain List → Manage
2. Advanced DNS → Add New Record
3. Add A record and CNAME record as above

#### **GoDaddy:**

1. Login → My Products → Domains → DNS
2. Add records as specified above

#### **Google Domains:**

1. Login → My domains → [domain] → DNS
2. Custom resource records → Add records

#### **Cloudflare (if using):**

1. DNS → Add record
2. Make sure "Proxy status" is set to "DNS only" (gray cloud)

## ⏱️ **Timeline & Verification**

### **Immediate (0-5 minutes):**

- Domain added in Vercel ✅
- DNS records configured at registrar ✅
- Firebase domains authorized ✅

### **Propagation (5-48 hours):**

- DNS propagation can take up to 48 hours
- Usually works within 15-30 minutes
- Check status at: https://dnschecker.org

### **Verification Steps:**

1. **Check DNS Propagation:**

   - Visit: https://dnschecker.org
   - Enter: `super-app.tech`
   - Should show Vercel's IP address

2. **Test Domain:**

   - Try: `https://super-app.tech`
   - Try: `https://www.super-app.tech`
   - Both should load your app

3. **Check SSL Certificate:**
   - Vercel automatically provides SSL
   - Look for 🔒 in browser address bar

## 🔧 **Troubleshooting**

### **Domain not working?**

1. **Check DNS propagation** - Wait up to 48 hours
2. **Verify DNS records** - Double-check A and CNAME records
3. **Clear browser cache** - Hard refresh (Ctrl+F5)
4. **Check Vercel status** - Visit Vercel Dashboard for any errors

### **SSL Certificate issues?**

- Vercel automatically provisions SSL
- May take 5-10 minutes after DNS propagates
- Check Vercel Dashboard → Domains for certificate status

### **Firebase Auth not working?**

- Ensure custom domains are added to Firebase authorized domains
- Check browser console for CORS errors

## 🎯 **Final Setup Checklist**

- [ ] Domain added in Vercel Dashboard
- [ ] A record pointing to Vercel IP
- [ ] CNAME record for www subdomain
- [ ] Firebase authorized domains updated
- [ ] DNS propagation complete (test with dnschecker.org)
- [ ] SSL certificate active (🔒 in browser)
- [ ] Both `super-app.tech` and `www.super-app.tech` working

## 🚀 **Expected Results**

Once everything is set up:

- ✅ `https://super-app.tech` → Your Super App
- ✅ `https://www.super-app.tech` → Your Super App
- ✅ Automatic HTTPS redirect
- ✅ Firebase authentication working
- ✅ Custom domain in browser address bar

## 📞 **Need Help?**

If you encounter issues:

1. Check Vercel Dashboard for domain status
2. Verify DNS records with your registrar
3. Test DNS propagation with online tools
4. Check browser console for any errors

Your custom domain should be working within 15-30 minutes to 48 hours depending on DNS propagation!
