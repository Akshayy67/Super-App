import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { PredictiveDashboard } from './PredictiveDashboard';
import { realTimeAuth } from '../../utils/realTimeAuth';

export const PredictiveDashboardWrapper: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Listen for auth state changes
    const unsubscribe = realTimeAuth.onAuthStateChange((currentUser) => {
      if (!mounted) return;
      console.log('🔐 Predictive Dashboard - Auth state changed:', currentUser);
      setUser(currentUser);
      setAuthChecked(true);
      setLoading(false);
    });

    // Check immediately but don't rely solely on this
    const currentUser = realTimeAuth.getCurrentUser();
    if (currentUser) {
      console.log('🔐 Predictive Dashboard - Current user (immediate):', currentUser);
      setUser(currentUser);
      setAuthChecked(true);
      setLoading(false);
    } else {
      // Give auth state listener time to fire (it will update via callback)
      setTimeout(() => {
        if (mounted && !authChecked) {
          const user = realTimeAuth.getCurrentUser();
          console.log('🔐 Predictive Dashboard - Current user (fallback check):', user);
          setUser(user);
          setAuthChecked(true);
          setLoading(false);
        }
      }, 2000); // Increased to 2 seconds
    }

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [authChecked]);

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

  console.log('✅ Loading predictive dashboard for user:', user.id);
  return <PredictiveDashboard userId={user.id} />;
};
