import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Download, Play } from 'lucide-react';
import { meetingDebugger, MeetingDiagnostics, MeetingError } from '../utils/meetingDebugger';

interface MeetingTroubleshooterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MeetingTroubleshooter: React.FC<MeetingTroubleshooterProps> = ({
  isOpen,
  onClose,
}) => {
  const [diagnostics, setDiagnostics] = useState<MeetingDiagnostics | null>(null);
  const [errors, setErrors] = useState<MeetingError[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [mediaTest, setMediaTest] = useState<{ camera: boolean; microphone: boolean; error?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  const runDiagnostics = async () => {
    setIsRunningTests(true);
    try {
      const diag = await meetingDebugger.getDiagnostics();
      const recentErrors = meetingDebugger.getRecentErrors(10);
      setDiagnostics(diag);
      setErrors(recentErrors);
    } catch (error) {
      console.error('Failed to run diagnostics:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const testMediaDevices = async () => {
    setIsRunningTests(true);
    try {
      const result = await meetingDebugger.testMediaDevices();
      setMediaTest(result);
    } catch (error) {
      console.error('Failed to test media devices:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const exportDiagnostics = () => {
    const data = meetingDebugger.exportDiagnostics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-diagnostics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getSeverityColor = (severity: MeetingError['severity']) => {
    switch (severity) {
      case 'low': return 'text-yellow-600';
      case 'medium': return 'text-orange-600';
      case 'high': return 'text-red-600';
      case 'critical': return 'text-red-800';
      default: return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-orange-500" />
              Meeting Troubleshooter
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={runDiagnostics}
              disabled={isRunningTests}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRunningTests ? 'animate-spin' : ''}`} />
              Run Diagnostics
            </button>
            <button
              onClick={testMediaDevices}
              disabled={isRunningTests}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Play className="w-4 h-4 mr-2" />
              Test Media Devices
            </button>
            <button
              onClick={exportDiagnostics}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>

          {/* Diagnostics Results */}
          {diagnostics && (
            <div className="space-y-6">
              {/* System Status */}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">System Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    {getStatusIcon(diagnostics.user.isAuthenticated)}
                    <span className="ml-2 text-sm">User Auth</span>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(diagnostics.signaling.isConnected)}
                    <span className="ml-2 text-sm">Signaling</span>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(diagnostics.browser.webrtcSupported)}
                    <span className="ml-2 text-sm">WebRTC</span>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(diagnostics.network.online)}
                    <span className="ml-2 text-sm">Network</span>
                  </div>
                </div>
              </div>

              {/* Connection Details */}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Connection Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Signaling Type:</span>
                    <span className="font-mono">{diagnostics.signaling.connectionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network Type:</span>
                    <span className="font-mono">{diagnostics.network.connectionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peer Connections:</span>
                    <span className="font-mono">{diagnostics.webrtc.peerConnections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Participants:</span>
                    <span className="font-mono">{diagnostics.webrtc.participants}</span>
                  </div>
                </div>
              </div>

              {/* Media Status */}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Media Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    {getStatusIcon(diagnostics.webrtc.localStream)}
                    <span className="ml-2 text-sm">Local Stream</span>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(diagnostics.webrtc.screenStream)}
                    <span className="ml-2 text-sm">Screen Share</span>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(diagnostics.browser.mediaDevicesSupported)}
                    <span className="ml-2 text-sm">Media Devices API</span>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(diagnostics.browser.broadcastChannelSupported)}
                    <span className="ml-2 text-sm">BroadcastChannel</span>
                  </div>
                </div>
              </div>

              {/* Media Device Test Results */}
              {mediaTest && (
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Media Device Test</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      {getStatusIcon(mediaTest.camera)}
                      <span className="ml-2 text-sm">Camera Access</span>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(mediaTest.microphone)}
                      <span className="ml-2 text-sm">Microphone Access</span>
                    </div>
                    {mediaTest.error && (
                      <div className="text-red-600 text-sm mt-2">
                        Error: {mediaTest.error}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Errors */}
              {errors.length > 0 && (
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Recent Errors</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {errors.map((error, index) => (
                      <div key={index} className="text-sm border-l-4 border-red-400 pl-3 py-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${getSeverityColor(error.severity)}`}>
                            [{error.type.toUpperCase()}] {error.message}
                          </span>
                          <span className="text-xs text-gray-500">
                            {error.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        {error.details && (
                          <div className="text-xs text-gray-600 mt-1">
                            {JSON.stringify(error.details)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Troubleshooting Tips */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Troubleshooting Tips</h3>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Ensure camera and microphone permissions are granted</li>
                  <li>• Check if other applications are using your camera/microphone</li>
                  <li>• Try refreshing the page if connections fail</li>
                  <li>• Use Chrome or Firefox for best WebRTC support</li>
                  <li>• Check your network connection and firewall settings</li>
                  <li>• For production use, deploy a WebSocket signaling server</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
