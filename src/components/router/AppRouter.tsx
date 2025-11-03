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
// import { AboutUs } from "../AboutUs";
import { AdminDashboard } from "../dashboards/AdminDashboard";
import { AdminRouteGuard } from "./AdminRouteGuard";
import { SettingsPage } from "../SettingsPage";
import { Calendar } from "../calendar/Calendar";
import { JournalManager } from "../journal/JournalManager";
import { MeetingsTimeline } from "../meeting/MeetingsTimeline";
import { ProfileEditPage } from "../profile/ProfileEditPage";
import { ProfileViewPage } from "../profile/ProfileViewPage";

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
        clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
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
    <div ref={containerRef} className="page-transition-wrapper" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
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
      <Route path="/dashboard" element={<PageTransitionWrapper><Dashboard /></PageTransitionWrapper>} />
      <Route path="/files/*" element={<PageTransitionWrapper><FileManager /></PageTransitionWrapper>} />
      <Route path="/tasks/*" element={<PageTransitionWrapper><TaskManager /></PageTransitionWrapper>} />
      <Route path="/notes/*" element={<PageTransitionWrapper><NotesManager /></PageTransitionWrapper>} />
      <Route path="/chat/*" element={<PageTransitionWrapper><EnhancedAIChat /></PageTransitionWrapper>} />
      <Route path="/tools/*" element={<PageTransitionWrapper><StudyTools /></PageTransitionWrapper>} />
      <Route path="/flashcards/*" element={<PageTransitionWrapper><FlashCards /></PageTransitionWrapper>} />
      <Route path="/interview/*" element={<PageTransitionWrapper><InterviewPrep /></PageTransitionWrapper>} />
      <Route
        path="/team/*"
        element={<PageTransitionWrapper><TeamSpace invitationData={invitationData} /></PageTransitionWrapper>}
      />
      <Route path="/meeting" element={<PageTransitionWrapper><VideoMeeting /></PageTransitionWrapper>} />
      <Route path="/meetings" element={<PageTransitionWrapper><MeetingsTimeline /></PageTransitionWrapper>} />
      <Route path="/community" element={<PageTransitionWrapper><Community /></PageTransitionWrapper>} />
      {/* <Route path="/about" element={<PageTransitionWrapper><AboutUs /></PageTransitionWrapper>} /> */}
      <Route path="/settings" element={<PageTransitionWrapper><SettingsPage /></PageTransitionWrapper>} />
      <Route path="/calendar" element={<PageTransitionWrapper><Calendar /></PageTransitionWrapper>} />
      <Route path="/journal" element={<PageTransitionWrapper><JournalManager /></PageTransitionWrapper>} />

      {/* Profile Routes */}
      <Route path="/profile/edit" element={<PageTransitionWrapper><ProfileEditPage /></PageTransitionWrapper>} />
      <Route path="/profile/:useremail" element={<PageTransitionWrapper><ProfileViewPage /></PageTransitionWrapper>} />

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

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
