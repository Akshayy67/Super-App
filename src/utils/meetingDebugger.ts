// Meeting Debugger Utility
// Provides comprehensive debugging and diagnostics for live meeting functionality

import { webrtcService } from './webrtcService';
import { signalingService } from './signalingService';
import { realTimeAuth } from './realTimeAuth';

export interface MeetingDiagnostics {
  timestamp: Date;
  user: {
    id: string | null;
    isAuthenticated: boolean;
  };
  signaling: {
    isConnected: boolean;
    connectionType: 'websocket' | 'broadcast' | 'none';
  };
  webrtc: {
    currentMeeting: any;
    localStream: boolean;
    screenStream: boolean;
    peerConnections: number;
    participants: number;
  };
  browser: {
    userAgent: string;
    webrtcSupported: boolean;
    mediaDevicesSupported: boolean;
    broadcastChannelSupported: boolean;
  };
  network: {
    online: boolean;
    connectionType: string;
  };
}

export interface MeetingError {
  timestamp: Date;
  type: 'webrtc' | 'signaling' | 'media' | 'network' | 'auth';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: any;
  stack?: string;
}

class MeetingDebugger {
  private errors: MeetingError[] = [];
  private maxErrors = 100;
  private isLoggingEnabled = true;

  // Enable/disable debug logging
  setLogging(enabled: boolean): void {
    this.isLoggingEnabled = enabled;
    console.log(`🔧 Meeting debug logging ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Log an error with context
  logError(type: MeetingError['type'], severity: MeetingError['severity'], message: string, details?: any): void {
    const error: MeetingError = {
      timestamp: new Date(),
      type,
      severity,
      message,
      details,
      stack: new Error().stack
    };

    this.errors.push(error);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    if (this.isLoggingEnabled) {
      const emoji = this.getSeverityEmoji(severity);
      console.error(`${emoji} [${type.toUpperCase()}] ${message}`, details);
    }
  }

  private getSeverityEmoji(severity: MeetingError['severity']): string {
    switch (severity) {
      case 'low': return '⚠️';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      case 'critical': return '💥';
      default: return '❌';
    }
  }

  // Get recent errors
  getRecentErrors(count = 10): MeetingError[] {
    return this.errors.slice(-count);
  }

  // Clear error log
  clearErrors(): void {
    this.errors = [];
    console.log('🧹 Meeting error log cleared');
  }

  // Get comprehensive diagnostics
  async getDiagnostics(): Promise<MeetingDiagnostics> {
    const user = realTimeAuth.getCurrentUser();
    const currentMeeting = webrtcService.getCurrentMeeting();
    
    return {
      timestamp: new Date(),
      user: {
        id: user?.id || null,
        isAuthenticated: realTimeAuth.isAuthenticated()
      },
      signaling: {
        isConnected: signalingService.isConnectedToSignaling(),
        connectionType: signalingService.getConnectionType()
      },
      webrtc: {
        currentMeeting: currentMeeting ? {
          id: currentMeeting.id,
          title: currentMeeting.title,
          hostId: currentMeeting.hostId,
          isActive: currentMeeting.isActive
        } : null,
        localStream: !!webrtcService.getLocalStream(),
        screenStream: !!webrtcService.getScreenStream(),
        peerConnections: (webrtcService as any).peerConnections?.size || 0,
        participants: currentMeeting?.participants?.size || 0
      },
      browser: {
        userAgent: navigator.userAgent,
        webrtcSupported: this.checkWebRTCSupport(),
        mediaDevicesSupported: this.checkMediaDevicesSupport(),
        broadcastChannelSupported: this.checkBroadcastChannelSupport()
      },
      network: {
        online: navigator.onLine,
        connectionType: this.getConnectionType()
      }
    };
  }

  private checkWebRTCSupport(): boolean {
    return !!(window.RTCPeerConnection && window.RTCSessionDescription && window.RTCIceCandidate);
  }

  private checkMediaDevicesSupport(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  private checkBroadcastChannelSupport(): boolean {
    return typeof BroadcastChannel !== 'undefined';
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  // Run comprehensive diagnostics and log results
  async runDiagnostics(): Promise<void> {
    console.log('🔍 Running meeting diagnostics...');
    
    const diagnostics = await this.getDiagnostics();
    
    console.group('📊 Meeting Diagnostics Report');
    console.log('🕐 Timestamp:', diagnostics.timestamp.toISOString());
    
    console.group('👤 User Status');
    console.log('Authenticated:', diagnostics.user.isAuthenticated);
    console.log('User ID:', diagnostics.user.id);
    console.groupEnd();
    
    console.group('🌐 Signaling Status');
    console.log('Connected:', diagnostics.signaling.isConnected);
    console.log('Connection Type:', diagnostics.signaling.connectionType);
    console.groupEnd();
    
    console.group('🎥 WebRTC Status');
    console.log('Current Meeting:', diagnostics.webrtc.currentMeeting);
    console.log('Local Stream:', diagnostics.webrtc.localStream);
    console.log('Screen Stream:', diagnostics.webrtc.screenStream);
    console.log('Peer Connections:', diagnostics.webrtc.peerConnections);
    console.log('Participants:', diagnostics.webrtc.participants);
    console.groupEnd();
    
    console.group('🌍 Browser Support');
    console.log('WebRTC Supported:', diagnostics.browser.webrtcSupported);
    console.log('Media Devices Supported:', diagnostics.browser.mediaDevicesSupported);
    console.log('BroadcastChannel Supported:', diagnostics.browser.broadcastChannelSupported);
    console.groupEnd();
    
    console.group('📡 Network Status');
    console.log('Online:', diagnostics.network.online);
    console.log('Connection Type:', diagnostics.network.connectionType);
    console.groupEnd();
    
    console.group('❌ Recent Errors');
    const recentErrors = this.getRecentErrors(5);
    if (recentErrors.length === 0) {
      console.log('✅ No recent errors');
    } else {
      recentErrors.forEach(error => {
        console.log(`${this.getSeverityEmoji(error.severity)} [${error.type}] ${error.message}`, error.details);
      });
    }
    console.groupEnd();
    
    console.groupEnd();
  }

  // Test media device access
  async testMediaDevices(): Promise<{ camera: boolean; microphone: boolean; error?: string }> {
    console.log('🎥 Testing media device access...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      
      const result = {
        camera: videoTracks.length > 0,
        microphone: audioTracks.length > 0
      };
      
      console.log('✅ Media device test completed:', result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Media device test failed:', errorMessage);
      
      this.logError('media', 'high', 'Media device test failed', { error: errorMessage });
      
      return {
        camera: false,
        microphone: false,
        error: errorMessage
      };
    }
  }

  // Export diagnostics as JSON
  exportDiagnostics(): string {
    const data = {
      diagnostics: this.getDiagnostics(),
      errors: this.errors,
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }
}

// Export singleton instance
export const meetingDebugger = new MeetingDebugger();

// Add global debugging functions for console access
(window as any).meetingDebugger = meetingDebugger;
(window as any).runMeetingDiagnostics = () => meetingDebugger.runDiagnostics();
(window as any).testMediaDevices = () => meetingDebugger.testMediaDevices();
(window as any).exportMeetingDiagnostics = () => meetingDebugger.exportDiagnostics();

console.log('🔧 Meeting debugger loaded. Use these console commands:');
console.log('  - runMeetingDiagnostics() - Run full diagnostics');
console.log('  - testMediaDevices() - Test camera/microphone access');
console.log('  - exportMeetingDiagnostics() - Export diagnostics as JSON');
