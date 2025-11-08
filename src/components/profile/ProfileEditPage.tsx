import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Save, User, Mail, Phone, MapPin, Globe, FileText, Loader2, Trophy, Zap, Github, Linkedin, Twitter } from "lucide-react";
import { ProfileService } from "../../services/profileService";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { UserProfile } from "../../types";
import { gamificationService, LEVELS } from "../../services/gamificationService";

export const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const user = realTimeAuth.getCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    username: "",
    email: user?.email || "",
    phoneNumber: "",
    bio: "",
    location: "",
    website: "",
    photoURL: "",
  });
  
  // Gamification data
  const [gamificationData, setGamificationData] = useState<any>(null);
  const [socialLinks, setSocialLinks] = useState({
    github: "",
    linkedin: "",
    twitter: "",
  });

  useEffect(() => {
    loadProfile();
    loadGamificationData();
  }, []);
  
  const loadGamificationData = async () => {
    if (!user?.id) {
      console.log("No user ID available for gamification");
      return;
    }
    try {
      console.log("Loading gamification data for user:", user.id);
      await gamificationService.updateLoginStreak(user.id);
      const data = await gamificationService.getUserGamification(user.id);
      console.log("Gamification data loaded:", data);
      setGamificationData(data);
    } catch (error) {
      console.error("Error loading gamification data:", error);
    }
  };

  const loadProfile = async () => {
    if (!user) {
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      const existingProfile = await ProfileService.getProfileByUserId(user.id);
      
      if (existingProfile) {
        setProfile(existingProfile);
      } else {
        // Create profile if it doesn't exist
        const newProfile = await ProfileService.upsertProfile(user.id, {
          username: user.username || user.email?.split("@")[0] || "",
          email: user.email || "",
        });
        setProfile(newProfile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingPhoto(true);
      setError(null);
      
      const photoURL = await ProfileService.uploadProfilePhoto(user.id, file);
      setProfile((prev) => ({ ...prev, photoURL }));
      setSuccess("Photo uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      setError(error.message || "Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeletePhoto = async () => {
    if (!user) return;

    try {
      setUploadingPhoto(true);
      setError(null);
      
      await ProfileService.deleteProfilePhoto(user.id);
      setProfile((prev) => ({ ...prev, photoURL: undefined }));
      setSuccess("Photo deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting photo:", error);
      setError(error.message || "Failed to delete photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate username
    if (!profile.username || profile.username.trim().length === 0) {
      setError("Username is required");
      return;
    }

    if (profile.username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    // Skip strict validation for akshayjuluri6704@gmail.com
    const isSpecialUser = user.email?.toLowerCase() === "akshayjuluri6704@gmail.com";
    
    if (!isSpecialUser && !/^[a-zA-Z0-9_-]+$/.test(profile.username)) {
      setError("Username can only contain letters, numbers, underscores, and hyphens");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Check username availability
      const isAvailable = await ProfileService.isUsernameAvailable(
        profile.username!,
        user.id
      );

      if (!isAvailable) {
        setError("Username is already taken. Please choose another one.");
        setSaving(false);
        return;
      }

      // Update profile
      const updatedProfile = await ProfileService.updateProfile(user.id, {
        username: profile.username!.toLowerCase(),
        email: profile.email || user.email || "",
        phoneNumber: profile.phoneNumber || undefined,
        bio: profile.bio || undefined,
        location: profile.location || undefined,
        website: profile.website || undefined,
      });

      setProfile(updatedProfile);
      setSuccess("Profile updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setError(error.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
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
                  Edit Profile
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Update your profile information
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* Gamification Section */}
        {gamificationData && (
          <div className="mb-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{LEVELS[gamificationData.level]?.name || 'Novice'}</h2>
                <p className="text-white/80">Level {gamificationData.level}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-300" />
                  <span className="text-2xl font-bold">{gamificationData.xp}</span>
                </div>
                <p className="text-white/80 text-sm">XP Points</p>
              </div>
            </div>
            
            {/* XP Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress to next level</span>
                <span>{gamificationData.xp} / {gamificationData.nextLevelXP || 0} XP</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 transition-all duration-500"
                  style={{ width: `${((gamificationData.xp / (gamificationData.nextLevelXP || 1)) * 100).toFixed(1)}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{gamificationData.stats?.currentStreak || 0}</div>
                <div className="text-white/80 text-xs">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{gamificationData.achievements?.length || 0}</div>
                <div className="text-white/80 text-xs">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">#{gamificationData.rank || '---'}</div>
                <div className="text-white/80 text-xs">Global Rank</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 space-y-6">
          {/* Photo Upload Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                )}
              </div>
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                </button>
                {profile.photoURL && (
                  <button
                    onClick={handleDeletePhoto}
                    disabled={uploadingPhoto}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG or GIF. Max size 5MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4" />
                Username *
              </label>
              <input
                type="text"
                value={profile.username || ""}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Enter your username"
                className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Your public profile URL: /profile/{encodeURIComponent(profile.email || "email@example.com")}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={profile.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phoneNumber || ""}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                placeholder="Enter your phone number"
                className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4" />
                Bio
              </label>
              <textarea
                value={profile.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                value={profile.location || ""}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Enter your location"
                className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Website */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Globe className="w-4 h-4" />
                Website
              </label>
              <input
                type="url"
                value={profile.website || ""}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

