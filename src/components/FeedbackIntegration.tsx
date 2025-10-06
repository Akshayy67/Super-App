import React from "react";
import { FeedbackButton } from "./FeedbackButton";
import { 
  FeedbackProvider, 
  SmartFeedbackBanner, 
  FeedbackTrigger,
  useFeatureTracking,
  useActionTracking 
} from "./FeedbackManager";

// Example component showing how to integrate feedback throughout your app
export const FeedbackIntegration: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <FeedbackProvider>
      {children}
      
      {/* Global floating feedback button */}
      <FeedbackButton 
        position="bottom-right" 
        variant="floating" 
        size="md" 
        showLabel={true} 
      />
    </FeedbackProvider>
  );
};

// Example usage in different components
export const InterviewPageWithFeedback: React.FC = () => {
  useFeatureTracking("Interview Preparation");
  const { trackAction } = useActionTracking();

  const handleInterviewComplete = () => {
    trackAction("interview-completed");
    // Your interview completion logic here
  };

  return (
    <div className="p-6">
      <SmartFeedbackBanner 
        pageName="Interview Preparation" 
        showAfter={45} // Show after 45 seconds
      />
      
      <h1 className="text-2xl font-display font-bold mb-6">Interview Preparation</h1>
      
      <FeedbackTrigger type="action" name="interview-started">
        <button 
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-heading font-medium hover:bg-blue-600 transition-colors"
          onClick={() => {
            // Start interview logic
            console.log("Interview started");
          }}
        >
          Start Interview Practice
        </button>
      </FeedbackTrigger>

      <div className="mt-8">
        <FeedbackTrigger type="action" name="interview-completed">
          <button 
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-heading font-medium hover:bg-green-600 transition-colors"
            onClick={handleInterviewComplete}
          >
            Complete Interview
          </button>
        </FeedbackTrigger>
      </div>
    </div>
  );
};

export const StudyToolsWithFeedback: React.FC = () => {
  useFeatureTracking("Study Tools");
  const { trackAction } = useActionTracking();

  return (
    <div className="p-6">
      <SmartFeedbackBanner 
        pageName="Study Tools" 
        showAfter={30}
      />
      
      <h1 className="text-2xl font-display font-bold mb-6">Study Tools</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeedbackTrigger type="feature" name="AI Assistant">
          <div 
            className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => trackAction("ai-assistant-opened")}
          >
            <h3 className="text-lg font-heading font-semibold mb-2">AI Assistant</h3>
            <p className="font-body text-gray-600 dark:text-gray-400">
              Get help with your studies using AI
            </p>
          </div>
        </FeedbackTrigger>

        <FeedbackTrigger type="feature" name="Flashcards">
          <div 
            className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => trackAction("flashcards-opened")}
          >
            <h3 className="text-lg font-heading font-semibold mb-2">Flashcards</h3>
            <p className="font-body text-gray-600 dark:text-gray-400">
              Create and study with flashcards
            </p>
          </div>
        </FeedbackTrigger>

        <FeedbackTrigger type="feature" name="Analytics">
          <div 
            className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => trackAction("analytics-opened")}
          >
            <h3 className="text-lg font-heading font-semibold mb-2">Analytics</h3>
            <p className="font-body text-gray-600 dark:text-gray-400">
              Track your study progress
            </p>
          </div>
        </FeedbackTrigger>
      </div>

      {/* Inline feedback button for specific features */}
      <div className="mt-8 flex justify-center">
        <FeedbackButton 
          variant="inline" 
          size="md" 
        />
      </div>
    </div>
  );
};

export const DashboardWithFeedback: React.FC = () => {
  useFeatureTracking("Dashboard");

  return (
    <div className="p-6">
      <SmartFeedbackBanner 
        pageName="Dashboard" 
        showAfter={60} // Show after 1 minute
      />
      
      <h1 className="text-2xl font-display font-bold mb-6">Dashboard</h1>
      
      {/* Dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats cards with feedback tracking */}
        <FeedbackTrigger type="action" name="stats-viewed">
          <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl cursor-pointer">
            <h3 className="text-lg font-heading font-semibold mb-2">Study Hours</h3>
            <p className="text-3xl font-display font-bold">24.5</p>
            <p className="text-blue-100 text-sm font-body">This week</p>
          </div>
        </FeedbackTrigger>

        <FeedbackTrigger type="action" name="progress-viewed">
          <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl cursor-pointer">
            <h3 className="text-lg font-heading font-semibold mb-2">Progress</h3>
            <p className="text-3xl font-display font-bold">87%</p>
            <p className="text-green-100 text-sm font-body">Course completion</p>
          </div>
        </FeedbackTrigger>

        <FeedbackTrigger type="action" name="interviews-viewed">
          <div className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl cursor-pointer">
            <h3 className="text-lg font-heading font-semibold mb-2">Interviews</h3>
            <p className="text-3xl font-display font-bold">12</p>
            <p className="text-purple-100 text-sm font-body">Completed</p>
          </div>
        </FeedbackTrigger>

        <FeedbackTrigger type="action" name="score-viewed">
          <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl cursor-pointer">
            <h3 className="text-lg font-heading font-semibold mb-2">Avg Score</h3>
            <p className="text-3xl font-display font-bold">92</p>
            <p className="text-orange-100 text-sm font-body">Last 10 sessions</p>
          </div>
        </FeedbackTrigger>
      </div>
    </div>
  );
};

// Example of how to integrate into your main App component
export const AppWithFeedback: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <FeedbackIntegration>
      {children}
    </FeedbackIntegration>
  );
};

// Usage instructions component
export const FeedbackUsageGuide: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-8">Feedback System Integration Guide</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-heading font-semibold mb-4">1. Wrap Your App</h2>
          <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
            <pre>{`import { FeedbackIntegration } from './components/FeedbackIntegration';

function App() {
  return (
    <FeedbackIntegration>
      <YourAppContent />
    </FeedbackIntegration>
  );
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-semibold mb-4">2. Track Feature Usage</h2>
          <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
            <pre>{`import { useFeatureTracking } from './components/FeedbackManager';

function InterviewPage() {
  useFeatureTracking("Interview Preparation");
  // Component automatically tracked
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-semibold mb-4">3. Track Actions</h2>
          <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
            <pre>{`import { useActionTracking } from './components/FeedbackManager';

function StudyComponent() {
  const { trackAction } = useActionTracking();
  
  const handleStudyComplete = () => {
    trackAction("study-session-completed");
  };
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-semibold mb-4">4. Add Smart Banners</h2>
          <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
            <pre>{`import { SmartFeedbackBanner } from './components/FeedbackManager';

function FeaturePage() {
  return (
    <div>
      <SmartFeedbackBanner 
        pageName="Feature Name" 
        showAfter={30} // seconds
      />
      {/* Page content */}
    </div>
  );
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-semibold mb-4">5. Trigger Feedback</h2>
          <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
            <pre>{`import { FeedbackTrigger } from './components/FeedbackManager';

function ActionButton() {
  return (
    <FeedbackTrigger type="action" name="important-action">
      <button>Complete Action</button>
    </FeedbackTrigger>
  );
}`}</pre>
          </div>
        </section>
      </div>
    </div>
  );
};
