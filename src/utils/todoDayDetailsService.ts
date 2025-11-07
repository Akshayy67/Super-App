import { GoogleGenerativeAI } from "@google/generative-ai";
import { unifiedAIService } from "./aiConfig";
import { Task } from "../types";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_AI_API_KEY || ""
);

const geminiModel = genAI.getGenerativeModel({
  model: import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash",
});

export interface DayDetails {
  suggestions: string[];
  detailedTasks: Array<{
    task: string;
    description: string;
    estimatedTime: string;
    priority: "high" | "medium" | "low";
    order: number;
  }>;
  resources: Array<{
    title: string;
    url: string;
    type: "video" | "article" | "course" | "practice" | "documentation";
    description: string;
  }>;
  tips: string[];
  motivation: string;
  generatedAt?: Date;
}

class TodoDayDetailsService {
  async generateDayDetails(
    date: Date,
    tasks: Task[]
  ): Promise<DayDetails> {
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const tasksList = tasks.map((task, idx) => ({
      index: idx + 1,
      title: task.title,
      description: task.description || "",
      subject: task.subject || "",
      priority: task.priority,
      dueDate: task.dueDate,
    }));

    const prompt = `You are an expert productivity planner. Generate a detailed daily plan for managing tasks on a specific date.

Date: ${dateStr}
Number of Tasks: ${tasks.length}

Tasks for this day:
${tasksList.map(t => `- ${t.title} (${t.priority} priority)${t.description ? `: ${t.description}` : ""}${t.subject ? ` [Subject: ${t.subject}]` : ""}`).join('\n')}

Generate:
1. **Suggestions for today** - 3-5 actionable suggestions to maximize productivity and complete all tasks efficiently
2. **Detailed task breakdown** - For each task, provide:
   - Task name
   - Detailed step-by-step approach
   - Estimated time to complete
   - Priority level (based on task priority and urgency)
   - Suggested order of completion
3. **Learning/Productivity resources** - Provide 3-5 relevant resources with:
   - Title
   - URL (use real URLs from platforms like YouTube, Coursera, Khan Academy, etc.)
   - Type (video/article/course/practice/documentation)
   - Brief description
4. **Productivity tips** - 3-5 tips specific to managing these tasks today
5. **Motivation** - A brief motivational message to stay focused

Return JSON format:
{
  "suggestions": ["Suggestion 1", "Suggestion 2", ...],
  "detailedTasks": [
    {
      "task": "Task name",
      "description": "Step-by-step approach",
      "estimatedTime": "30 minutes",
      "priority": "high|medium|low",
      "order": 1
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
- Prioritize tasks based on their priority and logical order
- Include a mix of resource types
- Make tips practical and applicable
- Order tasks logically (high priority first, then by dependencies)

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

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // Validate structure
      if (!parsed.suggestions || !parsed.detailedTasks || !parsed.resources || !parsed.tips || !parsed.motivation) {
        throw new Error("Invalid response structure from AI");
      }

      return {
        suggestions: parsed.suggestions || [],
        detailedTasks: parsed.detailedTasks || [],
        resources: parsed.resources || [],
        tips: parsed.tips || [],
        motivation: parsed.motivation || "",
        generatedAt: new Date(),
      };
    } catch (error: any) {
      console.error("Error generating day details:", error);
      // Return fallback structure
      return {
        suggestions: [
          "Start with high-priority tasks first",
          "Take short breaks between tasks",
          "Review your progress at the end of the day"
        ],
        detailedTasks: tasks.map((task, idx) => ({
          task: task.title,
          description: task.description || "Complete this task",
          estimatedTime: "30-60 minutes",
          priority: task.priority,
          order: idx + 1,
        })),
        resources: [],
        tips: [
          "Focus on one task at a time",
          "Set realistic time estimates",
          "Celebrate small wins"
        ],
        motivation: "You've got this! Take it one task at a time.",
        generatedAt: new Date(),
      };
    }
  }
}

export const todoDayDetailsService = new TodoDayDetailsService();


