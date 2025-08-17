import React from 'react';
import { Brain, AlertCircle, CheckCircle } from 'lucide-react';
import { unifiedAIService } from '../utils/aiConfig';

export const AIStatus: React.FC = () => {
  const provider = unifiedAIService.getCurrentProvider();
  const isConfigured = unifiedAIService.isConfigured();

  const getProviderName = () => {
    switch (provider) {
      case 'gemini':
        return 'Google Gemini';
      case 'openai':
        return 'OpenAI GPT';
      case 'claude':
        return 'Anthropic Claude';
      default:
        return 'Unknown';
    }
  };

  const getProviderColor = () => {
    if (!isConfigured) return 'text-red-600 bg-red-50';
    
    switch (provider) {
      case 'gemini':
        return 'text-blue-600 bg-blue-50';
      case 'openai':
        return 'text-green-600 bg-green-50';
      case 'claude':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
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
        {getProviderName()} {isConfigured ? '✓' : '⚠️'}
      </span>
    </div>
  );
};
