import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { StudyToolsCombined } from "./StudyToolsCombined";
import { StudyTools } from "../StudyTools";
import { StudyPlanManager } from "../studyPlan/StudyPlan";
import { FlashCards } from "../FlashCards";

export const StudyToolsRouter: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<StudyToolsCombined />}
      >
        <Route
          index
          element={<Navigate to="/tools/study-tools" replace />}
        />
        <Route path="study-tools/*" element={<StudyTools />} />
        <Route path="study-plans/new" element={<StudyPlanManager />} />
        <Route path="study-plans/:planId" element={<StudyPlanManager />} />
        <Route path="study-plans" element={<StudyPlanManager />} />
        <Route path="flashcards/*" element={<FlashCards />} />
        <Route
          path="*"
          element={<Navigate to="/tools/study-tools" replace />}
        />
      </Route>
    </Routes>
  );
};

