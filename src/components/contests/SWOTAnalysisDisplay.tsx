import React, { useEffect, useState } from 'react';
import { Target, TrendingUp, AlertTriangle, Lightbulb, BookOpen, Briefcase, Trophy, Clock } from 'lucide-react';
import { swotAnalysisService, SWOTAnalysis } from '../../services/swotAnalysisService';

interface SWOTAnalysisDisplayProps {
  userId: string;
  contestId: string;
}

export const SWOTAnalysisDisplay: React.FC<SWOTAnalysisDisplayProps> = ({ userId, contestId }) => {
  const [swotData, setSwotData] = useState<SWOTAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSWOTAnalysis();
  }, [userId, contestId]);

  const loadSWOTAnalysis = async () => {
    try {
      const data = await swotAnalysisService.getSWOTAnalysis(userId, contestId);
      setSwotData(data);
    } catch (error) {
      console.error('Error loading SWOT analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!swotData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">SWOT analysis not available</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'skill-development': return <Target className="w-5 h-5" />;
      case 'practice': return <Trophy className="w-5 h-5" />;
      case 'career': return <Briefcase className="w-5 h-5" />;
      case 'learning-path': return <BookOpen className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Your SWOT Analysis</h1>
        <p className="text-blue-100">Personalized insights to help you grow</p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span>Overall Score: {swotData.overallScore}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>Accuracy: {swotData.performanceMetrics.accuracy}%</span>
          </div>
        </div>
      </div>

      {/* SWOT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-green-900 dark:text-green-100">Strengths</h2>
          </div>
          <ul className="space-y-2">
            {swotData.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-green-800 dark:text-green-200">
                <span className="text-green-600 mt-1">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-2 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-600 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-red-900 dark:text-red-100">Weaknesses</h2>
          </div>
          <ul className="space-y-2">
            {swotData.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start gap-2 text-red-800 dark:text-red-200">
                <span className="text-red-600 mt-1">!</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">Opportunities</h2>
          </div>
          <ul className="space-y-2">
            {swotData.opportunities.map((opportunity, index) => (
              <li key={index} className="flex items-start gap-2 text-blue-800 dark:text-blue-200">
                <span className="text-blue-600 mt-1">→</span>
                <span>{opportunity}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Threats */}
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border-2 border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-600 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-orange-900 dark:text-orange-100">Threats</h2>
          </div>
          <ul className="space-y-2">
            {swotData.threats.map((threat, index) => (
              <li key={index} className="flex items-start gap-2 text-orange-800 dark:text-orange-200">
                <span className="text-orange-600 mt-1">⚠</span>
                <span>{threat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Performance Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{swotData.performanceMetrics.accuracy}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{swotData.performanceMetrics.speed}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Speed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{swotData.performanceMetrics.consistency}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Consistency</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{swotData.overallScore}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Overall</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Personalized Recommendations</h2>
        <div className="space-y-6">
          {swotData.recommendations.map((recommendation, index) => (
            <div
              key={index}
              className={`border-2 rounded-lg p-6 ${getPriorityColor(recommendation.priority)} transition-all hover:shadow-lg`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/50 rounded-lg">
                    {getRecommendationIcon(recommendation.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{recommendation.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-white/50 rounded-full font-medium">
                        {recommendation.type.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs px-2 py-1 bg-white/50 rounded-full font-medium">
                        Priority: {recommendation.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{recommendation.estimatedTime}</span>
                </div>
              </div>

              <p className="mb-4 text-sm">{recommendation.description}</p>

              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-sm">Action Items:</h4>
                <ul className="space-y-1">
                  {recommendation.actionItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {recommendation.resources.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Resources:</h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.resources.map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1 bg-white hover:bg-gray-50 rounded-full border border-gray-300 transition-colors"
                      >
                        {resource.title} ({resource.type})
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Category Performance */}
      {Object.keys(swotData.performanceMetrics.categoryScores).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Category Performance</h2>
          <div className="space-y-4">
            {Object.entries(swotData.performanceMetrics.categoryScores).map(([category, score]) => (
              <div key={category}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{category}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{score.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      score >= 80 ? 'bg-green-500' :
                      score >= 60 ? 'bg-blue-500' :
                      score >= 40 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
