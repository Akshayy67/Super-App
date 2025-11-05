import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { StudyPlan, StudyPlanInput } from "../types/studyPlan";
import { realTimeAuth } from "./realTimeAuth";

// Helper function to safely convert Date to Timestamp
const toTimestamp = (date: Date | Timestamp | null | undefined): Timestamp | null => {
  if (!date) return null;
  if (date instanceof Timestamp) return date;
  if (date instanceof Date) return Timestamp.fromDate(date);
  // If it's already a Timestamp-like object or has toDate method, try converting
  if (typeof date === 'object' && 'toDate' in date) {
    return date as Timestamp;
  }
  return null;
};

class StudyPlanService {
  private getPlansCollection(userId: string) {
    return collection(db, "users", userId, "studyPlans");
  }

  async createPlan(input: StudyPlanInput): Promise<string> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const planData = {
      userId: user.id,
      goal: input.goal,
      durationWeeks: input.duration,
      dailyHours: input.dailyHours,
      difficulty: input.difficulty,
      currentLevel: input.currentLevel || "",
      overview: "",
      weeks: [],
      status: "active" as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      startedAt: serverTimestamp(),
    };

    const docRef = await addDoc(this.getPlansCollection(user.id), planData);
    return docRef.id;
  }

  async getPlans(userId: string): Promise<StudyPlan[]> {
    const snapshot = await getDocs(
      query(
        this.getPlansCollection(userId),
        orderBy("createdAt", "desc")
      )
    );

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        startedAt: data.startedAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        weeks: (data.weeks || []).map((week: any) => ({
          ...week,
          completedAt: week.completedAt?.toDate(),
          dailyPlan: (week.dailyPlan || []).map((day: any) => ({
            ...day,
            completedAt: day.completedAt?.toDate(),
          })),
        })),
      } as StudyPlan;
    });
  }

  async getPlan(userId: string, planId: string): Promise<StudyPlan | null> {
    const plans = await this.getPlans(userId);
    return plans.find((p) => p.id === planId) || null;
  }

  async updatePlan(
    userId: string,
    planId: string,
    updates: Partial<StudyPlan>
  ): Promise<void> {
    const planRef = doc(this.getPlansCollection(userId), planId);
    
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    // Only include defined fields
    if (updates.overview !== undefined) updateData.overview = updates.overview;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.totalProgress !== undefined) updateData.totalProgress = updates.totalProgress;
    if (updates.motivation !== undefined) updateData.motivation = updates.motivation;
    if (updates.tips !== undefined) updateData.tips = updates.tips || [];
    if (updates.recommendedPlatforms !== undefined) updateData.recommendedPlatforms = updates.recommendedPlatforms || [];

    // Convert Date objects to Timestamps
    const completedAtTimestamp = toTimestamp(updates.completedAt);
    if (completedAtTimestamp) {
      updateData.completedAt = completedAtTimestamp;
    }
    const startedAtTimestamp = toTimestamp(updates.startedAt);
    if (startedAtTimestamp) {
      updateData.startedAt = startedAtTimestamp;
    }

    // Handle timeSummary
    if (updates.timeSummary) {
      updateData.timeSummary = {
        weeklyHours: updates.timeSummary.weeklyHours || 0,
        totalHours: updates.timeSummary.totalHours || 0,
      };
    }

    // Convert weeks array properly - need to convert nested Date objects and remove undefined values
    if (updates.weeks !== undefined) {
      updateData.weeks = (updates.weeks || []).map((week) => {
        const weekData: any = {
          week: week.week || 0,
          focus: week.focus || "",
          description: week.description || "",
          progress: week.progress || 0,
          completed: week.completed || false,
          dailyPlan: (week.dailyPlan || []).map((day) => ({
            day: day.day || 0,
            topic: day.topic || "",
            hours: day.hours || 0,
            tasks: day.tasks || [],
            completed: day.completed || false,
            resources: day.resources || [],
            dayType: day.dayType || "study",
          })),
        };

        // Only add optional fields if they exist
        if (week.summary) weekData.summary = week.summary;
        if (week.learningGoals && week.learningGoals.length > 0) weekData.learningGoals = week.learningGoals;
        if (week.recommendedHours !== undefined) weekData.recommendedHours = week.recommendedHours;
        const weekCompletedAtTimestamp = toTimestamp(week.completedAt);
        if (weekCompletedAtTimestamp) weekData.completedAt = weekCompletedAtTimestamp;

        return weekData;
      });
    }

    await updateDoc(planRef, updateData);
  }

  async updateWeek(
    userId: string,
    planId: string,
    weekIndex: number,
    updates: Partial<StudyPlan["weeks"][0]>
  ): Promise<void> {
    const plan = await this.getPlan(userId, planId);
    if (!plan) throw new Error("Plan not found");

    const weeks = [...plan.weeks];
    const existingWeek = weeks[weekIndex];
    
    // Build updated week data, filtering out undefined values
    const weekData: any = {
      week: existingWeek.week,
      focus: existingWeek.focus,
      description: existingWeek.description,
      progress: existingWeek.progress || 0,
      completed: existingWeek.completed || false,
      dailyPlan: existingWeek.dailyPlan || [],
    };

    // Only update defined fields
    if (updates.summary !== undefined) weekData.summary = updates.summary;
    if (updates.learningGoals !== undefined) weekData.learningGoals = updates.learningGoals || [];
    if (updates.recommendedHours !== undefined) weekData.recommendedHours = updates.recommendedHours;
    if (updates.progress !== undefined) weekData.progress = updates.progress;
    if (updates.completed !== undefined) weekData.completed = updates.completed;
    if (updates.description !== undefined) weekData.description = updates.description;
    if (updates.focus !== undefined) weekData.focus = updates.focus;
    if (updates.dailyPlan !== undefined) weekData.dailyPlan = updates.dailyPlan;

    // Convert Date to Timestamp if needed
    const weekCompletedAtTimestamp = updates.completedAt
      ? toTimestamp(updates.completedAt)
      : toTimestamp(existingWeek.completedAt);
    if (weekCompletedAtTimestamp) {
      weekData.completedAt = weekCompletedAtTimestamp;
    }

    weeks[weekIndex] = weekData;

    const planRef = doc(this.getPlansCollection(userId), planId);
    
    // Convert all weeks data properly, removing undefined values
    const weeksData = weeks.map((w) => {
      const weekData: any = {
        week: w.week || 0,
        focus: w.focus || "",
        description: w.description || "",
        progress: w.progress || 0,
        completed: w.completed || false,
        dailyPlan: (w.dailyPlan || []).map((day) => {
          const dayData: any = {
            day: day.day || 0,
            topic: day.topic || "",
            hours: day.hours || 0,
            tasks: day.tasks || [],
            completed: day.completed || false,
            resources: day.resources || [],
            dayType: day.dayType || "study",
          };
          const dayCompletedAtTimestamp = toTimestamp(day.completedAt);
          if (dayCompletedAtTimestamp) {
            dayData.completedAt = dayCompletedAtTimestamp;
          }
          return dayData;
        }),
      };

      // Only add optional fields if they exist
      if (w.summary) weekData.summary = w.summary;
      if (w.learningGoals && w.learningGoals.length > 0) weekData.learningGoals = w.learningGoals;
      if (w.recommendedHours !== undefined) weekData.recommendedHours = w.recommendedHours;
      const weekCompletedAtTimestamp = toTimestamp(w.completedAt);
      if (weekCompletedAtTimestamp) {
        weekData.completedAt = weekCompletedAtTimestamp;
      }

      return weekData;
    });

    await updateDoc(planRef, {
      weeks: weeksData,
      updatedAt: serverTimestamp(),
    });
  }

  async updateTask(
    userId: string,
    planId: string,
    weekIndex: number,
    dayIndex: number,
    updates: Partial<StudyPlan["weeks"][0]["dailyPlan"][0]>
  ): Promise<void> {
    const plan = await this.getPlan(userId, planId);
    if (!plan) throw new Error("Plan not found");

    const weeks = [...plan.weeks];
    const week = { ...weeks[weekIndex] };
    const dailyPlan = [...week.dailyPlan];
    const existingDay = dailyPlan[dayIndex];
    
    // Build updated day data, filtering out undefined values
    const dayData: any = {
      day: existingDay.day,
      topic: existingDay.topic || "",
      hours: existingDay.hours || 0,
      tasks: existingDay.tasks || [],
      completed: existingDay.completed || false,
      resources: existingDay.resources || [],
      dayType: existingDay.dayType || "study",
    };

    // Only update defined fields
    if (updates.day !== undefined) dayData.day = updates.day;
    if (updates.topic !== undefined) dayData.topic = updates.topic;
    if (updates.hours !== undefined) dayData.hours = updates.hours;
    if (updates.tasks !== undefined) dayData.tasks = updates.tasks || [];
    if (updates.completed !== undefined) dayData.completed = updates.completed;
    if (updates.resources !== undefined) dayData.resources = updates.resources || [];
    if (updates.dayType !== undefined) dayData.dayType = updates.dayType;

    // Convert Date to Timestamp if needed
    const completedAtTimestamp = updates.completedAt 
      ? toTimestamp(updates.completedAt)
      : toTimestamp(existingDay.completedAt);
    if (completedAtTimestamp) {
      dayData.completedAt = completedAtTimestamp;
    }

    dailyPlan[dayIndex] = dayData;
    week.dailyPlan = dailyPlan;
    weeks[weekIndex] = week;

    // Calculate week progress
    const completedTasks = dailyPlan.filter((d) => d.completed).length;
    week.progress = (completedTasks / dailyPlan.length) * 100;

    // Calculate total plan progress
    const totalTasks = weeks.reduce((sum, w) => sum + (w.dailyPlan?.length || 0), 0);
    const totalCompleted = weeks.reduce(
      (sum, w) =>
        sum + (w.dailyPlan || []).filter((d) => d.completed).length,
      0
    );
    const totalProgress = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

    const planRef = doc(this.getPlansCollection(userId), planId);
    
    // Convert all weeks data properly, removing undefined values
    const weeksData = weeks.map((w) => {
      const weekData: any = {
        week: w.week || 0,
        focus: w.focus || "",
        description: w.description || "",
        progress: w.progress || 0,
        completed: w.completed || false,
        dailyPlan: (w.dailyPlan || []).map((day) => {
          const dayData: any = {
            day: day.day || 0,
            topic: day.topic || "",
            hours: day.hours || 0,
            tasks: day.tasks || [],
            completed: day.completed || false,
            resources: day.resources || [],
            dayType: day.dayType || "study",
          };
          const dayCompletedAtTimestamp = toTimestamp(day.completedAt);
          if (dayCompletedAtTimestamp) {
            dayData.completedAt = dayCompletedAtTimestamp;
          }
          return dayData;
        }),
      };

      // Only add optional fields if they exist
      if (w.summary) weekData.summary = w.summary;
      if (w.learningGoals && w.learningGoals.length > 0) weekData.learningGoals = w.learningGoals;
      if (w.recommendedHours !== undefined) weekData.recommendedHours = w.recommendedHours;
      const weekCompletedAtTimestamp = toTimestamp(w.completedAt);
      if (weekCompletedAtTimestamp) {
        weekData.completedAt = weekCompletedAtTimestamp;
      }

      return weekData;
    });

    await updateDoc(planRef, {
      weeks: weeksData,
      totalProgress,
      updatedAt: serverTimestamp(),
    });
  }

  async deletePlan(userId: string, planId: string): Promise<void> {
    await deleteDoc(doc(this.getPlansCollection(userId), planId));
  }

  async regeneratePlan(
    userId: string,
    planId: string,
    newDuration?: number,
    newDifficulty?: "beginner" | "intermediate" | "advanced"
  ): Promise<void> {
    const plan = await this.getPlan(userId, planId);
    if (!plan) throw new Error("Plan not found");

    // This will be called after AI generates a new plan
    // The AI service will update the plan with new weeks
  }
}

export const studyPlanService = new StudyPlanService();

