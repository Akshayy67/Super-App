# Firebase Storage Setup Instructions

## CORS Error Fix

If you're seeing a CORS error when uploading profile photos, you need to apply the Firebase Storage security rules.

### Steps to Fix:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - Click on the "Rules" tab

3. **Apply the Rules**
   - Open the file `FIREBASE_STORAGE_RULES.txt` in your project
   - Copy ALL the rules from that file
   - Paste them into the Firebase Console Rules editor
   - Click "Publish" to save the rules

### Important Notes:

- The rules allow:
  - ✅ Public read access to profile photos (for viewing profiles)
  - ✅ Authenticated users can upload images to `profile-photos/`
  - ✅ File size limit: 5MB
  - ✅ Only image files allowed
  - ✅ Authenticated users can delete their photos

- If you still see errors after applying rules:
  - Wait a few seconds for rules to propagate
  - Refresh your browser
  - Check that you're logged in
  - Verify the storage bucket name matches in Firebase Console

### Storage Bucket Configuration:

Make sure your `.env` file (if using) or `src/config/firebase.ts` has the correct storage bucket:
- Should match the bucket shown in Firebase Console > Storage > Files

### Testing:

After applying rules, try uploading a profile photo again. The error should be resolved.

