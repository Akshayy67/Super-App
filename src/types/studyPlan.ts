export interface DailyTask {
  day: number;
  topic: string;
  hours: number;
  tasks: string[];
  resources?: string[];
  dayType?: "study" | "rest" | "review";
  completed?: boolean;
  completedAt?: Date;
}

export interface WeekPlan {
  week: number;
  focus: string;
  summary?: string;
  learningGoals?: string[];
  recommendedHours?: number;
  description: string;
  dailyPlan: DailyTask[];
  completed?: boolean;
  completedAt?: Date;
  progress?: number; // 0-100
}

export interface StudyPlan {
  id: string;
  userId: string;
  goal: string;
  durationWeeks: number;
  dailyHours: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  currentLevel?: string;
  overview: string;
  weeks: WeekPlan[];
  timeSummary?: {
    weeklyHours: number;
    totalHours: number;
  };
  tips?: string[];
  recommendedPlatforms?: string[];
  motivation?: string;
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "completed" | "paused";
  startedAt?: Date;
  completedAt?: Date;
  totalProgress?: number; // 0-100
}

export interface StudyPlanInput {
  goal: string;
  duration: number; // weeks
  difficulty: "beginner" | "intermediate" | "advanced";
  currentLevel?: string;
  dailyHours: number;
}

