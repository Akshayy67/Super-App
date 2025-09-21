# 🔧 Firestore Index Setup for Hierarchical File Organization

## ⚠️ Important Notice

The hierarchical file organization feature requires specific Firestore indexes to function properly. If you see errors like "The query requires an index", follow the steps below to resolve them.

## 🚀 Quick Fix

### Step 1: Look for Index Creation Links
When you encounter an index error, the console will show an error message with a direct link like:
```
https://console.firebase.google.com/v1/r/project/your-project/firestore/indexes?create_composite=...
```

### Step 2: Click the Link
Simply click the link in the error message. This will:
1. Open the Firebase Console
2. Pre-fill the index configuration
3. Allow you to create the index with one click

### Step 3: Wait for Index Creation
- Index creation typically takes 5-15 minutes
- You'll see a progress indicator in the Firebase Console
- Once complete, refresh your app and the feature will work

## 📋 Required Indexes

### 1. Shared Folders Index
- **Collection**: `sharedFolders`
- **Fields**: 
  - `teamId` (Ascending)
  - `parentId` (Ascending) 
  - `folderName` (Ascending)

### 2. Shared Files Index
- **Collection**: `sharedFiles`
- **Fields**:
  - `teamId` (Ascending)
  - `parentId` (Ascending)
  - `fileName` (Ascending)

## 🔍 Manual Index Creation

If you prefer to create indexes manually:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database > Indexes
4. Click "Create Index"
5. Configure the fields as listed above

## 🛠️ Troubleshooting

### Error: "The query requires an index"
- **Solution**: Click the index creation link in the error message
- **Time**: Index creation takes 5-15 minutes
- **Status**: Check Firebase Console for progress

### Error: "Index creation failed"
- **Check**: Ensure you have Firebase Admin permissions
- **Retry**: Try creating the index again
- **Contact**: Reach out to your Firebase project admin

### Feature not working after index creation
- **Wait**: Ensure index creation is 100% complete
- **Refresh**: Hard refresh your browser (Ctrl+F5)
- **Clear**: Clear browser cache and cookies

## 📖 Additional Resources

- [Firestore Index Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase Console](https://console.firebase.google.com)
- See `FIRESTORE_SETUP_GUIDE.md` for complete setup instructions

## ✅ Verification

Once indexes are created, you should be able to:
- ✅ Create new folders
- ✅ Navigate folder hierarchy
- ✅ Upload files to specific folders
- ✅ Use drag-and-drop organization
- ✅ Search across files and folders

If any of these features don't work, double-check that all required indexes are created and active.
