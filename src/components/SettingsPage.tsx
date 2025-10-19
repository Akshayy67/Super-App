import React, { useState } from "react";
import { Settings, MessageSquare, Heart, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FeedbackSettings } from "./feedback/FeedbackSettings";
import { useFeedbackSettings } from "./feedback/FeedbackContext";
import { VibrationSettings } from "./VibrationSettings";

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"general" | "feedback" | "vibration">("general");
  const { settings, updateSettings } = useFeedbackSettings();
  const [showVibrationSettings, setShowVibrationSettings] = useState(false);

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "vibration", label: "Vibration", icon: Heart },
  ];

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
                  Settings
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customize your Super Study experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-slate-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      General Settings
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Basic application preferences
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Theme
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Choose your preferred color scheme
                    </p>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-white dark:bg-slate-600 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-500 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-500 transition-colors">
                        Light
                      </button>
                      <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                        Dark
                      </button>
                      <button className="px-4 py-2 bg-gray-100 dark:bg-slate-600 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-500 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-500 transition-colors">
                        Auto
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Notifications
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Manage your notification preferences
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 dark:border-slate-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Task reminders
                        </span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 dark:border-slate-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Study session alerts
                        </span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 dark:border-slate-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Weekly progress reports
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "feedback" && (
              <FeedbackSettings
                currentPosition={settings.position}
                currentSize={settings.size}
                currentShowLabel={settings.showLabel}
                onPositionChange={(position) => updateSettings({ position })}
                onSizeChange={(size) => updateSettings({ size })}
                onShowLabelChange={(showLabel) => updateSettings({ showLabel })}
              />
            )}

            {activeTab === "vibration" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Vibration Settings
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Configure haptic feedback for your device
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Customize vibration patterns and intensity for different interactions.
                  </p>
                  <button
                    onClick={() => setShowVibrationSettings(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Open Vibration Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vibration Settings Modal */}
      <VibrationSettings
        isOpen={showVibrationSettings}
        onClose={() => setShowVibrationSettings(false)}
      />
    </div>
  );
};
