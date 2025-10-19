import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  Droplets,
  Eye,
  Activity,
  Plus,
  X,
  Settings,
  Volume2,
  VolumeX,
  Smartphone,
  Clock,
  Edit3,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { 
  smartNotifications, 
  NotificationSettings, 
  NotificationEvent,
  CustomReminder 
} from '../../utils/smartNotifications';

interface SmartNotificationsProps {
  className?: string;
}

export const SmartNotifications: React.FC<SmartNotificationsProps> = ({ 
  className = '' 
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(smartNotifications.getSettings());
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [editingReminder, setEditingReminder] = useState<CustomReminder | null>(null);
  const [newReminder, setNewReminder] = useState({
    title: '',
    message: '',
    interval: 30,
    enabled: true,
  });

  useEffect(() => {
    // Subscribe to notification events
    const unsubscribe = smartNotifications.addEventListener((event: NotificationEvent) => {
      setNotifications(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 notifications
    });

    // Load initial notification history
    setNotifications(smartNotifications.getNotificationHistory().slice(0, 10));

    return unsubscribe;
  }, []);

  const handleSettingsUpdate = (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    smartNotifications.updateSettings(updates);
  };

  const handleAddCustomReminder = () => {
    if (!newReminder.title.trim() || !newReminder.message.trim()) return;

    smartNotifications.addCustomReminder(newReminder);
    setSettings(smartNotifications.getSettings());
    setNewReminder({
      title: '',
      message: '',
      interval: 30,
      enabled: true,
    });
    setShowAddReminder(false);
  };

  const handleEditReminder = (reminder: CustomReminder) => {
    setEditingReminder(reminder);
    setNewReminder({
      title: reminder.title,
      message: reminder.message,
      interval: reminder.interval,
      enabled: reminder.enabled,
    });
    setShowAddReminder(true);
  };

  const handleUpdateReminder = () => {
    if (!editingReminder || !newReminder.title.trim() || !newReminder.message.trim()) return;

    smartNotifications.updateCustomReminder(editingReminder.id, newReminder);
    setSettings(smartNotifications.getSettings());
    setEditingReminder(null);
    setNewReminder({
      title: '',
      message: '',
      interval: 30,
      enabled: true,
    });
    setShowAddReminder(false);
  };

  const handleDeleteReminder = (id: string) => {
    smartNotifications.removeCustomReminder(id);
    setSettings(smartNotifications.getSettings());
  };

  const acknowledgeNotification = (notificationId: string) => {
    smartNotifications.acknowledgeNotification(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, acknowledged: true } : n)
    );
  };

  const requestNotificationPermission = async () => {
    const granted = await smartNotifications.requestNotificationPermission();
    if (granted) {
      handleSettingsUpdate({ showBrowserNotifications: true });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'hydration':
        return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'eyeRest':
        return <Eye className="w-5 h-5 text-green-500" />;
      case 'movement':
        return <Activity className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-purple-500" />;
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Smart Notifications
          </h2>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Toggle Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Hydration
            </span>
          </div>
          <button
            onClick={() => handleSettingsUpdate({ hydrationEnabled: !settings.hydrationEnabled })}
            className={`w-10 h-6 rounded-full transition-colors ${
              settings.hydrationEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
              settings.hydrationEnabled ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Eye Rest
            </span>
          </div>
          <button
            onClick={() => handleSettingsUpdate({ eyeRestEnabled: !settings.eyeRestEnabled })}
            className={`w-10 h-6 rounded-full transition-colors ${
              settings.eyeRestEnabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
              settings.eyeRestEnabled ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Movement
            </span>
          </div>
          <button
            onClick={() => handleSettingsUpdate({ movementEnabled: !settings.movementEnabled })}
            className={`w-10 h-6 rounded-full transition-colors ${
              settings.movementEnabled ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
              settings.movementEnabled ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Recent Notifications
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  notification.acknowledged
                    ? 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 opacity-60'
                    : 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-700'
                }`}
              >
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {notification.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {notification.message}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {notification.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {!notification.acknowledged && (
                  <button
                    onClick={() => acknowledgeNotification(notification.id)}
                    className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    title="Mark as read"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No notifications yet
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Notification Settings
          </h3>

          {/* Interval Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hydration Interval
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="240"
                  value={settings.hydrationInterval}
                  onChange={(e) => handleSettingsUpdate({ hydrationInterval: parseInt(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">min</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Eye Rest Interval
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={settings.eyeRestInterval}
                  onChange={(e) => handleSettingsUpdate({ eyeRestInterval: parseInt(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">min</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Movement Interval
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={settings.movementInterval}
                  onChange={(e) => handleSettingsUpdate({ movementInterval: parseInt(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">min</span>
              </div>
            </div>
          </div>

          {/* Notification Options */}
          <div className="space-y-3 mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => handleSettingsUpdate({ soundEnabled: e.target.checked })}
                className="rounded border-gray-300 dark:border-slate-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                Sound notifications
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.vibrationEnabled}
                onChange={(e) => handleSettingsUpdate({ vibrationEnabled: e.target.checked })}
                className="rounded border-gray-300 dark:border-slate-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Smartphone className="w-4 h-4" />
                Vibration (mobile)
              </span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showBrowserNotifications}
                onChange={(e) => {
                  if (e.target.checked) {
                    requestNotificationPermission();
                  } else {
                    handleSettingsUpdate({ showBrowserNotifications: false });
                  }
                }}
                className="rounded border-gray-300 dark:border-slate-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                {settings.showBrowserNotifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                Browser notifications
              </span>
              {!settings.showBrowserNotifications && 'Notification' in window && Notification.permission === 'denied' && (
                <span className="text-xs text-red-500">
                  (Permission denied)
                </span>
              )}
            </div>
          </div>

          {/* Custom Reminders */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                Custom Reminders
              </h4>
              <button
                onClick={() => setShowAddReminder(true)}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            <div className="space-y-2">
              {settings.customReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {reminder.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Every {formatTime(reminder.interval)} • {reminder.enabled ? 'Active' : 'Disabled'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditReminder(reminder)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Custom Reminder Modal */}
      {showAddReminder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingReminder ? 'Edit Reminder' : 'Add Custom Reminder'}
              </h3>
              <button
                onClick={() => {
                  setShowAddReminder(false);
                  setEditingReminder(null);
                  setNewReminder({ title: '', message: '', interval: 30, enabled: true });
                }}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Take vitamins"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  value={newReminder.message}
                  onChange={(e) => setNewReminder({ ...newReminder, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Don't forget to take your daily vitamins!"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interval (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={newReminder.interval}
                  onChange={(e) => setNewReminder({ ...newReminder, interval: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newReminder.enabled}
                  onChange={(e) => setNewReminder({ ...newReminder, enabled: e.target.checked })}
                  className="rounded border-gray-300 dark:border-slate-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Enable this reminder
                </span>
              </label>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={editingReminder ? handleUpdateReminder : handleAddCustomReminder}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingReminder ? 'Update' : 'Add'} Reminder
              </button>
              <button
                onClick={() => {
                  setShowAddReminder(false);
                  setEditingReminder(null);
                  setNewReminder({ title: '', message: '', interval: 30, enabled: true });
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
