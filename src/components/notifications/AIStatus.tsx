import React from 'react';
import { Brain, AlertCircle, CheckCircle } from 'lucide-react';
import { unifiedAIService } from '../../utils/aiConfig';

export const AIStatus: React.FC = () => {
  const isConfigured = unifiedAIService.isConfigured();

  const getProviderColor = () => {
    if (!isConfigured) return 'text-red-600 bg-red-50';
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getProviderColor()}`}>
      {isConfigured ? (
        <CheckCircle className="w-3 h-3 mr-1" />
      ) : (
        <AlertCircle className="w-3 h-3 mr-1" />
      )}
      <Brain className="w-3 h-3 mr-1" />
      <span>
        Super AI {isConfigured ? '✓' : '⚠️'}
      </span>
    </div>
  );
};
