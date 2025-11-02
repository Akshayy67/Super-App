import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  UserPlus,
  MessageCircle,
  Send,
  X,
  Check,
  XCircle,
  Search,
  Settings,
  Plus,
  Trash2,
  LogOut,
  Crown,
  MoreVertical,
  Loader2,
  Globe,
  UserCheck,
  UserX,
} from "lucide-react";
import { PageLayout } from "./layout/PageLayout";
import { realTimeAuth } from "../utils/realTimeAuth";
import {
  friendsService,
  chatService,
  friendRequestsService,
  type Friend,
  type FriendRequest,
  type Chat,
  type ChatMessage,
} from "../services/friends";
import { groupsService, groupManagementService, groupInvitesService, type Group } from "../services/groups";
import { Timestamp } from "firebase/firestore";

type FriendsTab = "friends" | "requests" | "chat" | "groups";

interface FriendsCommunityProps {
  onSwitchToGlobal?: () => void;
}

export const FriendsCommunity: React.FC<FriendsCommunityProps> = ({ onSwitchToGlobal }) => {
  const [activeTab, setActiveTab] = useState<FriendsTab>("friends");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [showInviteFriendModal, setShowInviteFriendModal] = useState(false);
  const [showInviteEmailModal, setShowInviteEmailModal] = useState(false);
  const [inviteGroupId, setInviteGroupId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = realTimeAuth.getCurrentUser();

  // Subscribe to friends
  useEffect(() => {
    if (!user) return;
    const unsubscribe = friendsService.subscribeToFriends((newFriends) => {
      setFriends(newFriends);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Subscribe to friend requests
  useEffect(() => {
    if (!user) return;
    const unsubscribe = friendRequestsService.subscribeToFriendRequests((requests) => {
      setFriendRequests(requests);
    });
    return () => unsubscribe();
  }, [user]);

  // Subscribe to sent requests
  useEffect(() => {
    if (!user) return;
    const unsubscribe = friendRequestsService.subscribeToSentFriendRequests((requests) => {
      setSentRequests(requests);
    });
    return () => unsubscribe();
  }, [user]);

  // Subscribe to chats
  useEffect(() => {
    if (!user) return;
    const unsubscribe = chatService.subscribeToChats((newChats) => {
      setChats(newChats);
    });
    return () => unsubscribe();
  }, [user]);

  // Subscribe to groups
  useEffect(() => {
    if (!user) return;
    const unsubscribe = groupsService.subscribeToGroups((newGroups) => {
      setGroups(newGroups);
    });
    return () => unsubscribe();
  }, [user]);

  // Subscribe to messages for selected chat
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const unsubscribe = chatService.subscribeToMessages(
      selectedChat,
      (newMessages) => {
        setMessages(newMessages);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        
        // Mark as read
        chatService.markAsRead(selectedChat).catch(console.error);
      }
    );

    return () => unsubscribe();
  }, [selectedChat]);

  const handleSendFriendRequest = async () => {
    if (!friendEmail.trim()) {
      setError("Please enter an email address");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await friendRequestsService.sendFriendRequestByEmail(friendEmail.trim());
      setFriendEmail("");
      setShowAddFriendModal(false);
      alert("Friend request sent!");
    } catch (err: any) {
      setError(err.message || "Failed to send friend request");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendRequestsService.acceptFriendRequest(requestId);
    } catch (err: any) {
      alert(err.message || "Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await friendRequestsService.rejectFriendRequest(requestId);
    } catch (err: any) {
      alert(err.message || "Failed to reject request");
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;
    try {
      await friendsService.removeFriend(friendId);
    } catch (err: any) {
      alert(err.message || "Failed to remove friend");
    }
  };

  const handleStartChat = async (friendId: string) => {
    try {
      const chatId = await chatService.getPersonalChat(friendId);
      setSelectedChat(chatId);
      setSelectedGroup(null);
      setActiveTab("chat");
    } catch (err: any) {
      alert(err.message || "Failed to start chat");
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !messageText.trim() || !user) return;

    try {
      await chatService.sendMessage(selectedChat, messageText.trim());
      setMessageText("");
    } catch (err: any) {
      alert(err.message || "Failed to send message");
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setError("Group name is required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const groupId = await groupManagementService.createGroup(
        newGroupName.trim(),
        newGroupDescription.trim()
      );
      setNewGroupName("");
      setNewGroupDescription("");
      setShowCreateGroupModal(false);
      setSelectedGroup(groupId);
      setSelectedChat(null);
      setActiveTab("groups");
    } catch (err: any) {
      setError(err.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const handleExitGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to exit this group?")) return;
    try {
      await groupManagementService.exitGroup(groupId);
      if (selectedGroup === groupId) {
        setSelectedGroup(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to exit group");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this group? This action cannot be undone.")) return;
    try {
      await groupManagementService.deleteGroup(groupId);
      if (selectedGroup === groupId) {
        setSelectedGroup(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete group");
    }
  };

  const handleInviteFriends = async () => {
    if (!inviteGroupId || selectedFriendIds.length === 0) {
      setError("Please select at least one friend");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await groupInvitesService.inviteFriendsToGroup(inviteGroupId, selectedFriendIds);
      setSelectedFriendIds([]);
      setShowInviteFriendModal(false);
      setInviteGroupId(null);
      alert("Friends invited successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to invite friends");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteByEmail = async () => {
    if (!inviteGroupId || !inviteEmail.trim()) {
      setError("Please enter an email address");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await groupInvitesService.inviteByEmail(inviteGroupId, inviteEmail.trim());
      setInviteEmail("");
      setShowInviteEmailModal(false);
      setInviteGroupId(null);
      alert("Invitation sent successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: Timestamp | Date | null | undefined): string => {
    if (!timestamp) return "just now";
    
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    if (!date) return "just now";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  const getAvatarInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <PageLayout>
      <div className="flex flex-col h-full bg-white dark:bg-slate-900">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Friends Community
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddFriendModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add Friend
              </button>
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Group
              </button>
            </div>
          </div>

          {/* Mode Toggle */}
          {onSwitchToGlobal && (
            <div className="mb-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-1 inline-flex">
                <button
                  onClick={onSwitchToGlobal}
                  className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  <Globe className="w-4 h-4" />
                  Global Community
                </button>
                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors bg-blue-600 text-white cursor-default"
                >
                  <Users className="w-4 h-4" />
                  Friends
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mt-4 border-b border-gray-200 dark:border-slate-700">
            {(
              [
                { id: "friends", label: "Friends", icon: Users },
                { id: "requests", label: "Requests", icon: UserPlus },
                { id: "chat", label: "Chats", icon: MessageCircle },
                { id: "groups", label: "Groups", icon: Users },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const count =
                tab.id === "requests"
                  ? friendRequests.length
                  : tab.id === "chat"
                  ? chats.filter((c) => (c.unreadCount[user?.id || ""] || 0) > 0).length
                  : 0;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as FriendsTab)}
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {count > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar / List View */}
          <div className="w-80 border-r border-gray-200 dark:border-slate-700 overflow-y-auto">
            {activeTab === "friends" && (
              <div className="p-4 space-y-2">
                {friends.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No friends yet</p>
                    <p className="text-sm mt-2">Add friends to get started!</p>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer group"
                      onClick={() => handleStartChat(friend.friendId)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {friend.friendAvatar ? (
                          <img
                            src={friend.friendAvatar}
                            alt={friend.friendName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getAvatarInitials(friend.friendName)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {friend.friendName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {friend.friendEmail}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFriend(friend.friendId);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-opacity"
                        title="Remove friend"
                      >
                        <UserX className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "requests" && (
              <div className="p-4 space-y-4">
                {/* Incoming Requests */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Received ({friendRequests.length})
                  </h3>
                  {friendRequests.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No pending requests
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {friendRequests.map((request) => (
                        <div
                          key={request.id}
                          className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                              {request.fromUserAvatar ? (
                                <img
                                  src={request.fromUserAvatar}
                                  alt={request.fromUserName}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                getAvatarInitials(request.fromUserName)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                {request.fromUserName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {request.fromUserEmail}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptRequest(request.id)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                            >
                              <XCircle className="w-3 h-3" />
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sent Requests */}
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Sent ({sentRequests.length})
                  </h3>
                  {sentRequests.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No sent requests
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {sentRequests.map((request) => (
                        <div
                          key={request.id}
                          className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                              {getAvatarInitials(request.toUserEmail.split("@")[0] || "User")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                {request.toUserEmail}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Pending
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="p-4 space-y-2">
                {chats.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No chats yet</p>
                    <p className="text-sm mt-2">Start chatting with friends!</p>
                  </div>
                ) : (
                  chats.map((chat) => {
                    const otherParticipants = chat.participants.filter((id) => id !== user?.id);
                    const chatName =
                      chat.type === "group"
                        ? chat.name
                        : chat.participantNames[otherParticipants[0]] || "Unknown";
                    const unreadCount = chat.unreadCount[user?.id || ""] || 0;

                    return (
                      <div
                        key={chat.id}
                        onClick={() => {
                          setSelectedChat(chat.id);
                          setSelectedGroup(null);
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedChat === chat.id
                            ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                            : "hover:bg-gray-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {chat.type === "group" ? (
                              <Users className="w-5 h-5" />
                            ) : (
                              getAvatarInitials(chatName)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                                {chatName}
                              </p>
                              {chat.lastMessage && chat.lastMessage.timestamp && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                  {formatTime(chat.lastMessage.timestamp)}
                                </span>
                              )}
                            </div>
                            {chat.lastMessage && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {chat.lastMessage.senderName}: {chat.lastMessage.text}
                              </p>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === "groups" && (
              <div className="p-4 space-y-2">
                {groups.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No groups yet</p>
                    <p className="text-sm mt-2">Create a group to get started!</p>
                  </div>
                ) : (
                  groups.map((group) => {
                    const canInvite = group.admins.includes(user?.id || "") || group.settings.allowInvites;
                    return (
                      <div
                        key={group.id}
                        className={`p-3 rounded-lg transition-colors ${
                          selectedGroup === group.id
                            ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
                            : "hover:bg-gray-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => {
                              setSelectedGroup(group.id);
                              setSelectedChat(group.id);
                            }}
                            className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                              {group.avatar ? (
                                <img
                                  src={group.avatar}
                                  alt={group.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <Users className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                                  {group.name}
                                </p>
                                {group.createdBy === user?.id && (
                                  <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {group.participants.length} member{group.participants.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          {canInvite && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setInviteGroupId(group.id);
                                setShowInviteFriendModal(true);
                              }}
                              className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded text-purple-600 dark:text-purple-400 transition-colors flex-shrink-0"
                              title="Invite to group"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Chat View */}
          {(selectedChat || (activeTab === "chat" && chats.length > 0)) && (
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-slate-900">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const currentChat = chats.find((c) => c.id === selectedChat);
                          const isGroupChat = currentChat?.type === "group";
                          const group = groups.find((g) => g.id === selectedChat);
                          
                          if (isGroupChat && group) {
                            return (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold text-xs">
                                {group.avatar ? (
                                  <img
                                    src={group.avatar}
                                    alt={group.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <Users className="w-4 h-4" />
                                )}
                              </div>
                            );
                          }
                          
                          return (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                              {getAvatarInitials(
                                currentChat?.participantNames[
                                  currentChat?.participants.find((id) => id !== user?.id) || ""
                                ] || "User"
                              )}
                            </div>
                          );
                        })()}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {(() => {
                              const currentChat = chats.find((c) => c.id === selectedChat);
                              if (currentChat?.type === "group") {
                                const group = groups.find((g) => g.id === selectedChat);
                                return group?.name || "Group";
                              }
                              return currentChat?.participantNames[
                                currentChat?.participants.find((id) => id !== user?.id) || ""
                              ] || "Chat";
                            })()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(() => {
                              const currentChat = chats.find((c) => c.id === selectedChat);
                              if (currentChat?.type === "group") {
                                const group = groups.find((g) => g.id === selectedChat);
                                return `${group?.participants.length || 0} member${(group?.participants.length || 0) !== 1 ? "s" : ""}`;
                              }
                              return "Online";
                            })()}
                          </p>
                        </div>
                      </div>
                      {(() => {
                        const currentChat = chats.find((c) => c.id === selectedChat);
                        if (currentChat?.type === "group") {
                          const group = groups.find((g) => g.id === selectedChat);
                          const canInvite = group && (group.admins.includes(user?.id || "") || group.settings.allowInvites);
                          
                          if (canInvite) {
                            return (
                              <button
                                onClick={() => {
                                  setInviteGroupId(selectedChat);
                                  setShowInviteFriendModal(true);
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-purple-600 dark:text-purple-400 transition-colors"
                                title="Invite to group"
                              >
                                <UserPlus className="w-5 h-5" />
                              </button>
                            );
                          }
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                          <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No messages yet. Start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => {
                      const isOwn = message.senderId === user?.id;
                      const isSystem = message.type === "system";

                      if (isSystem) {
                        return (
                          <div key={message.id} className="text-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                              {message.message}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] ${
                              isOwn
                                ? "bg-blue-600 text-white"
                                : "bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                            } rounded-lg px-4 py-2 shadow-sm`}
                          >
                            {!isOwn && (
                              <p className="text-xs font-semibold mb-1 opacity-80">
                                {message.senderName}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.message}
                            </p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a chat to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Friend Modal */}
        {showAddFriendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Add Friend
                </h3>
                <button
                  onClick={() => {
                    setShowAddFriendModal(false);
                    setFriendEmail("");
                    setError(null);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
                <button
                  onClick={handleSendFriendRequest}
                  disabled={loading || !friendEmail.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Send Friend Request"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateGroupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Create Group
                </h3>
                <button
                  onClick={() => {
                    setShowCreateGroupModal(false);
                    setNewGroupName("");
                    setNewGroupDescription("");
                    setError(null);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="What's this group about?"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
                <button
                  onClick={handleCreateGroup}
                  disabled={loading || !newGroupName.trim()}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Create Group"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invite Friends to Group Modal */}
        {showInviteFriendModal && inviteGroupId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Invite Friends
                </h3>
                <button
                  onClick={() => {
                    setShowInviteFriendModal(false);
                    setInviteGroupId(null);
                    setSelectedFriendIds([]);
                    setError(null);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Friends to Invite
                  </label>
                  <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-slate-600 rounded-lg p-2 space-y-2">
                    {friends.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No friends to invite. Add friends first!
                      </p>
                    ) : (
                      friends.map((friend) => {
                        const isSelected = selectedFriendIds.includes(friend.friendId);
                        const group = groups.find((g) => g.id === inviteGroupId);
                        const isInGroup = group?.participants.includes(friend.friendId);
                        
                        return (
                          <label
                            key={friend.id}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-purple-100 dark:bg-purple-900/30"
                                : "hover:bg-gray-50 dark:hover:bg-slate-700"
                            } ${isInGroup ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isInGroup}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFriendIds([...selectedFriendIds, friend.friendId]);
                                } else {
                                  setSelectedFriendIds(selectedFriendIds.filter((id) => id !== friend.friendId));
                                }
                              }}
                              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                              {friend.friendAvatar ? (
                                <img
                                  src={friend.friendAvatar}
                                  alt={friend.friendName}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                getAvatarInitials(friend.friendName)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                {friend.friendName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {friend.friendEmail}
                              </p>
                            </div>
                            {isInGroup && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">Already in group</span>
                            )}
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowInviteFriendModal(false);
                      setShowInviteEmailModal(true);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm"
                  >
                    Invite by Email
                  </button>
                </div>
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
                <button
                  onClick={handleInviteFriends}
                  disabled={loading || selectedFriendIds.length === 0}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Inviting...
                    </span>
                  ) : (
                    `Invite ${selectedFriendIds.length} Friend${selectedFriendIds.length !== 1 ? "s" : ""}`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invite by Email Modal */}
        {showInviteEmailModal && inviteGroupId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Invite by Email
                </h3>
                <button
                  onClick={() => {
                    setShowInviteEmailModal(false);
                    setInviteGroupId(null);
                    setInviteEmail("");
                    setError(null);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
                <button
                  onClick={handleInviteByEmail}
                  disabled={loading || !inviteEmail.trim()}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Send Invitation"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

