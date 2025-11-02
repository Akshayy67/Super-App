import React from 'react';
import { X, FileText, Sparkles, CheckCircle, XCircle, Zap, DollarSign, Users, Clock, Shield } from 'lucide-react';

interface FeatureComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeatureComparisonModal: React.FC<FeatureComparisonModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    {
      name: 'AI-Powered Scribe',
      description: 'Live transcription + AI summaries',
      us: true,
      zoom: false,
      meet: false
    },
    {
      name: 'Built-in Whiteboard',
      description: 'Collaborative drawing & brainstorming',
      us: true,
      zoom: 'addon',
      meet: false
    },
    {
      name: 'Free Forever',
      description: 'No time limits or participant caps',
      us: true,
      zoom: false,
      meet: false
    },
    {
      name: 'No Downloads',
      description: 'Works in any browser instantly',
      us: true,
      zoom: false,
      meet: false
    },
    {
      name: 'Unlimited Duration',
      description: 'No 40-minute limits',
      us: true,
      zoom: false,
      meet: false
    },
    {
      name: 'Screen Recording',
      description: 'Record meetings locally',
      us: true,
      zoom: true,
      meet: 'limited'
    },
    {
      name: 'Chat & Reactions',
      description: 'Real-time messaging',
      us: true,
      zoom: true,
      meet: true
    },
    {
      name: 'Breakout Rooms',
      description: 'Split into smaller groups',
      us: 'planned',
      zoom: true,
      meet: true
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Why We're Better
              </h2>
              <p className="text-blue-100 mt-1">See how we compare to Zoom and Google Meet</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Highlight Section */}
          <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-500">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-bold text-green-900 dark:text-green-200">
                🏆 Our Unique Advantage: AI-Powered Scribe
              </h3>
            </div>
            <p className="text-green-800 dark:text-green-300 text-sm">
              Get automatic live transcription with AI-generated summaries. Zoom requires expensive add-ons. 
              Google Meet only offers transcription with paid plans. We give it to you <strong>FREE</strong>!
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Feature</th>
                  <th className="text-center py-3 px-4">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">Our Platform</span>
                      <span className="text-xs text-gray-500 mt-1">You are here</span>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white text-sm">Zoom</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white text-sm">Google Meet</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr 
                    key={idx} 
                    className={`border-b border-gray-200 dark:border-gray-700 ${
                      idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/50' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">{feature.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{feature.description}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {feature.us === true && (
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto" />
                      )}
                      {feature.us === 'planned' && (
                        <div className="flex flex-col items-center">
                          <Clock className="w-6 h-6 text-blue-500 mx-auto" />
                          <span className="text-xs text-blue-500 mt-1">Soon</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {feature.zoom === true && (
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto" />
                      )}
                      {feature.zoom === false && (
                        <XCircle className="w-6 h-6 text-red-500 mx-auto" />
                      )}
                      {feature.zoom === 'addon' && (
                        <div className="flex flex-col items-center">
                          <DollarSign className="w-6 h-6 text-yellow-500 mx-auto" />
                          <span className="text-xs text-yellow-600 mt-1">Paid</span>
                        </div>
                      )}
                      {feature.zoom === 'limited' && (
                        <Users className="w-6 h-6 text-orange-500 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {feature.meet === true && (
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto" />
                      )}
                      {feature.meet === false && (
                        <XCircle className="w-6 h-6 text-red-500 mx-auto" />
                      )}
                      {feature.meet === 'limited' && (
                        <div className="flex flex-col items-center">
                          <Shield className="w-6 h-6 text-orange-500 mx-auto" />
                          <span className="text-xs text-orange-600 mt-1">40min</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-200">Fast & Light</h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                No bulky apps. Loads instantly in your browser.
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-green-900 dark:text-green-200">100% Free</h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                All features included. No credit card required.
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h4 className="font-semibold text-purple-900 dark:text-purple-200">AI Scribe</h4>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Unique transcription + summaries. No competition!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

