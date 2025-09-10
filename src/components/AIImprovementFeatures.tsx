import React, { useState, useEffect } from "react";
import {
  Brain,
  Target,
  Calendar,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Award,
  Zap,
  Users,
  MessageSquare,
  Play,
  Download,
  Share2,
  RefreshCw,
} from "lucide-react";
import { InterviewPerformanceData } from "../utils/performanceAnalytics";

interface ImprovementMilestone {
  id: string;
  title: string;
  description: string;
  targetScore: number;
  currentScore: number;
  deadline: string;
  status: "pending" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
  category: "communication" | "technical" | "behavioral" | "confidence" | "presentation";
  exercises: Exercise[];
  resources: Resource[];
  estimatedTimeToComplete: number; // in hours
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  type: "practice" | "simulation" | "study" | "reflection";
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: number; // in minutes
  completed: boolean;
  instructions: string[];
  successCriteria: string[];
}

interface Resource {
  id: string;
  title: string;
  type: "article" | "video" | "course" | "book" | "tool";
  url?: string;
  description: string;
  rating: number;
  estimatedTime: number; // in minutes
  free: boolean;
}

interface AIImprovementFeaturesProps {
  performanceData: InterviewPerformanceData;
  isDarkMode?: boolean;
  onScheduleFollowUp?: (milestones: ImprovementMilestone[]) => void;
  onStartExercise?: (exercise: Exercise) => void;
}

export const AIImprovementFeatures: React.FC<AIImprovementFeaturesProps> = ({
  performanceData,
  isDarkMode = false,
  onScheduleFollowUp,
  onStartExercise,
}) => {
  const [roadmap, setRoadmap] = useState<{
    "30": ImprovementMilestone[];
    "60": ImprovementMilestone[];
    "90": ImprovementMilestone[];
  }>({ "30": [], "60": [], "90": [] });
  const [selectedTimeframe, setSelectedTimeframe] = useState<"30" | "60" | "90">("30");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  useEffect(() => {
    generatePersonalizedRoadmap();
  }, [performanceData]);

  const generatePersonalizedRoadmap = async () => {
    setIsGenerating(true);
    
    // Simulate AI analysis and roadmap generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const weakAreas = identifyWeakAreas();
    const milestones = generateMilestones(weakAreas);
    
    setRoadmap(milestones);
    setIsGenerating(false);
  };

  const identifyWeakAreas = () => {
    const areas = [];
    
    if (performanceData.communicationScore < 75) {
      areas.push({
        category: "communication" as const,
        score: performanceData.communicationScore,
        priority: performanceData.communicationScore < 60 ? "high" as const : "medium" as const,
      });
    }
    
    if (performanceData.technicalScore < 75) {
      areas.push({
        category: "technical" as const,
        score: performanceData.technicalScore,
        priority: performanceData.technicalScore < 60 ? "high" as const : "medium" as const,
      });
    }
    
    if (performanceData.behavioralScore < 75) {
      areas.push({
        category: "behavioral" as const,
        score: performanceData.behavioralScore,
        priority: performanceData.behavioralScore < 60 ? "high" as const : "medium" as const,
      });
    }
    
    if (performanceData.detailedMetrics.confidence < 75) {
      areas.push({
        category: "confidence" as const,
        score: performanceData.detailedMetrics.confidence,
        priority: performanceData.detailedMetrics.confidence < 60 ? "high" as const : "medium" as const,
      });
    }
    
    return areas.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const generateMilestones = (weakAreas: any[]) => {
    const milestones: { "30": ImprovementMilestone[]; "60": ImprovementMilestone[]; "90": ImprovementMilestone[] } = {
      "30": [],
      "60": [],
      "90": []
    };

    weakAreas.forEach((area, index) => {
      const timeframe = index < 2 ? "30" : index < 4 ? "60" : "90";
      const targetImprovement = area.priority === "high" ? 20 : 15;
      
      milestones[timeframe].push({
        id: `milestone-${area.category}-${timeframe}`,
        title: `Improve ${area.category.charAt(0).toUpperCase() + area.category.slice(1)}`,
        description: `Increase your ${area.category} score from ${area.score} to ${Math.min(area.score + targetImprovement, 95)}`,
        targetScore: Math.min(area.score + targetImprovement, 95),
        currentScore: area.score,
        deadline: new Date(Date.now() + parseInt(timeframe) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "pending",
        priority: area.priority,
        category: area.category,
        exercises: generateExercises(area.category),
        resources: generateResources(area.category),
        estimatedTimeToComplete: area.priority === "high" ? 20 : 15,
      });
    });

    return milestones;
  };

  const generateExercises = (category: string): Exercise[] => {
    const exerciseTemplates = {
      communication: [
        {
          title: "STAR Method Practice",
          description: "Practice structuring responses using Situation, Task, Action, Result framework",
          type: "practice" as const,
          difficulty: "medium" as const,
          instructions: [
            "Choose 5 experiences from your background",
            "Structure each using STAR method",
            "Practice delivering each story in 2-3 minutes",
            "Record yourself and review for clarity"
          ],
          successCriteria: [
            "Clear situation setup",
            "Specific task description",
            "Detailed action steps",
            "Quantifiable results"
          ]
        },
        {
          title: "Filler Word Elimination",
          description: "Reduce use of filler words like 'um', 'uh', 'like'",
          type: "practice" as const,
          difficulty: "easy" as const,
          instructions: [
            "Record a 5-minute practice session",
            "Count filler words in recording",
            "Practice pausing instead of using fillers",
            "Repeat until filler words < 5 per minute"
          ],
          successCriteria: [
            "Less than 5 filler words per minute",
            "Natural pauses instead of fillers",
            "Confident delivery"
          ]
        }
      ],
      technical: [
        {
          title: "Algorithm Explanation Practice",
          description: "Practice explaining complex algorithms clearly",
          type: "practice" as const,
          difficulty: "hard" as const,
          instructions: [
            "Choose 10 common algorithms",
            "Explain each in simple terms",
            "Draw diagrams while explaining",
            "Practice with time constraints"
          ],
          successCriteria: [
            "Clear step-by-step explanation",
            "Appropriate use of examples",
            "Correct time/space complexity analysis"
          ]
        }
      ],
      behavioral: [
        {
          title: "Leadership Story Development",
          description: "Develop compelling leadership examples",
          type: "reflection" as const,
          difficulty: "medium" as const,
          instructions: [
            "Identify 3 leadership experiences",
            "Structure using STAR method",
            "Focus on impact and learning",
            "Practice delivery with confidence"
          ],
          successCriteria: [
            "Demonstrates leadership qualities",
            "Shows measurable impact",
            "Includes lessons learned"
          ]
        }
      ],
      confidence: [
        {
          title: "Power Posing Practice",
          description: "Build confidence through body language",
          type: "practice" as const,
          difficulty: "easy" as const,
          instructions: [
            "Practice power poses for 2 minutes",
            "Maintain eye contact in mirror",
            "Practice confident handshake",
            "Record mock interview sessions"
          ],
          successCriteria: [
            "Confident posture maintained",
            "Strong eye contact",
            "Firm handshake",
            "Reduced nervous gestures"
          ]
        }
      ]
    };

    const templates = exerciseTemplates[category as keyof typeof exerciseTemplates] || [];
    return templates.map((template, index) => ({
      id: `exercise-${category}-${index}`,
      ...template,
      estimatedTime: template.difficulty === "easy" ? 30 : template.difficulty === "medium" ? 60 : 90,
      completed: false,
    }));
  };

  const generateResources = (category: string): Resource[] => {
    const resourceTemplates = {
      communication: [
        {
          title: "Toastmasters International",
          type: "tool" as const,
          description: "Join local speaking club to practice communication skills",
          rating: 4.8,
          estimatedTime: 120,
          free: false,
          url: "https://toastmasters.org"
        },
        {
          title: "TED Talk: How to Speak So People Want to Listen",
          type: "video" as const,
          description: "Julian Treasure's guide to powerful speaking",
          rating: 4.9,
          estimatedTime: 20,
          free: true,
          url: "https://ted.com"
        }
      ],
      technical: [
        {
          title: "Cracking the Coding Interview",
          type: "book" as const,
          description: "Comprehensive guide to technical interview preparation",
          rating: 4.7,
          estimatedTime: 1200,
          free: false
        },
        {
          title: "LeetCode Premium",
          type: "tool" as const,
          description: "Practice coding problems with company-specific questions",
          rating: 4.6,
          estimatedTime: 60,
          free: false,
          url: "https://leetcode.com"
        }
      ],
      behavioral: [
        {
          title: "Behavioral Interview Masterclass",
          type: "course" as const,
          description: "Complete course on behavioral interview techniques",
          rating: 4.5,
          estimatedTime: 180,
          free: false
        }
      ],
      confidence: [
        {
          title: "Presence by Amy Cuddy",
          type: "book" as const,
          description: "Learn how body language shapes who you are",
          rating: 4.4,
          estimatedTime: 480,
          free: false
        }
      ]
    };

    const templates = resourceTemplates[category as keyof typeof resourceTemplates] || [];
    return templates.map((template, index) => ({
      id: `resource-${category}-${index}`,
      ...template,
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "communication": return MessageSquare;
      case "technical": return Brain;
      case "behavioral": return Users;
      case "confidence": return Star;
      case "presentation": return Award;
      default: return Target;
    }
  };

  if (isGenerating) {
    return (
      <div className={`rounded-lg shadow-lg p-8 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
        <h3 className="text-lg font-semibold mb-2">Generating Your Personalized Roadmap</h3>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          AI is analyzing your performance and creating targeted improvement plans...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex items-center gap-4">
        <span className="font-medium">Roadmap Timeframe:</span>
        {["30", "60", "90"].map((timeframe) => (
          <button
            key={timeframe}
            onClick={() => setSelectedTimeframe(timeframe as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTimeframe === timeframe
                ? "bg-blue-600 text-white"
                : isDarkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {timeframe} Days
          </button>
        ))}
      </div>

      {/* Milestones */}
      <div className="space-y-4">
        {roadmap[selectedTimeframe].map((milestone, index) => {
          const CategoryIcon = getCategoryIcon(milestone.category);
          const isExpanded = selectedMilestone === milestone.id;
          
          return (
            <div
              key={milestone.id}
              className={`rounded-lg shadow-lg border-2 transition-all ${
                isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
              }`}
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => setSelectedMilestone(isExpanded ? null : milestone.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      milestone.status === 'completed' ? 'bg-green-500' :
                      milestone.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                    } text-white`}>
                      <CategoryIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{milestone.title}</h3>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                        {milestone.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(milestone.priority)}`}>
                          {milestone.priority.toUpperCase()} PRIORITY
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Due: {new Date(milestone.deadline).toLocaleDateString()}
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          ~{milestone.estimatedTimeToComplete}h
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {milestone.currentScore} → {milestone.targetScore}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Target Score
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className={`border-t p-6 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Exercises */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Practice Exercises
                      </h4>
                      <div className="space-y-3">
                        {milestone.exercises.map((exercise) => (
                          <div
                            key={exercise.id}
                            className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">{exercise.title}</h5>
                              <button
                                onClick={() => onStartExercise && onStartExercise(exercise)}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                <Play className="w-3 h-3" />
                                Start
                              </button>
                            </div>
                            <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {exercise.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs">
                              <span className={`px-2 py-1 rounded ${
                                exercise.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                exercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {exercise.difficulty.toUpperCase()}
                              </span>
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                <Clock className="w-3 h-3 inline mr-1" />
                                {exercise.estimatedTime}min
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Recommended Resources
                      </h4>
                      <div className="space-y-3">
                        {milestone.resources.map((resource) => (
                          <div
                            key={resource.id}
                            className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-blue-50'}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-blue-700">{resource.title}</h5>
                              <div className="flex items-center gap-2">
                                {resource.free && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                    FREE
                                  </span>
                                )}
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < Math.floor(resource.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {resource.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Clock className="w-3 h-3 inline mr-1" />
                                {Math.floor(resource.estimatedTime / 60)}h {resource.estimatedTime % 60}min
                              </span>
                              {resource.url && (
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                >
                                  View Resource
                                  <ArrowRight className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                    <button
                      onClick={() => onScheduleFollowUp && onScheduleFollowUp([milestone])}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Follow-up
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                      <Download className="w-4 h-4" />
                      Export Plan
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      <Share2 className="w-4 h-4" />
                      Share with Mentor
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
