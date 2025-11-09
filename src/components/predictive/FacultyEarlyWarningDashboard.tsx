import React, { useEffect, useState } from 'react';
import { AlertTriangle, TrendingDown, Users, Mail, Phone, Calendar, CheckCircle, Clock, Filter, LogOut } from 'lucide-react';
import { predictiveLearningEngine, RiskPrediction } from '../../services/predictiveLearningEngine';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

interface AdviseeAlert {
  studentId: string;
  studentName: string;
  email: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  overallRiskScore: number;
  topFactors: string[];
  lastContact: Date;
  interventionStatus: 'none' | 'scheduled' | 'in-progress' | 'completed';
  prediction: RiskPrediction;
}

interface FacultyEarlyWarningDashboardProps {
  facultyId: string;
}

export const FacultyEarlyWarningDashboard: React.FC<FacultyEarlyWarningDashboardProps> = ({ facultyId }) => {
  const navigate = useNavigate();
  const [advisees, setAdvisees] = useState<AdviseeAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [sortBy, setSortBy] = useState<'risk' | 'lastContact' | 'name'>('risk');

  const handleLogout = () => {
    sessionStorage.removeItem('facultyAuth');
    console.log('🔒 Faculty logged out');
    window.location.reload(); // Reload to show login screen
  };

  useEffect(() => {
    loadAdvisees();
  }, [facultyId]);

  const loadAdvisees = async () => {
    setLoading(true);
    try {
      // Get list of advisees
      const adviseesQuery = query(
        collection(db, 'users'),
        where('advisorId', '==', facultyId)
      );
      const adviseesSnap = await getDocs(adviseesQuery);

      const adviseeData: AdviseeAlert[] = [];

      for (const doc of adviseesSnap.docs) {
        const studentData = doc.data();
        const studentId = doc.id;

        // Get latest risk prediction
        const prediction = await predictiveLearningEngine.getLatestPrediction(studentId);
        
        if (prediction) {
          adviseeData.push({
            studentId,
            studentName: studentData.displayName || studentData.name || 'Student',
            email: studentData.email || '',
            riskLevel: prediction.riskLevel,
            overallRiskScore: prediction.overallRiskScore,
            topFactors: prediction.contributingFactors.slice(0, 3).map(f => f.factor),
            lastContact: studentData.lastAdvisorContact?.toDate?.() || new Date(0),
            interventionStatus: studentData.interventionStatus || 'none',
            prediction,
          });
        }
      }

      setAdvisees(adviseeData);
    } catch (error) {
      console.error('Error loading advisees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdvisees = advisees.filter(advisee => {
    if (filter === 'all') return true;
    return advisee.riskLevel === filter;
  });

  const sortedAdvisees = [...filteredAdvisees].sort((a, b) => {
    switch (sortBy) {
      case 'risk':
        return b.overallRiskScore - a.overallRiskScore;
      case 'lastContact':
        return a.lastContact.getTime() - b.lastContact.getTime();
      case 'name':
        return a.studentName.localeCompare(b.studentName);
      default:
        return 0;
    }
  });

  const stats = {
    total: advisees.length,
    critical: advisees.filter(a => a.riskLevel === 'critical').length,
    high: advisees.filter(a => a.riskLevel === 'high').length,
    medium: advisees.filter(a => a.riskLevel === 'medium').length,
    low: advisees.filter(a => a.riskLevel === 'low').length,
    needsAttention: advisees.filter(a => {
      const daysSinceContact = (Date.now() - a.lastContact.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceContact > 14;
    }).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading advisee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Early Warning System</h1>
            <p className="text-purple-100">AI-powered student success monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
            <AlertTriangle className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatCard
          label="Total Advisees"
          value={stats.total}
          color="blue"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Critical Risk"
          value={stats.critical}
          color="red"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <StatCard
          label="High Risk"
          value={stats.high}
          color="orange"
          icon={<TrendingDown className="w-5 h-5" />}
        />
        <StatCard
          label="Medium Risk"
          value={stats.medium}
          color="yellow"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <StatCard
          label="Low Risk"
          value={stats.low}
          color="green"
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatCard
          label="Needs Contact"
          value={stats.needsAttention}
          color="purple"
          icon={<Clock className="w-5 h-5" />}
        />
      </div>

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Risk:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Students ({advisees.length})</option>
              <option value="critical">Critical ({stats.critical})</option>
              <option value="high">High Risk ({stats.high})</option>
              <option value="medium">Medium Risk ({stats.medium})</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="risk">Risk Score</option>
              <option value="lastContact">Last Contact</option>
              <option value="name">Name</option>
            </select>
          </div>

          <button
            onClick={loadAdvisees}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Advisees List */}
      <div className="space-y-4">
        {sortedAdvisees.map(advisee => (
          <AdviseeCard key={advisee.studentId} advisee={advisee} facultyId={facultyId} />
        ))}

        {sortedAdvisees.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">No students match the current filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== STAT CARD ====================

const StatCard: React.FC<{
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}> = ({ label, value, color, icon }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
      <div className={`inline-flex p-2 rounded-lg mb-2 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
};

// ==================== ADVISEE CARD ====================

const AdviseeCard: React.FC<{ advisee: AdviseeAlert; facultyId: string }> = ({ advisee, facultyId }) => {
  const [expanded, setExpanded] = useState(false);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      default: return 'green';
    }
  };

  const daysSinceContact = Math.floor((Date.now() - advisee.lastContact.getTime()) / (1000 * 60 * 60 * 24));
  const needsContact = daysSinceContact > 14;

  const color = getRiskColor(advisee.riskLevel);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 border-${color}-500 overflow-hidden`}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          {/* Student Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{advisee.studentName}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-300`}>
                {advisee.riskLevel.toUpperCase()} RISK
              </span>
              {needsContact && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  NEEDS CONTACT
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{advisee.email}</div>
          </div>

          {/* Risk Score */}
          <div className="text-right">
            <div className={`text-4xl font-bold text-${color}-600 mb-1`}>
              {advisee.overallRiskScore}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Risk Score</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Last Contact</div>
            <div className={`text-sm font-semibold ${needsContact ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
              {daysSinceContact === 0 ? 'Today' : `${daysSinceContact} days ago`}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Dropout Risk</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {advisee.prediction.predictions.dropoutRisk.score}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Failure Risk</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {advisee.prediction.predictions.failureRisk.score}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Burnout Risk</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {advisee.prediction.predictions.burnoutRisk.score}%
            </div>
          </div>
        </div>

        {/* Top Risk Factors */}
        <div className="mt-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Risk Factors:</div>
          <div className="flex flex-wrap gap-2">
            {advisee.topFactors.map((factor, idx) => (
              <span 
                key={idx}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
              >
                {factor}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => window.location.href = `mailto:${advisee.email}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email Student
          </button>
          <button
            onClick={() => window.location.href = `/advisor/schedule-meeting?studentId=${advisee.studentId}`}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Schedule Meeting
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ml-auto"
          >
            {expanded ? 'Show Less' : 'View Details'}
          </button>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            {/* All Contributing Factors */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">All Risk Factors:</h4>
              <div className="space-y-2">
                {advisee.prediction.contributingFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <div className={`px-2 py-1 rounded text-xs font-medium bg-${getSeverityColor(factor.severity)}-100 dark:bg-${getSeverityColor(factor.severity)}-900/30 text-${getSeverityColor(factor.severity)}-700 dark:text-${getSeverityColor(factor.severity)}-300`}>
                      {factor.severity}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{factor.factor}</div>
                      <div className="text-gray-600 dark:text-gray-400">{factor.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Interventions */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Suggested Interventions:</h4>
              <div className="space-y-2">
                {advisee.prediction.recommendedInterventions.slice(0, 3).map((intervention, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-medium text-blue-900 dark:text-blue-100">{intervention.title}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">{intervention.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return 'red';
    case 'medium': return 'orange';
    default: return 'yellow';
  }
};
