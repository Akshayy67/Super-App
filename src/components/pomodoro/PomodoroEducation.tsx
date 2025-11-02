import React from 'react';
import { X, Brain, Clock, Coffee, Target, CheckCircle, TrendingUp, Zap, Focus } from 'lucide-react';

interface PomodoroEducationProps {
  isVisible: boolean;
  onClose: () => void;
}

export const PomodoroEducation: React.FC<PomodoroEducationProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">The Pomodoro Technique</h2>
              <p className="text-red-100">Boost your productivity with science-backed time management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* What is Pomodoro */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">What is the Pomodoro Technique?</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              Developed by Francesco Cirillo in the late 1980s, the Pomodoro Technique is a time management method 
              that uses a timer to break work into focused intervals, traditionally 25 minutes in length, separated by short breaks. 
              The name comes from the tomato-shaped kitchen timer ("pomodoro" in Italian) that Cirillo used as a university student.
            </p>
          </section>

          {/* Why It Works */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Why Does It Work?</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Focus className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Reduces Mental Fatigue</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Regular breaks prevent burnout and maintain high cognitive performance throughout the day.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Improves Focus</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Time constraints create urgency, helping you concentrate on the task at hand without distractions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Tracks Progress</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Completed pomodoros provide tangible evidence of your productivity and achievements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Builds Momentum</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Small, manageable work sessions reduce procrastination and help you get started.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How to Use */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">How to Use the Pomodoro Technique</h3>
            </div>
            <div className="space-y-3">
              {[
                { step: 1, title: 'Choose a task', desc: 'Select a task you want to work on and get ready to focus.' },
                { step: 2, title: 'Start the timer', desc: 'Begin a 25-minute Pomodoro session and commit to working without interruption.' },
                { step: 3, title: 'Work until timer rings', desc: 'Focus solely on your task until the alarm sounds. Avoid all distractions.' },
                { step: 4, title: 'Take a short break', desc: 'When the timer rings, take a 5-minute break to recharge and relax.' },
                { step: 5, title: 'Repeat the cycle', desc: 'After 4 Pomodoros, take a longer 15-30 minute break to fully recover.' }
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Science Behind It */}
          <section className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">The Science</h3>
            </div>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                <strong className="text-gray-900 dark:text-gray-100">Timeboxing:</strong> Creating artificial time limits forces your brain to focus and work more efficiently.
              </p>
              <p>
                <strong className="text-gray-900 dark:text-gray-100">Ultradian Rhythms:</strong> Your brain naturally works in 90-120 minute cycles. The Pomodoro Technique aligns with these rhythms.
              </p>
              <p>
                <strong className="text-gray-900 dark:text-gray-100">Breaks Enhance Learning:</strong> Research shows that taking breaks improves memory consolidation and creative problem-solving.
              </p>
              <p>
                <strong className="text-gray-900 dark:text-gray-100">Flow State:</strong> Regular practice helps you enter a state of deep focus more quickly and maintain it longer.
              </p>
            </div>
          </section>

          {/* Tips */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Coffee className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Pro Tips</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                '🎯 Plan your Pomodoros at the start of each day',
                '📱 Eliminate distractions (phone, notifications, etc.)',
                '✅ Track your completed Pomodoros to build momentum',
                '🔄 Adjust timer lengths to match your focus capacity',
                '🎵 Use background music or white noise if helpful',
                '💪 Protect your Pomodoros - say no to interruptions',
                '🌟 Celebrate completed sessions to build positive habits',
                '📊 Review your stats to identify peak productivity times'
              ].map((tip, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <section className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl p-6 text-center">
            <h3 className="text-2xl font-bold mb-2">Ready to Get Started?</h3>
            <p className="mb-4 text-red-100">
              Click the Pomodoro timer icon in your sidebar to begin your first focused session!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
            >
              Let's Start Working! 🍅
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

