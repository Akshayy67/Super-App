import React, { useState } from 'react';
import { X, Save, Loader } from 'lucide-react';
import { VideoMeeting, MeetingSettings as MeetingSettingsType } from '../../types/videoMeeting';
import { videoMeetingService } from '../../services/videoMeetingService';

interface MeetingSettingsProps {
  meeting: VideoMeeting;
  isHost: boolean;
  onClose: () => void;
}

export const MeetingSettings: React.FC<MeetingSettingsProps> = ({
  meeting,
  isHost,
  onClose
}) => {
  const [settings, setSettings] = useState<MeetingSettingsType>(meeting.settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await videoMeetingService.updateMeetingSettings(meeting.id, settings);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof MeetingSettingsType>(
    key: K,
    value: MeetingSettingsType[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isHost) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Settings</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <p className="text-gray-400">Only the host can change meeting settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Meeting Settings</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Participant Permissions */}
        <div>
          <h4 className="text-white font-semibold mb-3">Participant Permissions</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <span className="text-white text-sm">Allow screen sharing</span>
              <input
                type="checkbox"
                checked={settings.allowParticipantsToShare}
                onChange={(e) => updateSetting('allowParticipantsToShare', e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <span className="text-white text-sm">Allow recording</span>
              <input
                type="checkbox"
                checked={settings.allowParticipantsToRecord}
                onChange={(e) => updateSetting('allowParticipantsToRecord', e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Meeting Options */}
        <div>
          <h4 className="text-white font-semibold mb-3">Meeting Options</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <span className="text-white text-sm">Mute participants on join</span>
              <input
                type="checkbox"
                checked={settings.muteOnJoin}
                onChange={(e) => updateSetting('muteOnJoin', e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <span className="text-white text-sm">Enable waiting room</span>
              <input
                type="checkbox"
                checked={settings.enableWaitingRoom}
                onChange={(e) => updateSetting('enableWaitingRoom', e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <span className="text-white text-sm">Require host approval</span>
              <input
                type="checkbox"
                checked={settings.requireHostApproval}
                onChange={(e) => updateSetting('requireHostApproval', e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Features */}
        <div>
          <h4 className="text-white font-semibold mb-3">Features</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <span className="text-white text-sm">Enable chat</span>
              <input
                type="checkbox"
                checked={settings.enableChat}
                onChange={(e) => updateSetting('enableChat', e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <span className="text-white text-sm">Enable reactions</span>
              <input
                type="checkbox"
                checked={settings.enableReactions}
                onChange={(e) => updateSetting('enableReactions', e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <span className="text-white text-sm">Enable virtual backgrounds</span>
              <input
                type="checkbox"
                checked={settings.enableVirtualBackground}
                onChange={(e) => updateSetting('enableVirtualBackground', e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Max Participants */}
        <div>
          <h4 className="text-white font-semibold mb-3">Capacity</h4>
          <div className="p-3 bg-gray-700/50 rounded-lg">
            <label className="text-white text-sm block mb-2">
              Maximum participants
            </label>
            <input
              type="number"
              min="2"
              max="100"
              value={settings.maxParticipants}
              onChange={(e) => updateSetting('maxParticipants', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        {saveSuccess ? (
          <div className="bg-green-500/20 text-green-400 px-4 py-3 rounded-lg text-center font-semibold">
            Settings saved successfully!
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};





