import React, { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { LandingPage } from "../LandingPage";
import { Dashboard } from "../dashboards/Dashboard";
import { FileManager } from "../file/FileManager";
import { TaskManager } from "../tasks/TaskManager";
import { NotesManager } from "../notes/NotesManager";
import { EnhancedAIChat } from "../ai/EnhancedAIChat";
import { StudyTools } from "../StudyTools";
import { FlashCards } from "../FlashCards";
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
import { PaymentPage } from "../PaymentPage";
import { AboutUsPage } from "../AboutUsPage";
import { SignupPage } from "../auth/SignupPage";
import { StudyPlanManager } from "../studyPlan/StudyPlan";

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

      {/* Protected Routes - Check if user is blocked */}
      <Route 
        path="/dashboard" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><Dashboard /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/files/*" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><FileManager /></PageTransitionWrapper>
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
            <PageTransitionWrapper><NotesManager /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/chat/*" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><EnhancedAIChat /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/tools/*" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><StudyTools /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/flashcards/*" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><FlashCards /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/interview/*" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><InterviewPrep /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route
        path="/team/*"
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><TeamSpace invitationData={invitationData} /></PageTransitionWrapper>
          </BlockedUserGuard>
        }
      />
      <Route 
        path="/meeting" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><VideoMeeting /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/meetings" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><MeetingsTimeline /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/community" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><Community /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><SettingsPage /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/calendar" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><Calendar /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/journal" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><JournalManager /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/study-plans" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><StudyPlanManager /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/profile/edit" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><ProfileEditPage /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/profile/:useremail" 
        element={
          <BlockedUserGuard>
            <PageTransitionWrapper><ProfileViewPage /></PageTransitionWrapper>
          </BlockedUserGuard>
        } 
      />
      <Route 
        path="/about" 
        element={<AboutUsPage />}
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
