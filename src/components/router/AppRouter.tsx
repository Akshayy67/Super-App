import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "../dashboards/Dashboard";
import { FileManager } from "../file/FileManager";
import { TaskManager } from "../tasks/TaskManager";
import { NotesManager } from "../notes/NotesManager";
import { EnhancedAIChat } from "../ai/EnhancedAIChat";
import { StudyTools } from "../StudyTools";
import { FlashCards } from "../FlashCards";
import { InterviewPrep } from "../InterviewPrep/InterviewPrep";
import { TeamSpace } from "../../team/components/TeamSpace";
import { AboutUs } from "../AboutUs";
import { AdminDashboard } from "../dashboards/AdminDashboard";
import { SettingsPage } from "../SettingsPage";

interface AppRouterProps {
  invitationData: {
    inviteCode?: string;
    teamId?: string;
  } | null;
}

export const AppRouter: React.FC<AppRouterProps> = ({ invitationData }) => {
  return (
    <Routes>
      {/* Main Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/files/*" element={<FileManager />} />
      <Route path="/tasks/*" element={<TaskManager />} />
      <Route path="/notes/*" element={<NotesManager />} />
      <Route path="/chat/*" element={<EnhancedAIChat />} />
      <Route path="/tools/*" element={<StudyTools />} />
      <Route path="/flashcards/*" element={<FlashCards />} />
      <Route path="/interview/*" element={<InterviewPrep />} />
      <Route
        path="/team/*"
        element={<TeamSpace invitationData={invitationData} />}
      />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/settings" element={<SettingsPage />} />

      {/* Admin Routes - Protected */}
      <Route path="/admin/*" element={<AdminDashboard />} />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
