import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Target,
  TrendingUp,
  Sparkles,
  BookOpen,
  ExternalLink,
  Lightbulb,
  Link2,
  AlertCircle,
  Trash2,
  Network,
  List,
} from "lucide-react";
import { StudyPlan } from "../../types/studyPlan";
import { studyPlanService } from "../../utils/studyPlanService";
import { studyPlanAIService } from "../../utils/studyPlanAIService";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { calendarService } from "../../utils/calendarService";
import { firestoreUserTasks } from "../../utils/firestoreUserTasks";
import { DopamineSpikeCelebration } from "../ui/DopamineSpikeCelebration";

interface StudyPlanTreeProps {
  plan: StudyPlan;
  onBack: () => void;
  onPlanDeleted: () => void;
  onPlanUpdated: () => void;
  onViewModeChange?: (mode: "tree" | "list") => void;
}

interface TreeNodeProps {
  node: {
    type: "root" | "week" | "day";
    data: any;
    weekIndex?: number;
    dayIndex?: number;
  };
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  onTaskToggle?: (completed: boolean) => void;
  onWeekToggle?: (completed: boolean) => void;
  onRegenerateWeek?: () => void;
  onLoadDayDetails?: () => void;
  onDelete?: () => void;
  dayDetails?: any;
  isLoadingDetails?: boolean;
  isLast?: boolean;
  hasSiblings?: boolean;
  isFirst?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  isExpanded,
  onToggle,
  onTaskToggle,
  onWeekToggle,
  onRegenerateWeek,
  onLoadDayDetails,
  onDelete,
  dayDetails,
  isLoadingDetails,
  isLast,
  hasSiblings,
  isFirst,
}) => {
  const { type, data, weekIndex, dayIndex } = node;

  // Load day details when expanded
  useEffect(() => {
    if (isExpanded && type === "day" && onLoadDayDetails && !dayDetails && !isLoadingDetails) {
      onLoadDayDetails();
    }
  }, [isExpanded, type, onLoadDayDetails, dayDetails, isLoadingDetails]);

  const renderRootNode = () => (
    <div className="relative">
      {/* Root Node */}
      <div
        className="relative bg-gradient-to-br from-blue-600 via-teal-500 to-cyan-600 dark:from-blue-700 dark:via-teal-600 dark:to-cyan-700 rounded-2xl shadow-2xl border-2 border-blue-400 dark:border-blue-500 p-6 cursor-pointer hover:scale-[1.02] transition-all duration-300 group"
        onClick={onToggle}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-teal-400/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  {data.goal}
                </h1>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
                  data.difficulty === "beginner"
                    ? "bg-green-500 text-white"
                    : data.difficulty === "intermediate"
                    ? "bg-yellow-500 text-white"
                    : "bg-red-500 text-white"
                }`}>
                  {data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1)}
                </span>
              </div>
              <p className="text-white/90 mb-4 leading-relaxed text-lg">
                {data.overview}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-300 transform hover:scale-110"
              title="Delete plan"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2 p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <div className="p-1.5 bg-white/30 rounded-lg">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-white/80">Duration</div>
                <div className="text-sm font-bold text-white">{data.durationWeeks} weeks</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <div className="p-1.5 bg-white/30 rounded-lg">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-white/80">Daily</div>
                <div className="text-sm font-bold text-white">{data.dailyHours}h/day</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <div className="p-1.5 bg-white/30 rounded-lg">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-white/80">Progress</div>
                <div className="text-sm font-bold text-white">{Math.round(data.totalProgress || 0)}%</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <div className="p-1.5 bg-white/30 rounded-lg">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-white/80">Status</div>
                <div className="text-sm font-bold text-white capitalize">{data.status || "active"}</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">Overall Progress</span>
              <span className="text-sm font-bold text-white">
                {Math.round(data.totalProgress || 0)}%
              </span>
            </div>
            <div className="relative w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="relative bg-white h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
                style={{ width: `${data.totalProgress || 0}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shine"></div>
              </div>
            </div>
          </div>

          {/* Expand/Collapse Indicator */}
          <div className="flex items-center justify-center gap-2 text-white/80 group-hover:text-white transition-colors">
            {isExpanded ? (
              <>
                <ChevronDown className="w-5 h-5" />
                <span className="text-sm font-medium">Hide Weeks</span>
              </>
            ) : (
              <>
                <ChevronRight className="w-5 h-5" />
                <span className="text-sm font-medium">Show Weeks</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderWeekNode = () => {
    const weekCompletedTasks = data.dailyPlan.filter((d: any) => d.completed).length;
    const weekTotalTasks = data.dailyPlan.length;
    const weekProgress = weekTotalTasks > 0 ? (weekCompletedTasks / weekTotalTasks) * 100 : 0;

    return (
      <div className="relative">
        {/* Week Node */}
        <div
          className={`relative bg-gradient-to-br from-slate-600 via-blue-600 to-slate-700 dark:from-slate-700 dark:via-blue-700 dark:to-slate-800 rounded-xl shadow-xl border-2 border-slate-400 dark:border-slate-500 p-5 cursor-pointer hover:scale-[1.02] transition-all duration-300 group ${
            data.completed ? "ring-2 ring-emerald-400" : ""
          }`}
          onClick={onToggle}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-400/30 to-blue-400/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-white" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-white" />
                  )}
                  <h3 className="text-xl font-bold text-white drop-shadow-md">
                    Week {data.week}: {data.focus}
                  </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWeekToggle?.(!data.completed);
                }}
                className="btn-touch hover:scale-110 transition-transform duration-200 flex-shrink-0"
              >
                {data.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-300" />
                ) : (
                  <Circle className="w-5 h-5 text-white/60 hover:text-white transition-colors duration-200" />
                )}
              </button>
                </div>
                {data.summary && (
                  <p className="text-sm font-medium text-white/90 mb-2 leading-relaxed">
                    {data.summary}
                  </p>
                )}
                <p className="text-sm text-white/80 leading-relaxed mb-3">
                  {data.description}
                </p>
                {data.learningGoals && data.learningGoals.length > 0 && (
                              <div className="mt-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-blue-200" />
                      Learning Goals:
                    </div>
                    <ul className="space-y-1.5">
                      {data.learningGoals.map((goal: string, idx: number) => (
                        <li key={idx} className="text-xs text-white/90 flex items-start gap-2 leading-relaxed">
                          <span className="text-white mt-1 flex-shrink-0">•</span>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-3 flex items-center gap-4 pt-3 border-t border-white/20">
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <Target className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      {weekCompletedTasks}/{weekTotalTasks} tasks
                    </span>
                  </div>
                  <div className="flex-1 max-w-xs bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
                      style={{ width: `${weekProgress}%` }}
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRegenerateWeek?.();
                }}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                title="Regenerate week plan"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDayNode = () => {
    return (
      <div className="relative">
        {/* Day Node */}
        <div
          className={`relative rounded-lg shadow-lg border-2 p-4 cursor-pointer hover:scale-[1.01] transition-all duration-300 group ${
            data.completed
              ? "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 dark:border-emerald-500"
              : "bg-gradient-to-br from-teal-500 via-cyan-500 to-teal-600 border-teal-400 dark:border-teal-500"
          }`}
          onClick={onToggle}
        >
          {/* Glow Effect */}
          <div className={`absolute inset-0 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            data.completed ? "bg-emerald-400/30" : "bg-teal-400/30"
          }`}></div>
          
          <div className="relative z-10">
            <div className="flex items-start gap-3 mb-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskToggle?.(!data.completed);
                }}
                className="mt-0.5 btn-touch hover:scale-110 transition-transform duration-200"
              >
                {data.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <Circle className="w-5 h-5 text-white/60 group-hover:text-white transition-colors duration-200" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-white" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white" />
                  )}
                  <h4 className="font-semibold text-white drop-shadow-sm">
                    Day {data.day}: {data.topic}
                  </h4>
                  {data.dayType && (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shadow-sm ${
                      data.dayType === "rest" 
                        ? "bg-white/30 text-white"
                        : data.dayType === "review"
                        ? "bg-yellow-400/80 text-white"
                        : "bg-white/30 text-white"
                    }`}>
                      {data.dayType === "rest" ? "☕ Rest" : data.dayType === "review" ? "🧩 Review" : "📚 Study"}
                    </span>
                  )}
                  {data.hours > 0 && (
                    <div className="flex items-center gap-1 text-xs text-white/90 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{data.hours}h</span>
                    </div>
                  )}
                </div>
                <ul className="list-none space-y-1.5 text-sm text-white/90">
                  {data.tasks.map((task: string, taskIndex: number) => (
                    <li key={taskIndex} className="flex items-start gap-2">
                      <span className="text-white mt-1.5 flex-shrink-0">•</span>
                      <span className="leading-relaxed">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Day Details */}
        {isExpanded && (
          <div className="mt-3 ml-8 border-l-2 border-teal-300 dark:border-teal-500 pl-4">
            <div className="bg-white/95 dark:bg-slate-800/95 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-5">
                  {isLoadingDetails ? (
                <div className="flex items-center justify-center py-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur"></div>
                    <div className="relative animate-spin rounded-full h-8 w-8 border-2 border-blue-200 dark:border-blue-800 border-t-blue-500"></div>
                  </div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400 font-medium">Loading day details...</span>
                </div>
              ) : dayDetails ? (
                <div className="space-y-4">
                  {/* Suggestions */}
                  {dayDetails.suggestions && dayDetails.suggestions.length > 0 && (
                    <div className="p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 shadow-sm">
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                        Suggestions for Today
                      </h5>
                      <ul className="space-y-2">
                        {dayDetails.suggestions.map((suggestion: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 leading-relaxed">
                            <span className="text-blue-500 mt-1.5 flex-shrink-0">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Detailed Tasks */}
                  {dayDetails.detailedTasks && dayDetails.detailedTasks.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        Detailed Task Breakdown
                      </h5>
                      <div className="space-y-3">
                        {dayDetails.detailedTasks.map((detailedTask: any, idx: number) => (
                          <div key={idx} className="p-4 bg-gray-50/80 dark:bg-slate-700/30 rounded-xl border border-gray-200/80 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{detailedTask.task}</h6>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{detailedTask.description}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1 ml-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  detailedTask.priority === "high"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    : detailedTask.priority === "low"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                }`}>
                                  {detailedTask.priority}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {detailedTask.estimatedTime}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Resources */}
                  {dayDetails.resources && dayDetails.resources.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-teal-600" />
                        Learning Resources
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {dayDetails.resources.map((resource: any, idx: number) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 bg-gray-50/80 dark:bg-slate-700/30 rounded-xl border border-gray-200/80 dark:border-slate-600/50 hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-200 group shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300">
                                    {resource.type}
                                  </span>
                                </div>
                                <h6 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200 truncate mb-1">
                                  {resource.title}
                                </h6>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                  {resource.description}
                                </p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-teal-500 flex-shrink-0 mt-1" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Tips */}
                  {dayDetails.tips && dayDetails.tips.length > 0 && (
                    <div className="p-4 bg-yellow-50/80 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800/30 shadow-sm">
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        Study Tips
                      </h5>
                      <ul className="space-y-2">
                        {dayDetails.tips.map((tip: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 leading-relaxed">
                            <span className="text-yellow-500 mt-1.5 flex-shrink-0">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Motivation */}
                  {dayDetails.motivation && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{dayDetails.motivation}</span>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">Failed to load day details. Please try again.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  switch (type) {
    case "root":
      return renderRootNode();
    case "week":
      return renderWeekNode();
    case "day":
      return renderDayNode();
    default:
      return null;
  }
};

export const StudyPlanTree: React.FC<StudyPlanTreeProps> = ({
  plan,
  onBack,
  onPlanDeleted,
  onPlanUpdated,
  onViewModeChange,
}) => {
  const user = realTimeAuth.getCurrentUser();
  const [expandedRoot, setExpandedRoot] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(
    new Set(plan.weeks && plan.weeks.length > 0 ? [plan.weeks[0].week] : [])
  );
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [dayDetails, setDayDetails] = useState<Map<string, any>>(new Map());
  const [loadingDayDetails, setLoadingDayDetails] = useState<Set<string>>(new Set());
  const [regenerating, setRegenerating] = useState(false);
  const [syncingToCalendar, setSyncingToCalendar] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationTaskTitle, setCelebrationTaskTitle] = useState<string>("");

  // Load saved day details from plan data on mount
  useEffect(() => {
    if (!plan.weeks) return;
    
    const savedDetails = new Map<string, any>();
    plan.weeks.forEach((week, weekIndex) => {
      week.dailyPlan.forEach((day, dayIndex) => {
        if (day.dayDetails) {
          const dayKey = `${weekIndex}-${dayIndex}`;
          savedDetails.set(dayKey, day.dayDetails);
        }
      });
    });
    
    if (savedDetails.size > 0) {
      setDayDetails(savedDetails);
    }
  }, [plan]);

  const toggleRoot = () => {
    setExpandedRoot(!expandedRoot);
  };

  const toggleWeek = (weekNumber: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekNumber)) {
      newExpanded.delete(weekNumber);
    } else {
      newExpanded.add(weekNumber);
    }
    setExpandedWeeks(newExpanded);
  };

  const toggleDay = (weekIndex: number, dayIndex: number) => {
    const dayKey = `${weekIndex}-${dayIndex}`;
    const newExpanded = new Set(expandedDays);
    
    if (newExpanded.has(dayKey)) {
      newExpanded.delete(dayKey);
    } else {
      newExpanded.add(dayKey);
    }
    
    setExpandedDays(newExpanded);
  };

  const loadDayDetails = async (weekIndex: number, dayIndex: number, dayKey: string) => {
    if (!user) return;
    
    const week = plan.weeks[weekIndex];
    const day = week.dailyPlan[dayIndex];
    
    if (day.dayDetails) {
      setDayDetails(prev => {
        const newMap = new Map(prev);
        newMap.set(dayKey, day.dayDetails);
        return newMap;
      });
      return;
    }
    
    setLoadingDayDetails(prev => new Set(prev).add(dayKey));
    
    try {
      const details = await studyPlanAIService.generateDayDetails(
        plan.goal,
        week.focus,
        day,
        plan.difficulty
      );
      
      const detailsWithTimestamp = {
        ...details,
        generatedAt: new Date(),
      };
      
      setDayDetails(prev => {
        const newMap = new Map(prev);
        newMap.set(dayKey, detailsWithTimestamp);
        return newMap;
      });
      
      try {
        await studyPlanService.saveDayDetails(
          user.id,
          plan.id,
          weekIndex,
          dayIndex,
          detailsWithTimestamp
        );
      } catch (saveError) {
        console.error("Error saving day details to Firestore:", saveError);
      }
    } catch (error) {
      console.error("Error loading day details:", error);
    } finally {
      setLoadingDayDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(dayKey);
        return newSet;
      });
    }
  };

  const handleTaskToggle = async (weekIndex: number, dayIndex: number, completed: boolean) => {
    if (!user) return;

    const week = plan.weeks[weekIndex];
    const day = week?.dailyPlan[dayIndex];
    
    if (completed && day && !day.completed) {
      setCelebrationTaskTitle(`${day.topic} - ${plan.goal}`);
      setShowCelebration(true);
    }

    try {
      await studyPlanService.updateTask(
        user.id,
        plan.id,
        weekIndex,
        dayIndex,
        {
          completed,
          completedAt: completed ? new Date() : undefined,
        }
      );
      
      onPlanUpdated();
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
      if (completed) {
        setShowCelebration(false);
      }
    }
  };

  const handleWeekToggle = async (weekIndex: number, completed: boolean) => {
    if (!user) return;

    const week = plan.weeks[weekIndex];
    
    if (completed && week && !week.completed) {
      setCelebrationTaskTitle(`Week ${week.week}: ${week.focus}`);
      setShowCelebration(true);
    }

    try {
      await studyPlanService.updateWeek(user.id, plan.id, weekIndex, {
        completed,
        completedAt: completed ? new Date() : undefined,
      });
      
      onPlanUpdated();
    } catch (error) {
      console.error("Error updating week:", error);
      alert("Failed to update week. Please try again.");
      if (completed) {
        setShowCelebration(false);
      }
    }
  };

  const handleRegenerateWeek = async (weekIndex: number) => {
    if (!user) return;

    try {
      setRegenerating(true);
      const week = plan.weeks[weekIndex];
      const newWeek = await studyPlanAIService.regenerateWeek(
        week.week,
        week.focus,
        plan.difficulty,
        plan.dailyHours
      );

      await studyPlanService.updateWeek(user.id, plan.id, weekIndex, newWeek);
      onPlanUpdated();
    } catch (error) {
      console.error("Error regenerating week:", error);
      alert("Failed to regenerate week. Please try again.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    if (window.confirm("Are you sure you want to delete this study plan?")) {
      try {
        await studyPlanService.deletePlan(user.id, plan.id);
        onPlanDeleted();
      } catch (error) {
        console.error("Error deleting plan:", error);
        alert("Failed to delete plan. Please try again.");
      }
    }
  };

  const handleSyncToCalendar = async () => {
    if (!user) return;

    try {
      setSyncingToCalendar(true);

      for (const week of plan.weeks) {
        for (const day of week.dailyPlan) {
          if (!day.completed) {
            const startDate = plan.startedAt || new Date();
            const weekStart = new Date(startDate);
            weekStart.setDate(weekStart.getDate() + (week.week - 1) * 7);
            const dueDate = new Date(weekStart);
            dueDate.setDate(weekStart.getDate() + day.day - 1);

            await firestoreUserTasks.addTask(user.id, {
              title: `${day.topic} - ${plan.goal}`,
              description: day.tasks.join("\n"),
              subject: plan.goal,
              dueDate: dueDate.toISOString(),
              priority: plan.difficulty === "advanced" ? "high" : "medium",
              status: "pending",
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      await calendarService.syncTodosToCalendar(user.id);
      alert("✅ Study plan tasks have been synced to your calendar and todos!");
    } catch (error) {
      console.error("Error syncing to calendar:", error);
      alert("Failed to sync to calendar. Please try again.");
    } finally {
      setSyncingToCalendar(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header with Back Button and View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 btn-touch transition-colors duration-300 group"
        >
          <span className="text-2xl">←</span>
          <span className="font-medium">Back to Plans</span>
        </button>
        
        {/* View Mode Toggle */}
        {onViewModeChange && (
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange("tree")}
              className="flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 bg-blue-500 text-white shadow-md"
            >
              <Network className="w-4 h-4" />
              <span className="text-sm font-medium">Tree View</span>
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className="flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">List View</span>
            </button>
          </div>
        )}
      </div>

      {/* Tree Container */}
      <div className="relative">
        {/* Root Node */}
        <div className="mb-8">
          <TreeNode
            node={{
              type: "root",
              data: plan,
            }}
            level={0}
            isExpanded={expandedRoot}
            onToggle={toggleRoot}
            onDelete={handleDelete}
          />
        </div>

        {/* Weeks (Children of Root) */}
        {expandedRoot && plan.weeks && plan.weeks.length > 0 && (
          <div className="space-y-6 relative">
            {/* Vertical connecting line from root to weeks */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-teal-400 to-transparent opacity-60"></div>
            
            <div className="space-y-6 ml-12">
              {plan.weeks.map((week, weekIndex) => {
                const isWeekExpanded = expandedWeeks.has(week.week);
                const isLastWeek = weekIndex === plan.weeks.length - 1;
                
                return (
                  <div key={week.week} className="relative">
                    {/* Horizontal connecting line from vertical line to week */}
                    <div className="absolute left-[-3rem] top-1/2 w-12 h-0.5 bg-gradient-to-r from-blue-400 to-teal-400 transform -translate-y-1/2 opacity-60"></div>
                    
                    {/* Week Node */}
                    <div className="mb-4">
                      <TreeNode
                        node={{
                          type: "week",
                          data: week,
                          weekIndex,
                        }}
                        level={1}
                        isExpanded={isWeekExpanded}
                        onToggle={() => toggleWeek(week.week)}
                        onWeekToggle={(completed) => handleWeekToggle(weekIndex, completed)}
                        onRegenerateWeek={() => handleRegenerateWeek(weekIndex)}
                      />
                    </div>

                    {/* Days (Children of Week) */}
                    {isWeekExpanded && week.dailyPlan && week.dailyPlan.length > 0 && (
                      <div className="space-y-3 ml-12 relative">
                        {/* Vertical connecting line from week to days */}
                        <div className="absolute left-[-3rem] top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-400 to-teal-400 opacity-60"></div>
                        
                        {week.dailyPlan.map((day, dayIndex) => {
                          const dayKey = `${weekIndex}-${dayIndex}`;
                          const isDayExpanded = expandedDays.has(dayKey);
                          const details = dayDetails.get(dayKey);
                          const isLoading = loadingDayDetails.has(dayKey);
                          const isLastDay = dayIndex === week.dailyPlan.length - 1;
                          
                          return (
                            <div key={day.day} className="relative">
                              {/* Horizontal connecting line from vertical line to day */}
                              <div className="absolute left-[-3rem] top-1/2 w-12 h-0.5 bg-gradient-to-r from-slate-400 to-teal-400 transform -translate-y-1/2 opacity-60"></div>
                              
                              <TreeNode
                                node={{
                                  type: "day",
                                  data: day,
                                  weekIndex,
                                  dayIndex,
                                }}
                                level={2}
                                isExpanded={isDayExpanded}
                                onToggle={() => toggleDay(weekIndex, dayIndex)}
                                onTaskToggle={(completed) => handleTaskToggle(weekIndex, dayIndex, completed)}
                                onLoadDayDetails={() => loadDayDetails(weekIndex, dayIndex, dayKey)}
                                dayDetails={details}
                                isLoadingDetails={isLoading}
                                isLast={isLastDay}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sync to Calendar Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSyncToCalendar}
            disabled={syncingToCalendar}
            className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 btn-touch font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transform overflow-hidden group"
          >
            <Calendar className="w-5 h-5 relative z-10" />
            <span className="relative z-10">{syncingToCalendar ? "Syncing..." : "Sync to Calendar"}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </button>
        </div>
      </div>

      {/* Celebration Effect */}
      <DopamineSpikeCelebration
        isVisible={showCelebration}
        taskTitle={celebrationTaskTitle}
        priority="medium"
        onComplete={() => {
          setShowCelebration(false);
          setCelebrationTaskTitle("");
        }}
      />
    </div>
  );
};

