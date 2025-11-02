# 🎯 How to Access Pair Tasks (Drawing & Programming)

## ⚠️ If you're seeing a blank screen, try these fixes:

### Fix #1: Hard Refresh
1. Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. This clears the cache and reloads

### Fix #2: Check Browser Console
1. Press `F12` to open Developer Tools
2. Click on the **Console** tab
3. Look for the line: `PairTasks rendering - teamId: [some ID]`
4. If you see this, the component is loading
5. Take a screenshot of any errors and share them

### Fix #3: Clear localStorage
1. Press `F12` to open Developer Tools
2. Go to **Application** tab
3. Find **Local Storage** in left sidebar
4. Right-click and select **Clear**
5. Refresh the page

---

## 📍 Step-by-Step Access Guide

### Step 1: Navigate to Team Space
```
Main Menu → Team Space
```

### Step 2: Select or Create a Team
- If you have teams, click on any team
- If not, click **"Create Team"** first

### Step 3: Find the "Pair Tasks" Tab
Look for the tab with the **Code icon** (`</>`):

**For Study Teams:**
```
Dashboard
Study Groups
Study Materials  
Study Sessions
👉 Pair Tasks ← CLICK HERE!
Doubt Discussion
General Chat
Settings
```

**For General Teams:**
```
Overview
Members
Files
Projects
👉 Pair Tasks ← CLICK HERE!
Doubt Discussion
Chat
Settings
```

### Step 4: Choose Your Mode

You should now see two large cards:

#### 🎨 For Drawing:
- Click the **pink/purple "Pair Drawing" card** on the right
- Features 12 drawing tools
- Perfect for brainstorming and diagrams

#### 💻 For Programming:
- Click the **blue/purple "Pair Programming" card** on the left
- Supports 13+ programming languages
- Perfect for coding together

---

## 🔍 Troubleshooting

### Problem: "I don't see the Pair Tasks tab"

**Solutions:**
1. Make sure you're inside a team (not the team list)
2. Scroll the tabs horizontally if on mobile
3. Check that you're logged in
4. Refresh the page with `Ctrl + R`

### Problem: "Tab is there but shows blank/white screen"

**Solutions:**
1. Open browser console (F12) and check for errors
2. Look for the console message: `PairTasks rendering - teamId: ...`
3. If you see the message but blank screen:
   - Try resizing the browser window
   - Try zooming out (`Ctrl + -`)
   - Check if scrolling down reveals content

4. If NO console message appears:
   - The component might not be rendering
   - Check that TeamSpace.tsx was updated correctly
   - Try hard refresh (`Ctrl + Shift + R`)

### Problem: "Cards are tiny or cut off"

**Solutions:**
1. Zoom out browser to 90% (`Ctrl + -`)
2. Make browser window larger
3. Try full-screen mode (F11)

### Problem: "Clicking cards does nothing"

**Solutions:**
1. Check browser console for errors
2. Make sure Firebase connection is working
3. Verify Firestore rules were updated
4. Check that you have a teamId

---

## 🎨 Once You're In Drawing Mode

### Quick Actions:
1. **Create Session**: Click "New Session" button
2. **Choose Tools**: Select from 12 tools in toolbar
3. **Pick Colors**: Click color palette icon
4. **Adjust Size**: Use size dropdown
5. **Start Drawing**: Click and drag on canvas
6. **Chat**: Use right sidebar for team chat
7. **Save Work**: Click save icon for snapshots
8. **Export**: Click download to save as PNG

### Available Tools:
- ✏️ Pen
- 🖍️ Highlighter
- 🧹 Eraser
- ─ Line
- → Arrow
- ▢ Rectangle
- ○ Circle
- △ Triangle
- T Text

---

## 💻 Once You're In Programming Mode

### Quick Actions:
1. **Create Session**: Click "New Session" button
2. **Choose Language**: Select from dropdown
3. **Start Coding**: Type in the code editor
4. **See Live Cursors**: Watch teammates type in real-time
5. **Chat**: Use right sidebar for discussions
6. **Save Snapshots**: Click save icon
7. **Download Code**: Click download to export

### Supported Languages:
- JavaScript, TypeScript, Python
- Java, C++, C#
- HTML, CSS
- Go, Rust, Ruby
- PHP, Swift, Kotlin

---

## 🎥 Visual Walkthrough

### What You Should See:

#### 1. Team Space Tab Bar
```
[Overview] [Members] [Files] [Projects] [👉 Pair Tasks] [Chat] [Settings]
```

#### 2. Pair Tasks Selection Screen
```
╔══════════════════════════════════════════════╗
║          Choose Your Collaboration Mode       ║
╠═══════════════════╦══════════════════════════╣
║                   ║                          ║
║  💻 PAIR          ║   🎨 PAIR               ║
║  PROGRAMMING      ║   DRAWING                ║
║                   ║                          ║
║  ✓ Real-time code ║   ✓ 12 drawing tools    ║
║  ✓ 13+ languages  ║   ✓ Live collaboration  ║
║  ✓ Live cursors   ║   ✓ Export PNG          ║
║                   ║                          ║
║  [Start →]        ║   [Start →]             ║
╚═══════════════════╩══════════════════════════╝
```

---

## 📱 Mobile Access

1. **Open Team Space**
2. **Select Team**
3. **Swipe** the tab bar to find "Pair Tasks"
4. **Tap** Pair Tasks
5. **Tap** either card (Programming or Drawing)

---

## ❓ Still Having Issues?

### Debug Checklist:
- [ ] Hard refresh (`Ctrl + Shift + R`)
- [ ] Check browser console for errors (F12)
- [ ] Verify you're logged in
- [ ] Verify you're inside a team
- [ ] Check internet connection
- [ ] Try a different browser
- [ ] Clear browser cache
- [ ] Update Firestore rules (from COMPLETE_FIRESTORE_RULES.txt)

### Share This Info:
If you need help, share:
1. Browser name and version
2. Screenshot of what you see
3. Any console errors (F12 → Console tab)
4. The console message that starts with "PairTasks rendering"

---

## 🎉 Success Indicators

You'll know it's working when you see:
- ✅ Colorful gradient background (purple/pink/indigo)
- ✅ "Pair Tasks" header with gradient text
- ✅ Two large, clickable cards
- ✅ Feature lists under each card
- ✅ No console errors

---

## 🚀 Quick Test

Run this quick test to verify everything works:

1. ✅ Navigate to Team Space
2. ✅ Click on a team
3. ✅ Click "Pair Tasks" tab
4. ✅ See two colorful cards
5. ✅ Click "Pair Drawing" card
6. ✅ See "New Session" button
7. ✅ Click back arrow
8. ✅ See cards again
9. ✅ Click "Pair Programming" card
10. ✅ See "New Session" button

If all steps work → **YOU'RE ALL SET! 🎉**

---

## 📞 Need More Help?

Check these files:
- `PAIR_TASKS_README.md` - Complete overview
- `docs/PAIR_TASKS_COMPLETE_GUIDE.md` - Full documentation
- `docs/PAIR_DRAWING_QUICK_START.md` - Drawing guide
- `docs/INTEGRATION_GUIDE.md` - Technical details





