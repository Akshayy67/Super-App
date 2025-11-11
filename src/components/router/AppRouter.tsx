import React, { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { LandingPage } from "../LandingPage";
import { Dashboard } from "../dashboards/Dashboard";
import { FileManager } from "../file/FileManager";
import { TaskManager } from "../tasks/TaskManager";
import { NotesManager } from "../notes/NotesManager";
import { FilesAndNotesRouter } from "../filesAndNotes/FilesAndNotesRouter";
import { EnhancedAIChat } from "../ai/EnhancedAIChat";
import { StudyTools } from "../StudyTools";
import { FlashCards } from "../FlashCards";
import { StudyToolsRouter } from "../studyTools/StudyToolsRouter";
import { InterviewPrep } from "../InterviewPrep/InterviewPrep";
import { TeamSpace } from "../../team/components/TeamSpace";
import { VideoMeeting } from "../meeting/VideoMeeting";
import { Community } from "../Community";
import { AdminDashboard } from "../dashboards/AdminDashboard";
import { AdminRouteGuard } from "./AdminRouteGuard";
import { SettingsPage } from "../SettingsPage";
import { Calendar } from "../calendar/Calendar";
import { JournalManager } from "../journal/JournalManager";
import { MeetingsTimeline } from "../meeting/MeetingsTimeline";
import { ProfileEditPage } from "../profile/ProfileEditPage";
import { ProfileViewPage } from "../profile/ProfileViewPage";
import { BlockedUsersPage } from "../BlockedUsersPage";
import { BlockedUserGuard } from "./BlockedUserGuard";
import { PremiumGuard } from "./PremiumGuard";
import { PaymentPage } from "../PaymentPage";
import { PaymentSuccess } from "../PaymentSuccess";
import { AboutUsPage } from "../AboutUsPage";
import { SignupPage } from "../auth/SignupPage";
import { StudyPlanManager } from "../studyPlan/StudyPlan";
import { SubscriptionPage } from "../SubscriptionPage";
import { ContactForm } from "../ContactForm";
import { ResumeBuilderPage } from "../resumeBuilder/ResumeBuilderPage";
import { GamifiedProfile } from "../profile/GamifiedProfile";
import { Leaderboard } from "../gamification/Leaderboard";
import { AICodingInterview } from "../gamification/AICodingInterview";
import { SkillAssessment } from "../gamification/SkillAssessment";
import { AIStudyRoom } from "../studyrooms/AIStudyRoom";
import { PersonalAIAssistant } from "../ai/PersonalAIAssistant";
import { EnhancedContestSystem } from "../contests/EnhancedContestSystem";
import { PredictiveDashboardWrapper } from "../predictive/PredictiveDashboardWrapper";
import { FacultyDashboardWrapper } from "../predictive/FacultyDashboardWrapper";
import { DailyQuestionComponent } from "../gamification/DailyQuestion";

interface AppRouterProps {
  invitationData: {
    inviteCode?: string;
    teamId?: string;
  } | null;
}

const PageTransitionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (!containerRef.current) return;

    // Enhanced page transition animation with morphing effect
    const container = containerRef.current;
    
    // Animate page out first if there's previous content
    const exitTl = gsap.timeline();
    exitTl.to(container, {
      opacity: 0,
      scale: 0.98,
      duration: 0.2,
      ease: "power2.in",
    });

    // Animate page in with multiple effects
    const enterTl = gsap.timeline();
    enterTl.fromTo(
      container,
      {
        opacity: 0,
        y: 40,
        scale: 0.96,
        filter: "blur(12px)",
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power3.out",
      }
    );
    
    // Add a subtle morph effect
    enterTl.fromTo(
      container,
      {
        rotationX: -5,
      },
      {
        rotationX: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
      },
      "<"
    );
  }, [location.pathname]);

  return (
    <div ref={containerRef} className="page-transition-wrapper" style={{ transformStyle: 'preserve-3d', perspective: '1000px', width: '100%', height: '100%', minHeight: '100%' }}>
      {children}
    </div>
  );
};

export const AppRouter: React.FC<AppRouterProps> = ({ invitationData }) => {
  return (
    <Routes>
      {/* Main Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      
      {/* Signup Page */}
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Blocked Users Page */}
      <Route path="/blocked" element={<BlockedUsersPage />} />
      
      {/* Payment Page */}
      <Route path="/payment" element={<PaymentPage />} />
      
      {/* Payment Success Page - Handles Razorpay callback */}
      <Route path="/payment-success" element={<PaymentSuccess />} />

      {/* Admin Routes - Protected */}
      <Route 
        path="/admin/*" 
        element={
          <AdminRouteGuard>
            <PageTransitionWrapper>
              <AdminDashboard />
            </PageTransitionWrapper>
          </AdminRouteGuard>
        } 
      />

      {/* Blocked Users Page */}
      <Route path="/blocked" element={<BlockedUsersPage />} />

      {/* Protected Routes - Free tier (no premium required) */}
      <Route 
        path="/dashboard" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><Dashboard /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/files-notes/*" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><FilesAndNotesRouter /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/files/*" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper>
                <Navigate to="/files-notes/files" replace />
              </PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/tasks/*" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><TaskManager /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/notes/*" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper>
                <Navigate to="/files-notes/notes" replace />
              </PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      {/* Premium Features - Show upsell if not premium */}
      <Route 
        path="/chat/*" 
        element={
          <BlockedUserGuard>
            <PremiumGuard featureName="AI Assistant">
              <PageTransitionWrapper><EnhancedAIChat /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/tools/*" 
        element={
          <BlockedUserGuard>
            <PremiumGuard featureName="Study Tools">
              <PageTransitionWrapper><StudyToolsRouter /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/flashcards/*" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper>
                <Navigate to="/tools/flashcards" replace />
              </PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/interview/*" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper><InterviewPrep /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/resume-builder" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper>
                <Navigate to="/interview/resume-builder" replace />
              </PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route
        path="/team/*"
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper><TeamSpace invitationData={invitationData} /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        }
      />
      <Route 
        path="/meeting" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper><VideoMeeting /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/meetings" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper><MeetingsTimeline /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/community" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper><Community /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/daily-question" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><DailyQuestionComponent /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper><SettingsPage /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/calendar" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper><Calendar /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/journal" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper><JournalManager /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/study-plans" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper>
                <Navigate to="/tools/study-plans" replace />
              </PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/profile/edit" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper><ProfileEditPage /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/profile/:useremail" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper><ProfileViewPage /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      
      {/* Gamification Routes */}
      <Route 
        path="/gamified-profile" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper><GamifiedProfile /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/leaderboard" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper><Leaderboard /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/coding-interview" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper><AICodingInterview /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/skill-assessment" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper><SkillAssessment /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      
      {/* AI-Powered Features */}
      <Route 
        path="/ai-assistant" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper><PersonalAIAssistant /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/study-rooms" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper><AIStudyRoom /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      
      {/* Predictive Learning & Analytics - Enterprise Features (No Premium Required) */}
      <Route 
        path="/predictive-dashboard" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><PredictiveDashboardWrapper /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/faculty-dashboard" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><FacultyDashboardWrapper /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      
      {/* Contests */}
      <Route 
        path="/contests" 
        element={
          <BlockedUserGuard>
            <PremiumGuard>
              <PageTransitionWrapper><EnhancedContestSystem /></PageTransitionWrapper>
            </PremiumGuard>
          </BlockedUserGuard>
        } 
      />
      
      <Route 
        path="/about" 
        element={<AboutUsPage />}
      />
      <Route 
        path="/subscription" 
        element={<SubscriptionPage />}
      />
      <Route 
        path="/contact" 
        element={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
            <ContactForm />
          </div>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
