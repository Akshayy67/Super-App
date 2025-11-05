import { GoogleGenerativeAI } from "@google/generative-ai";
import { StudyPlanInput, StudyPlan, WeekPlan, DailyTask } from "../types/studyPlan";
import { unifiedAIService } from "./aiConfig";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_AI_API_KEY || ""
);

const geminiModel = genAI.getGenerativeModel({
  model: import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash",
});

class StudyPlanAIService {
  async generateStudyPlan(input: StudyPlanInput): Promise<Omit<StudyPlan, "id" | "userId" | "createdAt" | "updatedAt" | "status" | "startedAt">> {
    const prompt = this.buildPrompt(input);

    try {
      let responseText: string;
      
      try {
        // Try Gemini API directly first
        const result = await geminiModel.generateContent(prompt);
        const response = result.response;
        responseText = response.text();
      } catch (geminiError: any) {
        console.warn("Gemini API direct call failed, falling back to unified service:", geminiError);
        
        // Check error types
        const isRateLimited = geminiError?.message?.includes("429") || 
                              geminiError?.message?.includes("Resource exhausted") ||
                              geminiError?.message?.includes("quota") ||
                              (geminiError?.status === 429);
        
        const isReferrerBlocked = geminiError?.message?.includes("403") || 
                                  geminiError?.message?.includes("HTTP_REFERRER_BLOCKED") || 
                                  geminiError?.message?.includes("referer") ||
                                  geminiError?.message?.includes("referrer") ||
                                  (geminiError?.status === 403);
        
        // If rate limited, provide specific error message
        if (isRateLimited) {
          throw new Error(
            "RATE_LIMIT_EXCEEDED: You've hit the API rate limit. " +
            "Please wait a few minutes before trying again, or consider upgrading your Gemini API plan. " +
            "The rate limit is temporary and will reset automatically."
          );
        }
        
        if (isReferrerBlocked) {
          console.warn("API key referrer restriction detected. Using unified service fallback.");
        }
        
        // Fallback to unified service (only if not rate limited)
        try {
          const response = await unifiedAIService.generateResponse(prompt, "");
          
          if (!response.success || !response.data) {
            // Check if it's a rate limit error from unified service
            if (response.error?.includes("429") || response.error?.includes("rate limit")) {
              throw new Error(
                "RATE_LIMIT_EXCEEDED: You've hit the API rate limit. " +
                "Please wait a few minutes before trying again, or consider upgrading your Gemini API plan."
              );
            }
            throw new Error(response.error || "Failed to generate study plan");
          }
          
          // Check if response looks like a fallback error message (not actual data)
          const dataStr = String(response.data).trim();
          const isFallbackMessage = dataStr.startsWith("I couldn't reach the AI") || 
                                   dataStr.startsWith("Temporary AI connectivity") ||
                                   dataStr.includes("Check your API configuration") ||
                                   (dataStr.length < 100 && dataStr.includes("AI"));
          
          if (isFallbackMessage) {
            // Unified service couldn't help either - likely rate limit or API issue
            throw new Error(
              "AI_SERVICE_UNAVAILABLE: The AI service is currently unavailable. " +
              "This could be due to rate limiting or API issues. Please try again in a few minutes."
            );
          }
          
          // Check for actual error messages in the response
          if (dataStr.startsWith("Error") && !dataStr.includes("{")) {
            throw new Error(`AI service error: ${dataStr.substring(0, 200)}`);
          }
          
          responseText = response.data;
        } catch (fallbackError: any) {
          console.error("Unified service fallback also failed:", fallbackError);
          
          // Don't override rate limit errors
          if (fallbackError?.message?.includes("RATE_LIMIT_EXCEEDED")) {
            throw fallbackError;
          }
          
          // Provide helpful error message
          if (isReferrerBlocked) {
            throw new Error(
              "API_KEY_HTTP_REFERRER_BLOCKED: Your Google Cloud API key has HTTP referrer restrictions. " +
              "Please update your API key settings in Google Cloud Console to allow requests from your domain, " +
              "or remove referrer restrictions for production use."
            );
          }
          
          if (fallbackError?.message) {
            throw fallbackError;
          }
          throw new Error("Unable to generate study plan. Please check your API configuration and try again.");
        }
      }

      // Extract JSON from response (handle code blocks)
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                       responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response as JSON");
      }

      const jsonText = jsonMatch[1] || jsonMatch[0];
      const planData = JSON.parse(jsonText);

      // Debug: Log parsed data
      console.log("Parsed AI Response:", {
        hasWeeks: !!planData.weeks,
        weeksCount: planData.weeks?.length || 0,
        weeksData: planData.weeks,
        totalWeeks: planData.totalWeeks,
        duration_weeks: planData.duration_weeks,
      });

      // Validate and structure the response
      // Support both old and new format
      const totalWeeks = planData.totalWeeks || planData.duration_weeks || input.duration;
      const totalHours = planData.totalHours || planData.time_summary?.total_hours || input.dailyHours * 7 * input.duration;
      const overview = planData.overview || "";
      const summary = planData.summary || {};
      const motivation = summary.motivation || planData.motivation || "";

      // Parse weeks - ensure we have valid data
      const weeksArray = planData.weeks || [];
      if (weeksArray.length === 0) {
        console.error("AI returned empty weeks array:", planData);
        throw new Error("AI failed to generate study plan weeks. The response was invalid. Please try again.");
      }

      const parsedWeeks = this.parseWeeks(weeksArray);
      console.log("Parsed Weeks:", {
        count: parsedWeeks.length,
        firstWeek: parsedWeeks[0],
      });

      return {
        goal: input.goal,
        durationWeeks: totalWeeks,
        dailyHours: input.dailyHours,
        difficulty: input.difficulty,
        currentLevel: input.currentLevel || "",
        overview: overview,
        weeks: parsedWeeks,
        timeSummary: {
          weeklyHours: input.dailyHours * 7,
          totalHours: totalHours,
        },
        tips: planData.tips || [],
        recommendedPlatforms: planData.recommended_platforms || [],
        motivation: motivation,
        totalProgress: summary.totalProgress || 0,
      };
    } catch (error: any) {
      console.error("Error generating study plan:", error);
      
      // Provide user-friendly error message
      if (error.message && error.message.includes("API_KEY_HTTP_REFERRER_BLOCKED")) {
        throw error;
      }
      
      throw new Error(error.message || "Failed to generate study plan. Please try again.");
    }
  }

  async regenerateWeek(
    weekNumber: number,
    focus: string,
    difficulty: "beginner" | "intermediate" | "advanced",
    dailyHours: number
  ): Promise<WeekPlan> {
    const prompt = `Generate a detailed 7-day daily schedule for Week ${weekNumber} focusing on: ${focus}

Difficulty Level: ${difficulty}
Daily Available Hours: ${dailyHours}

Please create a detailed week plan with:
1. A clear focus description
2. A description explaining why this week's topics are important
3. 7 days of daily plans, each with:
   - Topic name
   - Hours per day
   - Specific actionable tasks

Format your response as JSON:
{
  "week": ${weekNumber},
  "focus": "${focus}",
  "description": "Why this week's topics are important and how they build on previous knowledge",
  "daily_plan": [
    {
      "day": 1,
      "topic": "Topic name",
      "hours": ${dailyHours},
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    ...
  ]
}

Return only the JSON object, no additional text.`;

    try {
      let responseText: string;
      
      try {
        // Try Gemini API directly first
        const result = await geminiModel.generateContent(prompt);
        const response = result.response;
        responseText = response.text();
      } catch (geminiError: any) {
        console.warn("Gemini API direct call failed, falling back to unified service:", geminiError);
        
        // Check error types
        const isRateLimited = geminiError?.message?.includes("429") || 
                              geminiError?.message?.includes("Resource exhausted") ||
                              geminiError?.message?.includes("quota") ||
                              (geminiError?.status === 429);
        
        const isReferrerBlocked = geminiError?.message?.includes("403") || 
                                  geminiError?.message?.includes("HTTP_REFERRER_BLOCKED") || 
                                  geminiError?.message?.includes("referer") ||
                                  geminiError?.message?.includes("referrer") ||
                                  (geminiError?.status === 403);
        
        // If rate limited, provide specific error message
        if (isRateLimited) {
          throw new Error(
            "RATE_LIMIT_EXCEEDED: You've hit the API rate limit. " +
            "Please wait a few minutes before trying again, or consider upgrading your Gemini API plan."
          );
        }
        
        if (isReferrerBlocked) {
          console.warn("API key referrer restriction detected. Using unified service fallback.");
        }
        
        // Fallback to unified service (only if not rate limited)
        try {
          const response = await unifiedAIService.generateResponse(prompt, "");
          
          if (!response.success || !response.data) {
            // Check if it's a rate limit error from unified service
            if (response.error?.includes("429") || response.error?.includes("rate limit")) {
              throw new Error(
                "RATE_LIMIT_EXCEEDED: You've hit the API rate limit. " +
                "Please wait a few minutes before trying again."
              );
            }
            throw new Error(response.error || "Failed to regenerate week plan");
          }
          
          // Check if response looks like a fallback error message (not actual data)
          const dataStr = String(response.data).trim();
          const isFallbackMessage = dataStr.startsWith("I couldn't reach the AI") || 
                                   dataStr.startsWith("Temporary AI connectivity") ||
                                   dataStr.includes("Check your API configuration") ||
                                   (dataStr.length < 100 && dataStr.includes("AI"));
          
          if (isFallbackMessage) {
            throw new Error(
              "AI_SERVICE_UNAVAILABLE: The AI service is currently unavailable. " +
              "This could be due to rate limiting or API issues. Please try again in a few minutes."
            );
          }
          
          responseText = response.data;
        } catch (fallbackError: any) {
          console.error("Unified service fallback also failed:", fallbackError);
          
          // Don't override rate limit errors
          if (fallbackError?.message?.includes("RATE_LIMIT_EXCEEDED")) {
            throw fallbackError;
          }
          
          if (isReferrerBlocked) {
            throw new Error(
              "API_KEY_HTTP_REFERRER_BLOCKED: Your Google Cloud API key has HTTP referrer restrictions. " +
              "Please update your API key settings in Google Cloud Console to allow requests from your domain."
            );
          }
          
          if (fallbackError?.message) {
            throw fallbackError;
          }
          throw new Error("Unable to regenerate week plan. Please check your API configuration and try again.");
        }
      }

      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                       responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }

      const jsonText = jsonMatch[1] || jsonMatch[0];
      const weekData = JSON.parse(jsonText);

      return {
        week: weekData.week || weekNumber,
        focus: weekData.focus || focus,
        description: weekData.description || "",
        dailyPlan: (weekData.daily_plan || []).map((day: any) => ({
          day: day.day,
          topic: day.topic,
          hours: day.hours || dailyHours,
          tasks: day.tasks || [],
          completed: false,
        })),
        completed: false,
        progress: 0,
      };
    } catch (error: any) {
      console.error("Error regenerating week:", error);
      
      if (error.message && error.message.includes("API_KEY_HTTP_REFERRER_BLOCKED")) {
        throw error;
      }
      
      throw new Error(error.message || "Failed to regenerate week plan. Please try again.");
    }
  }

  private buildPrompt(input: StudyPlanInput): string {
    return `You are Dream-to-Plan AI — an expert study planner and UI logic generator.

Your job:
1. Create a detailed weekly and daily study roadmap for the user's goal.
2. Provide a structured JSON output that the frontend can use to render:
   - Weekly Cards (collapsible)
   - Daily Todo Checkboxes
   - Progress tracking (linked to completion %)
3. Include clear text content and meta for rendering.

🎯 USER INPUT:
Goal: ${input.goal}
Level: ${input.currentLevel || input.difficulty} (Beginner / Intermediate / Advanced)
Duration: ${input.duration} weeks
Hours per day: ${input.dailyHours}

🧭 TASK DETAILS:
Generate:
1. **Overview** — 2–3 lines explaining what the plan covers.
2. **Weekly Cards (Array)** — Each week should include:
   - weekTitle: Title (e.g., "Week 1: Arrays & Strings")
   - focus: Short focus summary (1 paragraph)
   - studyGoals: 3–5 weekly goals (as bullet points)
   - progress: numeric field (0–100)
   - dailyTodos: list of daily tasks (each with a checkbox and completion state)
3. **Daily Todos (Array inside week)** — Each todo should include:
   - day: numeric
   - topic: string (topic or focus)
   - tasks: array of 1–3 actionable items
   - hours: integer
   - isCompleted: boolean (default false)
   - resources: optional string list
4. **Progress Calculation**
   - Each daily todo completed = +1 toward week progress.
   - Each week's completion = sum of its daily completions / total days.
   - Global progress = average of all week progress values.
5. **Summary**
   - Total duration (weeks)
   - Total estimated study hours
   - Motivation line

💻 OUTPUT FORMAT (STRICT JSON):
Return only valid JSON like this:

{
  "overview": "This plan builds your DSA foundation over ${input.duration} weeks of focused learning.",
  "totalWeeks": ${input.duration},
  "totalHours": ${input.dailyHours * 7 * input.duration},
  "weeks": [
    {
      "weekTitle": "Week 1: Arrays & Strings",
      "focus": "Master arrays, strings, and basic problem-solving patterns.",
      "studyGoals": [
        "Understand array memory layout and operations",
        "Learn two-pointer and sliding window patterns",
        "Practice 10+ beginner DSA problems"
      ],
      "progress": 0,
      "dailyTodos": [
        {
          "day": 1,
          "topic": "Array Basics",
          "tasks": [
            "Learn array declaration and traversal",
            "Solve 5 easy problems on LeetCode"
          ],
          "hours": ${input.dailyHours},
          "isCompleted": false,
          "resources": ["NeetCode.io", "GeeksforGeeks Arrays"]
        },
        {
          "day": 2,
          "topic": "Two Pointer Technique",
          "tasks": [
            "Learn two-pointer pattern",
            "Solve 3 medium LeetCode problems"
          ],
          "hours": ${input.dailyHours},
          "isCompleted": false
        },
        ... (continue for all 7 days)
      ]
    },
    ... (continue for all ${input.duration} weeks)
  ],
  "summary": {
    "totalProgress": 0,
    "motivation": "Stay consistent — one concept a day compounds into mastery!"
  }
}

🪄 FRONTEND INSTRUCTIONS (for developer rendering):
- Render each week as a collapsible card (expand to show dailyTodos).
- Each dailyTodo should have:
  - Checkbox → toggles isCompleted
  - Auto-update parent week's progress field
  - Update global progress bar (avg of all weeks)
- Display progress value in the global progress bar at top.
- Show "Sync to Calendar" button linking planned days to user's calendar.

📦 OUTPUT REQUIREMENT:
Return *only* the JSON object described above — no extra commentary.
Ensure it includes exactly ${input.duration} weeks, each with 7 days of todos.

IMPORTANT REQUIREMENTS:
1. STRUCTURE:
   - Create exactly ${input.duration} weeks
   - Each week must have exactly 7 dailyTodos
   - Day 7 should typically be for rest/revision/recap (set hours to 0 or 1-2)
   - Days 1-6 should be active study days

2. CONTENT QUALITY:
   - Make tasks SPECIFIC and ACTIONABLE (e.g., "Solve 3 LeetCode easy problems" not just "Practice")
   - Include 3-5 study goals for each week
   - Progress from basic to advanced concepts logically
   - Each task should be clear and achievable
   - Include relevant resources when helpful

3. TONE & STYLE:
   - Friendly, professional, and action-oriented
   - Use motivational language
   - Make it sound encouraging but realistic

4. DIFFICULTY ADAPTATION:
   - Beginner: Focus on fundamentals, simpler examples, more explanation
   - Intermediate: Balance theory and practice, moderate complexity
   - Advanced: More challenging problems, deeper concepts, faster pace

5. TIME ALLOCATION:
   - Respect the daily hours (${input.dailyHours}h/day)
   - Weekends (Day 7) can be lighter (0-2 hours)
   - Ensure realistic time distribution

6. WEEKLY PROGRESSION:
   - Week 1: Foundation building
   - Week 2-${input.duration - 1}: Core concepts and practice
   - Final week: Review, integration, and advanced topics

Return ONLY the JSON object, no additional text or markdown formatting outside the JSON.`;
  }

  private parseWeeks(weeksData: any[]): WeekPlan[] {
    return weeksData.map((week: any, weekIndex: number) => {
      // Support both old format (weekTitle, dailyTodos) and new format (week, daily_plan)
      const weekNumber = week.week || weekIndex + 1;
      const weekTitle = week.weekTitle || `Week ${weekNumber}: ${week.focus || ""}`;
      const focus = week.focus || weekTitle.split(": ")[1] || "";
      
      // Parse daily todos - support both dailyTodos and daily_plan
      const dailyTodos = week.dailyTodos || week.daily_plan || [];
      
      return {
        week: weekNumber,
        focus: weekTitle,
        summary: week.summary || focus,
        learningGoals: week.studyGoals || week.learning_goals || [],
        recommendedHours: week.recommended_hours || week.recommendedHours,
        description: week.focus || week.description || "",
        dailyPlan: dailyTodos.map((day: any) => ({
          day: day.day || 0,
          topic: day.topic || "",
          hours: day.hours || 0,
          tasks: day.tasks || [],
          resources: day.resources || [],
          dayType: day.day_type || day.dayType || (day.day === 7 ? "rest" : "study"),
          completed: day.isCompleted !== undefined ? day.isCompleted : (day.completed || false),
        })),
        completed: false,
        progress: week.progress || 0,
      };
    });
  }
}

export const studyPlanAIService = new StudyPlanAIService();

