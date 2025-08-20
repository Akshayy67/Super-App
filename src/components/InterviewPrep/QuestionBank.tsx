import React, { useState } from "react";
import {
  Search,
  Filter,
  BookOpen,
  Briefcase,
  Users,
  Brain,
  Target,
  Lightbulb,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
  Copy,
  Volume2,
  Eye,
  EyeOff,
  Hash,
  Code,
  TrendingUp,
  Heart,
  Zap,
  Award,
  Bookmark,
  Play,
  BarChart3,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  type: "behavioral" | "technical" | "situational" | "general";
  sampleAnswer?: string;
  tips?: string[];
  followUps?: string[];
  tags?: string[];
}

interface QuestionCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
  questionCount: number;
}

export const QuestionBank: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});
  const [practicedQuestions, setPracticedQuestions] = useState<string[]>([]);
  const [favoriteQuestions, setFavoriteQuestions] = useState<string[]>([]);

  const categories: QuestionCategory[] = [
    {
      id: "general",
      name: "General Questions",
      icon: Briefcase,
      color: "blue",
      description: "Common interview questions asked across all industries",
      questionCount: 25,
    },
    {
      id: "behavioral",
      name: "Behavioral Questions",
      icon: Users,
      color: "purple",
      description: "Questions about past experiences and how you handle situations",
      questionCount: 30,
    },
    {
      id: "technical",
      name: "Technical Questions",
      icon: Code,
      color: "green",
      description: "Role-specific technical and skill-based questions",
      questionCount: 40,
    },
    {
      id: "leadership",
      name: "Leadership & Management",
      icon: Target,
      color: "orange",
      description: "Questions about leadership experience and management style",
      questionCount: 20,
    },
    {
      id: "culture",
      name: "Culture Fit",
      icon: Heart,
      color: "pink",
      description: "Questions to assess alignment with company values",
      questionCount: 15,
    },
    {
      id: "problem",
      name: "Problem Solving",
      icon: Brain,
      color: "teal",
      description: "Analytical and problem-solving scenario questions",
      questionCount: 25,
    },
  ];

  const questions: Question[] = [
    // General Questions
    {
      id: "gen-1",
      question: "Tell me about yourself.",
      category: "general",
      difficulty: "easy",
      type: "general",
      sampleAnswer:
        "I'm a [profession] with [X years] of experience in [industry/field]. In my current role at [Company], I [key achievement]. I'm particularly passionate about [relevant interest] and I'm excited about this opportunity because [specific reason related to the company/role].",
      tips: [
        "Keep it professional and relevant to the role",
        "Structure: Present → Past → Future",
        "Limit to 2-3 minutes",
        "End with why you're interested in this role",
      ],
      tags: ["opening", "essential"],
    },
    {
      id: "gen-2",
      question: "Why do you want to work here?",
      category: "general",
      difficulty: "medium",
      type: "general",
      sampleAnswer:
        "I'm impressed by [specific company achievement/value]. Your commitment to [specific initiative] aligns with my values. I believe my skills in [relevant skills] would contribute to [specific team/project], and I'm excited about the opportunity to [specific growth opportunity].",
      tips: [
        "Research the company thoroughly",
        "Mention specific projects or values",
        "Connect your skills to their needs",
        "Show genuine enthusiasm",
      ],
      tags: ["motivation", "research"],
    },
    {
      id: "gen-3",
      question: "What are your greatest strengths?",
      category: "general",
      difficulty: "easy",
      type: "general",
      sampleAnswer:
        "One of my key strengths is [strength]. For example, in my previous role, I [specific example demonstrating the strength]. This resulted in [positive outcome]. I believe this strength would be particularly valuable in this role because [connection to job requirements].",
      tips: [
        "Choose strengths relevant to the job",
        "Back up with specific examples",
        "Show impact and results",
        "Be authentic",
      ],
      followUps: ["Can you give another example?", "How would this strength help in this role?"],
    },
    {
      id: "gen-4",
      question: "What is your biggest weakness?",
      category: "general",
      difficulty: "hard",
      type: "general",
      sampleAnswer:
        "I used to struggle with [genuine weakness]. I recognized this was limiting my effectiveness, so I [specific action taken]. Now, I [current improved state]. I continue to work on this by [ongoing improvement strategy].",
      tips: [
        "Be honest but strategic",
        "Show self-awareness",
        "Demonstrate improvement efforts",
        "Don't say 'perfectionism' or 'working too hard'",
      ],
      tags: ["challenging", "self-awareness"],
    },
    {
      id: "gen-5",
      question: "Where do you see yourself in 5 years?",
      category: "general",
      difficulty: "medium",
      type: "general",
      sampleAnswer:
        "In five years, I see myself having grown significantly in [relevant skills]. I'd like to have taken on more responsibilities in [area], potentially moving into [realistic position]. I'm excited about the growth opportunities here and contributing to [company goal].",
      tips: [
        "Be ambitious but realistic",
        "Align with company growth",
        "Show commitment to the field",
        "Focus on skills and contributions",
      ],
    },

    // Behavioral Questions
    {
      id: "beh-1",
      question: "Describe a time when you had to work with a difficult team member.",
      category: "behavioral",
      difficulty: "medium",
      type: "behavioral",
      sampleAnswer:
        "Situation: At [Company], I worked with a colleague who often missed deadlines. Task: We needed to deliver a critical project. Action: I initiated a one-on-one conversation to understand their challenges, suggested a new workflow with clear milestones, and offered support. Result: We delivered on time and improved our working relationship.",
      tips: [
        "Use STAR method",
        "Focus on resolution, not conflict",
        "Show empathy and professionalism",
        "Highlight positive outcome",
      ],
      tags: ["teamwork", "conflict-resolution"],
    },
    {
      id: "beh-2",
      question: "Tell me about a time you failed.",
      category: "behavioral",
      difficulty: "hard",
      type: "behavioral",
      sampleAnswer:
        "Situation: I underestimated the complexity of a project. Task: Deliver a new feature by deadline. Action: When I realized we'd miss the deadline, I immediately informed stakeholders, presented a revised timeline, and implemented better project planning processes. Result: While we missed the initial deadline, we delivered a higher quality product and I learned valuable lessons about project estimation.",
      tips: [
        "Choose a real failure",
        "Take responsibility",
        "Focus on learning and growth",
        "Show how you've applied the lesson",
      ],
      tags: ["challenging", "growth"],
    },
    {
      id: "beh-3",
      question: "Give an example of when you went above and beyond.",
      category: "behavioral",
      difficulty: "medium",
      type: "behavioral",
      sampleAnswer:
        "Situation: Our client was facing a critical issue outside business hours. Task: While not on-call, I noticed the alert. Action: I spent my evening diagnosing and fixing the issue, documented the solution, and created a prevention plan. Result: We retained a major client and received commendation from leadership.",
      tips: [
        "Show initiative and ownership",
        "Quantify impact when possible",
        "Demonstrate commitment",
        "Link to company values",
      ],
      tags: ["initiative", "dedication"],
    },

    // Technical Questions (Generic)
    {
      id: "tech-1",
      question: "How do you stay updated with industry trends and technologies?",
      category: "technical",
      difficulty: "easy",
      type: "technical",
      sampleAnswer:
        "I maintain a multi-faceted approach: I follow industry leaders on social media, subscribe to relevant newsletters like [specific examples], attend webinars and conferences, participate in online communities, and dedicate time each week to learning new skills through courses and documentation.",
      tips: [
        "Be specific about resources",
        "Show continuous learning",
        "Mention recent learnings",
        "Connect to role requirements",
      ],
      tags: ["learning", "growth"],
    },
    {
      id: "tech-2",
      question: "Describe your experience with [specific technology/tool].",
      category: "technical",
      difficulty: "medium",
      type: "technical",
      sampleAnswer:
        "I have [duration] of experience with [technology]. In my recent project, I used it to [specific application]. I'm proficient in [specific features/aspects] and have also explored [advanced features]. One challenge I solved was [specific example].",
      tips: [
        "Be honest about skill level",
        "Provide concrete examples",
        "Show depth of knowledge",
        "Express willingness to learn more",
      ],
    },

    // Leadership Questions
    {
      id: "lead-1",
      question: "How would you describe your leadership style?",
      category: "leadership",
      difficulty: "medium",
      type: "behavioral",
      sampleAnswer:
        "I practice servant leadership, focusing on empowering my team. I believe in setting clear expectations, providing resources and support, and removing obstacles. For example, [specific example]. I adapt my style based on team member needs and situations.",
      tips: [
        "Have a clear philosophy",
        "Provide examples",
        "Show adaptability",
        "Align with company culture",
      ],
      tags: ["management", "leadership"],
    },
    {
      id: "lead-2",
      question: "How do you motivate underperforming team members?",
      category: "leadership",
      difficulty: "hard",
      type: "situational",
      sampleAnswer:
        "First, I have a private conversation to understand root causes. I work with them to create a clear improvement plan with measurable goals. I provide additional support, training, or resources as needed. I give regular feedback and recognition for progress. If issues persist, I involve HR while maintaining dignity and respect.",
      tips: [
        "Show empathy and support",
        "Be systematic in approach",
        "Focus on improvement",
        "Know when to escalate",
      ],
    },

    // Culture Fit Questions
    {
      id: "cult-1",
      question: "What type of work environment do you thrive in?",
      category: "culture",
      difficulty: "medium",
      type: "general",
      sampleAnswer:
        "I thrive in collaborative environments where innovation is encouraged and diverse perspectives are valued. I appreciate clear communication, mutual respect, and a balance between autonomy and teamwork. I'm energized by challenges and continuous learning opportunities.",
      tips: [
        "Research company culture first",
        "Be authentic",
        "Give specific examples",
        "Show flexibility",
      ],
      tags: ["culture", "fit"],
    },
    {
      id: "cult-2",
      question: "How do you handle work-life balance?",
      category: "culture",
      difficulty: "easy",
      type: "general",
      sampleAnswer:
        "I believe in working efficiently during work hours to deliver quality results. I prioritize tasks, use time management techniques, and maintain clear boundaries. This allows me to recharge and bring my best self to work. When needed for critical deadlines, I'm flexible.",
      tips: [
        "Show you're dedicated but balanced",
        "Demonstrate time management",
        "Be realistic",
        "Align with company expectations",
      ],
    },

    // Problem Solving Questions
    {
      id: "prob-1",
      question: "How would you approach a problem you've never encountered before?",
      category: "problem",
      difficulty: "medium",
      type: "situational",
      sampleAnswer:
        "I start by gathering information and understanding the problem fully. I research similar issues and solutions, consult with experts or colleagues, break down the problem into smaller parts, develop multiple potential solutions, test them systematically, and document my findings for future reference.",
      tips: [
        "Show systematic thinking",
        "Demonstrate resourcefulness",
        "Include collaboration",
        "Emphasize learning",
      ],
      tags: ["analytical", "problem-solving"],
    },
    {
      id: "prob-2",
      question: "Describe a complex problem you solved.",
      category: "problem",
      difficulty: "hard",
      type: "behavioral",
      sampleAnswer:
        "Situation: [Complex problem description]. Task: [What needed to be achieved]. Action: I analyzed the problem, identified root causes, developed a solution strategy, implemented it in phases, and monitored results. Result: [Quantified positive outcome and lessons learned].",
      tips: [
        "Choose genuinely complex problem",
        "Show analytical process",
        "Highlight creativity",
        "Quantify results",
      ],
    },
  ];

  const toggleAnswer = (questionId: string) => {
    setShowAnswers((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const togglePracticed = (questionId: string) => {
    setPracticedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const toggleFavorite = (questionId: string) => {
    setFavoriteQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const copyQuestion = (question: string) => {
    navigator.clipboard.writeText(question);
    // You could add a toast notification here
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-100 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "hard":
        return "text-red-600 bg-red-100 border-red-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "behavioral":
        return "text-purple-600 bg-purple-100 border-purple-200";
      case "technical":
        return "text-blue-600 bg-blue-100 border-blue-200";
      case "situational":
        return "text-orange-600 bg-orange-100 border-orange-200";
      case "general":
        return "text-gray-600 bg-gray-100 border-gray-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getCategoryColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-100 text-blue-600 border-blue-200",
      purple: "bg-purple-100 text-purple-600 border-purple-200",
      green: "bg-green-100 text-green-600 border-green-200",
      orange: "bg-orange-100 text-orange-600 border-orange-200",
      pink: "bg-pink-100 text-pink-600 border-pink-200",
      teal: "bg-teal-100 text-teal-600 border-teal-200",
    };
    return colors[color] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      searchQuery === "" ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || q.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
    const matchesType = selectedType === "all" || q.type === selectedType;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Question Bank</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Practice with our comprehensive collection of interview questions across various categories and difficulty levels
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
            >
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="behavioral">Behavioral</option>
              <option value="technical">Technical</option>
              <option value="situational">Situational</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Hash className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{questions.length}</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">Practiced</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{practicedQuestions.length}</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-600">Favorites</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{favoriteQuestions.length}</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Filter className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">Filtered</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{filteredQuestions.length}</span>
          </div>
        </div>
      </div>

      {/* Category Cards (when no search/filter) */}
      {searchQuery === "" && selectedCategory === "all" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-left group hover:border-blue-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl border ${getCategoryColor(category.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-medium">{category.questionCount} questions</span>
                  <div className="flex -space-x-1">
                    {["easy", "medium", "hard"].map((diff) => (
                      <span
                        key={diff}
                        className={`w-3 h-3 rounded-full border-2 border-white ${
                          diff === "easy"
                            ? "bg-green-400"
                            : diff === "medium"
                            ? "bg-yellow-400"
                            : "bg-red-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {filteredQuestions.map((question, index) => {
          const isExpanded = showAnswers[question.id];
          const isPracticed = practicedQuestions.includes(question.id);
          const isFavorite = favoriteQuestions.includes(question.id);

          return (
            <div
              key={question.id}
              className={`bg-white rounded-2xl border transition-all duration-300 ${
                isPracticed ? "border-green-200 bg-green-50 shadow-sm" : "border-gray-200 shadow-sm hover:shadow-md"
              }`}
            >
              <div className="p-6">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Question #{index + 1}
                      </span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full border ${getDifficultyColor(
                          question.difficulty
                        )}`}
                      >
                        {question.difficulty}
                      </span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full border ${getTypeColor(
                          question.type
                        )}`}
                      >
                        {question.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-relaxed">{question.question}</h3>
                    {question.tags && (
                      <div className="flex flex-wrap gap-2">
                        {question.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleFavorite(question.id)}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        isFavorite
                          ? "bg-yellow-100 text-yellow-600 border border-yellow-200"
                          : "bg-gray-100 text-gray-400 hover:text-gray-600 border border-gray-200"
                      }`}
                    >
                      <Star className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => togglePracticed(question.id)}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        isPracticed
                          ? "bg-green-100 text-green-600 border border-green-200"
                          : "bg-gray-100 text-gray-400 hover:text-gray-600 border border-gray-200"
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => copyQuestion(question.question)}
                      className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:text-gray-600 transition-all duration-300 border border-gray-200"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 mb-4">
                  <button
                    onClick={() => toggleAnswer(question.id)}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-300 text-sm font-medium border border-blue-200"
                  >
                    {isExpanded ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Hide Answer</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>View Answer</span>
                      </>
                    )}
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 text-sm font-medium border border-gray-200">
                    <Volume2 className="w-4 h-4" />
                    <span>Practice Aloud</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2.5 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all duration-300 text-sm font-medium border border-purple-200">
                    <Play className="w-4 h-4" />
                    <span>Start Practice</span>
                  </button>
                </div>

                {/* Expanded Content */}
                {isExpanded && question.sampleAnswer && (
                  <div className="mt-6 space-y-4">
                    {/* Sample Answer */}
                    <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Lightbulb className="w-5 h-5 mr-2 text-blue-600" />
                        Sample Answer
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{question.sampleAnswer}</p>
                    </div>

                    {/* Tips */}
                    {question.tips && (
                      <div className="p-5 bg-yellow-50 rounded-xl border border-yellow-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                          Tips for Answering
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {question.tips.map((tip, idx) => (
                            <div key={idx} className="text-gray-700 flex items-start bg-white p-3 rounded-lg border border-yellow-100">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Questions */}
                    {question.followUps && (
                      <div className="p-5 bg-purple-50 rounded-xl border border-purple-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                          Potential Follow-ups
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {question.followUps.map((followUp, idx) => (
                            <div key={idx} className="text-gray-700 bg-white p-3 rounded-lg border border-purple-100">
                              <span className="text-sm">• {followUp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredQuestions.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search terms to find more questions.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedDifficulty("all");
              setSelectedType("all");
            }}
            className="px-6 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors border border-blue-200"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Practice Progress</h3>
              <p className="text-sm text-gray-600">Track your improvement over time</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round((practicedQuestions.length / questions.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};
