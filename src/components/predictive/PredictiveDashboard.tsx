import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Brain,
  Clock,
  Award,
  BookOpen,
  Users,
  Zap,
  Activity,
  Shield,
  Heart,
} from 'lucide-react';
import { predictiveLearningEngine, RiskPrediction, AdaptiveLearningPath } from '../../services/predictiveLearningEngine';
import { knowledgeGraphService, KnowledgeNode } from '../../services/knowledgeGraphService';

interface PredictiveDashboardProps {
  userId: string;
}

export const PredictiveDashboard: React.FC<PredictiveDashboardProps> = ({ userId }) => {
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);
  const [learningPath, setLearningPath] = useState<AdaptiveLearningPath | null>(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'path' | 'knowledge'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [pred, path, graph] = await Promise.all([
        predictiveLearningEngine.getLatestPrediction(userId) || predictiveLearningEngine.predictStudentRisk(userId),
        knowledgeGraphService.getLearningPath(userId) || knowledgeGraphService.generateAdaptivePath(userId),
        knowledgeGraphService.getKnowledgeGraph(userId),
      ]);

      setPrediction(pred);
      setLearningPath(path);
      setKnowledgeGraph(graph);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your personalized insights...</p>
        </div>
      </div>
    );
  }

  if (!prediction || !learningPath) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">Unable to load predictive data</p>
        <button 
          onClick={loadDashboardData}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your AI Learning Assistant</h1>
            <p className="text-blue-100">
              Personalized insights powered by predictive AI
            </p>
          </div>
          <Brain className="w-16 h-16 opacity-80" />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Activity className="w-5 h-5 inline-block mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('path')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'path'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Target className="w-5 h-5 inline-block mr-2" />
            Learning Path
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'knowledge'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Brain className="w-5 h-5 inline-block mr-2" />
            Knowledge Map
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab prediction={prediction} learningPath={learningPath} />
          )}
          {activeTab === 'path' && (
            <LearningPathTab path={learningPath} />
          )}
          {activeTab === 'knowledge' && (
            <KnowledgeMapTab graph={knowledgeGraph} />
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== OVERVIEW TAB ====================

const OverviewTab: React.FC<{ prediction: RiskPrediction; learningPath: AdaptiveLearningPath }> = ({
  prediction,
  learningPath,
}) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      default: return 'green';
    }
  };

  const riskColor = getRiskColor(prediction.riskLevel);

  return (
    <div className="space-y-6">
      {/* Risk Score Card */}
      <div className={`bg-${riskColor}-50 dark:bg-${riskColor}-900/20 border-2 border-${riskColor}-200 dark:border-${riskColor}-800 rounded-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {prediction.riskLevel === 'low' && <Shield className="w-8 h-8 text-green-600" />}
            {prediction.riskLevel === 'medium' && <Activity className="w-8 h-8 text-yellow-600" />}
            {(prediction.riskLevel === 'high' || prediction.riskLevel === 'critical') && (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Success Score: {100 - prediction.overallRiskScore}%
              </h2>
              <p className={`text-${riskColor}-700 dark:text-${riskColor}-300 font-medium`}>
                Risk Level: {prediction.riskLevel.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {(prediction.confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <RiskMetric
            label="Dropout Risk"
            score={prediction.predictions.dropoutRisk.score}
            trend={prediction.predictions.dropoutRisk.trend}
          />
          <RiskMetric
            label="Failure Risk"
            score={prediction.predictions.failureRisk.score}
            trend={prediction.predictions.failureRisk.trend}
          />
          <RiskMetric
            label="Burnout Risk"
            score={prediction.predictions.burnoutRisk.score}
            trend={prediction.predictions.burnoutRisk.trend}
          />
          <RiskMetric
            label="Disengagement"
            score={prediction.predictions.disengagementRisk.score}
            trend={prediction.predictions.disengagementRisk.trend}
          />
        </div>
      </div>

      {/* Protective Factors */}
      {prediction.protectiveFactors.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Strengths</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prediction.protectiveFactors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className={`p-2 bg-green-100 dark:bg-green-900/30 rounded-lg`}>
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{factor.factor}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{factor.description}</div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Strength: {factor.strength.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Areas for Improvement */}
      {prediction.contributingFactors.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Areas for Improvement</h3>
          </div>
          <div className="space-y-3">
            {prediction.contributingFactors.slice(0, 5).map((factor, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className={`p-2 bg-${getSeverityColor(factor.severity)}-100 dark:bg-${getSeverityColor(factor.severity)}-900/30 rounded-lg`}>
                  <Activity className={`w-5 h-5 text-${getSeverityColor(factor.severity)}-600`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900 dark:text-white">{factor.factor}</div>
                    <div className={`text-xs px-2 py-1 bg-${getSeverityColor(factor.severity)}-100 dark:bg-${getSeverityColor(factor.severity)}-900/30 text-${getSeverityColor(factor.severity)}-700 dark:text-${getSeverityColor(factor.severity)}-300 rounded-full`}>
                      {factor.severity.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{factor.description}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-gray-500">Impact: {(factor.weight * 100).toFixed(0)}%</span>
                    <span className="text-gray-400">•</span>
                    <span className={`text-${factor.trend === 'improving' ? 'green' : factor.trend === 'worsening' ? 'red' : 'gray'}-600`}>
                      {factor.trend === 'improving' && '↗ Improving'}
                      {factor.trend === 'worsening' && '↘ Worsening'}
                      {factor.trend === 'stable' && '→ Stable'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recommended Actions</h3>
        </div>
        <div className="space-y-4">
          {prediction.recommendedInterventions.map((intervention, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-lg border-l-4 border-blue-600">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-lg text-gray-900 dark:text-white">{intervention.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{intervention.description}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadgeClass(intervention.priority)}`}>
                  {intervention.priority.toUpperCase()}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action Steps:</div>
                <ul className="space-y-1">
                  {intervention.actions.map((action, aidx) => (
                    <li key={aidx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {intervention.resources && intervention.resources.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {intervention.resources.map((resource, ridx) => (
                    <a
                      key={ridx}
                      href={resource.url}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      {getResourceIcon(resource.type)}
                      {resource.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Progress</h3>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">{learningPath.currentLevel}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Level</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{learningPath.targetLevel}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Target Level</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{learningPath.estimatedTimeToTarget.toFixed(0)}h</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Est. Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== LEARNING PATH TAB ====================

const LearningPathTab: React.FC<{ path: AdaptiveLearningPath }> = ({ path }) => {
  return (
    <div className="space-y-6">
      {/* Next Milestone */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">{path.nextMilestone.title}</h2>
            <p className="text-purple-100">{path.nextMilestone.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <div className="text-sm text-purple-100">Target Date</div>
            <div className="text-lg font-bold">{path.nextMilestone.targetDate.toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-sm text-purple-100">Progress</div>
            <div className="text-lg font-bold">{path.nextMilestone.progress.toFixed(0)}%</div>
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-3">
          <div 
            className="bg-white rounded-full h-3 transition-all"
            style={{ width: `${path.nextMilestone.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Learning Path Steps */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          Your Personalized Learning Path
        </h3>
        
        {path.pathNodes.map((node, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-l-4 border-blue-600">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold">
                  {node.order}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">{node.topic}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {node.estimatedTime} min
                    </span>
                    <span>Current: {node.currentMastery}%</span>
                    <span>Target: {node.targetMastery}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progress to Target</span>
                <span>{((node.currentMastery / node.targetMastery) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2 transition-all"
                  style={{ width: `${(node.currentMastery / node.targetMastery) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Recommended Activities */}
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recommended Activities:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {node.recommendedActivities.slice(0, 4).map((activity, aidx) => (
                  <a
                    key={aidx}
                    href={activity.url}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      {getActivityIcon(activity.activityType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-white truncate">{activity.title}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {activity.estimatedTime} min • +{activity.expectedMasteryGain}% mastery
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== KNOWLEDGE MAP TAB ====================

const KnowledgeMapTab: React.FC<{ graph: KnowledgeNode[] }> = ({ graph }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(graph.map(n => n.category))];
  const filteredGraph = selectedCategory === 'all' 
    ? graph 
    : graph.filter(n => n.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Knowledge Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGraph.map((node, idx) => (
          <div
            key={idx}
            className={`bg-white dark:bg-gray-800 rounded-lg p-5 shadow-lg border-2 ${
              node.mastery >= 80 ? 'border-green-500' :
              node.mastery >= 60 ? 'border-blue-500' :
              node.mastery >= 40 ? 'border-yellow-500' :
              'border-gray-300 dark:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">{node.topicName}</h4>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{node.category}</div>
              </div>
              <div className={`text-2xl font-bold ${
                node.mastery >= 80 ? 'text-green-600' :
                node.mastery >= 60 ? 'text-blue-600' :
                node.mastery >= 40 ? 'text-yellow-600' :
                'text-gray-400'
              }`}>
                {node.mastery}%
              </div>
            </div>

            {/* Mastery Bar */}
            <div className="mb-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`rounded-full h-2 transition-all ${
                    node.mastery >= 80 ? 'bg-green-500' :
                    node.mastery >= 60 ? 'bg-blue-500' :
                    node.mastery >= 40 ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`}
                  style={{ width: `${node.mastery}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
              <div>Attempts: {node.timesAttempted}</div>
              <div>Confidence: {node.confidence}%</div>
              <div>Time: {Math.round(node.timeSpent)} min</div>
              <div>Last: {node.lastTested.toLocaleDateString()}</div>
            </div>

            {/* Prerequisites Status */}
            {!node.prerequisitesMet && (
              <div className="text-xs text-orange-600 dark:text-orange-400 mb-2">
                ⚠️ Prerequisites not met
              </div>
            )}

            {/* Strengths/Weaknesses */}
            {node.strengthIndicators.length > 0 && (
              <div className="text-xs text-green-600 dark:text-green-400 mb-1">
                ✓ {node.strengthIndicators[0]}
              </div>
            )}
            {node.weaknessIndicators.length > 0 && (
              <div className="text-xs text-red-600 dark:text-red-400">
                ✗ {node.weaknessIndicators[0]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== HELPER COMPONENTS ====================

const RiskMetric: React.FC<{ label: string; score: number; trend: string }> = ({ label, score, trend }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{label}</div>
      <div className={`text-2xl font-bold ${
        score < 30 ? 'text-green-600' :
        score < 60 ? 'text-yellow-600' :
        'text-red-600'
      }`}>
        {score}%
      </div>
      <div className="flex items-center justify-center gap-1 mt-1 text-xs">
        {trend === 'improving' && <TrendingDown className="w-4 h-4 text-green-600" />}
        {trend === 'declining' && <TrendingUp className="w-4 h-4 text-red-600" />}
        <span className={
          trend === 'improving' ? 'text-green-600' :
          trend === 'declining' ? 'text-red-600' :
          'text-gray-600'
        }>
          {trend}
        </span>
      </div>
    </div>
  );
};

// Helper functions
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return 'red';
    case 'medium': return 'orange';
    default: return 'yellow';
  }
};

const getPriorityBadgeClass = (priority: string) => {
  switch (priority) {
    case 'immediate':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    case 'high':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  }
};

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'video': return <BookOpen className="w-4 h-4" />;
    case 'tutor': return <Users className="w-4 h-4" />;
    case 'study-group': return <Users className="w-4 h-4" />;
    case 'counselor': return <Heart className="w-4 h-4" />;
    default: return <BookOpen className="w-4 h-4" />;
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'video': return <BookOpen className="w-5 h-5 text-blue-600" />;
    case 'practice': return <Target className="w-5 h-5 text-green-600" />;
    case 'contest': return <Award className="w-5 h-5 text-purple-600" />;
    case 'peer-learning': return <Users className="w-5 h-5 text-orange-600" />;
    case 'reading': return <BookOpen className="w-5 h-5 text-blue-600" />;
    case 'project': return <Zap className="w-5 h-5 text-yellow-600" />;
    default: return <Activity className="w-5 h-5 text-gray-600" />;
  }
};
