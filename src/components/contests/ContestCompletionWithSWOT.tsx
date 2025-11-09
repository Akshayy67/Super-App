import React, { useState, useEffect } from 'react';
import { CheckCircle, Trophy, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { swotAnalysisService, ContestResult } from '../../services/swotAnalysisService';
import { n8nIntegrationService } from '../../services/n8nIntegrationService';
import { SWOTAnalysisDisplay } from './SWOTAnalysisDisplay';

interface ContestCompletionProps {
  contestResult: ContestResult;
  onClose: () => void;
}

export const ContestCompletionWithSWOT: React.FC<ContestCompletionProps> = ({ 
  contestResult, 
  onClose 
}) => {
  const [step, setStep] = useState<'results' | 'generating' | 'swot'>('results');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Automatically start SWOT generation after showing results for 3 seconds
    const timer = setTimeout(() => {
      generateSWOTAnalysis();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const generateSWOTAnalysis = async () => {
    setStep('generating');
    setError(null);

    try {
      // Generate SWOT analysis
      await swotAnalysisService.generateSWOTAnalysis(contestResult);
      
      // Trigger n8n workflow for additional processing (optional)
      await n8nIntegrationService.triggerContestSWOT(
        contestResult.userId,
        contestResult.contestId,
        contestResult
      );

      setStep('swot');
    } catch (err: any) {
      console.error('Error generating SWOT analysis:', err);
      setError('Failed to generate SWOT analysis. Please try again.');
      setStep('results');
    }
  };

  const accuracy = (contestResult.correctAnswers / contestResult.totalQuestions) * 100;
  const speedScore = ((contestResult.timeLimit - contestResult.timeTaken) / contestResult.timeLimit) * 100;

  if (step === 'results') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 rounded-t-lg text-white text-center">
            <CheckCircle className="w-20 h-20 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Contest Completed!</h2>
            <p className="text-green-100">Great job! Let's see how you performed.</p>
          </div>

          <div className="p-8">
            {/* Score Overview */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                <div className="text-4xl font-bold text-blue-600 mb-1">
                  {contestResult.score}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 text-center">
                <Target className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <div className="text-4xl font-bold text-green-600 mb-1">
                  {contestResult.correctAnswers}/{contestResult.totalQuestions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct Answers</div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4 mb-8">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Accuracy</span>
                  <span className="font-bold text-gray-900 dark:text-white">{accuracy.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${accuracy}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Speed</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {Math.max(0, speedScore).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.max(0, speedScore)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Preparing SWOT Message */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-6 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-purple-600" />
              <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-2">
                Generating Your SWOT Analysis...
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                We're analyzing your performance to provide personalized insights and recommendations.
              </p>
              <div className="flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                <button
                  onClick={generateSWOTAnalysis}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-200 dark:border-purple-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
            <TrendingUp className="absolute inset-0 m-auto w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Analyzing Your Performance
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Creating personalized insights and recommendations...
          </p>
        </div>
      </div>
    );
  }

  if (step === 'swot') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
        <div className="min-h-screen p-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
              {/* Header with close button */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-lg z-10 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Your Complete Analysis</h2>
                  <p className="text-purple-100">Score: {contestResult.score}% | {contestResult.correctAnswers}/{contestResult.totalQuestions} correct</p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* SWOT Analysis Component */}
              <SWOTAnalysisDisplay 
                userId={contestResult.userId} 
                contestId={contestResult.contestId} 
              />

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      // Navigate to practice page
                      window.location.href = '/practice';
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Start Practice
                  </button>
                  <button
                    onClick={() => {
                      // Navigate to contests page
                      window.location.href = '/contests';
                    }}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Take Another Contest
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
