import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import { FileManager } from "./FileManager";
import { TaskManager } from "./TaskManager";
import { NotesManager } from "./NotesManager";
import { AIChat } from "./AIChat";
import { StudyTools } from "./StudyTools";
import { FlashCards } from "./FlashCards";
import { InterviewPrep } from "./InterviewPrep/InterviewPrep";
import { TeamSpace } from "./TeamSpace";

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
      <Route path="/chat/*" element={<AIChat />} />
      <Route path="/tools/*" element={<StudyTools />} />
      <Route path="/flashcards/*" element={<FlashCards />} />
      <Route path="/interview/*" element={<InterviewPrep />} />
      <Route path="/team/*" element={<TeamSpace invitationData={invitationData} />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
