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
    if (!this.analyser || !this.isRecording) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const monitor = () => {
      if (!this.isRecording) return;

      this.analyser!.getByteFrequencyData(dataArray);

      // Calculate average volume
      const average =
        dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      this.volumeHistory.push(average);

      // Detect pauses (low volume periods)
      if (average < 10) {
        // Threshold for silence
        this.pauseTimestamps.push(Date.now() - this.startTime);
      }

      requestAnimationFrame(monitor);
    };

    monitor();
  }

  private async processRecordedAudio() {
    if (this.audioChunks.length === 0) return;

    const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });

    // In a real implementation, you would:
    // 1. Send audio to speech-to-text service (like Google Speech-to-Text)
    // 2. Get detailed transcript with word-level timestamps
    // 3. Analyze audio features for pronunciation assessment

    // For now, we'll simulate this with mock data
    this.simulateTranscription();
  }

  private simulateTranscription() {
    // Mock transcription with timestamps
    const mockWords = [
      { word: "hello", time: 0.5 },
      { word: "um", time: 1.2 },
      { word: "my", time: 1.8 },
      { word: "name", time: 2.1 },
      { word: "is", time: 2.4 },
      { word: "like", time: 2.9 },
      { word: "john", time: 3.5 },
    ];

    this.wordTimestamps = mockWords;
    this.currentTranscript = mockWords.map((w) => w.word).join(" ");
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

    return {
      fillerWords: fillerWordAnalysis,
      paceAnalysis,
      confidenceScore,
      pronunciationAssessment,
      overallMetrics: {
        totalWords,
        totalDuration: duration,
        averageVolume,
        silencePercentage: Math.min(silencePercentage, 100),
      },
    };
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
      paceScore = 85 + Math.random() * 15; // 85-100 for optimal pace
    }

    return {
      wordsPerMinute: Math.round(wordsPerMinute),
      averagePause: Math.round(averagePause * 100) / 100,
      paceRating,
      paceScore: Math.round(paceScore),
    };
  }

  private analyzeConfidence() {
    const volumeVariation = this.calculateVolumeVariation();
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
      overall: Math.max(0, Math.min(100, overall)),
      volumeVariation: Math.round((1 - volumeVariation) * 100),
      voiceTremor: Math.round((1 - voiceTremor) * 100),
      pausePattern: Math.round(pausePattern * 100),
      factors,
    };
  }

  private calculateVolumeVariation(): number {
    if (this.volumeHistory.length < 2) return 0;

    const mean =
      this.volumeHistory.reduce((sum, vol) => sum + vol, 0) /
      this.volumeHistory.length;
    const variance =
      this.volumeHistory.reduce(
        (sum, vol) => sum + Math.pow(vol - mean, 2),
        0
      ) / this.volumeHistory.length;
    const standardDeviation = Math.sqrt(variance);

    return Math.min(1, standardDeviation / mean);
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
    // In a real implementation, this would use advanced audio analysis
    // For now, we'll provide mock scores based on available data

    const clarity = 75 + Math.random() * 20; // 75-95
    const articulation = 70 + Math.random() * 25; // 70-95
    const fluency = 80 + Math.random() * 15; // 80-95

    const overallScore = (clarity + articulation + fluency) / 3;

    const issues: string[] = [];
    if (clarity < 80) issues.push("Some words may be unclear");
    if (articulation < 75) issues.push("Articulation could be improved");
    if (fluency < 85) issues.push("Consider working on fluency");

    return {
      clarity: Math.round(clarity),
      articulation: Math.round(articulation),
      fluency: Math.round(fluency),
      overallScore: Math.round(overallScore),
      issues,
    };
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
