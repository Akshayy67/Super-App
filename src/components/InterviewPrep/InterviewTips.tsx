import React, { useState } from "react";
import {
  Shirt,
  Brain,
  Users,
  Clock,
  MessageSquare,
  Eye,
  Smile,
  Target,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Briefcase,
  Heart,
  Zap,
  Award,
  AlertCircle,
  Coffee,
  Mail,
  BookOpen,
  TrendingUp,
  Lightbulb,
} from "lucide-react";

interface TipCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  tips: Tip[];
}

interface Tip {
  id: string;
  title: string;
  content: string;
  importance: "high" | "medium" | "low";
  examples?: string[];
  doNot?: string[];
}

export const InterviewTips: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [completedTips, setCompletedTips] = useState<string[]>([]);

  const tipCategories: TipCategory[] = [
    {
      id: "dressing",
      title: "Dressing & Appearance",
      icon: Shirt,
      color: "purple",
      tips: [
        {
          id: "dress-1",
          title: "Dress Code Research",
          content:
            "Research the company's dress code beforehand. When in doubt, it's better to be slightly overdressed than underdressed.",
          importance: "high",
          examples: [
            "Corporate: Business formal (suit and tie)",
            "Tech Startup: Business casual (dress shirt, slacks)",
            "Creative Agency: Smart casual (neat, professional but relaxed)",
          ],
        },
        {
          id: "dress-2",
          title: "Grooming Essentials",
          content:
            "Ensure impeccable grooming - neat hair, trimmed nails, fresh breath, and minimal cologne/perfume.",
          importance: "high",
          doNot: [
            "Strong fragrances",
            "Excessive jewelry",
            "Wrinkled clothes",
            "Visible tattoos (unless company culture permits)",
          ],
        },
        {
          id: "dress-3",
          title: "Color Psychology",
          content:
            "Choose colors that convey professionalism. Navy, gray, and black are safe choices. Add a pop of color with accessories.",
          importance: "medium",
          examples: [
            "Navy suit: Conveys trust and stability",
            "Gray suit: Professional and sophisticated",
            "White shirt: Clean and crisp appearance",
          ],
        },
        {
          id: "dress-4",
          title: "Prepare the Night Before",
          content:
            "Lay out your outfit the night before, ensuring everything is clean, pressed, and fits well. Have a backup outfit ready.",
          importance: "medium",
        },
      ],
    },
    {
      id: "attitude",
      title: "Attitude & Mindset",
      icon: Brain,
      color: "blue",
      tips: [
        {
          id: "attitude-1",
          title: "Confidence Without Arrogance",
          content:
            "Project confidence through good posture, steady eye contact, and clear speech. Balance confidence with humility and eagerness to learn.",
          importance: "high",
          examples: [
            "Good: 'I successfully led a team of 5...'",
            "Better: 'I had the opportunity to lead a team of 5, and learned...'",
          ],
        },
        {
          id: "attitude-2",
          title: "Growth Mindset",
          content:
            "Demonstrate a growth mindset by discussing how you've learned from challenges and continuously seek improvement.",
          importance: "high",
          examples: [
            "Talk about courses you've taken",
            "Mention books or podcasts that inspire you",
            "Share how feedback has helped you grow",
          ],
        },
        {
          id: "attitude-3",
          title: "Enthusiasm & Energy",
          content:
            "Show genuine enthusiasm for the role and company. Your energy level should match the company culture.",
          importance: "medium",
        },
        {
          id: "attitude-4",
          title: "Stay Positive",
          content:
            "Maintain a positive attitude throughout, even when discussing challenges or previous job experiences.",
          importance: "high",
          doNot: [
            "Speak negatively about past employers",
            "Complain about commute or salary",
            "Show frustration with the process",
          ],
        },
      ],
    },
    {
      id: "body-language",
      title: "Body Language",
      icon: Eye,
      color: "green",
      tips: [
        {
          id: "body-1",
          title: "The Power Pose",
          content:
            "Before the interview, strike a power pose for 2 minutes to boost confidence. During the interview, sit up straight with shoulders back.",
          importance: "medium",
          examples: [
            "Stand with hands on hips",
            "Arms raised in victory pose",
            "Lean back with hands behind head",
          ],
        },
        {
          id: "body-2",
          title: "Handshake Mastery",
          content:
            "Offer a firm, confident handshake with 2-3 pumps while maintaining eye contact and smiling.",
          importance: "high",
          doNot: ["Limp handshake", "Crushing grip", "Sweaty palms", "Looking away"],
        },
        {
          id: "body-3",
          title: "Active Listening Cues",
          content:
            "Show you're engaged through nodding, leaning slightly forward, and maintaining appropriate eye contact (60-70% of the time).",
          importance: "high",
        },
        {
          id: "body-4",
          title: "Hand Gestures",
          content:
            "Use natural hand gestures to emphasize points, but keep them controlled and within your body frame.",
          importance: "medium",
          doNot: ["Pointing", "Fidgeting", "Touching face repeatedly", "Crossed arms"],
        },
      ],
    },
    {
      id: "communication",
      title: "Communication Skills",
      icon: MessageSquare,
      color: "orange",
      tips: [
        {
          id: "comm-1",
          title: "STAR Method",
          content:
            "Structure behavioral answers using Situation, Task, Action, Result. This ensures complete, concise responses.",
          importance: "high",
          examples: [
            "Situation: Set the context",
            "Task: Explain your responsibility",
            "Action: Describe what you did",
            "Result: Share the outcome and learnings",
          ],
        },
        {
          id: "comm-2",
          title: "Active Voice & Ownership",
          content:
            "Use 'I' statements to show ownership of your achievements. Be specific about your contributions in team projects.",
          importance: "high",
          examples: [
            "Instead of: 'The project was completed'",
            "Say: 'I completed the project'",
            "Instead of: 'We achieved'",
            "Say: 'I contributed to our achievement by...'",
          ],
        },
        {
          id: "comm-3",
          title: "Pause and Think",
          content:
            "It's okay to pause before answering. Say 'That's a great question, let me think for a moment' if needed.",
          importance: "medium",
        },
        {
          id: "comm-4",
          title: "Ask Clarifying Questions",
          content:
            "Don't hesitate to ask for clarification if a question is unclear. It shows attention to detail.",
          importance: "medium",
        },
      ],
    },
    {
      id: "preparation",
      title: "Pre-Interview Preparation",
      icon: Target,
      color: "red",
      tips: [
        {
          id: "prep-1",
          title: "Company Deep Dive",
          content:
            "Research the company's mission, values, recent news, competitors, and industry trends. Follow them on social media.",
          importance: "high",
          examples: [
            "Company website and annual reports",
            "Recent press releases",
            "Glassdoor reviews",
            "LinkedIn company page",
            "Industry publications",
          ],
        },
        {
          id: "prep-2",
          title: "Know Your Interviewers",
          content:
            "Research your interviewers on LinkedIn. Find common connections or interests to build rapport.",
          importance: "medium",
        },
        {
          id: "prep-3",
          title: "Prepare Your Stories",
          content:
            "Have 5-7 stories ready that demonstrate different skills. Each should be adaptable to various questions.",
          importance: "high",
          examples: [
            "Leadership story",
            "Problem-solving story",
            "Teamwork story",
            "Failure/learning story",
            "Achievement story",
          ],
        },
        {
          id: "prep-4",
          title: "Mock Interviews",
          content:
            "Practice with friends, mentors, or use video recording. Focus on eliminating filler words and improving clarity.",
          importance: "high",
        },
      ],
    },
    {
      id: "during",
      title: "During the Interview",
      icon: Clock,
      color: "teal",
      tips: [
        {
          id: "during-1",
          title: "Arrive Early Strategy",
          content:
            "Arrive 15 minutes early to the building, but only check in 5-10 minutes before. Use extra time to review notes and calm nerves.",
          importance: "high",
        },
        {
          id: "during-2",
          title: "Building Rapport",
          content:
            "Start with small talk if initiated. Comment on office decor, commute, or current events (avoid controversial topics).",
          importance: "medium",
          doNot: ["Politics", "Religion", "Personal problems", "Salary (unless asked)"],
        },
        {
          id: "during-3",
          title: "Take Notes",
          content:
            "Bring a professional notebook and pen. Jot down key points and questions. It shows engagement and organization.",
          importance: "medium",
        },
        {
          id: "during-4",
          title: "Handle Difficult Questions",
          content:
            "For tough questions, acknowledge the challenge, provide your best answer, and pivot to your strengths.",
          importance: "high",
          examples: [
            "Weakness: Share a real weakness and how you're improving",
            "Gap in resume: Focus on skills gained during the gap",
            "Lack of experience: Emphasize transferable skills and quick learning",
          ],
        },
      ],
    },
    {
      id: "questions",
      title: "Asking Questions",
      icon: Heart,
      color: "pink",
      tips: [
        {
          id: "quest-1",
          title: "Intelligent Questions",
          content:
            "Prepare 5-7 thoughtful questions that show you've done research and are thinking about the role strategically.",
          importance: "high",
          examples: [
            "What does success look like in this role?",
            "What are the biggest challenges facing the team?",
            "How would you describe the team culture?",
            "What growth opportunities are available?",
          ],
        },
        {
          id: "quest-2",
          title: "Follow-up Questions",
          content:
            "Ask follow-up questions based on the interviewer's responses. It shows active listening and genuine interest.",
          importance: "medium",
        },
        {
          id: "quest-3",
          title: "Culture Fit Questions",
          content:
            "Ask about company culture, team dynamics, and work-life balance to assess if it's the right fit for you.",
          importance: "medium",
        },
      ],
    },
    {
      id: "post",
      title: "Post-Interview",
      icon: Mail,
      color: "indigo",
      tips: [
        {
          id: "post-1",
          title: "Thank You Note",
          content:
            "Send a personalized thank you email within 24 hours. Reference specific points from the conversation.",
          importance: "high",
          examples: [
            "Thank them for their time",
            "Mention a specific topic you discussed",
            "Reiterate your interest",
            "Add any points you forgot to mention",
          ],
        },
        {
          id: "post-2",
          title: "Follow-up Timeline",
          content:
            "If you don't hear back within their stated timeline, send a polite follow-up after one week.",
          importance: "medium",
        },
        {
          id: "post-3",
          title: "Continuous Improvement",
          content:
            "After each interview, write down what went well and what to improve. This helps you get better with each opportunity.",
          importance: "medium",
        },
        {
          id: "post-4",
          title: "Network Maintenance",
          content:
            "Connect with interviewers on LinkedIn, even if you don't get the job. Maintain professional relationships.",
          importance: "low",
        },
      ],
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleTipCompletion = (tipId: string) => {
    setCompletedTips((prev) =>
      prev.includes(tipId)
        ? prev.filter((id) => id !== tipId)
        : [...prev, tipId]
    );
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high":
        return "text-red-600 bg-red-100 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-100 border-green-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getCategoryColor = (color: string) => {
    const colors: Record<string, string> = {
      purple: "bg-purple-100 text-purple-600 border-purple-200",
      blue: "bg-blue-100 text-blue-600 border-blue-200",
      green: "bg-green-100 text-green-600 border-green-200",
      orange: "bg-orange-100 text-orange-600 border-orange-200",
      red: "bg-red-100 text-red-600 border-red-200",
      teal: "bg-teal-100 text-teal-600 border-teal-200",
      pink: "bg-pink-100 text-pink-600 border-pink-200",
      indigo: "bg-indigo-100 text-indigo-600 border-indigo-200",
    };
    return colors[color] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  const completionPercentage = Math.round(
    (completedTips.length /
      tipCategories.reduce((acc, cat) => acc + cat.tips.length, 0)) *
      100
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
          <Lightbulb className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Mastery Guide</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Comprehensive tips and strategies to help you ace your next interview
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
          </div>
          <span className="text-lg font-bold text-gray-900">
            {completedTips.length} / {tipCategories.reduce((acc, cat) => acc + cat.tips.length, 0)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">
          {completionPercentage}% Complete - Keep going!
        </p>
      </div>

      {/* Tips Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tipCategories.map((category) => {
          const Icon = category.icon;
          const isExpanded = expandedCategories.includes(category.id);
          const categoryCompleted = category.tips.filter((tip) =>
            completedTips.includes(tip.id)
          ).length;

          return (
            <div
              key={category.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl border ${getCategoryColor(category.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                    <p className="text-sm text-gray-500">
                      {categoryCompleted} of {category.tips.length} tips completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(categoryCompleted / category.tips.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Category Content */}
              {isExpanded && (
                <div className="px-6 pb-6 space-y-4 border-t border-gray-100 bg-gray-50">
                  {category.tips.map((tip) => {
                    const isCompleted = completedTips.includes(tip.id);

                    return (
                      <div
                        key={tip.id}
                        className={`p-5 rounded-xl border transition-all duration-300 ${
                          isCompleted
                            ? "bg-green-50 border-green-200 shadow-sm"
                            : "bg-white border-gray-200 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h4 className="text-lg font-semibold text-gray-900">{tip.title}</h4>
                              <span
                                className={`text-xs px-3 py-1 rounded-full border ${getImportanceColor(
                                  tip.importance
                                )}`}
                              >
                                {tip.importance} priority
                              </span>
                            </div>
                            <p className="text-gray-700 mb-4 leading-relaxed">{tip.content}</p>

                            {/* Examples */}
                            {tip.examples && (
                              <div className="mb-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <p className="text-sm font-medium text-gray-700">Examples:</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {tip.examples.map((example, idx) => (
                                    <div
                                      key={idx}
                                      className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg"
                                    >
                                      {example}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Don'ts */}
                            {tip.doNot && (
                              <div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                  <p className="text-sm font-medium text-gray-700">Avoid:</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {tip.doNot.map((dont, idx) => (
                                    <div
                                      key={idx}
                                      className="text-sm text-gray-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100"
                                    >
                                      {dont}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => toggleTipCompletion(tip.id)}
                            className={`ml-4 p-3 rounded-xl transition-all duration-300 ${
                              isCompleted
                                ? "bg-green-200 text-green-700 hover:bg-green-300 shadow-sm"
                                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                            }`}
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Reference Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Star className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Golden Rule</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              Be yourself, but be your best self. Authenticity combined with preparation is the
              winning formula for interview success.
            </p>
            <div className="mt-4 flex items-center space-x-2 text-sm text-blue-600">
              <BookOpen className="w-4 h-4" />
              <span>Remember: Confidence comes from preparation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
