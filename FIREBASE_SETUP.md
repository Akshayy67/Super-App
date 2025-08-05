# Firebase Setup Instructions

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Create a project"
3. Enter project name: "super-study-app" (or your choice)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Save the changes

## Step 3: Enable Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

## Step 4: Get Your Config

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → Web app (</>)
4. Enter app nickname: "super-study-web"
5. Enable Firebase Hosting (optional)
6. Click "Register app"
7. Copy the config object

## Step 5: Add Config to Your App

Replace the config in `src/config/firebase.ts` with your actual config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};
```

## Step 6: Test the Application

1. Run `npm run dev`
2. Try registering a new account
3. Check Firebase Console to see the user created
4. Try logging in/out
5. Check real-time updates

## Security Rules (For Production)

Update Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Add other collection rules as needed
  }
}
```
