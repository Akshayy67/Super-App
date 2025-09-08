import React, { useState, useEffect } from "react";
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
  Search,
  Filter,
  Printer,
  Calendar,
  Download,
  ArrowRight,
  Building,
  Sparkles,
  BookMarked,
  ListChecks,
  Timer,
  Play,
} from "lucide-react";

interface TipCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  tips: Tip[];
  industry?: string;
}

interface Tip {
  id: string;
  title: string;
  content: string;
  importance: "high" | "medium" | "low";
  examples?: string[];
  doNot?: string[];
  practicePrompt?: string;
  timeToMaster?: number; // in days
  industry?: string[];
}

interface TimelineStep {
  day: number;
  title: string;
  description: string;
  tipIds: string[];
  completed: boolean;
}

export const InterviewTips: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [completedTips, setCompletedTips] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPracticeModeActive, setIsPracticeModeActive] =
    useState<boolean>(false);
  const [currentPracticeTip, setCurrentPracticeTip] = useState<Tip | null>(
    null
  );
  const [practiceFeedback, setPracticeFeedback] = useState<string>("");
  const [practiceResponse, setPracticeResponse] = useState<string>("");
  const [interviewDate, setInterviewDate] = useState<Date | null>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  ); // Default 2 weeks from now
  const [prepTimeline, setPrepTimeline] = useState<TimelineStep[]>([]);

  // Reset to tips overview when component mounts or tab is clicked
  useEffect(() => {
    setIsPracticeModeActive(false);
    setCurrentPracticeTip(null);
    setPracticeFeedback("");
    setPracticeResponse("");
    setSearchQuery("");
  }, []);

  // Generate prep timeline based on interview date
  useEffect(() => {
    if (interviewDate) {
      const totalDays = Math.max(
        1,
        Math.floor(
          (interviewDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
        )
      );

      // Create a custom timeline based on available days
      const newTimeline: TimelineStep[] = [];

      // Day 1: Start with basics
      newTimeline.push({
        day: 1,
        title: "Master the Basics",
        description:
          "Focus on company research and preparing your elevator pitch",
        tipIds: ["dress-1", "attitude-1", "prep-1"],
        completed: false,
      });

      // Middle days: Distribute remaining tips
      if (totalDays > 3) {
        newTimeline.push({
          day: Math.floor(totalDays / 3),
          title: "Communication Practice",
          description:
            "Work on communication skills and answering difficult questions",
          tipIds: ["comm-1", "body-1", "body-2"],
          completed: false,
        });

        newTimeline.push({
          day: Math.floor((totalDays * 2) / 3),
          title: "Question Preparation",
          description:
            "Prepare your questions and practice mock interview sessions",
          tipIds: ["quest-1", "during-4", "prep-3"],
          completed: false,
        });
      }

      // Last day: Final preparations
      newTimeline.push({
        day: totalDays,
        title: "Final Review",
        description: "Final appearance check and mental preparation",
        tipIds: ["dress-2", "attitude-4", "post-1"],
        completed: false,
      });

      setPrepTimeline(newTimeline);
    }
  }, [interviewDate]);

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
          practicePrompt:
            "List three specific outfit combinations that would be appropriate for the company you're interviewing with. Consider the industry and company culture.",
          timeToMaster: 2,
          industry: ["tech", "finance", "healthcare", "creative"],
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
          practicePrompt:
            "Record yourself answering the question 'What's your greatest professional achievement?' Focus on balancing confidence with humility.",
          timeToMaster: 3,
          industry: ["tech", "finance", "healthcare", "creative", "education"],
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
          doNot: [
            "Limp handshake",
            "Crushing grip",
            "Sweaty palms",
            "Looking away",
          ],
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
          doNot: [
            "Pointing",
            "Fidgeting",
            "Touching face repeatedly",
            "Crossed arms",
          ],
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
          doNot: [
            "Politics",
            "Religion",
            "Personal problems",
            "Salary (unless asked)",
          ],
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
    // New Industry-Specific Tips Category
    {
      id: "industry-specific",
      title: "Industry-Specific Tips",
      icon: Building,
      color: "indigo",
      tips: [
        {
          id: "industry-tech",
          title: "Tech Industry",
          content:
            "For tech interviews, be prepared to demonstrate both technical and soft skills. Technical challenges and cultural fit are equally important.",
          importance: "high",
          examples: [
            "Prepare for whiteboard coding or technical assessments",
            "Research the company's tech stack thoroughly",
            "Be ready to discuss past projects with technical specificity",
            "Show continuous learning through side projects, courses, or contributions",
          ],
          industry: ["tech"],
          practicePrompt:
            "Prepare a 2-minute explanation of a technical project you've worked on, focusing on your specific contribution, technologies used, and lessons learned.",
        },
        {
          id: "industry-finance",
          title: "Finance Industry",
          content:
            "Finance interviews often focus on numerical aptitude, analytical thinking, and attention to detail. Prepare to discuss market trends and showcase your financial knowledge.",
          importance: "high",
          examples: [
            "Be ready for case studies and financial scenarios",
            "Stay updated on current market conditions and industry news",
            "Demonstrate strong Excel and financial modeling skills",
            "Practice explaining complex financial concepts in simple terms",
          ],
          industry: ["finance"],
          practicePrompt:
            "Explain a recent financial news event and its potential impact on markets or businesses in a clear, concise manner.",
        },
        {
          id: "industry-healthcare",
          title: "Healthcare Industry",
          content:
            "Healthcare interviews focus on patient care, regulatory knowledge, and ethical decision-making. Emphasize your understanding of healthcare systems and commitment to quality care.",
          importance: "high",
          examples: [
            "Demonstrate knowledge of relevant regulations (HIPAA, etc.)",
            "Prepare examples of patient-centered care or outcomes",
            "Discuss experience with healthcare technology or systems",
            "Show awareness of current healthcare challenges and trends",
          ],
          industry: ["healthcare"],
          practicePrompt:
            "Describe a situation where you had to balance efficiency with quality of care, and how you made your decision.",
        },
        {
          id: "industry-creative",
          title: "Creative Industries",
          content:
            "Creative interviews often include portfolio reviews and discussions about your creative process. Be prepared to explain your design decisions and creative philosophy.",
          importance: "high",
          examples: [
            "Have your portfolio easily accessible and organized by project type",
            "Be ready to explain your creative process from concept to execution",
            "Prepare to discuss design trends and inspirations",
            "Show how you incorporate feedback and iterate on your work",
          ],
          industry: ["creative"],
          practicePrompt:
            "Choose one piece from your portfolio and practice a 3-minute explanation of your process, challenges faced, and the impact of the final result.",
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

  // Start practice session with a specific tip
  const startPractice = (tip: Tip) => {
    setCurrentPracticeTip(tip);
    setPracticeFeedback("");
    setPracticeResponse("");
    setIsPracticeModeActive(true);
  };

  // End practice session
  const endPractice = () => {
    setIsPracticeModeActive(false);
    setCurrentPracticeTip(null);
  };

  // Submit practice response
  const submitPractice = () => {
    if (practiceResponse.trim().length > 0) {
      // Simple feedback based on response length and content
      let feedback = "Good start! ";

      if (practiceResponse.length < 50) {
        feedback +=
          "Consider expanding your answer with more specific details and examples.";
      } else if (practiceResponse.length > 200) {
        feedback +=
          "Your answer is comprehensive. Make sure it remains focused and concise in an actual interview.";
      } else {
        feedback +=
          "Your answer has good length. Review it for clarity and relevance.";
      }

      // Check for STAR method elements if this is a behavioral question
      if (currentPracticeTip?.id.includes("beh")) {
        if (
          !practiceResponse.toLowerCase().includes("situation") &&
          !practiceResponse.toLowerCase().includes("task") &&
          !practiceResponse.toLowerCase().includes("action") &&
          !practiceResponse.toLowerCase().includes("result")
        ) {
          feedback +=
            " Consider using the STAR method (Situation, Task, Action, Result) to structure your response.";
        }
      }

      setPracticeFeedback(feedback);

      // Auto-mark tip as completed when practiced
      if (
        currentPracticeTip &&
        !completedTips.includes(currentPracticeTip.id)
      ) {
        toggleTipCompletion(currentPracticeTip.id);
      }
    }
  };

  // Generate printable cheat sheet
  const generateCheatSheet = () => {
    const highPriorityTips = tipCategories.flatMap((category) =>
      category.tips.filter((tip) => tip.importance === "high")
    );

    // This would normally trigger a print dialog or generate a PDF
    console.log(
      "Generating cheat sheet with",
      highPriorityTips.length,
      "high priority tips"
    );

    // In a real implementation, this would create a formatted PDF or printable HTML
    alert("Interview Cheat Sheet generated! Check your downloads.");
  };

  // Filter tips based on search and filters
  const getFilteredTipCategories = () => {
    return tipCategories
      .map((category) => {
        // Filter tips within each category
        const filteredTips = category.tips.filter((tip) => {
          // Filter by search query only
          return (
            searchQuery === "" ||
            tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tip.content.toLowerCase().includes(searchQuery.toLowerCase())
          );
        });

        // Return category with filtered tips
        return {
          ...category,
          tips: filteredTips,
        };
      })
      .filter((category) => category.tips.length > 0); // Only show categories with matching tips
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high":
        return "text-white font-medium bg-gradient-to-r from-red-500 to-red-600 shadow-sm shadow-red-200 border-red-500";
      case "medium":
        return "text-white font-medium bg-gradient-to-r from-amber-500 to-amber-600 shadow-sm shadow-amber-200 border-amber-500";
      case "low":
        return "text-white font-medium bg-gradient-to-r from-green-500 to-green-600 shadow-sm shadow-green-200 border-green-500";
      default:
        return "text-white font-medium bg-gradient-to-r from-gray-500 to-gray-600 shadow-sm shadow-gray-200 border-gray-500";
    }
  };

  const getCategoryColor = (color: string) => {
    const colors: Record<string, string> = {
      purple:
        "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      green:
        "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
      orange:
        "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
      red: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
      teal: "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800",
      pink: "bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800",
      indigo:
        "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
    };
    return (
      colors[color] ||
      "bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800"
    );
  };

  const completionPercentage = Math.round(
    (completedTips.length /
      tipCategories.reduce((acc, cat) => acc + cat.tips.length, 0)) *
      100
  );

  return (
    <div className="space-y-8">
      {isPracticeModeActive && currentPracticeTip ? (
        // Practice Mode View
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-md">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-3 rounded-xl border ${getImportanceColor(
                    currentPracticeTip.importance
                  )}`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Practice Session
                </h3>
              </div>
              <button
                onClick={() => setIsPracticeModeActive(false)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <span>Exit Practice</span>
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-4 border border-blue-100 dark:border-blue-800">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {currentPracticeTip.title}
              </h4>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {currentPracticeTip.content}
              </p>

              <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <h5 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                  Practice Task:
                </h5>
                <p className="text-gray-700">
                  {currentPracticeTip.practicePrompt ||
                    "Practice applying this tip by writing a response below."}
                </p>
              </div>
            </div>

            <textarea
              value={practiceResponse}
              onChange={(e) => setPracticeResponse(e.target.value)}
              placeholder="Type your practice response here..."
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setPracticeResponse("")}
                className="px-4 py-2 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                Clear Response
              </button>
              <button
                onClick={submitPractice}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Get Feedback
              </button>
            </div>

            {practiceFeedback && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h5 className="font-medium text-green-700 dark:text-green-400 mb-2">
                  Feedback:
                </h5>
                <p className="text-gray-700 dark:text-gray-300">
                  {practiceFeedback}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
            <button
              onClick={() => setIsPracticeModeActive(false)}
              className="w-full py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Complete Practice & Return</span>
            </button>
          </div>
        </div>
      ) : (
        // Normal View
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Interview Mastery Guide
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tips and strategies to help you ace your next
              interview
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              {/* Search */}
              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search tips..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Your Progress
                </h3>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-gray-900">
                  {completedTips.length} /{" "}
                  {tipCategories.reduce((acc, cat) => acc + cat.tips.length, 0)}
                </span>

                <button
                  onClick={generateCheatSheet}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Cheat Sheet</span>
                </button>
              </div>
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

          {/* Tips Categories - Using filtered categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {getFilteredTipCategories().map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategories.includes(category.id);
              const categoryCompleted = category.tips.filter((tip) =>
                completedTips.includes(tip.id)
              ).length;

              // Set color classes based on category color
              const colorClasses = {
                purple: "from-purple-500 to-indigo-600 shadow-purple-200",
                blue: "from-blue-500 to-cyan-600 shadow-blue-200",
                green: "from-emerald-500 to-teal-600 shadow-emerald-200",
                orange: "from-orange-500 to-amber-600 shadow-orange-200",
                red: "from-red-500 to-rose-600 shadow-red-200",
                teal: "from-teal-500 to-cyan-600 shadow-teal-200",
                pink: "from-pink-500 to-rose-600 shadow-pink-200",
                indigo: "from-indigo-500 to-blue-600 shadow-indigo-200",
              };

              const gradientClass =
                colorClasses[category.color as keyof typeof colorClasses] ||
                "from-gray-500 to-slate-600";

              return (
                <div
                  key={category.id}
                  className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                    isExpanded
                      ? "col-span-1 md:col-span-2 xl:col-span-3 shadow-xl"
                      : "shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  }`}
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full relative group ${
                      isExpanded
                        ? "bg-gradient-to-r rounded-t-2xl"
                        : "bg-gradient-to-r rounded-2xl"
                    } ${gradientClass} p-6`}
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-bold">
                            {category.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-24 bg-white bg-opacity-30 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-white h-full rounded-full"
                                style={{
                                  width: `${
                                    (categoryCompleted / category.tips.length) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-white">
                              {categoryCompleted} of {category.tips.length}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 bg-white bg-opacity-20 rounded-full p-1.5">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Category Content */}
                  {isExpanded && (
                    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-slate-800 dark:to-slate-800 border-t-0 border border-gray-100 dark:border-slate-700 rounded-b-2xl shadow-inner">
                      <div className="grid grid-cols-1 gap-6 p-6">
                        {category.tips.map((tip) => {
                          const isCompleted = completedTips.includes(tip.id);

                          // Determine color styling based on importance
                          let accentStyles;
                          switch (tip.importance) {
                            case "high":
                              accentStyles =
                                "border-l-red-500 bg-gradient-to-r from-red-50/50 via-red-50/10 to-white dark:from-red-900/20 dark:via-red-900/5 dark:to-slate-800";
                              break;
                            case "medium":
                              accentStyles =
                                "border-l-amber-500 bg-gradient-to-r from-amber-50/50 via-amber-50/10 to-white dark:from-amber-900/20 dark:via-amber-900/5 dark:to-slate-800";
                              break;
                            case "low":
                              accentStyles =
                                "border-l-green-500 bg-gradient-to-r from-green-50/50 via-green-50/10 to-white dark:from-green-900/20 dark:via-green-900/5 dark:to-slate-800";
                              break;
                            default:
                              accentStyles =
                                "border-l-blue-400 bg-gradient-to-r from-blue-50/50 via-blue-50/10 to-white dark:from-blue-900/20 dark:via-blue-900/5 dark:to-slate-800";
                          }

                          return (
                            <div
                              key={tip.id}
                              className={`rounded-xl border-l-4 ${accentStyles} border border-gray-100 shadow-md transition-all duration-300 overflow-hidden ${
                                isCompleted
                                  ? "ring-2 ring-green-300 shadow-green-100"
                                  : "hover:shadow-lg hover:-translate-y-0.5"
                              }`}
                            >
                              <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center">
                                    <h4 className="text-xl font-bold text-gray-900 mb-2 sm:mb-0 sm:mr-3">
                                      {tip.title}
                                    </h4>
                                    <span
                                      className={`text-xs px-3 py-1.5 rounded-full w-max ${getImportanceColor(
                                        tip.importance
                                      )}`}
                                    >
                                      {tip.importance} priority
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleTipCompletion(tip.id);
                                    }}
                                    className={`ml-3 p-2.5 rounded-full transition-all duration-300 ${
                                      isCompleted
                                        ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30 shadow-sm border border-green-200 dark:border-green-800"
                                        : "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600"
                                    }`}
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                  </button>
                                </div>

                                <p className="text-gray-700 dark:text-gray-300 mb-5 leading-relaxed text-base border-l-2 pl-4 border-gray-200 dark:border-slate-600 ml-1 py-1.5">
                                  {tip.content}
                                </p>

                                {/* Examples & Don'ts in tabs */}
                                {(tip.examples || tip.doNot) && (
                                  <div className="mt-4 border-t border-gray-100 pt-4">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      {tip.examples && (
                                        <div className="flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-medium border border-emerald-200 dark:border-emerald-800">
                                          <CheckCircle className="w-3 h-3" />
                                          <span>
                                            {tip.examples.length} Examples
                                          </span>
                                        </div>
                                      )}

                                      {tip.doNot && (
                                        <div className="flex items-center space-x-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-xs font-medium border border-red-200 dark:border-red-800">
                                          <AlertCircle className="w-3 h-3" />
                                          <span>
                                            {tip.doNot.length} Things to Avoid
                                          </span>
                                        </div>
                                      )}

                                      {tip.practicePrompt && (
                                        <div className="flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800">
                                          <Play className="w-3 h-3" />
                                          <span>Practice Available</span>
                                        </div>
                                      )}
                                    </div>

                                    {tip.examples && (
                                      <div className="grid grid-cols-1 gap-2 mb-3">
                                        {tip.examples.map((example, idx) => (
                                          <div
                                            key={idx}
                                            className="flex items-start text-sm text-gray-700 dark:text-gray-300 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800"
                                          >
                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                                            <span>{example}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {tip.doNot && (
                                      <div className="grid grid-cols-1 gap-2 mb-3">
                                        {tip.doNot.map((dont, idx) => (
                                          <div
                                            key={idx}
                                            className="flex items-start text-sm text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800"
                                          >
                                            <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                            <span>{dont}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Bottom Actions Area */}
                                <div className="mt-4 flex flex-wrap items-center justify-between pt-3 border-t border-gray-100">
                                  {/* Industry Tags */}
                                  {tip.industry && tip.industry.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mr-2">
                                      {tip.industry.map((ind, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs bg-gray-100/80 dark:bg-slate-700/80 text-gray-700 dark:text-gray-300 font-medium px-3 py-1 rounded-full border border-gray-200/50 dark:border-slate-600/50 shadow-sm"
                                        >
                                          {ind.charAt(0).toUpperCase() +
                                            ind.slice(1)}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Practice Button */}
                                  {tip.practicePrompt && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startPractice(tip);
                                      }}
                                      className="flex items-center space-x-1.5 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-md hover:-translate-y-0.5 px-4 py-2 rounded-lg transition-all duration-300 font-medium"
                                    >
                                      <Play className="w-3.5 h-3.5" />
                                      <span>Practice</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Reference Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="p-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl mb-4 md:mb-0 md:mr-6 flex-shrink-0">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Golden Rule of Interviewing
                </h3>
                <p className="text-white text-lg leading-relaxed opacity-90">
                  Be yourself, but be your best self. Authenticity combined with
                  preparation is the winning formula for interview success.
                </p>
                <div className="mt-6 flex items-center space-x-2 text-sm bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 w-max">
                  <BookOpen className="w-4 h-4 text-white" />
                  <span className="text-white">
                    Remember: Confidence comes from preparation
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Optimization Notice */}
          <div className="md:hidden bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-full">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <h4 className="font-bold text-xl mb-2">Interview Tips on the Go</h4>
            <p className="text-white text-opacity-90">
              This guide is fully optimized for mobile. Practice your interview
              skills anytime, anywhere!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
