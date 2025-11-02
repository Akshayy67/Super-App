# Pair Programming Feature Guide

## Overview

The Pair Programming feature allows team members to collaborate on code in real-time within the Super App Team Space. This feature provides a professional, collaborative coding environment with live cursor tracking, syntax highlighting, role-based permissions, and integrated chat.

## Features

### 🎯 Core Features

- **Real-time Code Collaboration**: Multiple developers can work together on the same code
- **Live Cursor Tracking**: See where other participants are editing in real-time
- **Syntax Highlighting**: Support for multiple programming languages with color-coded syntax
- **Role-based Editing**: Driver/Navigator/Observer roles with appropriate permissions
- **Integrated Chat**: Communicate with your pair without leaving the editor
- **Code History**: Save and restore code snapshots at any point
- **Session Management**: Create, join, and manage multiple concurrent sessions

### 👥 Participant Roles

1. **Driver** 🚗
   - Can edit the code
   - Has full write access
   - Can save snapshots
   - Can switch roles with others
   - Only one driver at a time (configurable)

2. **Navigator** 🧭
   - Read-only access to code
   - Can view real-time changes
   - Can chat and provide guidance
   - Can be promoted to driver

3. **Observer** 👁️
   - Read-only access
   - Can view the session
   - Can participate in chat
   - Cannot edit code

### 💻 Supported Languages

- JavaScript
- TypeScript
- Python
- Java
- C++
- HTML
- CSS

## Getting Started

### Creating a Session

1. Navigate to your **Team Space**
2. Click on the **Pair Programming** tab
3. Click **"New Session"** button
4. Fill in the session details:
   - **Session Title** (required): e.g., "Feature Implementation"
   - **Programming Language**: Select from the dropdown
   - **Description** (optional): What you're working on
5. Click **"Create Session"**

### Joining an Existing Session

1. Go to the **Pair Programming** tab in your team space
2. Browse active sessions
3. Click on any session card to join
4. You'll automatically join as a **Navigator**

## Using the Editor

### Editor Interface

The pair programming editor consists of several key areas:

#### 1. **Header Bar**
- Session title and language
- Quick action buttons:
  - 💾 **Save Snapshot**: Save current code state
  - 📥 **Download Code**: Download as a file
  - 📋 **Copy Code**: Copy to clipboard
  - 🕐 **Code History**: View and restore previous versions
  - ⛶ **Fullscreen**: Toggle fullscreen mode
  - 🚪 **Leave Session**: Exit the current session
  - ⏹️ **End Session**: (Creator only) End for everyone

#### 2. **Code Editor**
- Line numbers on the left
- Syntax highlighting for selected language
- Live cursor indicators showing other participants' positions
- Current line and column display
- Read-only indicator (if you're not the driver)

#### 3. **Side Panel**
Two tabs available:
- **Team Tab**: View and manage participants
- **Chat Tab**: Text communication with the team

### Key Shortcuts

- **Tab**: Insert 2 spaces (auto-indentation)
- **Enter**: Send chat message (when in chat input)

## Working with Roles

### Switching the Driver

If you're currently the **driver** or the **session creator**:

1. Go to the **Team** tab in the side panel
2. Find the participant you want to make the driver
3. Click **"Make Driver"** button under their name
4. The role will switch immediately

### Role Indicators

Each participant in the Team tab shows:
- 🟣 **Colored dot**: Unique participant color
- **Name**: Participant's display name
- 👑 **Crown icon**: Session creator
- **Role badge**: Current role (Driver/Navigator/Observer)

## Code History & Snapshots

### Saving a Snapshot

1. Click the **Save** 💾 icon in the header
2. A snapshot is automatically created with:
   - Current code state
   - Your name
   - Timestamp

### Restoring Code

1. Click the **History** 🕐 icon
2. Browse through saved snapshots
3. Click **Restore** on any snapshot to load that code
4. The code editor will update immediately for all participants

## Chat Features

### Sending Messages

1. Switch to the **Chat** tab in the side panel
2. Type your message in the input field
3. Press **Enter** or click the **Send** button

### Message Types

- **Text Messages**: Regular chat messages
- **Code Snippets**: Share code in monospace format
- **System Messages**: Automatic notifications (joins, leaves, role changes)

### Chat Features

- Timestamps on all messages
- User identification
- Auto-scroll to latest message
- Persistent chat history

## Session Management

### Session Settings

Each session includes configurable settings:

- `allowMultipleDrivers`: Allow multiple people to edit simultaneously
- `autoSaveInterval`: Automatic snapshot interval (in seconds)
- `maxParticipants`: Maximum number of participants (default: 6)
- `requireApprovalToJoin`: Require creator approval for new joiners
- `enableVoiceChat`: Enable voice communication (future feature)
- `enableScreenShare`: Enable screen sharing (future feature)
- `enableCodeSuggestions`: Enable AI code suggestions (future feature)

### Session Status

- 🟢 **Active**: Session is running and accepting participants
- ⏸️ **Paused**: Session is temporarily paused
- 🔴 **Ended**: Session has been terminated

### Ending a Session

**Note**: Only the session creator can end a session.

1. Click the **"End Session"** button (red button in header)
2. Confirm the action
3. All participants will be notified
4. The session will move to "ended" status
5. Code can still be viewed but not edited

## Advanced Features

### Exporting Code

**Download as File**:
1. Click the **Download** 📥 icon
2. File will be saved with appropriate extension (`.js`, `.py`, etc.)
3. Filename will be the session title

**Copy to Clipboard**:
1. Click the **Copy** 📋 icon
2. Code is copied to clipboard
3. Green checkmark confirms successful copy

### Fullscreen Mode

1. Click the **Fullscreen** ⛶ icon
2. Editor expands to fill the entire screen
3. Click **Exit Fullscreen** to return to normal view

### Real-time Cursor Tracking

- Each participant has a unique color
- Cursors show participant name on hover
- Cursor positions update in real-time
- Active users listed at the bottom of the editor

## Best Practices

### For Effective Pair Programming

1. **Communicate Frequently**
   - Use the chat to explain your thinking
   - Ask questions when unsure
   - Provide context for your changes

2. **Switch Roles Regularly**
   - Rotate driver role every 15-30 minutes
   - Keep both participants engaged
   - Share the learning experience

3. **Take Breaks**
   - Use the pause feature for short breaks
   - Save snapshots before taking breaks
   - End sessions that won't continue soon

4. **Save Snapshots Often**
   - Before major changes
   - After completing features
   - When switching drivers
   - At natural breakpoints

5. **Respect Roles**
   - Drivers should narrate their actions
   - Navigators should provide guidance, not dictate
   - Observers should learn and ask questions

### Session Organization

- Use descriptive session titles
- Add descriptions for context
- End completed sessions promptly
- Create new sessions for different features

## Troubleshooting

### Common Issues

**Problem**: Can't edit the code
- **Solution**: Check if you're the driver. Only the driver can edit.

**Problem**: Not seeing other participants' cursors
- **Solution**: Ensure participants are actively typing or moving their cursor.

**Problem**: Changes not syncing
- **Solution**: Check your internet connection. Refresh if needed.

**Problem**: Session not appearing in list
- **Solution**: Ensure you're in the correct team. Check if session was ended.

**Problem**: Can't join a session
- **Solution**: Session may be at max capacity or require approval.

### Performance Tips

- Close unnecessary browser tabs
- Use fullscreen mode for better focus
- Clear code history if session becomes slow
- Limit participants to 3-4 for best performance

## Technical Details

### Real-time Synchronization

The pair programming feature uses Firebase Firestore for real-time synchronization:

- Code changes are synced instantly across all participants
- Cursor positions update every keystroke
- Chat messages appear immediately
- Role changes are reflected in real-time

### Data Structure

Each session is stored in Firestore with:
- Unique session ID
- Team association
- Participant list with roles and colors
- Current code state
- Chat history
- Code snapshots
- Session metadata

### Security

- Only team members can access sessions
- Role-based permissions enforce editing rights
- Session creator has administrative privileges
- All data is secured with Firestore rules

## API Reference

### Creating a Session Programmatically

```typescript
import { pairProgrammingService } from './utils/pairProgrammingService';

const session = await pairProgrammingService.createSession(
  teamId,
  "My Coding Session",
  "javascript",
  "Working on user authentication"
);
```

### Joining a Session

```typescript
await pairProgrammingService.joinSession(sessionId);
```

### Updating Code

```typescript
await pairProgrammingService.updateCode(
  sessionId,
  newCode,
  createSnapshot // boolean
);
```

### Switching Roles

```typescript
await pairProgrammingService.switchRoles(
  sessionId,
  newDriverUserId
);
```

### Sending Chat Messages

```typescript
await pairProgrammingService.sendMessage(
  sessionId,
  "Great idea!",
  "text" // or "code"
);
```

## Future Enhancements

### Planned Features

- 🎥 **Video/Audio Integration**: Built-in voice and video chat
- 🖥️ **Screen Sharing**: Share your screen with participants
- 🤖 **AI Code Suggestions**: Intelligent code completion
- 📊 **Session Analytics**: Track coding time and contributions
- 🔄 **Git Integration**: Commit directly from sessions
- 🎨 **Custom Themes**: Personalize editor appearance
- 📝 **Code Reviews**: Built-in review tools
- 🏆 **Achievements**: Gamification for regular pair programmers

## FAQ

**Q: How many people can join a session?**
A: Default is 6 participants, but this can be configured in session settings.

**Q: Can I have multiple drivers?**
A: By default, no. But you can enable `allowMultipleDrivers` in settings.

**Q: Is the code saved automatically?**
A: Code state is continuously synced to Firestore. Use snapshots for version history.

**Q: Can I use this for interviews?**
A: Absolutely! It's perfect for technical interviews and coding assessments.

**Q: What happens if I lose connection?**
A: Your session remains active. Reconnect and rejoin to continue.

**Q: Can I use this solo?**
A: Yes! Create a session and use it as a cloud-based code editor.

**Q: How do I delete a session?**
A: Currently, ended sessions remain in history. Deletion feature coming soon.

## Support

For issues or feature requests:
- Check the troubleshooting section
- Review console logs for errors
- Contact your team administrator
- Submit feedback through the app

## Contributing

To contribute to the pair programming feature:
1. Review the codebase in `src/utils/pairProgrammingService.ts`
2. Check component code in `src/team/components/PairProgramming.tsx`
3. Follow existing patterns and conventions
4. Test thoroughly with multiple participants
5. Submit pull requests with clear descriptions

---

**Happy Pair Programming! 🚀👨‍💻👩‍💻**

*Built with ❤️ for collaborative coding*

