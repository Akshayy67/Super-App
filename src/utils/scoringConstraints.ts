/**
 * Strict Scoring Constraints for Interview Analytics
 * All scoring must be data-driven and follow these precise constraints
 */

export interface ScoringConstraints {
  speech: SpeechConstraints;
  bodyLanguage: BodyLanguageConstraints;
  technical: TechnicalConstraints;
  communication: CommunicationConstraints;
  behavioral: BehavioralConstraints;
  overall: OverallConstraints;
}

export interface SpeechConstraints {
  pronunciation: {
    clarity: { min: 0; max: 100; excellent: 90; good: 75; fair: 60; poor: 40 };
    articulation: { min: 0; max: 100; excellent: 85; good: 70; fair: 55; poor: 35 };
    fluency: { min: 0; max: 100; excellent: 88; good: 72; fair: 58; poor: 38 };
  };
  pace: {
    wordsPerMinute: { optimal: [140, 160]; acceptable: [120, 180]; poor: [0, 119] | [181, 300] };
    pauseFrequency: { optimal: [8, 15]; acceptable: [5, 20]; poor: [0, 4] | [21, 50] };
  };
  confidence: {
    volumeStability: { min: 0; max: 100; excellent: 85; good: 70; fair: 55; poor: 35 };
    voiceTremor: { min: 0; max: 100; excellent: 90; good: 75; fair: 60; poor: 40 };
    pausePattern: { min: 0; max: 100; excellent: 80; good: 65; fair: 50; poor: 30 };
  };
  fillerWords: {
    percentage: { excellent: [0, 2]; good: [2.1, 4]; fair: [4.1, 7]; poor: [7.1, 100] };
    count: { excellent: [0, 5]; good: [6, 12]; fair: [13, 20]; poor: [21, 1000] };
  };
}

export interface BodyLanguageConstraints {
  eyeContact: {
    percentage: { excellent: [70, 85]; good: [55, 69]; fair: [40, 54]; poor: [0, 39] };
    consistency: { excellent: [80, 100]; good: [65, 79]; fair: [50, 64]; poor: [0, 49] };
  };
  posture: {
    alignment: { excellent: [85, 100]; good: [70, 84]; fair: [55, 69]; poor: [0, 54] };
    stability: { excellent: [80, 100]; good: [65, 79]; fair: [50, 64]; poor: [0, 49] };
  };
  facialExpressions: {
    confidence: { excellent: [75, 100]; good: [60, 74]; fair: [45, 59]; poor: [0, 44] };
    engagement: { excellent: [70, 100]; good: [55, 69]; fair: [40, 54]; poor: [0, 39] };
    nervousness: { excellent: [0, 15]; good: [16, 25]; fair: [26, 40]; poor: [41, 100] };
  };
  gestures: {
    appropriateness: { excellent: [80, 100]; good: [65, 79]; fair: [50, 64]; poor: [0, 49] };
    frequency: { optimal: [8, 18]; acceptable: [5, 25]; poor: [0, 4] | [26, 100] };
  };
}

export interface TechnicalConstraints {
  responseQuality: {
    coherence: { excellent: [85, 100]; good: [70, 84]; fair: [55, 69]; poor: [0, 54] };
    depth: { excellent: [80, 100]; good: [65, 79]; fair: [50, 64]; poor: [0, 49] };
    accuracy: { excellent: [90, 100]; good: [75, 89]; fair: [60, 74]; poor: [0, 59] };
  };
  timeManagement: {
    responseTime: { optimal: [30, 120]; acceptable: [15, 180]; poor: [0, 14] | [181, 600] };
    completeness: { excellent: [90, 100]; good: [75, 89]; fair: [60, 74]; poor: [0, 59] };
  };
}

export interface CommunicationConstraints {
  weights: {
    pronunciation: 0.30;
    fluency: 0.25;
    confidence: 0.20;
    pace: 0.15;
    clarity: 0.10;
  };
  thresholds: {
    excellent: 85;
    good: 70;
    fair: 55;
    poor: 40;
  };
}

export interface BehavioralConstraints {
  weights: {
    eyeContact: 0.30;
    posture: 0.25;
    facialExpressions: 0.20;
    gestures: 0.15;
    overall: 0.10;
  };
  thresholds: {
    excellent: 80;
    good: 65;
    fair: 50;
    poor: 35;
  };
}

export interface OverallConstraints {
  difficultyWeights: {
    easy: { technical: 0.25; communication: 0.45; behavioral: 0.30 };
    medium: { technical: 0.40; communication: 0.35; behavioral: 0.25 };
    hard: { technical: 0.55; communication: 0.30; behavioral: 0.15 };
  };
  experienceAdjustments: {
    entry: { multiplier: 1.1; maxBonus: 10 };
    mid: { multiplier: 1.0; maxBonus: 0 };
    senior: { multiplier: 0.9; maxPenalty: -15 };
  };
  scoreRanges: {
    excellent: [85, 100];
    good: [70, 84];
    fair: [55, 69];
    poor: [0, 54];
  };
}

/**
 * Strict scoring constraints instance
 */
export const SCORING_CONSTRAINTS: ScoringConstraints = {
  speech: {
    pronunciation: {
      clarity: { min: 0, max: 100, excellent: 90, good: 75, fair: 60, poor: 40 },
      articulation: { min: 0, max: 100, excellent: 85, good: 70, fair: 55, poor: 35 },
      fluency: { min: 0, max: 100, excellent: 88, good: 72, fair: 58, poor: 38 },
    },
    pace: {
      wordsPerMinute: { optimal: [140, 160], acceptable: [120, 180], poor: [0, 119] },
      pauseFrequency: { optimal: [8, 15], acceptable: [5, 20], poor: [0, 4] },
    },
    confidence: {
      volumeStability: { min: 0, max: 100, excellent: 85, good: 70, fair: 55, poor: 35 },
      voiceTremor: { min: 0, max: 100, excellent: 90, good: 75, fair: 60, poor: 40 },
      pausePattern: { min: 0, max: 100, excellent: 80, good: 65, fair: 50, poor: 30 },
    },
    fillerWords: {
      percentage: { excellent: [0, 2], good: [2.1, 4], fair: [4.1, 7], poor: [7.1, 100] },
      count: { excellent: [0, 5], good: [6, 12], fair: [13, 20], poor: [21, 1000] },
    },
  },
  bodyLanguage: {
    eyeContact: {
      percentage: { excellent: [70, 85], good: [55, 69], fair: [40, 54], poor: [0, 39] },
      consistency: { excellent: [80, 100], good: [65, 79], fair: [50, 64], poor: [0, 49] },
    },
    posture: {
      alignment: { excellent: [85, 100], good: [70, 84], fair: [55, 69], poor: [0, 54] },
      stability: { excellent: [80, 100], good: [65, 79], fair: [50, 64], poor: [0, 49] },
    },
    facialExpressions: {
      confidence: { excellent: [75, 100], good: [60, 74], fair: [45, 59], poor: [0, 44] },
      engagement: { excellent: [70, 100], good: [55, 69], fair: [40, 54], poor: [0, 39] },
      nervousness: { excellent: [0, 15], good: [16, 25], fair: [26, 40], poor: [41, 100] },
    },
    gestures: {
      appropriateness: { excellent: [80, 100], good: [65, 79], fair: [50, 64], poor: [0, 49] },
      frequency: { optimal: [8, 18], acceptable: [5, 25], poor: [0, 4] },
    },
  },
  technical: {
    responseQuality: {
      coherence: { excellent: [85, 100], good: [70, 84], fair: [55, 69], poor: [0, 54] },
      depth: { excellent: [80, 100], good: [65, 79], fair: [50, 64], poor: [0, 49] },
      accuracy: { excellent: [90, 100], good: [75, 89], fair: [60, 74], poor: [0, 59] },
    },
    timeManagement: {
      responseTime: { optimal: [30, 120], acceptable: [15, 180], poor: [0, 14] },
      completeness: { excellent: [90, 100], good: [75, 89], fair: [60, 74], poor: [0, 59] },
    },
  },
  communication: {
    weights: {
      pronunciation: 0.30,
      fluency: 0.25,
      confidence: 0.20,
      pace: 0.15,
      clarity: 0.10,
    },
    thresholds: {
      excellent: 85,
      good: 70,
      fair: 55,
      poor: 40,
    },
  },
  behavioral: {
    weights: {
      eyeContact: 0.30,
      posture: 0.25,
      facialExpressions: 0.20,
      gestures: 0.15,
      overall: 0.10,
    },
    thresholds: {
      excellent: 80,
      good: 65,
      fair: 50,
      poor: 35,
    },
  },
  overall: {
    difficultyWeights: {
      easy: { technical: 0.25, communication: 0.45, behavioral: 0.30 },
      medium: { technical: 0.40, communication: 0.35, behavioral: 0.25 },
      hard: { technical: 0.55, communication: 0.30, behavioral: 0.15 },
    },
    experienceAdjustments: {
      entry: { multiplier: 1.1, maxBonus: 10 },
      mid: { multiplier: 1.0, maxBonus: 0 },
      senior: { multiplier: 0.9, maxPenalty: -15 },
    },
    scoreRanges: {
      excellent: [85, 100],
      good: [70, 84],
      fair: [55, 69],
      poor: [0, 54],
    },
  },
};

/**
 * Utility functions for constraint validation
 */
export class ConstraintValidator {
  static validateScore(score: number, min: number = 0, max: number = 100): number {
    return Math.round(Math.max(min, Math.min(max, score)));
  }

  static isInRange(value: number, range: [number, number]): boolean {
    return value >= range[0] && value <= range[1];
  }

  static getScoreCategory(
    score: number,
    thresholds: { excellent: number; good: number; fair: number; poor: number }
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= thresholds.excellent) return 'excellent';
    if (score >= thresholds.good) return 'good';
    if (score >= thresholds.fair) return 'fair';
    return 'poor';
  }

  static validateWeights(weights: Record<string, number>): boolean {
    const sum = Object.values(weights).reduce((acc, weight) => acc + weight, 0);
    return Math.abs(sum - 1.0) < 0.001; // Allow for floating point precision
  }
}
