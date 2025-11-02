import { unifiedAIService } from "./aiConfig";
import { journalService, type JournalEntry, type DreamToPlanResult } from "./journalService";
import { firestoreUserTasks } from "./firestoreUserTasks";
import { calendarService, type MeetingRequest } from "./calendarService";
import { realTimeAuth } from "./realTimeAuth";
import { teamManagementService } from "../team/utils/teamManagement";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI for direct intent detection
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_AI_API_KEY || "");
const geminiModel = genAI.getGenerativeModel({
  model: import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash",
});

class DreamToPlanService {
  async analyzeJournalAndSuggestGoals(
    journalContent: string,
    journalDate?: Date
  ): Promise<DreamToPlanResult> {
    const prompt = `You are an intelligent journal analyzer. Analyze the following text and extract themes, goals, and actionable items. Be VERY precise in your analysis.

User Text:
"${journalContent}"

ANALYSIS INSTRUCTIONS:

1. THEME ANALYSIS: Identify key themes, topics, and recurring ideas in the journal entry. Look for:
   - Emotional patterns (stress, excitement, motivation, etc.)
   - Work/school topics (assignments, projects, subjects)
   - Personal development themes (health, relationships, hobbies)
   - Achievement/personal growth themes
   - Struggle/challenge themes
   Provide 2-5 key themes with confidence scores (0-100).

2. GOAL EXTRACTION: Identify any explicit or implicit goals mentioned in the journal entry. Look for:
   - Long-term aspirations and dreams
   - Short-term objectives
   - Personal improvements
   - Academic/career targets
   Extract goals with titles, descriptions, priorities (high/medium/low), and suggested due dates if mentioned.

CRITICAL INSTRUCTIONS - Detect these action types:

1. "team" type - ONLY use when user explicitly says:
   - "create a team", "form a team", "set up a team", "make a team", "start a team", "new team", "team for [purpose]", "team which works on [thing]"
   - Examples: 
     * "create me a team which works on creating an ecommerce website" → type: "team"
     * "I want to create a team for my project" → type: "team"
     * "make a team" → type: "team"
   - Extract team name from context if mentioned, otherwise use a descriptive name based on purpose

2. "meeting" type - ONLY use when user explicitly says:
   - "schedule a meeting", "set up a meeting", "have a meeting", "meet with", "call with", "discussion", "appointment"
   - Example: "I need to schedule a meeting with John tomorrow" → type: "meeting"

3. "todo" type - Use when user says:
   - "need to", "need to complete", "need to finish", "need to do", "must do", "should do"
   - "complete", "finish", "work on", "do [something]", "complete [something]"
   - "assignments", "tasks", "homework", "project", "report", "work"
   - Phrases like "I need to complete X by [date]" or "complete X by [date]" or "X by [date]"
   - Examples: 
     * "I need to complete my 2 assignments of os and cn one by 3rd november and other by 5th november" → type: "todo" (extract dates)
     * "I need to finish the report" → type: "todo"
     * "complete homework by Friday" → type: "todo" with suggestedDate

4. "reminder" type - Use when user explicitly mentions:
   - "remind me", "don't forget", "remember to"
   - Example: "Remind me to call mom" → type: "reminder"

STRICT RULES:
- If user says "create a team" or "make a team" or "team which works on" → MUST use type "team"
- If user says "schedule a meeting" or "meet with" → MUST use type "meeting"  
- If user mentions completing/finishing work, assignments, tasks, projects, reports with or without dates → MUST use type "todo"
- Extract dates/deadlines when mentioned (e.g., "by 3rd november", "by November 5", "on Friday", "by [date]") and set suggestedDate
- If user mentions multiple tasks/assignments, create separate action items for each
- Do NOT create action items for general descriptions or explanations - ONLY for explicit actions
- If user describes a team structure but doesn't explicitly say "create team", do NOT create a team action item
- Extract the team name/purpose from the user's message if mentioned
- Handle typos gracefully - "assignments" vs "assignmnets", "november" vs "novembneer", etc.

Please respond in the following JSON format:
{
  "themes": [
    {
      "name": "Theme name (e.g., 'Academic Pressure', 'Personal Growth', 'Time Management')",
      "description": "Brief description of how this theme appears in the journal",
      "confidence": 85,
      "tags": ["tag1", "tag2"]
    }
  ],
  "suggestedGoals": [
    {
      "title": "Goal title",
      "description": "Goal description",
      "priority": "high|medium|low",
      "suggestedDueDate": "YYYY-MM-DD or null"
    }
  ],
  "motivationInsights": "Provide insights about the user's motivation, mood, and emotional state",
  "actionItems": [
    {
      "text": "Action item text (e.g., 'Create team for e-commerce website' or 'Complete OS assignment' or 'Complete CN assignment')",
      "type": "todo|meeting|reminder|event|team",
      "suggestedDate": "YYYY-MM-DD HH:MM or null (extract dates like '3rd november' → '2024-11-03 00:00', '5th november' → '2024-11-05 00:00')",
      "teamName": "Team name if type is team (extract from user message or infer from purpose)"
    }
  ]
}

IMPORTANT: Only create action items if the user explicitly wants to DO something. If they're just describing or explaining, return empty actionItems array.`;

    try {
      // Use Gemini API directly for better intent detection
      let responseData: string;
      
      try {
        // Try Gemini API directly first
        const result = await geminiModel.generateContent(prompt);
        const response = result.response;
        responseData = response.text();
      } catch (geminiError: any) {
        console.warn("Gemini API direct call failed, falling back to unified service:", geminiError);
        
        // Check if it's a referrer blocking error (403)
        const isReferrerBlocked = geminiError?.message?.includes("403") || 
                                  geminiError?.message?.includes("HTTP_REFERRER_BLOCKED") || 
                                  geminiError?.message?.includes("referer") ||
                                  geminiError?.message?.includes("referrer") ||
                                  (geminiError?.status === 403);
        
        if (isReferrerBlocked) {
          console.warn("API key referrer restriction detected. Consider updating your Google Cloud API key settings to allow requests from localhost.");
          
          // If it's a referrer block, the unified service will also fail with the same issue
          // So we should throw a helpful error immediately instead of trying the fallback
          throw new Error("API_KEY_HTTP_REFERRER_BLOCKED: Your Google Cloud API key has HTTP referrer restrictions that block requests from http://localhost:5176/. Please update your API key settings in Google Cloud Console to allow this referrer, or remove referrer restrictions for localhost.");
        }
        
        // For other errors, try fallback to unified service
        try {
          const response = await unifiedAIService.generateResponse(prompt, "");
          
          // Check if the unified service returned an error response
          if (!response.success) {
            throw new Error(response.error || "Failed to analyze intent");
          }
          
          if (!response.data) {
            throw new Error("No data received from AI service");
          }
          
          // Check if response looks like an error message (unified service sometimes returns error messages as data)
          const dataStr = String(response.data).trim();
          if (dataStr.startsWith("I couldn't") || 
              dataStr.startsWith("Temporary AI") ||
              dataStr.startsWith("Error") ||
              dataStr.includes("API key") ||
              dataStr.includes("forbidden") ||
              dataStr.includes("403")) {
            throw new Error(`AI service returned an error: ${dataStr.substring(0, 200)}`);
          }
          
          responseData = response.data;
        } catch (fallbackError: any) {
          console.error("Unified service fallback also failed:", fallbackError);
          
          // If fallback also failed, throw a clear error
          if (fallbackError?.message) {
            throw fallbackError;
          }
          throw new Error("Unable to connect to AI service. Please check your API configuration and try again.");
        }
      }

      if (responseData) {
        // Check if response looks like an error message instead of JSON
        const trimmedResponse = responseData.trim();
        if (trimmedResponse.startsWith("I couldn't") || 
            trimmedResponse.startsWith("Temporary AI") ||
            trimmedResponse.startsWith("Error") ||
            (!trimmedResponse.startsWith("{") && !trimmedResponse.startsWith("```"))) {
          console.warn("Received non-JSON response from AI service:", trimmedResponse.substring(0, 100));
          throw new Error("AI service returned an error message instead of analysis results. Please check your API configuration.");
        }

        // Try to parse JSON from response
        let parsed: DreamToPlanResult;

        try {
          // Extract JSON from response (might be wrapped in markdown code blocks)
          const jsonMatch = responseData.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                           responseData.match(/(\{[\s\S]*\})/);
          
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[1]);
          } else {
            // Fallback: try to parse the whole response as JSON
            parsed = JSON.parse(responseData);
          }
        } catch (parseError) {
          console.error("Failed to parse JSON response:", parseError);
          console.error("Response data:", responseData.substring(0, 500));
          throw new Error("Failed to parse AI response. The service may be experiencing issues. Please try again.");
        }

        // Ensure arrays are initialized
        if (!parsed.themes) parsed.themes = [];
        if (!parsed.suggestedGoals) parsed.suggestedGoals = [];
        if (!parsed.actionItems) parsed.actionItems = [];
        if (!parsed.motivationInsights) parsed.motivationInsights = "";

        // Log for debugging
        console.log("🎯 Dream-to-Plan Analysis Result:", {
          themesCount: parsed.themes?.length,
          themes: parsed.themes,
          actionItemsCount: parsed.actionItems?.length,
          actionItems: parsed.actionItems,
        });

        // Parse dates
        parsed.suggestedGoals = parsed.suggestedGoals.map((goal) => ({
          ...goal,
          suggestedDueDate: goal.suggestedDueDate
            ? new Date(goal.suggestedDueDate)
            : undefined,
        }));

        parsed.actionItems = parsed.actionItems.map((item) => ({
          ...item,
          type: (item.type?.toLowerCase() || "todo"), // Normalize type - lowercase it
          suggestedDate: item.suggestedDate
            ? new Date(item.suggestedDate)
            : undefined,
          teamName: item.teamName || undefined,
        }));

        // Log normalized types
        console.log("🎯 Normalized Action Items:", parsed.actionItems);

        return parsed;
      }

      // Fallback response
      return {
        themes: [],
        suggestedGoals: [],
        motivationInsights: "Unable to analyze journal entry. Please try again or rephrase.",
        actionItems: [],
      };
    } catch (error: any) {
      console.error("Error analyzing journal:", error);
      
      // Provide more helpful error messages based on error type
      let errorMessage = "Error analyzing journal entry. Please try again.";
      
      if (error?.message) {
        if (error.message.includes("API_KEY_HTTP_REFERRER_BLOCKED") || 
            error.message.includes("referer") || 
            error.message.includes("403")) {
          errorMessage = "API key configuration issue: Requests from localhost are blocked. Please update your Google Cloud API key settings to allow requests from http://localhost:5176/ or use a different API key without referrer restrictions.";
        } else if (error.message.includes("parse") || error.message.includes("JSON")) {
          errorMessage = "Failed to process AI response. The service may be experiencing issues. Please check your API configuration and try again.";
        } else if (error.message.includes("connect") || error.message.includes("Unable to connect")) {
          errorMessage = "Unable to connect to AI service. Please check your API key configuration in your environment variables.";
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        themes: [],
        suggestedGoals: [],
        motivationInsights: errorMessage,
        actionItems: [],
      };
    }
  }

  async createTodosFromGoals(goals: DreamToPlanResult["suggestedGoals"]): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    for (const goal of goals) {
      await firestoreUserTasks.addTask(user.id, {
        title: goal.title,
        description: goal.description,
        subject: "Dream-to-Plan Goal",
        dueDate: goal.suggestedDueDate?.toISOString() || new Date().toISOString(),
        priority: goal.priority,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    }

    // Sync todos to calendar
    await calendarService.syncTodosToCalendar(user.id);
  }

  async scheduleMeetingsFromActions(
    actionItems: DreamToPlanResult["actionItems"]
  ): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    for (const item of actionItems) {
      if (item.type === "meeting") {
        // If no date is provided, create a todo only (for unscheduled meetings)
        if (!item.suggestedDate) {
          await firestoreUserTasks.addTask(user.id, {
            title: `Meeting: ${item.text}`,
            description: "Meeting scheduled from Dream-to-Plan analysis (date TBD)",
            subject: "Meeting Reminder",
            dueDate: new Date().toISOString(),
            priority: "medium",
            status: "pending",
            createdAt: new Date().toISOString(),
          });
          continue;
        }

        const endTime = new Date(item.suggestedDate);
        endTime.setHours(endTime.getHours() + 1); // Default 1-hour meeting

        // Schedule meeting in calendar
        await calendarService.scheduleMeeting({
          title: item.text,
          startTime: item.suggestedDate,
          endTime: endTime,
          description: "Scheduled from Dream-to-Plan analysis",
        });

        // Create a todo reminder about the meeting
        await firestoreUserTasks.addTask(user.id, {
          title: `Meeting: ${item.text}`,
          description: `Scheduled meeting on ${item.suggestedDate.toLocaleString()}`,
          subject: "Meeting Reminder",
          dueDate: item.suggestedDate.toISOString(),
          priority: "high",
          status: "pending",
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Sync todos to calendar
    await calendarService.syncTodosToCalendar(user.id);
  }

  async createTeamFromAction(
    teamName: string,
    description: string = "",
    emails: string[] = []
  ): Promise<string> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    // Create the team
    const team = await teamManagementService.createTeam({
      name: teamName,
      description: description || `Team created from Dream-to-Plan: ${teamName}`,
      size: "small",
      teamType: "general",
    });

    // Send invitations to provided emails
    for (const email of emails) {
      if (email.trim()) {
        try {
          await teamManagementService.inviteMember(team.id, email.trim(), "member");
        } catch (error) {
          console.error(`Failed to invite ${email}:`, error);
          // Continue with other invitations even if one fails
        }
      }
    }

    return team.id;
  }

  async createTodosFromActions(
    actionItems: DreamToPlanResult["actionItems"]
  ): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    for (const item of actionItems) {
      if (item.type === "todo") {
        await firestoreUserTasks.addTask(user.id, {
          title: item.text,
          description: "Added from Dream-to-Plan analysis",
          subject: "Action Item",
          dueDate: item.suggestedDate?.toISOString() || new Date().toISOString(),
          priority: "medium",
          status: "pending",
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Sync todos to calendar
    await calendarService.syncTodosToCalendar(user.id);
  }

  async createRemindersFromActions(
    actionItems: DreamToPlanResult["actionItems"]
  ): Promise<void> {
    const user = realTimeAuth.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    for (const item of actionItems) {
      if (item.type === "reminder" && item.suggestedDate) {
        await calendarService.createEvent({
          title: item.text,
          description: "Reminder from Dream-to-Plan",
          startDate: item.suggestedDate,
          type: "reminder",
          color: "#f59e0b",
          allDay: false,
        });
      }
    }
  }

  async processJournalEntry(
    journalContent: string,
    options: {
      autoCreateTodos?: boolean;
      autoScheduleMeetings?: boolean;
      autoCreateReminders?: boolean;
    } = {}
  ): Promise<DreamToPlanResult> {
    const result = await this.analyzeJournalAndSuggestGoals(journalContent);

    if (options.autoCreateTodos !== false) {
      await this.createTodosFromGoals(result.suggestedGoals);
      await this.createTodosFromActions(
        result.actionItems.filter((item) => item.type === "todo")
      );
    }

    if (options.autoScheduleMeetings !== false) {
      await this.scheduleMeetingsFromActions(
        result.actionItems.filter((item) => item.type === "meeting")
      );
    }

    if (options.autoCreateReminders !== false) {
      await this.createRemindersFromActions(
        result.actionItems.filter((item) => item.type === "reminder")
      );
    }

    return result;
  }

  async extractActionsFromNaturalLanguage(
    text: string
  ): Promise<DreamToPlanResult["actionItems"]> {
    const prompt = `Extract actionable items from the following text. Identify the EXACT type of action.

Text: "${text}"

CRITICAL - Detect action types accurately:
- "team" type: If user says "create a team", "form a team", "make a team", "set up a team", "new team"
- "meeting" type: If user says "schedule a meeting", "meet with", "call with", "have a meeting", "appointment"
- "todo" type: If user says "need to", "should", "do", "task", "complete", "finish"
- "reminder" type: If user says "remind me", "don't forget", "remember"

Respond in JSON format:
{
  "actionItems": [
    {
      "text": "Action item text",
      "type": "todo|meeting|reminder|event|team",
      "suggestedDate": "YYYY-MM-DD HH:MM or null if not specified",
      "teamName": "Team name if type is team and mentioned, or null"
    }
  ]
}

Be precise: "create a team" → type: "team". "schedule a meeting" → type: "meeting".`;

    try {
      const response = await unifiedAIService.generateResponse(prompt, "");

      if (response.success && response.data) {
        const jsonMatch = response.data.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) ||
                          response.data.match(/(\{[\s\S]*\})/);
        
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[1]);
          return parsed.actionItems.map((item: any) => ({
            ...item,
            type: (item.type?.toLowerCase() || "todo"), // Normalize type
            suggestedDate: item.suggestedDate ? new Date(item.suggestedDate) : undefined,
            teamName: item.teamName || undefined,
          }));
        }
      }
    } catch (error) {
      console.error("Error extracting actions:", error);
    }

    return [];
  }
}

export const dreamToPlanService = new DreamToPlanService();

