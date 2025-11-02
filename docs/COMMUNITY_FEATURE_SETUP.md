# Community Feature Setup Guide

## Overview

The Community feature provides a real-time social platform within Super App where users can:
- 📝 **Create and share posts** with the community
- 📅 **Organize and join events** (study groups, workshops, webinars)
- 🏆 **Compete on leaderboards** with points and streaks
- 📚 **Share learning resources** with other users
- 💬 **Comment on posts** and engage with content
- ⭐ **Like and view posts** with real-time updates

## Features

### 1. Community Feed
- **Real-time post updates** using Firestore snapshots
- **Like/Unlike functionality** with optimistic UI updates
- **View tracking** to see post engagement
- **Tag-based filtering** for easy content discovery
- **Multiple filter options**: All Posts, Trending, Most Recent, Most Popular
- **Post creation** with tags and rich text support

### 2. Events Management
- **Create events** with date, time, and type (Study/Workshop/Webinar)
- **Join/Leave events** with real-time attendee tracking
- **Event types** with color-coded badges
- **Upcoming events display** sorted by date

### 3. Leaderboard System
- **Points system** for community engagement:
  - Creating a post: **10 points**
  - Adding a comment: **5 points**
  - Receiving a like: **2 points** (for post author)
  - Creating an event: **20 points**
  - Joining an event: **5 points**
  - Sharing a resource: **15 points**
  - Getting a resource download: **3 points** (for author)
- **Streak tracking** for daily activity
- **Top contributors** with medal indicators
- **Personal stats** with highlighted position

### 4. Resource Sharing
- **Upload and share** study materials
- **Download tracking** with analytics
- **Resource categorization** by type
- **Author attribution** for all resources

## Setup Instructions

### 1. Firestore Security Rules

Add the security rules from `docs/COMMUNITY_FIRESTORE_RULES.txt` to your Firebase project:

1. Go to **Firebase Console > Firestore Database > Rules**
2. Add the community collection rules
3. **Publish** the rules
4. **Test** using the Rules Simulator

### 2. Firestore Collections

The following collections will be automatically created when users start using the feature:

- `community_posts` - Stores all user posts
- `community_events` - Stores community events
- `community_leaderboard` - Tracks user points and streaks
- `community_resources` - Stores shared learning materials
- `community_comments` - Stores post comments

### 3. Indexes (Optional but Recommended)

For better performance, create the following Firestore indexes:

```
Collection: community_posts
- likes (Descending), timestamp (Descending)
- views (Descending), timestamp (Descending)
- timestamp (Descending)

Collection: community_events
- date (Ascending)

Collection: community_leaderboard
- points (Descending)

Collection: community_comments
- postId (Ascending), createdAt (Descending)
```

To create indexes:
1. Go to **Firebase Console > Firestore Database > Indexes**
2. Click **Create Index**
3. Add the fields as specified above

Or wait for Firebase to prompt you with index creation links when queries are first run.

## Usage

### For Users

#### Creating a Post
1. Navigate to **Community** tab
2. Click **Community Feed**
3. Click **New Post** button
4. Write your content and add tags (comma-separated)
5. Click **Post** to publish

#### Creating an Event
1. Navigate to **Community > Events**
2. Click **Create Event**
3. Fill in event details (title, date, time, type)
4. Click **Create Event** to publish

#### Joining an Event
1. Browse events in the **Events** tab
2. Click **Join Event** on any event
3. Your name will be added to the attendees list
4. Click **Leave Event** to remove yourself

#### Viewing Leaderboard
1. Navigate to **Community > Leaderboard**
2. View top contributors and their points
3. See your own rank (highlighted with "You" label)
4. Check your streak in the header stats

#### Sharing Resources
1. Navigate to **Community > Resources**
2. Click **Share Resource** (coming soon - UI implementation pending)
3. Upload file and add details
4. Others can download and you earn points

### For Developers

#### Adding New Point Actions

To add points for a new user action:

```typescript
import { communityService } from '../services/communityService';

// Award points to a user
await communityService.updateUserPoints(userId, points);
```

#### Subscribing to Real-time Updates

```typescript
// Subscribe to posts
const unsubscribe = communityService.subscribeToFeed('all', (posts) => {
  console.log('New posts:', posts);
});

// Clean up
return () => unsubscribe();
```

#### Creating Custom Filters

Modify the `subscribeToFeed` method in `communityService.ts`:

```typescript
subscribeToFeed(filterType: string, callback: (posts: Post[]) => void) {
  let q;
  
  switch (filterType) {
    case 'myPosts':
      q = query(
        this.postsCollection,
        where('authorId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      break;
    // Add more cases...
  }
  
  return onSnapshot(q, (snapshot) => {
    // Handle updates
  });
}
```

## Points System Details

| Action | Points Earned | Recipient |
|--------|--------------|-----------|
| Create a post | 10 | Post creator |
| Add a comment | 5 | Commenter |
| Receive a like | 2 | Post author |
| Create an event | 20 | Event creator |
| Join an event | 5 | Event joiner |
| Share a resource | 15 | Resource sharer |
| Resource downloaded | 3 | Resource author |

## Streak System

- Streaks track **consecutive days** of activity
- Any community action counts (posting, commenting, liking, etc.)
- Streaks reset if a day is missed (more than 24 hours)
- Streaks are updated automatically via `updateUserStreak()`

## Real-time Updates

All data uses Firestore real-time listeners:
- ✅ **Posts** update instantly across all clients
- ✅ **Events** show live attendee changes
- ✅ **Leaderboard** updates as points are earned
- ✅ **Resources** reflect download counts in real-time

## Performance Optimization

The service includes several optimizations:

1. **Limited queries** - Only fetches 50 most recent items
2. **Indexed queries** - All major queries use indexes
3. **Efficient listeners** - Properly unsubscribed on component unmount
4. **Optimistic UI** - Like actions feel instant before server confirmation
5. **View tracking** - Only counts unique views per user

## Troubleshooting

### Posts Not Showing
- Check Firestore rules are properly configured
- Ensure user is authenticated
- Check browser console for errors
- Verify collection name is `community_posts`

### Real-time Updates Not Working
- Confirm Firebase is initialized correctly
- Check network connection
- Verify Firestore rules allow read access
- Check for listener cleanup issues

### Points Not Updating
- Ensure leaderboard is initialized for the user
- Check console for errors during point updates
- Verify user ID matches in leaderboard collection

### Events Not Appearing
- Verify event dates are in correct format (YYYY-MM-DD)
- Check that events collection exists
- Ensure proper read permissions in Firestore rules

## Future Enhancements

Potential features to add:

- [ ] Image uploads for posts
- [ ] Rich text editor for posts
- [ ] Notifications for event reminders
- [ ] Direct messaging between users
- [ ] Post categories and advanced filtering
- [ ] User profiles with bio and avatar upload
- [ ] Resource file uploads (currently URL-based)
- [ ] Comment threading and replies
- [ ] Post bookmarking/saving
- [ ] Community moderation tools
- [ ] Achievement badges system
- [ ] Weekly/Monthly leaderboard resets
- [ ] Event calendar view
- [ ] Search functionality across all content

## API Reference

### communityService Methods

#### Posts
- `createPost(userId, userName, content, tags)` - Create a new post
- `updatePost(postId, content, tags)` - Update existing post
- `deletePost(postId)` - Delete a post
- `likePost(postId, userId)` - Like/Unlike a post
- `viewPost(postId, userId)` - Track post view
- `sharePost(postId)` - Increment share count
- `subscribeToFeed(filterType, callback)` - Real-time post updates

#### Comments
- `addComment(postId, userId, userName, content)` - Add a comment
- `subscribeToComments(postId, callback)` - Real-time comments

#### Events
- `createEvent(userId, title, description, date, time, type)` - Create event
- `joinEvent(eventId, userId)` - Join/Leave an event
- `subscribeToEvents(callback)` - Real-time event updates

#### Leaderboard
- `initializeUserLeaderboard(userId, userName)` - Setup user entry
- `updateUserPoints(userId, points)` - Add/subtract points
- `updateUserStreak(userId)` - Update streak status
- `subscribeToLeaderboard(timeRange, callback)` - Real-time leaderboard

#### Resources
- `shareResource(userId, userName, title, description, fileUrl, type)` - Share resource
- `downloadResource(resourceId, userId)` - Track download
- `subscribeToResources(callback)` - Real-time resource updates

#### Statistics
- `getCommunityStats()` - Get overall community statistics
- `getUserStreak(userId)` - Get user's current streak

## Support

For issues or questions about the Community feature:
1. Check this documentation
2. Review Firestore rules and indexes
3. Check browser console for errors
4. Verify Firebase configuration

## License

Part of the Super App project - see main LICENSE file.

