import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Globe, FileText, ArrowLeft, Loader2, Edit, UserPlus, Users } from "lucide-react";
import { ProfileService } from "../../services/profileService";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { UserProfile } from "../../types";
import { friendsService } from "../../services/friends/friendsService";
import { friendRequestsService } from "../../services/friends/friendRequestsService";

export const ProfileViewPage: React.FC = () => {
  const { useremail } = useParams<{ useremail: string }>();
  const navigate = useNavigate();
  const currentUser = realTimeAuth.getCurrentUser();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [isRequestPending, setIsRequestPending] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);

  useEffect(() => {
    if (useremail) {
      loadProfile();
    }
  }, [useremail]);

  useEffect(() => {
    if (profile && currentUser && profile.userId !== currentUser.id) {
      checkFriendStatus();
    } else {
      setIsFriend(false);
      setIsRequestPending(false);
    }
  }, [profile, currentUser]);

  const loadProfile = async () => {
    if (!useremail) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Decode the email from URL (handles @ symbol and special characters)
      const decodedEmail = decodeURIComponent(useremail);
      
      const userProfile = await ProfileService.getProfileByEmail(decodedEmail);
      
      if (!userProfile) {
        setError("Profile not found");
      } else {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isOwnProfile = currentUser && profile && profile.userId === currentUser.id;

  const checkFriendStatus = async () => {
    if (!currentUser || !profile || profile.userId === currentUser.id) return;

    try {
      // Check if already friends
      const friends = await friendsService.getFriends();
      const isAlreadyFriend = friends.some(friend => friend.friendId === profile.userId);
      setIsFriend(isAlreadyFriend);

      if (!isAlreadyFriend) {
        // Check if request is pending - subscribe temporarily
        let unsubscribe: (() => void) | null = null;
        unsubscribe = friendRequestsService.subscribeToSentFriendRequests((requests) => {
          const pending = requests.some(req => req.toUserId === profile.userId);
          setIsRequestPending(pending);
          // Unsubscribe after getting the first result
          if (unsubscribe) {
            setTimeout(() => {
              if (unsubscribe) unsubscribe();
            }, 100);
          }
        });
      } else {
        setIsRequestPending(false);
      }
    } catch (error) {
      console.error("Error checking friend status:", error);
    }
  };

  const handleAddFriend = async () => {
    if (!currentUser || !profile || isAddingFriend) return;

    try {
      setIsAddingFriend(true);
      await friendRequestsService.sendFriendRequestByEmail(profile.email);
      setIsRequestPending(true);
    } catch (error: any) {
      console.error("Error sending friend request:", error);
      alert(error.message || "Failed to send friend request. Please try again.");
    } finally {
      setIsAddingFriend(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Profile Not Found
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {error || "The profile you're looking for doesn't exist."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Profile
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {profile.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isOwnProfile ? (
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  {isFriend ? (
                    <div className="px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium rounded-lg flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Friends
                    </div>
                  ) : isRequestPending ? (
                    <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Request Sent
                    </div>
                  ) : (
                    <button
                      onClick={handleAddFriend}
                      disabled={isAddingFriend}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAddingFriend ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Add Friend
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-gray-200 dark:border-slate-700">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.username || profile.email}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {profile.username ? `@${profile.username}` : profile.email}
              </h2>
              {profile.bio && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {profile.bio}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.email && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Email
                    </p>
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-all"
                    >
                      {profile.email}
                    </a>
                  </div>
                </div>
              )}

              {profile.phoneNumber && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Phone
                    </p>
                    <a
                      href={`tel:${profile.phoneNumber}`}
                      className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {profile.phoneNumber}
                    </a>
                  </div>
                </div>
              )}

              {profile.location && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Location
                    </p>
                    <p className="text-gray-900 dark:text-gray-100">
                      {profile.location}
                    </p>
                  </div>
                </div>
              )}

              {profile.website && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Website
                    </p>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {profile.website}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {profile.bio && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    About
                  </h4>
                </div>
                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>

          {/* Profile Stats (if needed in future) */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

