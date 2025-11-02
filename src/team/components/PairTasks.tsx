import React, { useState } from 'react';
import { Code, Palette, ArrowLeft, Code2, Brush } from 'lucide-react';
import { PairProgramming } from './PairProgramming';
import { PairDrawing } from './PairDrawing';

interface PairTasksProps {
  teamId: string;
  onClose?: () => void;
}

type TaskType = 'programming' | 'drawing' | null;

export const PairTasks: React.FC<PairTasksProps> = ({ teamId, onClose }) => {
  const [selectedTask, setSelectedTask] = useState<TaskType>(null);

  // If a task is selected, render that component
  if (selectedTask === 'programming') {
    return (
      <PairProgramming
        teamId={teamId}
        onClose={() => setSelectedTask(null)}
      />
    );
  }

  if (selectedTask === 'drawing') {
    return (
      <PairDrawing
        teamId={teamId}
        onClose={() => setSelectedTask(null)}
      />
    );
  }

  // Main selection view
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-pink-900/20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Pair Tasks
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Collaborate with your team in real-time - code together or draw together
            </p>
          </div>
        </div>
      </div>

      {/* Task Selection */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Choose Your Collaboration Mode
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Work together with your team in real-time through programming or drawing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pair Programming Card */}
            <div
              onClick={() => setSelectedTask('programming')}
              className="group cursor-pointer bg-white dark:bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-indigo-500 dark:hover:border-indigo-400"
            >
              <div className="p-8">
                {/* Icon */}
                <div className="mb-6 relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Code2 className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                  Pair Programming
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6 leading-relaxed">
                  Collaborate on code in real-time with multiple team members. Features live cursor
                  tracking, syntax highlighting, and integrated chat.
                </p>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <Feature icon="✓" text="Real-time code editing" />
                  <Feature icon="✓" text="Multiple programming languages" />
                  <Feature icon="✓" text="Role-based permissions" />
                  <Feature icon="✓" text="Code history & snapshots" />
                  <Feature icon="✓" text="Live cursor tracking" />
                  <Feature icon="✓" text="Integrated chat" />
                </div>

                {/* Button */}
                <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg group-hover:shadow-xl">
                  Start Pair Programming
                </button>
              </div>

              {/* Decorative gradient border on hover */}
              <div className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>

            {/* Pair Drawing Card */}
            <div
              onClick={() => setSelectedTask('drawing')}
              className="group cursor-pointer bg-white dark:bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-pink-500 dark:hover:border-pink-400"
            >
              <div className="p-8">
                {/* Icon */}
                <div className="mb-6 relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Brush className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                  Pair Drawing
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6 leading-relaxed">
                  Create and collaborate on drawings together. Perfect for brainstorming,
                  whiteboarding, and visual design sessions.
                </p>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <Feature icon="✓" text="Multiple drawing tools" />
                  <Feature icon="✓" text="Shapes, text, and colors" />
                  <Feature icon="✓" text="Real-time collaboration" />
                  <Feature icon="✓" text="Drawing history & snapshots" />
                  <Feature icon="✓" text="Live cursor tracking" />
                  <Feature icon="✓" text="Export & share" />
                </div>

                {/* Button */}
                <button className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg group-hover:shadow-xl">
                  Start Pair Drawing
                </button>
              </div>

              {/* Decorative gradient border on hover */}
              <div className="h-2 bg-gradient-to-r from-pink-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-12 text-center">
            <div className="inline-block bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Real-time sync</span>
                </div>
                <div className="w-px h-6 bg-gray-300 dark:bg-slate-600" />
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  <span>Multiple participants</span>
                </div>
                <div className="w-px h-6 bg-gray-300 dark:bg-slate-600" />
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span>Rich feature set</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
                💡 Pair Programming Tips
              </h4>
              <p className="text-sm text-indigo-700 dark:text-indigo-400">
                Switch between driver and navigator roles regularly. Use chat to discuss approach
                before implementing. Save snapshots at important milestones.
              </p>
            </div>

            <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 border border-pink-200 dark:border-pink-800">
              <h4 className="font-semibold text-pink-900 dark:text-pink-300 mb-2">
                🎨 Pair Drawing Tips
              </h4>
              <p className="text-sm text-pink-700 dark:text-pink-400">
                Use different colors for each participant's ideas. Combine shapes and text for
                clear diagrams. Export your work regularly to save progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component
const Feature: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
    <span className="text-green-500 font-bold">{icon}</span>
    <span>{text}</span>
  </div>
);

