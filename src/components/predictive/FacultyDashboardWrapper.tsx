import React from 'react';
import { Navigate } from 'react-router-dom';
import { FacultyEarlyWarningDashboard } from './FacultyEarlyWarningDashboard';
import { realTimeAuth } from '../../utils/realTimeAuth';

export const FacultyDashboardWrapper: React.FC = () => {
  const user = realTimeAuth.getCurrentUser();
  
  if (!user || !user.id) {
    return <Navigate to="/landing" replace />;
  }

  return <FacultyEarlyWarningDashboard facultyId={user.id} />;
};
