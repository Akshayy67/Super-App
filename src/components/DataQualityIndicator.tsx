import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface DataQualityIndicatorProps {
  speechAnalysis?: any;
  bodyLanguageAnalysis?: any;
  validationResult?: any;
  className?: string;
}

export const DataQualityIndicator: React.FC<DataQualityIndicatorProps> = ({
  speechAnalysis,
  bodyLanguageAnalysis,
  validationResult,
  className = ''
}) => {
  // Check for simulated data
  const speechIsSimulated = speechAnalysis?.overallMetrics?.isSimulated;
  const bodyIsSimulated = bodyLanguageAnalysis?.overallBodyLanguage?.isSimulated;
  const hasSimulatedData = speechIsSimulated || bodyIsSimulated;

  // Determine overall data quality
  const getDataQualityStatus = () => {
    if (hasSimulatedData) {
      return {
        level: 'critical',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        title: 'Simulated Data Detected',
        message: 'Results are not accurate due to simulated data'
      };
    }

    if (validationResult?.confidence < 50) {
      return {
        level: 'warning',
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        title: 'Low Data Quality',
        message: 'Results may be less reliable'
      };
    }

    if (validationResult?.confidence < 80) {
      return {
        level: 'info',
        icon: Info,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        title: 'Moderate Data Quality',
        message: 'Results are reasonably reliable'
      };
    }

    return {
      level: 'success',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      title: 'High Data Quality',
      message: 'Results are highly reliable'
    };
  };

  const status = getDataQualityStatus();
  const Icon = status.icon;

  const getDetailedIssues = () => {
    const issues: string[] = [];

    if (speechIsSimulated) {
      issues.push('Speech analysis is using simulated data - audio recording may have failed');
    }

    if (bodyIsSimulated) {
      issues.push('Body language analysis is using simulated data - camera access may have failed');
    }

    if (validationResult?.errors?.length > 0) {
      issues.push(...validationResult.errors);
    }

    if (validationResult?.warnings?.length > 0) {
      issues.push(...validationResult.warnings);
    }

    return issues;
  };

  const issues = getDetailedIssues();

  return (
    <div className={`rounded-lg border p-4 ${status.bgColor} ${status.borderColor} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${status.color} mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          <h4 className={`font-medium ${status.color}`}>
            {status.title}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {status.message}
          </p>

          {issues.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Issues Detected:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {issues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasSimulatedData && (
            <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Critical: Interview results are not accurate
              </p>
              <p className="text-sm text-red-700 mt-1">
                The system fell back to simulated data because:
              </p>
              <ul className="text-sm text-red-700 mt-2 space-y-1">
                {speechIsSimulated && (
                  <li>• Microphone access failed or no speech was detected</li>
                )}
                {bodyIsSimulated && (
                  <li>• Camera access failed or no video was detected</li>
                )}
              </ul>
              <p className="text-sm text-red-700 mt-2">
                Please ensure your microphone and camera are working properly and try again.
              </p>
            </div>
          )}

          {validationResult?.confidence && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Data Confidence:</span>
                <span className={`font-medium ${
                  validationResult.confidence >= 80 ? 'text-green-600' :
                  validationResult.confidence >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {validationResult.confidence}%
                </span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    validationResult.confidence >= 80 ? 'bg-green-500' :
                    validationResult.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${validationResult.confidence}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataQualityIndicator;
