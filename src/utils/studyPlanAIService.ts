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
    // Log the input parameters for debugging
    console.log("📚 Generating Study Plan with parameters:", {
      goal: input.goal,
      difficulty: input.difficulty,
      currentLevel: input.currentLevel || 'Not specified',
      duration: input.duration,
      dailyHours: input.dailyHours,
    });

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
        
        // If rate limited, provide generic error message
        if (isRateLimited) {
          throw new Error(
            "Our AI servers are busy right now. Please try again in a few moments."
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
                "Our AI servers are busy right now. Please try again in a few moments."
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
              "Our AI servers are busy right now. Please try again in a few moments."
            );
          }
          
          // Check for actual error messages in the response
          if (dataStr.startsWith("Error") && !dataStr.includes("{")) {
            throw new Error(`AI service error: ${dataStr.substring(0, 200)}`);
          }
          
          responseText = response.data;
        } catch (fallbackError: any) {
          console.error("Unified service fallback also failed:", fallbackError);
          
          // Don't override rate limit errors - they're already generic
          if (fallbackError?.message?.includes("Our AI servers are busy")) {
            throw fallbackError;
          }
          
          // Provide helpful error message
          if (isReferrerBlocked) {
            throw new Error(
              "Service temporarily unavailable. Please try again later."
            );
          }
          
          if (fallbackError?.message) {
            throw fallbackError;
          }
          throw new Error("Our AI servers are busy right now. Please try again in a few moments.");
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
        
        // If rate limited, provide generic error message
        if (isRateLimited) {
          throw new Error(
            "Our AI servers are busy right now. Please try again in a few moments."
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
                "Our AI servers are busy right now. Please try again in a few moments."
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
              "Our AI servers are busy right now. Please try again in a few moments."
            );
          }
          
          responseText = response.data;
        } catch (fallbackError: any) {
          console.error("Unified service fallback also failed:", fallbackError);
          
          // Don't override rate limit errors - they're already generic
          if (fallbackError?.message?.includes("Our AI servers are busy")) {
            throw fallbackError;
          }
          
          if (isReferrerBlocked) {
            throw new Error(
              "Service temporarily unavailable. Please try again later."
            );
          }
          
          if (fallbackError?.message) {
            throw fallbackError;
          }
          throw new Error("Our AI servers are busy right now. Please try again in a few moments.");
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
    // Determine actual difficulty level considering both inputs
    const effectiveLevel = input.currentLevel?.toLowerCase() || input.difficulty;
    const isBeginnerLevel = effectiveLevel.includes('beginner') || input.difficulty === 'beginner';
    const isIntermediateLevel = effectiveLevel.includes('intermediate') || input.difficulty === 'intermediate';
    const isAdvancedLevel = effectiveLevel.includes('advanced') || input.difficulty === 'advanced';

    return `You are Dream-to-Plan AI — an expert study planner and UI logic generator specializing in personalized learning paths.

Your job:
1. Create a detailed weekly and daily study roadmap STRICTLY TAILORED to the user's CURRENT LEVEL and DIFFICULTY.
2. Provide a structured JSON output that the frontend can use to render:
   - Weekly Cards (collapsible)
   - Daily Todo Checkboxes
   - Progress tracking (linked to completion %)
3. Include clear text content and meta for rendering.

🎯 USER INPUT:
Goal: ${input.goal}
Current Level: ${input.currentLevel || 'Not specified'}
Difficulty: ${input.difficulty.toUpperCase()}
Duration: ${input.duration} weeks
Hours per day: ${input.dailyHours}

⚠️ CRITICAL REQUIREMENTS - MUST FOLLOW:

${isBeginnerLevel ? `
📌 BEGINNER LEVEL ADAPTATION:
- Start with ABSOLUTE BASICS and fundamental concepts
- Use simple, clear language without jargon
- Provide step-by-step explanations for everything
- Include MORE hands-on examples and practice exercises (easier difficulty)
- Break down complex topics into VERY SMALL digestible chunks
- Assume NO prior knowledge unless explicitly stated
- First week should focus on introduction, tools/setup, and basic terminology
- Progress SLOWLY - spend more time on foundations
- Include more "why" explanations to build understanding
- Avoid advanced topics or mention them only as "future learning"
- Tasks should be simple and achievable (e.g., "Learn basic terminology", "Try 3 simple exercises", "Watch introduction video")
- Resources should be beginner-friendly (tutorials, visual guides, interactive platforms, YouTube basics)
` : isIntermediateLevel ? `
📌 INTERMEDIATE LEVEL ADAPTATION:
- Assume basic knowledge of fundamentals
- Focus on building DEPTH and practical application
- Include moderate complexity challenges and projects
- Introduce best practices and advanced techniques
- Balance theory with hands-on practice (50/50)
- Week 1 can start with review but quickly move to intermediate concepts
- Include some challenging tasks but ensure they're achievable
- Explain "why" for complex concepts but less hand-holding
- Introduce optimization and efficiency in the subject area
- Tasks should be specific and moderately challenging (e.g., "Complete intermediate exercises", "Create a small project", "Practice advanced techniques")
- Resources should include specialized guides, community articles, practice platforms, and structured courses
` : `
📌 ADVANCED LEVEL ADAPTATION:
- Assume strong foundation in fundamentals and intermediate concepts
- Focus on ADVANCED techniques, mastery, and expert-level application
- Include complex challenges and real-world professional projects
- Emphasize best practices, expert-level execution, and professional standards
- Week 1 should dive into advanced topics immediately
- Include challenging expert-level tasks and comprehensive projects
- Minimal hand-holding - focus on depth and mastery
- Introduce cutting-edge techniques and professional/academic resources
- Expect learner to connect concepts independently and do research
- Tasks should be challenging and comprehensive (e.g., "Create advanced project", "Research and implement cutting-edge techniques", "Master professional-level skills")
- Resources should include academic papers, advanced courses, professional guides, and expert-level content
`}

🎓 LEARNING GOAL ALIGNMENT:
- Every week MUST directly contribute to achieving: "${input.goal}"
- Week titles should explicitly reference the goal
- Daily tasks should clearly connect to the end goal
- Progress should be measurable toward the stated goal
- Final week should include goal achievement verification/project

📚 SUBJECT DOMAIN ADAPTATION (CRITICAL):
Analyze the goal "${input.goal}" and ADAPT ALL content to the specific subject domain:

**For Programming/Tech:** Use coding exercises, projects, debugging tasks, documentation reading
**For Languages:** Use vocabulary, grammar, conversation practice, listening/reading comprehension
**For Arts/Design:** Use sketching, practice pieces, studies, portfolio projects, critique
**For Music:** Use scales, exercises, pieces to learn, ear training, performance practice
**For Business/Marketing:** Use case studies, strategy development, market analysis, campaigns
**For Fitness/Sports:** Use workout routines, skill drills, endurance training, technique practice
**For Writing:** Use writing exercises, drafts, editing, reading assignments, style practice
**For Science:** Use experiments, problem sets, paper reading, lab work, theory study
**For Other Subjects:** Identify the domain from the goal and adapt accordingly

IMPORTANT: 
- Use domain-specific terminology throughout
- Recommend domain-appropriate resources (not generic ones)
- Structure tasks in the way practitioners in that field actually learn
- Include domain-specific best practices and methods
- Use realistic examples from that field

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

⏰ TIME ALLOCATION RULES (STRICTLY ENFORCE):
- User has ${input.dailyHours} hours per day
- Days 1-6: Active study days with full hours (${input.dailyHours}h each)
- Day 7: MUST be rest/review/recap day with REDUCED hours (0-2 hours max)
${isBeginnerLevel ? '- Beginners need MORE practice time and LESS theory (40% theory, 60% practice)' : ''}
${isIntermediateLevel ? '- Intermediate learners need BALANCED time (50% theory, 50% practice)' : ''}
${isAdvancedLevel ? '- Advanced learners need MORE application time (30% theory, 70% implementation/projects)' : ''}
- Each day's tasks MUST be achievable within the allocated hours
- Include specific time estimates for each task (e.g., "2 hours for X, 1 hour for Y")

💻 OUTPUT FORMAT (STRICT JSON):
Return only valid JSON like this:

{
  "overview": "This plan will help you achieve '${input.goal}' over ${input.duration} weeks through structured, ${input.difficulty}-level learning.",
  "totalWeeks": ${input.duration},
  "totalHours": ${input.dailyHours * 7 * input.duration},
  "weeks": [
    {
      "weekTitle": "Week 1: [Subject-Appropriate Title for First Week]",
      "focus": "[Brief description of this week's focus area]",
      "studyGoals": [
        "[Specific, measurable goal 1 for this week]",
        "[Specific, measurable goal 2 for this week]",
        "[Specific, measurable goal 3 for this week]"
      ],
      "progress": 0,
      "dailyTodos": [
        {
          "day": 1,
          "topic": "[Topic appropriate to the goal]",
          "tasks": [
            "[Specific, actionable task 1 - with time estimate]",
            "[Specific, actionable task 2 - with time estimate]"
          ],
          "hours": ${input.dailyHours},
          "isCompleted": false,
          "resources": ["[Domain-appropriate resource 1]", "[Domain-appropriate resource 2]"]
        },
        {
          "day": 2,
          "topic": "[Next topic]",
          "tasks": [
            "[Task 1 for day 2]",
            "[Task 2 for day 2]"
          ],
          "hours": ${input.dailyHours},
          "isCompleted": false
        },
        ... (continue for days 3-6 with full hours),
        {
          "day": 7,
          "topic": "Rest & Review",
          "tasks": [
            "Review this week's learning",
            "Rest and consolidate knowledge"
          ],
          "hours": 1,
          "isCompleted": false,
          "dayType": "rest"
        }
      ]
    },
    ... (continue for all ${input.duration} weeks)
  ],
  "summary": {
    "totalProgress": 0,
    "motivation": "[Motivational message related to the goal]"
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
   - Day 7 MUST be rest/revision/recap (0-2 hours max, marked as "rest" dayType)
   - Days 1-6 should be active study days

2. CONTENT QUALITY BASED ON LEVEL:
${isBeginnerLevel ? `   - BEGINNER: Tasks must be VERY SIMPLE and ACHIEVABLE (e.g., "Read tutorial on variables", "Complete 2 basic exercises")
   - Use encouraging language: "Learn", "Understand", "Try", "Practice"
   - Break down every concept into smallest possible steps
   - Include explanations and "why this matters" context
   - Avoid jargon or define it immediately
   - 3-5 simple, clear study goals per week` : ''}
${isIntermediateLevel ? `   - INTERMEDIATE: Tasks should be SPECIFIC and MODERATELY CHALLENGING (e.g., "Implement binary search", "Solve 5 medium LeetCode problems")
   - Balance conceptual understanding with practical application
   - Include optimization and best practices
   - Reference multiple resources and approaches
   - 4-6 concrete study goals per week` : ''}
${isAdvancedLevel ? `   - ADVANCED: Tasks must be CHALLENGING and COMPREHENSIVE (e.g., "Design scalable system architecture", "Implement advanced algorithm with optimization")
   - Focus on depth, edge cases, and real-world scenarios
   - Include system design and architectural considerations
   - Expect independent research and problem-solving
   - 5-7 ambitious study goals per week` : ''}
   - ALL LEVELS: Make tasks ACTIONABLE with clear outcomes

3. TONE & STYLE:
   - Friendly, professional, and action-oriented
   - Use motivational language appropriate to level
${isBeginnerLevel ? '   - BEGINNER: Extra encouraging, patient, emphasize progress over perfection' : ''}
${isIntermediateLevel ? '   - INTERMEDIATE: Balanced encouragement, focus on skill building' : ''}
${isAdvancedLevel ? '   - ADVANCED: Challenge-focused, emphasize mastery and innovation' : ''}

4. DIFFICULTY ADAPTATION (CRITICAL):
${isBeginnerLevel ? `   - BEGINNER SPECIFIC:
     * Week 1: Introduction to the subject, basic setup/preparation, fundamental terminology
     * Week 2-3: One concept at a time, lots of beginner-level practice
     * Later weeks: Gradually combine concepts but keep complexity low
     * NO advanced topics - stay focused on fundamentals
     * Focus: Understanding > Speed, Quality > Quantity, Build Confidence
     * Approach: "Learn X" → "Try simple X" → "Practice basic X" → "Review and consolidate"` : ''}
${isIntermediateLevel ? `   - INTERMEDIATE SPECIFIC:
     * Week 1: Quick review of basics + introduce intermediate concepts
     * Week 2-${Math.ceil(input.duration * 0.6)}: Core intermediate skills and techniques
     * Week ${Math.ceil(input.duration * 0.6) + 1}-${input.duration}: Practical applications and intermediate projects
     * Include: Best practices, efficient methods, common pitfalls
     * Focus: Depth + Breadth, Theory + Practice, Real Applications
     * Approach: "Review basics" → "Learn intermediate X" → "Apply in context" → "Create project"` : ''}
${isAdvancedLevel ? `   - ADVANCED SPECIFIC:
     * Week 1: Jump into advanced/expert topics immediately
     * Week 2-${Math.ceil(input.duration * 0.5)}: Deep dive into advanced techniques and mastery
     * Week ${Math.ceil(input.duration * 0.5) + 1}-${input.duration}: Complex projects and professional-level work
     * Include: Expert techniques, research-level content, professional standards
     * Focus: Mastery + Innovation, Professional + Research, Cutting-edge
     * Approach: "Master advanced X" → "Research latest techniques" → "Create professional project" → "Innovate"` : ''}

5. TIME ALLOCATION (MUST FOLLOW):
   - Total available: ${input.dailyHours}h/day × 6 active days = ${input.dailyHours * 6}h/week
   - Day 7: 0-2 hours only (rest/review)
   - Each task MUST include estimated time
   - Daily total MUST NOT exceed ${input.dailyHours}h
   - Tasks should fill the available time but leave buffer for breaks

6. WEEKLY PROGRESSION (TAILORED TO GOAL):
   - ALL weeks must clearly advance toward: "${input.goal}"
   - Week 1: ${isBeginnerLevel ? 'Absolute basics and environment setup' : isIntermediateLevel ? 'Review and intermediate foundations' : 'Advanced concepts immediately'}
   - Middle weeks: Build progressively toward the goal
   - Final week: ${isBeginnerLevel ? 'Simple project demonstrating learned concepts' : isIntermediateLevel ? 'Comprehensive project applying all skills' : 'Complex capstone project or research'}
   - Each week's focus should be a milestone toward the goal

7. RESOURCE QUALITY (ADAPT TO SUBJECT):
${isBeginnerLevel ? '   - BEGINNER: Interactive tutorials, visual guides, beginner courses, YouTube basics, step-by-step guides, beginner books/articles' : ''}
${isIntermediateLevel ? '   - INTERMEDIATE: Specialized guides, community articles, structured courses, practice platforms, intermediate books, expert blogs' : ''}
${isAdvancedLevel ? '   - ADVANCED: Academic papers, professional guides, advanced courses, expert-level content, research materials, professional communities' : ''}

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

  async generateDayDetails(
    goal: string,
    weekFocus: string,
    day: DailyTask,
    difficulty: "beginner" | "intermediate" | "advanced"
  ): Promise<{
    suggestions: string[];
    detailedTasks: Array<{
      task: string;
      description: string;
      estimatedTime: string;
      priority: "high" | "medium" | "low";
    }>;
    resources: Array<{
      title: string;
      url: string;
      type: "video" | "article" | "course" | "practice" | "documentation";
      description: string;
    }>;
    tips: string[];
    motivation: string;
  }> {
    const prompt = `You are an expert study planner. Generate detailed suggestions and resources for a specific day in a study plan.

Goal: ${goal}
Week Focus: ${weekFocus}
Day Topic: ${day.topic}
Day Hours: ${day.hours}
Difficulty: ${difficulty}

Existing Tasks:
${day.tasks.map(t => `- ${t}`).join('\n')}

Generate:
1. **Suggestions for today** - 3-5 actionable suggestions to maximize learning
2. **Detailed task breakdown** - Expand each existing task with:
   - Detailed description
   - Estimated time
   - Priority level
3. **Learning resources** - Provide 5-8 relevant resources with:
   - Title
   - URL (use real URLs from platforms like YouTube, Coursera, LeetCode, etc.)
   - Type (video/article/course/practice/documentation)
   - Brief description
4. **Study tips** - 3-5 tips specific to today's topic
5. **Motivation** - A brief motivational message

Return JSON format:
{
  "suggestions": ["Suggestion 1", "Suggestion 2", ...],
  "detailedTasks": [
    {
      "task": "Task name",
      "description": "Detailed explanation",
      "estimatedTime": "30 minutes",
      "priority": "high|medium|low"
    }
  ],
  "resources": [
    {
      "title": "Resource title",
      "url": "https://example.com/resource",
      "type": "video|article|course|practice|documentation",
      "description": "What this resource covers"
    }
  ],
  "tips": ["Tip 1", "Tip 2", ...],
  "motivation": "Motivational message for today"
}

IMPORTANT: 
- Use real, working URLs from popular platforms
- Make suggestions specific and actionable
- Prioritize tasks based on importance
- Include a mix of resource types
- Make tips practical and applicable

Return ONLY the JSON object, no additional text.`;

    try {
      let responseText: string;
      
      try {
        const result = await geminiModel.generateContent(prompt);
        responseText = result.response.text();
      } catch (geminiError: any) {
        console.warn("Gemini API failed, using fallback:", geminiError);
        const response = await unifiedAIService.generateResponse(prompt, "");
        if (!response.success || !response.data) {
          throw new Error(response.error || "Failed to generate day details");
        }
        responseText = response.data;
      }

      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                       responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }

      const jsonText = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonText);
    } catch (error: any) {
      console.error("Error generating day details:", error);
      // Return fallback data
      return {
        suggestions: [
          `Focus on understanding the core concepts of ${day.topic}`,
          `Practice with hands-on exercises`,
          `Take notes and review key points`
        ],
        detailedTasks: day.tasks.map(task => ({
          task,
          description: `Complete: ${task}`,
          estimatedTime: `${Math.floor(day.hours / day.tasks.length)} hours`,
          priority: "medium" as const
        })),
        resources: day.resources?.map(resource => ({
          title: resource,
          url: `https://www.google.com/search?q=${encodeURIComponent(resource)}`,
          type: "article" as const,
          description: `Learn about ${resource}`
        })) || [],
        tips: [
          "Break down complex topics into smaller chunks",
          "Take regular breaks to maintain focus",
          "Practice actively rather than just reading"
        ],
        motivation: `You're making progress on ${day.topic}! Keep going!`
      };
    }
  }
}

export const studyPlanAIService = new StudyPlanAIService();

