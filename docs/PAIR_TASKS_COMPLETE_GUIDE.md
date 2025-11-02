# Pair Tasks - Complete Guide

## 📋 Overview

**Pair Tasks** is a unified collaboration system that combines **Pair Programming** and **Pair Drawing** into a single, powerful feature for team collaboration. This enables real-time collaborative coding and visual design work within your Super App Team Space.

---

## 🎯 What is Pair Tasks?

Pair Tasks provides two distinct but complementary collaboration modes:

### 1. **Pair Programming** 💻
Real-time collaborative coding with multiple team members, featuring live cursor tracking, syntax highlighting, role-based permissions, and integrated communication tools.

### 2. **Pair Drawing** 🎨
Real-time collaborative drawing and whiteboarding, perfect for brainstorming, design sessions, architecture diagrams, and visual collaboration.

Both modes support:
- ✅ Real-time synchronization
- ✅ Multiple concurrent participants
- ✅ Live cursor tracking
- ✅ Integrated chat
- ✅ Session history and snapshots
- ✅ Export functionality

---

## 🚀 Getting Started

### Accessing Pair Tasks

1. Navigate to your **Team Space**
2. Click on the **Pair Tasks** section
3. Choose between **Pair Programming** or **Pair Drawing**

### Quick Start Flow

```
Team Space → Pair Tasks → Choose Mode → Create/Join Session → Collaborate!
```

---

## 💻 Pair Programming

### Creating a Programming Session

1. Click **Pair Programming** from Pair Tasks
2. Click **"New Session"**
3. Fill in session details:
   - **Title**: e.g., "Feature Implementation"
   - **Programming Language**: Select from dropdown (JavaScript, Python, Java, etc.)
   - **Description** (optional): What you're working on
4. Click **"Create Session"**

### Supported Languages

- JavaScript
- TypeScript
- Python
- Java
- C++
- HTML
- CSS
- Go
- Rust
- Ruby
- PHP
- Swift
- Kotlin
- C#

### Participant Roles

#### 🚗 Driver
- **Can** edit code
- **Can** save snapshots
- **Can** switch roles
- Only ONE driver at a time (configurable)

#### 🧭 Navigator
- **Cannot** edit code
- **Can** view real-time changes
- **Can** participate in chat
- **Can** be promoted to driver

#### 👁️ Observer
- **Cannot** edit code
- **Can** view session
- **Can** participate in chat
- Read-only access

### Features

#### Code Editing
- Real-time code synchronization
- Syntax highlighting for all supported languages
- Line numbers and formatting
- Tab support (2 spaces)

#### Live Cursors
- See where other participants are typing
- Color-coded per user
- Username labels
- Real-time position updates

#### Chat System
- Integrated text chat
- System messages for events
- Code sharing in chat
- Message history

#### Code History
- Save code snapshots at any time
- Add descriptions to snapshots
- Restore previous versions
- Track who made changes

#### Actions
- 💾 **Save Snapshot**: Create a restore point
- 📥 **Download**: Export code to file
- 📋 **Copy**: Copy code to clipboard
- 🕐 **History**: View and restore snapshots
- ▶️ **Run**: Execute code (where supported)
- 🚪 **Leave**: Exit session gracefully

### Keyboard Shortcuts
- **Tab** = Insert 2 spaces (indentation)
- **Enter** (in chat) = Send message

---

## 🎨 Pair Drawing

### Creating a Drawing Session

1. Click **Pair Drawing** from Pair Tasks
2. Click **"New Session"**
3. Fill in session details:
   - **Title**: e.g., "Design Brainstorm"
   - **Description** (optional): What you're working on
4. Click **"Create Session"**

### Drawing Tools

#### ✏️ Basic Tools
| Tool | Description | Shortcut |
|------|-------------|----------|
| **Pen** | Freehand drawing | - |
| **Highlighter** | Semi-transparent marker | - |
| **Eraser** | Remove drawn elements | - |
| **Select** | Move and manipulate objects | - |

#### 📐 Shape Tools
| Tool | Description |
|------|-------------|
| **Line** | Draw straight lines |
| **Arrow** | Draw directional arrows |
| **Rectangle** | Draw rectangles/squares |
| **Circle** | Draw circles/ellipses |
| **Triangle** | Draw triangles |

#### 🎨 Styling Tools
| Feature | Options |
|---------|---------|
| **Colors** | 16 preset colors + custom color picker |
| **Brush Size** | 1px - 32px (10 preset sizes) |
| **Opacity** | Adjustable for highlighter tool |
| **Fill** | Optional fill for shapes |

#### 📝 Text Tool
- Add text at any position
- Adjustable size based on brush size
- Any color
- Font: Arial (default)

### Participant Roles

#### ✏️ Drawer
- **Can** draw and edit
- **Can** use all tools
- **Can** save snapshots
- **Can** clear canvas
- Multiple drawers allowed (configurable)

#### 👁️ Viewer
- **Cannot** draw
- **Can** view real-time changes
- **Can** participate in chat
- **Can** see other participants' cursors

### Features

#### Real-time Collaboration
- Live drawing synchronization
- Multiple concurrent drawers
- Color-coded participant cursors
- Instant updates across all participants

#### Canvas Management
- 1200x800px default canvas
- White background (customizable)
- Zoom and pan support (coming soon)
- Grid overlay option (coming soon)

#### Drawing History
- Save canvas snapshots
- Add descriptions to snapshots
- Restore previous versions
- View snapshot history

#### Actions
- 💾 **Save Snapshot**: Create a restore point
- 🔄 **Undo**: Remove last drawing
- 🗑️ **Clear Canvas**: Remove all drawings
- 📥 **Export**: Download as PNG
- 🕐 **History**: View and restore snapshots
- 🚪 **Leave**: Exit session

#### Chat System
- Integrated text chat
- System messages for events
- Real-time message sync
- Message history

---

## 👥 Collaboration Features

### Session Management

#### Creating Sessions
- Only authenticated team members can create
- Session creator becomes the host
- Host has special permissions

#### Joining Sessions
- See all active team sessions
- One-click join
- Automatic participant assignment
- Real-time participant list

#### Leaving Sessions
- Graceful exit
- Automatically remove cursor and presence
- System message to other participants
- Session auto-ends if last participant leaves

#### Ending Sessions
- Only session creator can end
- Disconnects all participants
- Session moves to "ended" state
- Can view ended sessions in history

### Participant Management

#### Adding Participants
- Share session from active sessions list
- Team members join directly
- Max participants: configurable (default 6 for programming, 10 for drawing)

#### Role Management
- Session creator can switch roles
- Roles affect editing permissions
- Visual indicators for roles
- System messages when roles change

### Live Cursors

#### Features
- Real-time cursor position tracking
- Color-coded per participant
- Username labels
- Automatically hidden when participant leaves

#### Display
- 8px circular cursor indicator
- Floating username label
- Matches participant's assigned color
- Updates smoothly in real-time

---

## 💬 Chat System

### Sending Messages
1. Type message in chat input box
2. Press **Enter** or click **Send**
3. Message appears for all participants

### Message Types
- **User Messages**: Regular chat messages
- **System Messages**: Automatic notifications (joins, leaves, role changes)

### Features
- Real-time message sync
- Message history preserved
- Auto-scroll to latest message
- Username and timestamp display
- Color-coded by participant

---

## 📸 Snapshots & History

### Creating Snapshots

#### Pair Programming
1. Click **💾 Save Snapshot**
2. Current code is saved with timestamp
3. Snapshot appears in history

#### Pair Drawing
1. Click **💾 Save Snapshot**
2. Optionally add description
3. Current canvas is saved
4. Snapshot appears in history

### Viewing History
1. Click **🕐 History** tab
2. Browse saved snapshots
3. See who created each snapshot
4. View timestamps and descriptions

### Restoring Snapshots
1. Open **History** panel
2. Find snapshot to restore
3. Click **Restore** button
4. Current state replaced with snapshot

### Auto-save
- Configurable auto-save interval (default: 30 seconds)
- Runs in background
- No user action required
- Can disable in settings

---

## 📥 Export & Download

### Pair Programming

#### Download Code
1. Click **📥 Download** button
2. File saves with format: `code_<language>_<date>.ext`
3. Appropriate file extension based on language

#### Copy Code
1. Click **📋 Copy** button
2. Code copied to clipboard
3. Confirmation message appears

### Pair Drawing

#### Export Drawing
1. Click **📥 Export** button
2. Canvas saved as PNG
3. File name: `drawing_<title>_<date>.png`
4. Full resolution export

---

## ⚙️ Settings & Configuration

### Session Settings

#### Pair Programming
```typescript
{
  allowMultipleDrivers: false,      // Allow multiple simultaneous editors
  autoSaveInterval: 30,             // Seconds between auto-saves
  maxParticipants: 6,               // Maximum participants allowed
  requireApprovalToJoin: false,     // Host must approve joins
  enableVoiceChat: true,            // Enable voice communication
  enableScreenShare: true,          // Enable screen sharing
  enableCodeSuggestions: true       // AI code suggestions
}
```

#### Pair Drawing
```typescript
{
  allowMultipleDrawers: true,       // Allow multiple drawers
  autoSaveInterval: 30,             // Seconds between auto-saves
  maxParticipants: 10,              // Maximum participants allowed
  requireApprovalToJoin: false,     // Host must approve joins
  enableVoiceChat: true,            // Enable voice communication
  showCursors: true,                // Show live cursors
  showDrawingHistory: true          // Show history panel
}
```

### Changing Settings
- Only session creator can modify settings
- Changes apply immediately
- All participants see updated settings
- System message sent on change

---

## 🎯 Best Practices

### Pair Programming

#### Driver/Navigator Pattern
1. **Driver** writes code actively
2. **Navigator** reviews and guides
3. Switch roles every 15-20 minutes
4. Use chat to discuss approach

#### Code Quality
- Save snapshots before major changes
- Use descriptive snapshot names
- Review code together before committing
- Discuss architecture in chat

#### Communication
- Explain your thinking out loud
- Ask questions freely
- Use chat for links and references
- Take breaks together

### Pair Drawing

#### Collaborative Drawing
- Use different colors per person
- Label your sections
- Combine shapes for clarity
- Add text annotations

#### Organization
- Start with rough sketches
- Refine together
- Use arrows for flow
- Save snapshots of iterations

#### Visual Design
- Use color coding consistently
- Keep text readable (size 12+)
- Group related elements
- Export regularly

---

## 🔒 Security & Permissions

### Authentication
- All features require authentication
- Firebase Authentication integration
- Secure token-based access

### Firestore Rules
```javascript
// Pair Programming Sessions
match /pairProgrammingSessions/{sessionId} {
  allow create: if request.auth != null 
                && request.resource.data.createdBy == request.auth.uid;
  allow read: if request.auth != null;
  allow update: if request.auth != null 
                && (resource.data.createdBy == request.auth.uid 
                    || request.auth.uid in resource.data.participants.keys());
  allow delete: if request.auth != null 
                && resource.data.createdBy == request.auth.uid;
}

// Pair Drawing Sessions
match /pairDrawingSessions/{sessionId} {
  allow create: if request.auth != null 
                && request.resource.data.createdBy == request.auth.uid;
  allow read: if request.auth != null;
  allow update: if request.auth != null 
                && (resource.data.createdBy == request.auth.uid 
                    || request.auth.uid in resource.data.participants.keys());
  allow delete: if request.auth != null 
                && resource.data.createdBy == request.auth.uid;
}
```

### Permissions Summary
- **Create**: Authenticated users only
- **Read**: All team members
- **Update**: Creator and participants
- **Delete**: Creator only

---

## 🐛 Troubleshooting

### Common Issues

#### "Session not found"
- Session may have been ended
- Check active sessions list
- Create a new session

#### "Cannot edit code/drawing"
- Check your role (Driver/Drawer required)
- Ask session creator to change your role
- Verify you're in an active session

#### Cursor not updating
- Check internet connection
- Refresh the page
- Rejoin the session

#### Chat messages not sending
- Verify authentication
- Check network connection
- Ensure session is active

### Performance Tips
- Limit participants to recommended max
- Clear history periodically
- Export and start fresh for large projects
- Use modern browsers (Chrome, Firefox, Edge)

---

## 📊 Technical Details

### Architecture

#### Services
- **pairProgrammingService.ts**: Programming session management
- **pairDrawingService.ts**: Drawing session management
- Real-time Firestore synchronization
- Optimistic UI updates

#### Components
- **PairTasks.tsx**: Unified entry point
- **PairProgramming.tsx**: Programming interface
- **PairDrawing.tsx**: Drawing interface

#### Data Flow
```
User Action → Service Layer → Firestore → Real-time Listeners → UI Update
```

### Real-time Sync

#### Technologies
- Firebase Firestore real-time listeners
- Optimistic updates for responsiveness
- Automatic conflict resolution
- Delta updates for efficiency

#### Update Frequency
- Cursor updates: ~100ms throttle
- Drawing paths: Immediate on complete
- Chat messages: Immediate
- Code changes: Debounced (500ms)

---

## 🎓 Use Cases

### Pair Programming
- **Feature Development**: Build features together
- **Bug Fixing**: Debug issues collaboratively
- **Code Reviews**: Review and discuss code live
- **Mentoring**: Teach coding concepts
- **Interviews**: Technical interview sessions
- **Learning**: Learn new languages together

### Pair Drawing
- **Brainstorming**: Visual idea generation
- **Architecture Design**: System diagrams
- **UI/UX Design**: Wireframes and mockups
- **Whiteboarding**: Problem solving
- **Education**: Visual teaching
- **Documentation**: Flowcharts and diagrams

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Voice chat integration
- [ ] Screen sharing
- [ ] AI code suggestions
- [ ] More drawing tools (polygon, bezier curves)
- [ ] Canvas zoom and pan
- [ ] Layer support for drawings
- [ ] Collaborative text documents
- [ ] Session recording and playback
- [ ] Integration with version control
- [ ] Mobile app support

---

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Pair Programming implementation
- ✅ Pair Drawing implementation
- ✅ Unified Pair Tasks interface
- ✅ Real-time collaboration
- ✅ Live cursor tracking
- ✅ Chat system
- ✅ History and snapshots
- ✅ Export functionality
- ✅ Role-based permissions
- ✅ Multiple drawing tools
- ✅ Syntax highlighting for code
- ✅ Multi-language support

---

## 🆘 Support

### Getting Help
- Check this documentation first
- Review troubleshooting section
- Check team space settings
- Verify Firestore rules are updated

### Reporting Issues
When reporting issues, include:
- Session type (programming/drawing)
- Number of participants
- Steps to reproduce
- Browser and version
- Error messages (if any)

---

## 📚 Additional Resources

### Related Documentation
- [Pair Programming Implementation Summary](./PAIR_PROGRAMMING_IMPLEMENTATION_SUMMARY.md)
- [Pair Programming Guide](./PAIR_PROGRAMMING_GUIDE.md)
- [Pair Programming Quick Start](./PAIR_PROGRAMMING_QUICK_START.md)
- [Complete Firestore Rules](../COMPLETE_FIRESTORE_RULES.txt)

### Code Files
- `src/team/components/PairTasks.tsx`
- `src/team/components/PairProgramming.tsx`
- `src/team/components/PairDrawing.tsx`
- `src/utils/pairProgrammingService.ts`
- `src/utils/pairDrawingService.ts`
- `src/team/types/pairProgrammingTypes.ts`
- `src/team/types/pairDrawingTypes.ts`

---

## 🎉 Conclusion

Pair Tasks brings powerful real-time collaboration to your team, enabling both code and visual design collaboration in a seamless, integrated experience. Whether you're building features together or brainstorming designs, Pair Tasks provides the tools you need for effective team collaboration.

**Happy Collaborating! 🚀**





