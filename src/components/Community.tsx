import React, { useState, useEffect } from "react";
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  TrendingUp, 
  Award, 
  Calendar,
  Users,
  BookOpen,
  Search,
  Filter,
  Plus,
  ThumbsUp,
  MessageSquare,
  Eye,
  Star,
  Trophy,
  Flame,
  Target,
  Loader2,
  Send,
  Trash2,
  MoreVertical,
  Edit,
  Globe
} from "lucide-react";
import { PageLayout } from "./layout/PageLayout";
import { 
  communityService, 
  Post as PostType, 
  Event as EventType, 
  LeaderboardUser as LeaderboardUserType,
  Resource as ResourceType
} from "../services/communityService";
import { realTimeAuth } from "../utils/realTimeAuth";
import { Timestamp } from "firebase/firestore";
import { Comment } from "../services/communityService";
import { FriendsCommunity } from "./FriendsCommunity";

// Comments Section Component
const CommentsSection: React.FC<{ postId: string }> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = communityService.subscribeToComments(postId, (newComments) => {
      setComments(newComments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [postId]);

  const formatCommentTime = (timestamp: Timestamp): string => {
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const avatar = comment.author
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {avatar}
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {comment.author}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCommentTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {comment.content}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Community: React.FC = () => {
  const [communityMode, setCommunityMode] = useState<"global" | "friends">("global");
  const [activeTab, setActiveTab] = useState<"feed" | "events" | "leaderboard" | "resources">("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  
  // Real-time data state
  const [posts, setPosts] = useState<PostType[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUserType[]>([]);
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [stats, setStats] = useState({
    activeMembers: 0,
    postsToday: 0,
    upcomingEvents: 0,
  });
  const [userStreak, setUserStreak] = useState(0);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  
  // New post form
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  
  // New event form
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    type: "study" as "study" | "workshop" | "webinar",
  });
  
  // Comments management
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  
  // Post menu management
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  
  const user = realTimeAuth.getCurrentUser();

  // Initialize user leaderboard on mount
  useEffect(() => {
    if (user) {
      communityService.initializeUserLeaderboard(user.id, user.username);
      communityService.updateUserStreak(user.id);
    }
  }, [user]);

  // Subscribe to feed
  useEffect(() => {
    if (!user) return;

    const unsubscribe = communityService.subscribeToFeed(selectedFilter, (newPosts) => {
      setPosts(newPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, selectedFilter]);

  // Subscribe to events
  useEffect(() => {
    if (!user) return;

    const unsubscribe = communityService.subscribeToEvents((newEvents) => {
      setEvents(newEvents);
    });

    return () => unsubscribe();
  }, [user]);

  // Subscribe to leaderboard
  useEffect(() => {
    if (!user) return;

    const unsubscribe = communityService.subscribeToLeaderboard("all", (users) => {
      setLeaderboard(users);
    });

    return () => unsubscribe();
  }, [user]);

  // Subscribe to resources
  useEffect(() => {
    if (!user) return;

    const unsubscribe = communityService.subscribeToResources((newResources) => {
      setResources(newResources);
    });

    return () => unsubscribe();
  }, [user]);

  // Load community stats
  useEffect(() => {
    const loadStats = async () => {
      const communityStats = await communityService.getCommunityStats();
      setStats(communityStats);
      
      if (user) {
        const streak = await communityService.getUserStreak(user.id);
        setUserStreak(streak);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (openMenuPostId && !target.closest('.relative')) {
        setOpenMenuPostId(null);
      }
    };

    if (openMenuPostId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuPostId]);

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    try {
      await communityService.likePost(postId, user.id);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newPostContent.trim()) return;
    
    setPosting(true);
    try {
      const tags = newPostTags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      await communityService.createPost(user.id, user.username, newPostContent, tags);
      
      setNewPostContent("");
      setNewPostTags("");
      setShowNewPostForm(false);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!user || !newEvent.title.trim()) return;
    
    try {
      await communityService.createEvent(
        user.id,
        newEvent.title,
        newEvent.description,
        newEvent.date,
        newEvent.time,
        newEvent.type
      );
      
      setNewEvent({
        title: "",
        description: "",
        date: "",
        time: "",
        type: "study",
      });
      setShowNewEventForm(false);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!user) return;
    
    try {
      await communityService.joinEvent(eventId, user.id);
    } catch (error) {
      console.error("Error joining event:", error);
    }
  };

  const handleViewPost = async (postId: string) => {
    if (!user) return;
    
    try {
      await communityService.viewPost(postId, user.id);
    } catch (error) {
      console.error("Error viewing post:", error);
    }
  };

  const handleShare = async (postId: string) => {
    if (!user) return;
    
    try {
      await communityService.sharePost(postId);
      
      // Copy link to clipboard
      const shareUrl = `${window.location.origin}/community?post=${postId}`;
      await navigator.clipboard.writeText(shareUrl);
      
      alert("Link copied to clipboard!");
    } catch (error) {
      console.error("Error sharing post:", error);
      alert("Failed to share post. Please try again.");
    }
  };

  const handleToggleComments = (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      handleViewPost(postId);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user || !commentText.trim()) return;
    
    setPostingComment(true);
    try {
      await communityService.addComment(postId, user.id, user.username, commentText);
      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeletePost = async (postId: string, authorId: string) => {
    if (!user || user.id !== authorId) {
      alert("You can only delete your own posts.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );

    if (!confirmDelete) return;

    setDeletingPostId(postId);
    try {
      await communityService.deletePost(postId);
      setOpenMenuPostId(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    } finally {
      setDeletingPostId(null);
    }
  };

  const togglePostMenu = (postId: string) => {
    setOpenMenuPostId(openMenuPostId === postId ? null : postId);
  };

  const formatTimestamp = (timestamp: Timestamp | undefined): string => {
    if (!timestamp) return "Just now";
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const getEventTypeColor = (type: EventType["type"]) => {
    switch (type) {
      case "study": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "workshop": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "webinar": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-500";
      case 2: return "text-gray-400";
      case 3: return "text-orange-600";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const tabs = [
    { id: "feed", label: "Community Feed", icon: MessageCircle },
    { id: "events", label: "Events", icon: Calendar },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "resources", label: "Resources", icon: BookOpen }
  ];

  // If friends mode is selected, render FriendsCommunity
  if (communityMode === "friends") {
    return <FriendsCommunity onSwitchToGlobal={() => setCommunityMode("global")} />;
  }

  return (
    <PageLayout
      title="Community"
      description="Connect, learn, and grow together"
      icon={Users}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mode Toggle */}
        <div className="mb-6 flex items-center gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-1 inline-flex">
            <button
              onClick={() => setCommunityMode("global")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                communityMode === "global"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <Globe className="w-4 h-4" />
              Global Community
            </button>
            <button
              onClick={() => setCommunityMode("friends")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                communityMode === "friends"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <Users className="w-4 h-4" />
              Friends
            </button>
          </div>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeMembers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Posts Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.postsToday}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingEvents}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStreak} {userStreak === 1 ? 'day' : 'days'}</p>
              </div>
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 mb-6">
          <div className="border-b border-gray-200 dark:border-slate-700">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Based on Active Tab */}
        <div className="space-y-6">
          {/* Feed Tab */}
          {activeTab === "feed" && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search posts, topics, or people..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    >
                      <option value="all">All Posts</option>
                      <option value="trending">Trending</option>
                      <option value="recent">Most Recent</option>
                      <option value="popular">Most Popular</option>
                    </select>
                    <button 
                      onClick={() => setShowNewPostForm(!showNewPostForm)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      New Post
                    </button>
                  </div>
                </div>
              </div>

              {/* New Post Form */}
              {showNewPostForm && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create a Post</h3>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your thoughts, questions, or experiences..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white mb-4 min-h-[120px]"
                  />
                  <input
                    type="text"
                    value={newPostTags}
                    onChange={(e) => setNewPostTags(e.target.value)}
                    placeholder="Tags (comma-separated, e.g., Study Tips, Interview Prep)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white mb-4"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowNewPostForm(false);
                        setNewPostContent("");
                        setNewPostTags("");
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreatePost}
                      disabled={posting || !newPostContent.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {posting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Post
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading posts...</span>
                </div>
              )}

              {/* Empty State */}
              {!loading && posts.length === 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-12 shadow-sm border border-gray-200 dark:border-slate-700 text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Be the first to share something with the community!</p>
                  <button
                    onClick={() => setShowNewPostForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create First Post
                  </button>
                </div>
              )}

              {/* Posts */}
              {!loading && posts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                  {/* Post Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center flex-1" onClick={() => handleViewPost(post.id)}>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {post.avatar}
                        </div>
                        <div className="ml-3">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {post.author}
                            {user && post.authorId === user.id && (
                              <span className="ml-2 text-xs text-blue-500">(You)</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{formatTimestamp(post.timestamp)}</p>
                        </div>
                      </div>

                      {/* Post Menu (Only for post author) */}
                      {user && post.authorId === user.id && (
                        <div className="relative">
                          <button
                            onClick={() => togglePostMenu(post.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
                            aria-label="Post options"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuPostId === post.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleDeletePost(post.id, post.authorId)}
                                  disabled={deletingPostId === post.id}
                                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {deletingPostId === post.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="w-4 h-4 mr-3" />
                                      Delete Post
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <p className="text-gray-700 dark:text-gray-300 mb-4">{post.content}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Post Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-2 transition-colors ${
                            user && post.likedBy?.includes(user.id)
                              ? "text-red-500"
                              : "text-gray-500 hover:text-red-500 dark:text-gray-400"
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${user && post.likedBy?.includes(user.id) ? "fill-current" : ""}`} />
                          <span className="text-sm font-medium">{post.likes}</span>
                        </button>
                        <button 
                          onClick={() => handleToggleComments(post.id)}
                          className={`flex items-center space-x-2 transition-colors ${
                            expandedPostId === post.id
                              ? "text-blue-500"
                              : "text-gray-500 hover:text-blue-500 dark:text-gray-400"
                          }`}
                        >
                          <MessageSquare className="w-5 h-5" />
                          <span className="text-sm font-medium">{post.comments}</span>
                        </button>
                        <button 
                          onClick={() => handleShare(post.id)}
                          className="flex items-center space-x-2 text-gray-500 hover:text-green-500 dark:text-gray-400 transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm font-medium">{post.shares}</span>
                        </button>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                        <Eye className="w-5 h-5" />
                        <span className="text-sm">{post.views} views</span>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {expandedPostId === post.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Comments ({post.comments})
                        </h4>
                        
                        {/* Add Comment Form */}
                        <div className="mb-4">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {user?.username.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <div className="flex-1">
                              <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white text-sm resize-none"
                                rows={2}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment(post.id);
                                  }
                                }}
                              />
                              <div className="flex justify-end mt-2">
                                <button
                                  onClick={() => handleAddComment(post.id)}
                                  disabled={postingComment || !commentText.trim()}
                                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center"
                                >
                                  {postingComment ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Posting...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-4 h-4 mr-2" />
                                      Comment
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Comments List */}
                        <CommentsSection postId={post.id} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
                  <button 
                    onClick={() => setShowNewEventForm(!showNewEventForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Event
                  </button>
                </div>

                {/* New Event Form */}
                {showNewEventForm && (
                  <div className="mb-6 p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Event</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                        placeholder="Event title"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                      />
                      <textarea
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                        placeholder="Event description (optional)"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                        rows={3}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                          className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                        />
                        <input
                          type="time"
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                          className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <select
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({...newEvent, type: e.target.value as "study" | "workshop" | "webinar"})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                      >
                        <option value="study">Study Group</option>
                        <option value="workshop">Workshop</option>
                        <option value="webinar">Webinar</option>
                      </select>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setShowNewEventForm(false)}
                          className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateEvent}
                          disabled={!newEvent.title.trim() || !newEvent.date || !newEvent.time}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Create Event
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {events.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No upcoming events</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Create an event to get started!</p>
                  </div>
                )}

                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </span>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {event.date}
                            </div>
                            <div>{event.time}</div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {event.attendees?.length || 0} attending
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleJoinEvent(event.id)}
                          className={`px-4 py-2 rounded-lg text-sm ${
                            user && event.attendees?.includes(user.id)
                              ? "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {user && event.attendees?.includes(user.id) ? "Leave Event" : "Join Event"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
                    Top Contributors
                  </h2>
                  <select className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white">
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>All Time</option>
                  </select>
                </div>

                {/* Empty State */}
                {leaderboard.length === 0 && (
                  <div className="text-center py-8">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No activity yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">Be the first to earn points!</p>
                  </div>
                )}

                <div className="space-y-3">
                  {leaderboard.map((lbUser, index) => (
                    <div key={lbUser.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className={`text-2xl font-bold w-8 ${getRankColor(index + 1)}`}>
                          #{index + 1}
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                          {lbUser.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {lbUser.name}
                            {user && lbUser.userId === user.id && (
                              <span className="ml-2 text-xs text-blue-500">(You)</span>
                            )}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-1 text-yellow-500" />
                              {lbUser.points} points
                            </div>
                            <div className="flex items-center">
                              <Flame className="w-4 h-4 mr-1 text-orange-500" />
                              {lbUser.streak} day streak
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < 3 && (
                        <Trophy className={`w-8 h-8 ${getRankColor(index + 1)}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Award className="w-6 h-6 mr-2 text-blue-500" />
                  Your Achievements
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["First Post", "5 Day Streak", "100 Likes", "Event Host"].map((achievement, index) => (
                    <div key={index} className="text-center p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{achievement}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === "resources" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shared Resources</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Share Resource
                  </button>
                </div>

                {/* Empty State */}
                {resources.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No resources yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">Share your study materials with the community!</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((resource) => (
                    <div key={resource.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{resource.title}</h3>
                          {resource.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{resource.description}</p>
                          )}
                          <p className="text-sm text-gray-500 dark:text-gray-500">by {resource.author}</p>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                          {resource.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{resource.downloads} downloads</span>
                        <button 
                          onClick={async () => {
                            if (user && resource.fileUrl) {
                              await communityService.downloadResource(resource.id, user.id);
                              window.open(resource.fileUrl, '_blank');
                            }
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          {user && resource.downloadedBy?.includes(user.id) ? "Downloaded" : "Download"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

