# Video Meeting Components

This directory contains all components for the production-grade video meeting feature.

## 📁 Component Structure

### Main Components

#### `VideoMeeting.tsx`
The main orchestrator component that manages the entire meeting experience.

**Responsibilities:**
- Meeting state management
- WebRTC connection handling
- Firestore real-time synchronization
- View mode switching (grid/speaker)
- Sidebar management (chat, participants, settings)
- Error handling and notifications

**Key State:**
- `meeting`: Current meeting data from Firestore
- `localStream`: User's camera/microphone stream
- `remoteStreams`: Other participants' streams
- `isAudioMuted`, `isVideoOff`, `isScreenSharing`: Media controls
- `isChatOpen`, `isParticipantsOpen`, `isSettingsOpen`: UI toggles

#### `MeetingLobby.tsx`
Pre-meeting interface for creating or joining meetings.

**Responsibilities:**
- Meeting creation form
- Meeting join form
- Camera/microphone preview
- Device testing and preview
- Mode switching (create/join)

**Features:**
- Real-time video preview
- Audio/video toggle before joining
- Beautiful gradient UI
- Mobile-responsive design

#### `MeetingControls.tsx`
Bottom control bar with all meeting actions.

**Responsibilities:**
- Audio/video toggles
- Screen share control
- Hand raise button
- Chat/participants/settings toggles
- Leave meeting button

**Props:**
- All boolean states for controls
- Callback functions for each action
- Chat unread count
- Host status

### UI Components

#### `ParticipantVideo.tsx`
Individual video tile for each participant.

**Responsibilities:**
- Display participant video or avatar
- Show participant name and status
- Audio level visualization
- Status badges (host, screen sharing, hand raised)
- Mute/camera indicators

**Features:**
- Speaking indicator (green border)
- Gradient avatar fallbacks
- Hover effects for controls
- Mobile-optimized sizing

#### `MeetingChat.tsx`
Chat sidebar for messaging during meetings.

**Responsibilities:**
- Display chat messages
- Send text messages
- Quick reactions (emojis)
- System messages (join/leave)
- Auto-scroll to latest

**Features:**
- Timestamp for each message
- Own messages right-aligned
- System messages centered
- Emoji picker
- Real-time updates

#### `ParticipantsList.tsx`
Participants sidebar showing all attendees.

**Responsibilities:**
- List all participants
- Show participant status
- Display audio/video state
- Show raised hands
- Statistics footer

**Features:**
- Avatar or photo display
- Host badge (crown icon)
- Mute/video indicators
- Hand raise animation
- Participant count stats

#### `MeetingSettings.tsx`
Settings panel for meeting configuration (host only).

**Responsibilities:**
- Display meeting settings
- Update settings in real-time
- Validate host permissions
- Save settings to Firestore

**Settings Categories:**
1. Participant Permissions
   - Screen sharing
   - Recording

2. Meeting Options
   - Mute on join
   - Waiting room
   - Host approval

3. Features
   - Chat
   - Reactions
   - Virtual backgrounds

4. Capacity
   - Max participants

## 🔧 Services Used

### `videoMeetingService`
Firestore operations for meeting management.

```typescript
import { videoMeetingService } from '../../services/videoMeetingService';

// Create meeting
const meetingId = await videoMeetingService.createMeeting(
  userId,
  userName,
  title,
  description
);

// Join meeting
await videoMeetingService.joinMeeting(
  meetingId,
  userId,
  userName,
  userEmail,
  avatar
);

// Subscribe to updates
const unsubscribe = videoMeetingService.subscribeMeeting(
  meetingId,
  (meeting) => {
    setMeeting(meeting);
  }
);
```

### `webRTCService`
WebRTC operations for media streaming.

```typescript
import { webRTCService } from '../../services/webRTCService';

// Start camera/microphone
const stream = await webRTCService.startLocalStream(true, true);

// Toggle audio
webRTCService.toggleAudio(enabled);

// Start screen sharing
const screenStream = await webRTCService.startScreenShare();
```

## 📊 Data Flow

```
User Action
    ↓
Component Handler
    ↓
├─ WebRTC Service ──→ Media Streams ──→ Video Elements
│
└─ Meeting Service ──→ Firestore ──→ Real-time Sync
                                        ↓
                                   All Participants
```

## 🎨 Styling

### Theme
- Dark mode optimized
- Gradient accents (blue-purple)
- Tailwind CSS utilities
- Responsive breakpoints

### Colors
```css
Background:  bg-gray-900, bg-gray-800
Text:        text-white, text-gray-400
Accents:     blue-600, purple-600
Status:
  - Muted:   red-500
  - Active:  green-400
  - Hand:    yellow-500
```

### Responsive
- Mobile: Single column, bottom controls
- Tablet: 2x2 grid, adaptive controls
- Desktop: Up to 4x4 grid, full features

## 🔐 Security

### Permissions
- All actions require authentication
- Host-only actions are validated
- Firestore rules enforce permissions

### Data Privacy
- Media streams are P2P (not stored)
- Firestore stores only metadata
- No recording without permission

## 🧩 Component Communication

### Props Flow
```
VideoMeeting (Parent)
├─ MeetingControls
│  └─ Callback props for actions
├─ ParticipantVideo (per participant)
│  └─ Participant data + stream
├─ MeetingChat
│  └─ Meeting data + callbacks
├─ ParticipantsList
│  └─ Meeting data + current user
└─ MeetingSettings
   └─ Meeting data + host flag
```

### Event Handling
```typescript
// Parent handles all state
const [isAudioMuted, setIsAudioMuted] = useState(false);

// Pass state + callback to child
<MeetingControls
  isAudioMuted={isAudioMuted}
  onToggleAudio={toggleAudio}
/>

// Child calls callback
const handleToggle = () => {
  onToggleAudio();
};
```

## 📱 Mobile Considerations

### Touch Optimizations
- Larger tap targets (44px minimum)
- Swipe to close sidebars
- Bottom sheet style panels
- Reduced margins/padding

### Performance
- Lower video quality on mobile data
- Reduce grid participants on small screens
- Lazy load sidebars
- Efficient re-renders

### Layout
```
Mobile:
[==== Video Grid ====]
[                   ]
[  Control Bar      ]

Desktop:
[Video Grid] [Chat]
[          ] [     ]
[Control Bar      ]
```

## 🐛 Error Handling

### Common Errors
1. **Camera/Mic Access Denied**
   ```typescript
   try {
     await webRTCService.startLocalStream(true, true);
   } catch (err) {
     setError('Could not access camera/microphone');
   }
   ```

2. **Meeting Not Found**
   ```typescript
   if (!meeting) {
     setError('Meeting not found');
   }
   ```

3. **Connection Failed**
   ```typescript
   webRTCService.onConnectionStateChange((userId, state) => {
     if (state === 'failed') {
       // Handle reconnection
     }
   });
   ```

## 🧪 Testing

### Component Tests
```typescript
// Test participant video
test('shows avatar when video off', () => {
  const participant = {
    ...mockParticipant,
    isCameraOff: true
  };
  render(<ParticipantVideo participant={participant} />);
  expect(screen.getByText(/initials/)).toBeInTheDocument();
});
```

### Integration Tests
```typescript
// Test meeting flow
test('can create and join meeting', async () => {
  // Create meeting
  const meetingId = await videoMeetingService.createMeeting(...);
  expect(meetingId).toBeTruthy();
  
  // Join meeting
  await videoMeetingService.joinMeeting(meetingId, ...);
  const meeting = await videoMeetingService.getMeeting(meetingId);
  expect(meeting.participants).toHaveLength(1);
});
```

## 📚 Resources

### External Dependencies
- **WebRTC API**: [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- **Firestore**: [Firebase Docs](https://firebase.google.com/docs/firestore)
- **React**: [React Docs](https://react.dev)
- **Tailwind**: [Tailwind Docs](https://tailwindcss.com)

### Internal Resources
- Types: `src/types/videoMeeting.ts`
- Services: `src/services/videoMeetingService.ts`, `src/services/webRTCService.ts`
- Docs: `docs/VIDEO_MEETING_*.md`

## 🚀 Quick Start for Developers

### Adding a New Feature

1. **Update Types** (`src/types/videoMeeting.ts`)
   ```typescript
   export interface VideoMeeting {
     // Add your property
     newFeature?: boolean;
   }
   ```

2. **Update Service** (`src/services/videoMeetingService.ts`)
   ```typescript
   async updateNewFeature(meetingId: string, value: boolean) {
     await updateDoc(doc(this.meetingsCollection, meetingId), {
       newFeature: value
     });
   }
   ```

3. **Update UI** (Relevant component)
   ```typescript
   const handleNewFeature = async () => {
     await videoMeetingService.updateNewFeature(meetingId, true);
   };
   ```

### Debugging Tips

1. **Enable Console Logs**
   ```typescript
   // In VideoMeeting.tsx
   useEffect(() => {
     console.log('Meeting state:', meeting);
     console.log('Local stream:', localStream);
     console.log('Remote streams:', remoteStreams);
   }, [meeting, localStream, remoteStreams]);
   ```

2. **Check Firestore**
   - Open Firebase Console
   - Go to Firestore Database
   - Check `videoMeetings` collection
   - Verify data structure

3. **Test WebRTC**
   ```typescript
   // Check local stream
   const stream = webRTCService.getLocalStream();
   console.log('Tracks:', stream?.getTracks());
   ```

## 🎓 Best Practices

### Performance
- Use `React.memo` for video tiles
- Debounce frequent updates
- Lazy load sidebars
- Clean up listeners on unmount

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for complex logic
- Keep components under 500 lines

### Git Commits
```
feat: Add virtual background support
fix: Resolve audio echo issue
refactor: Extract chat logic to hook
docs: Update meeting component README
```

---

**Happy coding! 🎥**





