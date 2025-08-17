import React, { useState, useEffect } from "react";
import { Smartphone, Volume2, VolumeX, Settings, Zap } from "lucide-react";
import { VibrationManager, VibrationSettings as VibrationSettingsType } from "../utils/vibrationSettings";

interface VibrationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VibrationSettings: React.FC<VibrationSettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState<VibrationSettingsType>(
    VibrationManager.getSettings()
  );

  useEffect(() => {
    if (isOpen) {
      setSettings(VibrationManager.getSettings());
    }
  }, [isOpen]);

  const handleSave = () => {
    VibrationManager.saveSettings(settings);
    onClose();
  };

  const handleTest = () => {
    VibrationManager.testVibration();
  };

  const updateSetting = <K extends keyof VibrationSettingsType>(
    key: K,
    value: VibrationSettingsType[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  const isSupported = VibrationManager.isSupported();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Vibration Settings</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {!isSupported && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <VolumeX className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Vibration is not supported on this device or browser.
                </p>
              </div>
            </div>
          )}

          {/* Master Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Enable Vibration</h4>
              <p className="text-sm text-gray-500">
                Turn on haptic feedback for all interactions
              </p>
            </div>
            <button
              onClick={() => updateSetting('enabled', !settings.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              disabled={!isSupported}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Intensity Setting */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Vibration Intensity</h4>
            <div className="space-y-2">
              {(['light', 'medium', 'strong'] as const).map((intensity) => (
                <label key={intensity} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="intensity"
                    value={intensity}
                    checked={settings.intensity === intensity}
                    onChange={() => updateSetting('intensity', intensity)}
                    disabled={!settings.enabled || !isSupported}
                    className="text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium capitalize">{intensity}</span>
                      {intensity === 'strong' && (
                        <Zap className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {VibrationManager.getIntensityDescription(intensity)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Vibration Features</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Task Completion</span>
                  <p className="text-xs text-gray-500">2-second celebration vibration</p>
                </div>
                <button
                  onClick={() => updateSetting('taskCompletion', !settings.taskCompletion)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    settings.taskCompletion && settings.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  disabled={!settings.enabled || !isSupported}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      settings.taskCompletion && settings.enabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Achievements</span>
                  <p className="text-xs text-gray-500">3-second epic celebration</p>
                </div>
                <button
                  onClick={() => updateSetting('achievements', !settings.achievements)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    settings.achievements && settings.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  disabled={!settings.enabled || !isSupported}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      settings.achievements && settings.enabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Streak Milestones</span>
                  <p className="text-xs text-gray-500">Special pattern for weekly streaks</p>
                </div>
                <button
                  onClick={() => updateSetting('streaks', !settings.streaks)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    settings.streaks && settings.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  disabled={!settings.enabled || !isSupported}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      settings.streaks && settings.enabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Button Presses</span>
                  <p className="text-xs text-gray-500">Quick feedback for taps</p>
                </div>
                <button
                  onClick={() => updateSetting('buttons', !settings.buttons)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    settings.buttons && settings.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  disabled={!settings.enabled || !isSupported}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      settings.buttons && settings.enabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Test Button */}
          {settings.enabled && isSupported && (
            <button
              onClick={handleTest}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>Test Vibration</span>
            </button>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
