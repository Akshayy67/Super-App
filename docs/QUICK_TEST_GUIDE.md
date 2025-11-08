# 🧪 QUICK TEST GUIDE

## ✅ Testing AI Coding Interview in Mock Interview

### Step 1: Navigate to Mock Interview
```
URL: http://localhost:5174/interview
```

### Step 2: You Should See 4 Tabs:
1. **Interview Templates** (blue border when active)
2. **Custom Interview** (purple border when active)  
3. **Resume-Based Interview** (green border when active)
4. **AI Coding Interview** (orange border when active) ⭐ **NEW!**

### Step 3: Click "AI Coding Interview" Tab
- Look for the tab with `</>` icon
- On mobile: Shows "Coding"
- On desktop: Shows "AI Coding Interview"
- Should have orange border when clicked

### Step 4: Test the Coding Interview
1. Select difficulty: Easy, Medium, or Hard
2. Select language: JavaScript, Python, Java, or C++
3. Click "Start Interview"
4. Should see:
   - Monaco code editor (VS Code style)
   - AI chat on the side
   - Problem description
   - Test cases
   - Run code button

---

## ✅ Testing Profile Gamification

### Step 1: Navigate to Profile Edit
```
URL: http://localhost:5174/profile/edit
```

### Step 2: Look at Top of Page
You should see a **purple-blue gradient card** showing:
- Your level name (e.g., "Novice")
- Level number
- XP points
- Progress bar to next level
- 3 stats: Streak, Achievements, Rank

### If Card Doesn't Show:
1. Visit: `http://localhost:5174/gamified-profile`
2. This initializes your gamification data
3. Go back to `/profile/edit`
4. Card should now appear

---

## 🎯 Complete Feature Checklist

### Mock Interview:
- [ ] Navigate to `/interview`
- [ ] See 4 tabs (Templates, Custom, Resume, **Coding**)
- [ ] Click "AI Coding Interview" tab
- [ ] Select difficulty and language
- [ ] Start interview
- [ ] See Monaco editor
- [ ] Code editor works
- [ ] Can type code
- [ ] Can chat with AI

### Profile Gamification:
- [ ] Navigate to `/profile/edit`
- [ ] See purple-blue card at top
- [ ] Shows level name
- [ ] Shows XP progress bar
- [ ] Shows streak count
- [ ] Shows achievements count
- [ ] Shows global rank
- [ ] Can edit profile info below

### Navigation:
- [ ] Sidebar shows "AI Learning Assistant" (NEW badge)
- [ ] Sidebar shows "Study Rooms" (NEW badge)
- [ ] No duplicate "My Profile & Level"
- [ ] No duplicate "Leaderboard"
- [ ] No duplicate "Skill Assessment"

---

## 🔍 If Something Doesn't Work

### Coding Interview Tab Not Visible:
```bash
# 1. Clear browser cache (Ctrl+Shift+Delete)
# 2. Hard refresh (Ctrl+F5)
# 3. Restart dev server:
npm run dev
```

### Profile Card Not Showing:
```bash
# Visit gamified profile first:
http://localhost:5174/gamified-profile

# Then go back to:
http://localhost:5174/profile/edit
```

### Check Browser Console (F12):
- Look for red errors
- Share any error messages you see

---

## 📸 What You Should See

### Mock Interview - 4 Tabs:
```
┌─────────────┬──────────────┬───────────────────┬──────────────────────┐
│ Templates   │ Custom       │ Resume-Based      │ AI Coding Interview  │
│   (blue)    │  (purple)    │   (green)         │     (orange)         │
└─────────────┴──────────────┴───────────────────┴──────────────────────┘
```

### Profile Edit - Purple Card at Top:
```
┌──────────────────────────────────────────────────────────┐
│  🎮 Novice                          🏆 500 XP            │
│     Level 1                            XP Points          │
│                                                           │
│  Progress to next level                                  │
│  ████████░░░░░░░░░░░░░░ 500 / 1000 XP                    │
│                                                           │
│  📅 5 Day Streak  |  🎖️ 3 Achievements  |  🏅 #42 Rank   │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Clear node_modules and reinstall (if issues)
rm -rf node_modules
npm install
npm run dev
```

---

## ✨ What's Working Now

✅ **AI Coding Interview** - 4th tab in Mock Interview  
✅ **Profile Gamification** - Purple card on /profile/edit  
✅ **Navigation** - Clean sidebar, no duplicates  
✅ **Gamification System** - XP, levels, achievements  
✅ **Skill Assessment** - In Interview Prep section  
✅ **Leaderboard** - In Community tab  

---

## 📞 Need Help?

1. **Check browser console** (F12 → Console tab)
2. **Share screenshot** of what you see
3. **Share any error messages**
4. **Confirm you're on** http://localhost:5174/interview

---

**Everything should be working now! The coding interview is the 4th tab after Resume-Based Interview.** 🎉
