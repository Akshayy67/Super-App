import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FacultyEarlyWarningDashboard } from './FacultyEarlyWarningDashboard';
import { realTimeAuth } from '../../utils/realTimeAuth';

export const FacultyDashboardWrapper: React.FC = () => {
  const [user, setUser] = useState(realTimeAuth.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Give auth a moment to initialize
    const timer = setTimeout(() => {
      const currentUser = realTimeAuth.getCurrentUser();
      console.log('🔐 Faculty Dashboard - Current user:', currentUser);
      setUser(currentUser);
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!user || !user.id) {
    console.warn('⚠️ No user found, redirecting to landing');
    return <Navigate to="/landing" replace />;
  }

  console.log('✅ Loading faculty dashboard for user:', user.id);
  return <FacultyEarlyWarningDashboard facultyId={user.id} />;
};
