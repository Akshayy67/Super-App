import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { InterviewPrepLayout } from "./InterviewPrepLayout";
import { InterviewOverview } from "./routes/InterviewOverview";
import { InterviewPractice } from "./routes/InterviewPractice";
import { InterviewQuestionBank } from "./routes/InterviewQuestionBank";
import { MockInterview } from "./MockInterview";
import { InterviewTips } from "./InterviewTips";

export const InterviewPrepRouter: React.FC = () => {
  return (
    <InterviewPrepLayout>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/interview/overview" replace />}
        />
        <Route path="/overview" element={<InterviewOverview />} />
        <Route path="/practice" element={<InterviewPractice />} />
        <Route path="/question-bank" element={<InterviewQuestionBank />} />
        <Route path="/mock-interview" element={<MockInterview />} />
        <Route path="/interview-tips" element={<InterviewTips />} />
        <Route
          path="*"
          element={<Navigate to="/interview/overview" replace />}
        />
      </Routes>
    </InterviewPrepLayout>
  );
};
