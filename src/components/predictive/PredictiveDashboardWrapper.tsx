import React from 'react';
import { Navigate } from 'react-router-dom';
import { PredictiveDashboard } from './PredictiveDashboard';
import { realTimeAuth } from '../../utils/realTimeAuth';

export const PredictiveDashboardWrapper: React.FC = () => {
  const user = realTimeAuth.getCurrentUser();
  
  if (!user || !user.id) {
    return <Navigate to="/landing" replace />;
  }

  return <PredictiveDashboard userId={user.id} />;
};
