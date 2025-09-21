export interface SpeechAnalysisResult {
  fillerWords: {
    count: number;
    words: string[];
    percentage: number;
    timestamps: { word: string; time: number }[];
  };
  paceAnalysis: {
    wordsPerMinute: number;
    averagePause: number;
    paceRating: "too_slow" | "optimal" | "too_fast";
    paceScore: number;
  };
  confidenceScore: {
    overall: number;
    volumeVariation: number;
    voiceTremor: number;
    pausePattern: number;
    factors: string[];
  };
  pronunciationAssessment: {
    clarity: number;
    articulation: number;
    fluency: number;
    overallScore: number;
    issues: string[];
  };
  overallMetrics: {
    totalWords: number;
    totalDuration: number;
    averageVolume: number;
    silencePercentage: number;
  };
}

export class SpeechAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private startTime = 0;
  private volumeHistory: number[] = [];
  private pauseTimestamps: number[] = [];
  private currentTranscript = "";
  private wordTimestamps: { word: string; time: number }[] = [];
  private frequencyStability = 1; // Track frequency stability for tremor detection
  private isSimulatedData = false; // Track if data is simulated vs real

  // Common filler words to detect
  private readonly FILLER_WORDS = [
    "um",
    "uh",
    "er",
    "ah",
    "like",
    "you know",
    "so",
    "well",
    "actually",
    "basically",
    "literally",
    "right",
    "okay",
    "yeah",
    "hmm",
    "mmm",
  ];

  async initialize(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();

      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);

      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      this.mediaRecorder = new MediaRecorder(stream);
      this.setupMediaRecorder();

      return true;
    } catch (error) {
      console.error("Failed to initialize speech analyzer:", error);
      return false;
    }
  }

  private setupMediaRecorder() {
    if (!this.mediaRecorder) return;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      // Process the recorded audio for detailed analysis
      this.processRecordedAudio();
    };
  }

  // Start continuous monitoring for real-time metrics (without recording)
  startContinuousMonitoring(): void {
    if (!this.analyser) return;

    console.log("Starting continuous audio monitoring for real-time metrics");
    this.startTime = Date.now();
    this.volumeHistory = [];
    this.pauseTimestamps = [];
    this.wordTimestamps = [];
    this.currentTranscript = "";

    // Start volume monitoring without recording
    this.startVolumeMonitoring();

    // Start speech recognition for word detection
    this.startSpeechRecognition();
  }

  startAnalysis(): void {
    if (!this.mediaRecorder || !this.analyser) return;

    this.isRecording = true;
    this.startTime = Date.now();
    this.audioChunks = [];
    this.volumeHistory = [];
    this.pauseTimestamps = [];
    this.wordTimestamps = [];
    this.currentTranscript = "";

    this.mediaRecorder.start(100); // Collect data every 100ms
    this.startVolumeMonitoring();
    this.startSpeechRecognition();
  }

  stopAnalysis(): Promise<SpeechAnalysisResult> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(this.generateEmptyResult());
        return;
      }

      this.isRecording = false;
      this.mediaRecorder.stop();

      // Wait a bit for processing to complete
      setTimeout(() => {
        const result = this.generateAnalysisResult();
        resolve(result);
      }, 1000);
    });
  }

  private startVolumeMonitoring() {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const monitor = () => {
      // Continue monitoring as long as analyzer exists
      if (!this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);

      // Calculate average volume
      const average =
        dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      this.volumeHistory.push(average);

      // Keep only recent volume history (last 100 readings)
      if (this.volumeHistory.length > 100) {
        this.volumeHistory = this.volumeHistory.slice(-100);
      }

      // Detect pauses (low volume periods)
      if (average < 10) {
        // Threshold for silence
        this.pauseTimestamps.push(Date.now() - this.startTime);
      }

      requestAnimationFrame(monitor);
    };

    monitor();
  }

  private startSpeechRecognition() {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      console.log("Speech recognition not supported");
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;

            // Process words for timing and filler detection
            const words = transcript.toLowerCase().split(" ");
            const currentTime = Date.now();

            words.forEach((word) => {
              // Add word timestamp
              this.wordTimestamps.push({
                word: word.trim(),
                time: currentTime,
              });

              // Check for filler words
              if (this.fillerWords.includes(word.trim())) {
                this.fillerWordCount++;
                console.log("Detected filler word:", word);
              }
            });

            // Keep only recent word timestamps (last 5 minutes)
            const fiveMinutesAgo = currentTime - 300000;
            this.wordTimestamps = this.wordTimestamps.filter(
              (w) => w.time > fiveMinutesAgo
            );
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.log("Speech recognition error:", event.error);
      };

      recognition.start();
      console.log("Speech recognition started");
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
    }
  }

  private async processRecordedAudio() {
    if (this.audioChunks.length === 0) return;

    const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });

    try {
      // Real implementation: Analyze audio features
      await this.analyzeAudioFeatures(audioBlob);

      // Use Web Speech API for real-time transcription if available
      if (
        "webkitSpeechRecognition" in window ||
        "SpeechRecognition" in window
      ) {
        await this.performRealTimeTranscription();
      } else {
        // Fallback to simulated transcription
        this.simulateTranscription();
      }
    } catch (error) {
      console.error("Audio processing failed:", error);
      // Fallback to simulated data
      this.simulateTranscription();
    }
  }

  private async analyzeAudioFeatures(audioBlob: Blob): Promise<void> {
    try {
      // Convert blob to audio buffer for analysis
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Analyze audio characteristics
      const channelData = audioBuffer.getChannelData(0);

      // Calculate volume variations for confidence analysis
      this.analyzeVolumePatterns(channelData);

      // Analyze frequency patterns for voice tremor detection
      this.analyzeFrequencyPatterns(channelData, audioContext.sampleRate);

      // Analyze pause patterns
      this.analyzePausePatterns(channelData, audioContext.sampleRate);

      audioContext.close();
    } catch (error) {
      console.error("Audio feature analysis failed:", error);
    }
  }

  private analyzeVolumePatterns(channelData: Float32Array): void {
    const windowSize = 1024;
    const volumes: number[] = [];

    for (let i = 0; i < channelData.length; i += windowSize) {
      let sum = 0;
      const end = Math.min(i + windowSize, channelData.length);

      for (let j = i; j < end; j++) {
        sum += Math.abs(channelData[j]);
      }

      volumes.push(sum / (end - i));
    }

    // Store volume data for confidence analysis
    this.volumeHistory = volumes;
  }

  private analyzeFrequencyPatterns(
    channelData: Float32Array,
    sampleRate: number
  ): void {
    // Simple frequency analysis for voice tremor detection
    const fftSize = 2048;
    const frequencies: number[] = [];

    for (let i = 0; i < channelData.length - fftSize; i += fftSize) {
      const segment = channelData.slice(i, i + fftSize);
      const magnitude = this.calculateMagnitude(segment);
      frequencies.push(magnitude);
    }

    // Analyze frequency stability for tremor detection
    this.frequencyStability = this.calculateStability(frequencies);
  }

  private calculateMagnitude(segment: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < segment.length; i++) {
      sum += segment[i] * segment[i];
    }
    return Math.sqrt(sum / segment.length);
  }

  private calculateStability(values: number[]): number {
    if (values.length < 2) return 1;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    const standardDeviation = Math.sqrt(variance);

    // Return stability score (lower deviation = higher stability)
    return Math.max(0, 1 - standardDeviation / mean);
  }

  private analyzePausePatterns(
    channelData: Float32Array,
    sampleRate: number
  ): void {
    const silenceThreshold = 0.01;
    const minPauseDuration = 0.2; // 200ms minimum pause
    const samplesPerSecond = sampleRate;
    const minPauseSamples = minPauseDuration * samplesPerSecond;

    let silenceStart = -1;
    const pauses: { start: number; duration: number }[] = [];

    for (let i = 0; i < channelData.length; i++) {
      const isSilent = Math.abs(channelData[i]) < silenceThreshold;

      if (isSilent && silenceStart === -1) {
        silenceStart = i;
      } else if (!isSilent && silenceStart !== -1) {
        const pauseDuration = (i - silenceStart) / samplesPerSecond;
        if (i - silenceStart >= minPauseSamples) {
          pauses.push({
            start: silenceStart / samplesPerSecond,
            duration: pauseDuration,
          });
        }
        silenceStart = -1;
      }
    }

    // Store pause data
    this.pauseTimestamps = pauses.map((p) => p.start);
  }

  private async performRealTimeTranscription(): Promise<void> {
    return new Promise((resolve) => {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        this.simulateTranscription();
        resolve();
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let finalTranscript = "";
      const words: { word: string; time: number }[] = [];
      const startTime = Date.now();

      recognition.onresult = (event: any) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;

            // Extract words with approximate timestamps
            const newWords = transcript
              .trim()
              .split(/\s+/)
              .map((word: string, index: number) => ({
                word: word.toLowerCase(),
                time: (Date.now() - startTime) / 1000 + index * 0.3,
              }));

            words.push(...newWords);
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognition.onerror = () => {
        this.simulateTranscription();
        resolve();
      };

      recognition.onend = () => {
        this.currentTranscript = finalTranscript || this.currentTranscript;
        this.wordTimestamps = words.length > 0 ? words : this.wordTimestamps;
        resolve();
      };

      // Start recognition for a short duration to capture recent speech
      recognition.start();

      // Stop after 3 seconds to avoid conflicts
      setTimeout(() => {
        recognition.stop();
      }, 3000);
    });
  }

  private simulateTranscription() {
    // CRITICAL: This should only be used as absolute fallback
    console.warn(
      "⚠️ USING SIMULATED SPEECH DATA - Results will be inaccurate!"
    );

    // Mark this as simulated data for validation
    this.isSimulatedData = true;

    // Minimal fallback data - clearly marked as unreliable
    this.currentTranscript = "Simulated speech data - results not accurate";
    this.wordTimestamps = [
      { word: "simulated", time: 0 },
      { word: "data", time: 500 },
    ];
    this.pauseTimestamps = [1000];
  }

  updateTranscript(
    transcript: string,
    wordTimestamps?: { word: string; time: number }[]
  ) {
    this.currentTranscript = transcript;
    if (wordTimestamps) {
      this.wordTimestamps = wordTimestamps;
    }
  }

  private generateAnalysisResult(): SpeechAnalysisResult {
    const duration = (Date.now() - this.startTime) / 1000; // in seconds
    const words = this.currentTranscript
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    const totalWords = words.length;

    // Analyze filler words
    const fillerWordAnalysis = this.analyzeFillerWords(words);

    // Analyze pace
    const paceAnalysis = this.analyzePace(totalWords, duration);

    // Analyze confidence
    const confidenceScore = this.analyzeConfidence();

    // Analyze pronunciation
    const pronunciationAssessment = this.analyzePronunciation();

    // Calculate overall metrics
    const averageVolume =
      this.volumeHistory.length > 0
        ? this.volumeHistory.reduce((sum, vol) => sum + vol, 0) /
          this.volumeHistory.length
        : 0;

    const silencePercentage =
      ((this.pauseTimestamps.length * 0.1) / duration) * 100; // Rough estimate

    // Add simulation detection to results
    const result = {
      fillerWords: fillerWordAnalysis,
      paceAnalysis,
      confidenceScore,
      pronunciationAssessment,
      overallMetrics: {
        totalWords,
        totalDuration: duration,
        averageVolume,
        silencePercentage: Math.min(silencePercentage, 100),
        isSimulated: this.isSimulatedData,
      },
    };

    // Log warning if using simulated data
    if (this.isSimulatedData) {
      console.warn(
        "⚠️ Speech analysis contains simulated data - scores will be inaccurate"
      );
    }

    return result;
  }

  private analyzeFillerWords(words: string[]) {
    const fillerWordsFound: string[] = [];
    const timestamps: { word: string; time: number }[] = [];

    words.forEach((word, index) => {
      if (this.FILLER_WORDS.includes(word)) {
        fillerWordsFound.push(word);
        const timestamp = this.wordTimestamps.find(
          (wt) => wt.word.toLowerCase() === word
        );
        if (timestamp) {
          timestamps.push(timestamp);
        }
      }
    });

    const count = fillerWordsFound.length;
    const percentage = words.length > 0 ? (count / words.length) * 100 : 0;

    return {
      count,
      words: fillerWordsFound,
      percentage: Math.round(percentage * 100) / 100,
      timestamps,
    };
  }

  private analyzePace(totalWords: number, duration: number) {
    const wordsPerMinute = duration > 0 ? (totalWords / duration) * 60 : 0;
    const averagePause =
      this.pauseTimestamps.length > 0
        ? this.pauseTimestamps.reduce((sum, pause) => sum + pause, 0) /
          this.pauseTimestamps.length /
          1000
        : 0;

    let paceRating: "too_slow" | "optimal" | "too_fast";
    let paceScore: number;

    if (wordsPerMinute < 120) {
      paceRating = "too_slow";
      paceScore = Math.max(0, (wordsPerMinute / 120) * 70);
    } else if (wordsPerMinute > 180) {
      paceRating = "too_fast";
      paceScore = Math.max(0, 100 - ((wordsPerMinute - 180) / 60) * 30);
    } else {
      paceRating = "optimal";
      // Remove random component - use deterministic scoring
      const optimalMid = 150; // Optimal WPM midpoint
      const deviation = Math.abs(wordsPerMinute - optimalMid);
      paceScore = Math.max(85, 100 - deviation * 0.5); // 85-100 for optimal pace
    }

    return {
      wordsPerMinute: Math.round(wordsPerMinute),
      averagePause: Math.round(averagePause * 100) / 100,
      paceRating,
      paceScore: Math.round(paceScore),
    };
  }

  private analyzeConfidence() {
    const volumeVariation = this.calculateVolumeVariation(this.volumeHistory);
    const voiceTremor = this.calculateVoiceTremor();
    const pausePattern = this.analyzePausePattern();

    const factors: string[] = [];

    if (volumeVariation > 0.7) factors.push("High volume variation detected");
    if (voiceTremor > 0.6) factors.push("Voice tremor detected");
    if (pausePattern < 0.4) factors.push("Irregular pause patterns");

    const overall = Math.round(
      ((1 - volumeVariation) * 0.4 +
        (1 - voiceTremor) * 0.3 +
        pausePattern * 0.3) *
        100
    );

    return {
      overall: Math.max(30, Math.min(100, overall)), // Minimum 30 for valid data
      volumeVariation: Math.round((1 - volumeVariation) * 100),
      voiceTremor: Math.round((1 - voiceTremor) * 100),
      pausePattern: Math.round(pausePattern * 100),
      factors,
    };
  }

  private calculateVoiceTremor(): number {
    // Simplified tremor detection based on rapid volume changes
    if (this.volumeHistory.length < 10) return 0;

    let rapidChanges = 0;
    for (let i = 1; i < this.volumeHistory.length; i++) {
      const change = Math.abs(
        this.volumeHistory[i] - this.volumeHistory[i - 1]
      );
      if (change > 20) rapidChanges++;
    }

    return Math.min(1, rapidChanges / this.volumeHistory.length);
  }

  private analyzePausePattern(): number {
    if (this.pauseTimestamps.length < 2) return 0.8; // Assume good if not enough data

    // Analyze regularity of pauses
    const intervals: number[] = [];
    for (let i = 1; i < this.pauseTimestamps.length; i++) {
      intervals.push(this.pauseTimestamps[i] - this.pauseTimestamps[i - 1]);
    }

    if (intervals.length === 0) return 0.8;

    const mean =
      intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance =
      intervals.reduce(
        (sum, interval) => sum + Math.pow(interval - mean, 2),
        0
      ) / intervals.length;
    const coefficient = Math.sqrt(variance) / mean;

    return Math.max(0, 1 - coefficient);
  }

  private analyzePronunciation() {
    // Real implementation using analyzed audio data

    // Calculate clarity based on frequency stability and volume consistency
    const volumeConsistency = this.calculateVolumeConsistency();
    const clarity = Math.min(
      95,
      60 + volumeConsistency * 35 + this.frequencyStability * 10
    );

    // Calculate articulation based on pause patterns and speech rate
    const pauseQuality = this.analyzePauseQuality();
    const speechRate = this.calculateSpeechRate();
    const articulation = Math.min(95, 50 + pauseQuality * 25 + speechRate * 20);

    // Calculate fluency based on filler words and overall flow
    const fillerWordRatio = this.calculateFillerWordRatio();
    const fluency = Math.min(95, 70 + (1 - fillerWordRatio) * 25);

    const overallScore = (clarity + articulation + fluency) / 3;

    const issues: string[] = [];

    if (clarity < 80) {
      issues.push("Audio clarity could be improved");
    }
    if (articulation < 75) {
      issues.push("Articulation needs improvement");
    }
    if (fluency < 85) {
      issues.push("Reduce filler words for better fluency");
    }

    return {
      clarity: Math.round(clarity),
      articulation: Math.round(articulation),
      fluency: Math.round(fluency),
      overallScore: Math.round(overallScore),
      issues,
    };
  }

  private calculateVolumeConsistency(): number {
    if (this.volumeHistory.length < 2) return 0.5;

    const mean =
      this.volumeHistory.reduce((sum, vol) => sum + vol, 0) /
      this.volumeHistory.length;
    const variance =
      this.volumeHistory.reduce(
        (sum, vol) => sum + Math.pow(vol - mean, 2),
        0
      ) / this.volumeHistory.length;
    const coefficient = Math.sqrt(variance) / mean;

    // Return consistency score (lower coefficient = higher consistency)
    return Math.max(0, Math.min(1, 1 - coefficient));
  }

  private analyzePauseQuality(): number {
    if (this.pauseTimestamps.length === 0) return 0.3; // No pauses detected

    const totalDuration = (Date.now() - this.startTime) / 1000;
    const pauseFrequency = this.pauseTimestamps.length / (totalDuration / 60); // pauses per minute

    // Optimal pause frequency is 8-15 pauses per minute
    if (pauseFrequency >= 8 && pauseFrequency <= 15) return 1;
    if (pauseFrequency >= 5 && pauseFrequency <= 20) return 0.8;
    if (pauseFrequency >= 3 && pauseFrequency <= 25) return 0.6;
    return 0.4;
  }

  private calculateSpeechRate(): number {
    const totalWords = this.wordTimestamps.length;
    const totalDuration = (Date.now() - this.startTime) / 1000 / 60; // in minutes

    if (totalDuration === 0) return 0.5;

    const wordsPerMinute = totalWords / totalDuration;

    // Optimal speech rate is 140-180 words per minute
    if (wordsPerMinute >= 140 && wordsPerMinute <= 180) return 1;
    if (wordsPerMinute >= 120 && wordsPerMinute <= 200) return 0.8;
    if (wordsPerMinute >= 100 && wordsPerMinute <= 220) return 0.6;
    return 0.4;
  }

  private calculateFillerWordRatio(): number {
    const totalWords = this.wordTimestamps.length;
    if (totalWords === 0) return 0;

    const fillerCount = this.wordTimestamps.filter((wt) =>
      this.FILLER_WORDS.includes(wt.word.toLowerCase())
    ).length;

    return fillerCount / totalWords;
  }

  private generateEmptyResult(): SpeechAnalysisResult {
    return {
      fillerWords: { count: 0, words: [], percentage: 0, timestamps: [] },
      paceAnalysis: {
        wordsPerMinute: 0,
        averagePause: 0,
        paceRating: "optimal",
        paceScore: 0,
      },
      confidenceScore: {
        overall: 0,
        volumeVariation: 0,
        voiceTremor: 0,
        pausePattern: 0,
        factors: [],
      },
      pronunciationAssessment: {
        clarity: 0,
        articulation: 0,
        fluency: 0,
        overallScore: 0,
        issues: [],
      },
      overallMetrics: {
        totalWords: 0,
        totalDuration: 0,
        averageVolume: 0,
        silencePercentage: 0,
      },
    };
  }

  // Real-time metric methods for live updates
  getCurrentFillerWordCount(): number {
    console.log("Getting filler word count:", this.fillerWordCount);

    // Return actual filler word count (starts at 0)
    return this.fillerWordCount;
  }

  getCurrentConfidenceScore(): number {
    console.log(
      "Getting confidence score, volume history length:",
      this.volumeHistory.length,
      "isRecording:",
      this.isRecording
    );

    if (this.volumeHistory.length === 0) {
      // Return 0 if no audio data yet
      return 0;
    }

    const recentVolumes = this.volumeHistory.slice(-10); // Last 10 readings
    const avgVolume =
      recentVolumes.reduce((sum, vol) => sum + vol, 0) / recentVolumes.length;
    const volumeVariation = this.calculateVolumeVariation(recentVolumes);

    // Calculate confidence based on volume consistency and level
    const volumeScore = Math.min(100, avgVolume * 2); // Normalize to 0-100
    const consistencyScore = Math.max(0, 100 - volumeVariation * 10);

    const confidence = Math.round((volumeScore + consistencyScore) / 2);
    console.log("Calculated confidence:", confidence, "avgVolume:", avgVolume);

    return confidence;
  }

  getCurrentSpeakingPace(): number {
    console.log(
      "Getting speaking pace, word timestamps length:",
      this.wordTimestamps.length,
      "isRecording:",
      this.isRecording
    );

    if (this.wordTimestamps.length < 2) {
      // Return 0 if no speech data yet
      return 0;
    }

    const currentTime = Date.now();
    const recentWords = this.wordTimestamps.filter(
      (timestamp) => currentTime - timestamp.time < 60000 // Last minute
    );

    const pace = recentWords.length; // Words per minute (approximate)
    console.log("Calculated speaking pace:", pace);

    return pace;
  }

  private calculateVolumeVariation(volumes: number[]): number {
    if (volumes.length < 2) return 0;

    const mean = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const variance =
      volumes.reduce((sum, vol) => sum + Math.pow(vol - mean, 2), 0) /
      volumes.length;
    const standardDeviation = Math.sqrt(variance);

    return Math.min(1, standardDeviation / (mean || 1));
  }

  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.mediaRecorder = null;
    this.isRecording = false;
  }
}
