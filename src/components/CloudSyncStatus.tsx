import React, { useState, useEffect } from "react";
import {
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
  User,
  UserX,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  Upload,
} from "lucide-react";
import { unifiedAnalyticsStorage } from "../utils/unifiedAnalyticsStorage";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

export const CloudSyncStatus: React.FC = () => {
  const [storageStatus, setStorageStatus] = useState(
    unifiedAnalyticsStorage.getStorageStatus()
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    // Update status every 30 seconds
    const interval = setInterval(() => {
      setStorageStatus(unifiedAnalyticsStorage.getStorageStatus());
    }, 30000);

    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setStorageStatus(unifiedAnalyticsStorage.getStorageStatus());
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const handleForceSync = async () => {
    setIsSyncing(true);
    setLastSyncResult(null);

    try {
      const result = await unifiedAnalyticsStorage.forcSync();
      
      if (result.toCloud.success && result.fromCloud.success) {
        setLastSyncResult(
          `✅ Sync completed: ${result.toCloud.synced} uploaded, ${result.fromCloud.synced} downloaded`
        );
      } else {
        setLastSyncResult(
          `⚠️ Partial sync: Upload ${result.toCloud.success ? 'success' : 'failed'}, Download ${result.fromCloud.success ? 'success' : 'failed'}`
        );
      }
      
      setStorageStatus(unifiedAnalyticsStorage.getStorageStatus());
    } catch (error) {
      setLastSyncResult(`❌ Sync failed: ${error}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const getConnectionIcon = () => {
    if (!storageStatus.isOnline) {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
    return <Wifi className="w-4 h-4 text-green-500" />;
  };

  const getAuthIcon = () => {
    if (!storageStatus.isAuthenticated) {
      return <UserX className="w-4 h-4 text-red-500" />;
    }
    return <User className="w-4 h-4 text-green-500" />;
  };

  const getCloudIcon = () => {
    if (!storageStatus.isOnline || !storageStatus.isAuthenticated) {
      return <CloudOff className="w-4 h-4 text-gray-400" />;
    }
    if (storageStatus.needsSync) {
      return <Cloud className="w-4 h-4 text-yellow-500" />;
    }
    return <Cloud className="w-4 h-4 text-green-500" />;
  };

  const getSyncStatusText = () => {
    if (!storageStatus.isAuthenticated) {
      return "Sign in to enable cloud sync";
    }
    if (!storageStatus.isOnline) {
      return "Offline - using local storage";
    }
    if (storageStatus.needsSync) {
      return "Sync needed";
    }
    if (storageStatus.lastSync) {
      const lastSync = new Date(storageStatus.lastSync);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) {
        return "Synced just now";
      } else if (diffMinutes < 60) {
        return `Synced ${diffMinutes}m ago`;
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        return `Synced ${diffHours}h ago`;
      }
    }
    return "Ready to sync";
  };

  const getSyncStatusColor = () => {
    if (!storageStatus.isAuthenticated || !storageStatus.isOnline) {
      return "text-gray-600 dark:text-gray-400";
    }
    if (storageStatus.needsSync) {
      return "text-yellow-600 dark:text-yellow-400";
    }
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getCloudIcon()}
          <h3 className="font-medium text-gray-900 dark:text-white">
            Cloud Sync
          </h3>
        </div>
        <button
          onClick={handleForceSync}
          disabled={isSyncing || !storageStatus.isAuthenticated || !storageStatus.isOnline}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {/* Status Indicators */}
      <div className="space-y-2">
        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm">
          {getConnectionIcon()}
          <span className="text-gray-700 dark:text-gray-300">
            {storageStatus.isOnline ? "Online" : "Offline"}
          </span>
        </div>

        {/* Authentication Status */}
        <div className="flex items-center gap-2 text-sm">
          {getAuthIcon()}
          <span className="text-gray-700 dark:text-gray-300">
            {storageStatus.isAuthenticated 
              ? `Signed in as ${user?.email || user?.displayName || 'User'}`
              : "Not signed in"
            }
          </span>
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-2 text-sm">
          {storageStatus.needsSync ? (
            <Clock className="w-4 h-4 text-yellow-500" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
          <span className={getSyncStatusColor()}>
            {getSyncStatusText()}
          </span>
        </div>
      </div>

      {/* Last Sync Result */}
      {lastSyncResult && (
        <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
          {lastSyncResult}
        </div>
      )}

      {/* Info Text */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {storageStatus.isAuthenticated ? (
          <>
            Your interview data is automatically synced across all your devices.
            {!storageStatus.isOnline && " Data will sync when you're back online."}
          </>
        ) : (
          "Sign in to sync your interview data across devices and get accurate trends."
        )}
      </div>

      {/* Sync Benefits (when not authenticated) */}
      {!storageStatus.isAuthenticated && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Benefits of Cloud Sync:
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li className="flex items-center gap-2">
              <Upload className="w-3 h-3" />
              Access your data from any device
            </li>
            <li className="flex items-center gap-2">
              <Download className="w-3 h-3" />
              Automatic backup and restore
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              Accurate trend analysis across sessions
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
