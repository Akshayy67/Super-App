import { unifiedAIService } from '../utils/aiConfig';

interface TranscriptionSegment {
  text: string;
  timestamp: Date;
  speaker?: string;
  confidence?: number;
}

interface TranscriptionConfig {
  language?: string;
  interimResults?: boolean;
  continuous?: boolean;
  maxAlternatives?: number;
}

class MeetingTranscriptionService {
  private recognition: any = null;
  private transcriptSegments: TranscriptionSegment[] = [];
  private isTranscribing = false;
  private onTranscriptUpdate?: (transcript: string, interimTranscript?: string) => void;
  private retryAttempts = 0;
  private maxRetries = 3;
  private restartTimeout: NodeJS.Timeout | null = null;
  private lastResultTime = Date.now();
  private qualityCheckInterval: NodeJS.Timeout | null = null;

  async startTranscription(
    meetingId: string,
    onTranscriptUpdate?: (transcript: string, interimTranscript?: string) => void
  ): Promise<void> {
    if (this.isTranscribing) {
      console.warn('Transcription already in progress');
      return;
    }

    this.onTranscriptUpdate = onTranscriptUpdate;
    this.transcriptSegments = [];
    this.retryAttempts = 0;

    // Check for browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      if (onTranscriptUpdate) {
        onTranscriptUpdate('', 'Speech recognition not supported in your browser. Please use Chrome, Edge, or Safari.');
      }
      return;
    }

    // Check if running in a secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      console.warn('Speech recognition requires a secure context (HTTPS or localhost)');
    }

    this.recognition = new SpeechRecognition();
    
    // Enhanced configuration for better accuracy
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = import.meta.env.VITE_TRANSCRIPTION_LANGUAGE || 'en-US';
    this.recognition.maxAlternatives = 1; // Use only best result for now
    
    // Additional optimization settings
    try {
      // Try to use best available model
      if ((this.recognition as any).grammars) {
        (this.recognition as any).grammars = null; // Use general grammar
      }
    } catch (e) {
      // Feature not supported, continue
    }
    
    // Additional settings for better performance (Chrome-specific)
    if (this.recognition.serviceURI) {
      this.recognition.serviceURI = 'wss://chrome.cloudspeech.google.com/web/v1/recognize';
    }

    this.recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      this.retryAttempts = 0;
      this.lastResultTime = Date.now();
    };

    this.recognition.onresult = (event: any) => {
      this.lastResultTime = Date.now();
      let interimTranscript = '';
      let finalTranscript = '';

      // Start from event.resultIndex to avoid processing duplicate results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0;
        const minConfidence = parseFloat(import.meta.env.VITE_TRANSCRIPTION_CONFIDENCE_THRESHOLD) || 0.0;

        // Only include results with reasonable confidence
        if (confidence < minConfidence) {
          console.log(`⚠️ Low confidence result filtered: ${transcript} (confidence: ${confidence.toFixed(2)})`);
          continue;
        }

        if (result.isFinal) {
          // Check for duplicate within the last segment to prevent repetition from same result event
          const trimmedTranscript = transcript.trim().toLowerCase();
          const lastSegment = this.transcriptSegments.length > 0 
            ? this.transcriptSegments[this.transcriptSegments.length - 1] 
            : null;
          
          // Only filter if it's an exact duplicate of the last segment added
          if (!lastSegment || lastSegment.text.toLowerCase() !== trimmedTranscript) {
            finalTranscript += transcript + ' ';
            this.transcriptSegments.push({
              text: transcript.trim(), // Keep original casing
              timestamp: new Date(),
              confidence: confidence
            });
            console.log(`✅ Added: "${transcript.trim()}" (confidence: ${confidence.toFixed(2)})`);
          } else {
            console.log('🔄 Duplicate filtered:', transcript.trim());
          }
        } else {
          interimTranscript += transcript;
        }
      }

      // Update callback with both final and interim transcripts
      if (this.onTranscriptUpdate) {
        const fullTranscript = this.getFullTranscript();
        this.onTranscriptUpdate(fullTranscript, interimTranscript.trim());
      }
    };

    this.recognition.onerror = (event: any) => {
      const error = event.error;
      console.log(`🔍 Speech recognition event: ${error}`);

      // Handle different error types
      switch (error) {
        case 'no-speech':
          // Silent handling - user might be listening
          break;
        case 'audio-capture':
          console.error('❌ Microphone not accessible');
          this.handleError('Microphone not accessible. Please check your permissions.');
          break;
        case 'not-allowed':
          console.error('❌ Microphone permission denied');
          this.handleError('Microphone permission denied. Please allow microphone access.');
          this.stopTranscription();
          break;
        case 'network':
          console.error('❌ Network error');
          this.handleError('Network error. Please check your internet connection.');
          this.restartAfterDelay();
          break;
        case 'aborted':
          // Handled in onend
          break;
        default:
          console.error(`❌ Unknown error: ${error}`);
          if (error !== 'no-speech' && error !== 'audio-capture') {
            this.restartAfterDelay();
          }
      }
    };

    this.recognition.onend = () => {
      console.log('🔴 Speech recognition ended');
      
      if (this.isTranscribing) {
        // Auto-restart with exponential backoff
        this.retryAttempts++;
        
        if (this.retryAttempts < this.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, this.retryAttempts), 10000);
          console.log(`⏳ Restarting transcription in ${delay}ms (attempt ${this.retryAttempts}/${this.maxRetries})`);
          
          this.restartTimeout = setTimeout(() => {
            if (this.isTranscribing && this.recognition) {
              try {
                this.recognition.start();
              } catch (e) {
                console.error('Failed to restart recognition:', e);
              }
            }
          }, delay);
        } else {
          console.error('❌ Max retries reached. Stopping transcription.');
          this.handleError('Transcription stopped after multiple failures. Please try again.');
          this.stopTranscription();
        }
      }
    };

    // Quality monitoring - check if we're getting results
    this.qualityCheckInterval = setInterval(() => {
      const timeSinceLastResult = Date.now() - this.lastResultTime;
      
      // If no results for 30 seconds and we're supposed to be transcribing, show a warning
      if (timeSinceLastResult > 30000 && this.isTranscribing) {
        console.warn('⚠️ No speech detected for 30 seconds');
        if (this.onTranscriptUpdate) {
          this.onTranscriptUpdate(
            this.getFullTranscript(),
            'Waiting for speech...'
          );
        }
        this.lastResultTime = Date.now(); // Reset to avoid spam
      }
    }, 30000);

    try {
      this.recognition.start();
      this.isTranscribing = true;
      console.log('✅ Transcription started successfully');
    } catch (error) {
      console.error('❌ Failed to start speech recognition:', error);
      this.isTranscribing = false;
      this.handleError('Failed to start transcription. Please refresh and try again.');
    }
  }

  private handleError(message: string) {
    if (this.onTranscriptUpdate) {
      // Show error in interim transcript
      this.onTranscriptUpdate(this.getFullTranscript(), `[Error: ${message}]`);
    }
  }

  private restartAfterDelay() {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }
    
    if (this.isTranscribing && this.recognition) {
      this.restartTimeout = setTimeout(() => {
        if (this.isTranscribing && this.recognition) {
          try {
            console.log('🔄 Attempting to restart transcription...');
            this.recognition.start();
          } catch (e) {
            console.error('Failed to restart:', e);
          }
        }
      }, 2000);
    }
  }

  stopTranscription(): void {
    console.log('🛑 Stopping transcription');
    
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    
    if (this.qualityCheckInterval) {
      clearInterval(this.qualityCheckInterval);
      this.qualityCheckInterval = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
      this.recognition = null;
    }
    
    this.isTranscribing = false;
    this.retryAttempts = 0;
  }

  getFullTranscript(): string {
    return this.transcriptSegments
      .map(segment => segment.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  getTranscriptSegments(): TranscriptionSegment[] {
    return [...this.transcriptSegments];
  }

  getAverageConfidence(): number {
    if (this.transcriptSegments.length === 0) return 0;
    const sum = this.transcriptSegments.reduce((acc, seg) => acc + (seg.confidence || 0), 0);
    return sum / this.transcriptSegments.length;
  }

  clearTranscript(): void {
    this.transcriptSegments = [];
  }

  async generateAISummary(transcript: string): Promise<string | null> {
    if (!transcript.trim()) {
      return null;
    }

    try {
      const prompt = `Please provide a concise summary of the following meeting transcript. Include key points, decisions made, and action items in bullet points:

${transcript}

Format the summary with clear bullet points for easy reading.`;

      const response = await unifiedAIService.generateResponse(prompt, '');
      
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      return null;
    }
  }
}

export const meetingTranscriptionService = new MeetingTranscriptionService();
