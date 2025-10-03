import React from "react";
import { motion } from "framer-motion";
import {
  Play,
  Mic,
  Video,
  Users,
  MessageSquare,
  BarChart3,
  Target,
  CheckCircle,
  TrendingUp,
  Award,
  Clock,
  Zap,
} from "lucide-react";

interface DemoContentProps {
  category: string;
  step: string;
}

export const DemoContent: React.FC<DemoContentProps> = ({ category, step }) => {
  const renderInterviewDemo = () => {
    switch (step) {
      case "setup":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Personalized Interview Setup
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Interview Type</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Technical</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Industry</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Software Engineering</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Experience Level</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Mid-Level</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">45 minutes</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Questions</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">12 adaptive</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Difficulty</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Auto-adjusting</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "analysis":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                Real-Time Performance Analysis
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Content Quality</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                        <div className="w-12 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-green-600">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Vocal Confidence</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                        <div className="w-14 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-blue-600">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pacing</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                        <div className="w-10 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-yellow-600">78%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Eye Contact</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                        <div className="w-13 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-green-600">88%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Body Language</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                        <div className="w-11 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-blue-600">82%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Overall Score</span>
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">85/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "feedback":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Actionable Insights & Recommendations
              </h4>
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">Excellent Technical Knowledge</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Your answers demonstrated strong understanding of system design principles.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">Improve Speaking Pace</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Consider slowing down slightly to allow for better comprehension and emphasis.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Target className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">Next Practice Focus</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Practice behavioral questions to complement your strong technical skills.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderVideoDemo = () => {
    switch (step) {
      case "connection":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Video className="w-5 h-5 mr-2 text-green-600" />
                Instant Video Connection
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Connection Status</span>
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded-full">Connected</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>HD Quality • 0ms latency</span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Room ID</span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-1 rounded-full">interview-2024</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Share this ID to invite participants
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Video Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "collaboration":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Advanced Collaboration Features
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Screen Sharing</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Share your screen for technical demos</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Recording</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Record sessions for later review</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Live Chat</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Real-time messaging during calls</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Multi-participant</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Support for up to 4 participants</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "management":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-purple-600" />
                Smart Room Management
              </h4>
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Scheduled Sessions</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Technical Interview Practice</span>
                      <span className="text-gray-900 dark:text-gray-100">Today, 3:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Behavioral Questions Review</span>
                      <span className="text-gray-900 dark:text-gray-100">Tomorrow, 10:00 AM</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Participant Permissions</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Screen sharing</span>
                      <span className="text-green-600">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Recording</span>
                      <span className="text-blue-600">Host only</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderStudyDemo = () => {
    switch (step) {
      case "assistant":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
                AI Study Companion
              </h4>
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        "Based on your recent interview performance, I recommend focusing on system design questions. 
                        Would you like me to create a personalized study plan?"
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">You</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        "Yes, please create a study plan for system design interviews."
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                        "Perfect! I've created a 2-week system design study plan:"
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Week 1: Scalability fundamentals & Load balancing</li>
                        <li>• Week 2: Database design & Caching strategies</li>
                        <li>• Practice: 3 mock interviews with increasing complexity</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return renderStudyDemo();
    }
  };

  const renderAnalyticsDemo = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            Performance Analytics Dashboard
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">85%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
              <div className="text-xs text-green-600 mt-1">↑ 12% this week</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">23</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Interviews Completed</div>
              <div className="text-xs text-blue-600 mt-1">5 this week</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">4.2</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Confidence</div>
              <div className="text-xs text-purple-600 mt-1">↑ 0.8 points</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render appropriate demo content based on category and step
  switch (category) {
    case "interview":
      return renderInterviewDemo();
    case "video":
      return renderVideoDemo();
    case "study":
      return renderStudyDemo();
    case "analytics":
      return renderAnalyticsDemo();
    default:
      return null;
  }
};
