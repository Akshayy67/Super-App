import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FacultyEarlyWarningDashboard } from './FacultyEarlyWarningDashboard';
import { FacultyLogin } from './FacultyLogin';
import { realTimeAuth } from '../../utils/realTimeAuth';

export const FacultyDashboardWrapper: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [facultyAuthenticated, setFacultyAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Check faculty authentication from sessionStorage
    const checkFacultyAuth = () => {
      try {
        const facultyAuth = sessionStorage.getItem('facultyAuth');
        if (facultyAuth) {
          const authData = JSON.parse(facultyAuth);
          if (authData.authenticated) {
            console.log('✅ Faculty already authenticated');
            setFacultyAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error checking faculty auth:', error);
      }
    };

    checkFacultyAuth();

    // Listen for auth state changes
    const unsubscribe = realTimeAuth.onAuthStateChange((currentUser) => {
      if (!mounted) return;
      console.log('🔐 Faculty Dashboard - Auth state changed:', currentUser);
      setUser(currentUser);
      setAuthChecked(true);
      setLoading(false);
    });

    // Check immediately but don't rely solely on this
    const currentUser = realTimeAuth.getCurrentUser();
    if (currentUser) {
      console.log('🔐 Faculty Dashboard - Current user (immediate):', currentUser);
      setUser(currentUser);
      setAuthChecked(true);
      setLoading(false);
    } else {
      // Give auth state listener time to fire (it will update via callback)
      setTimeout(() => {
        if (mounted && !authChecked) {
          const user = realTimeAuth.getCurrentUser();
          console.log('🔐 Faculty Dashboard - Current user (fallback check):', user);
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

  // Show loading until auth is confirmed
  if (loading || !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing dashboard...</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Authenticating...</p>
        </div>
      </div>
    );
  }
  
  // Only redirect if auth check is complete and still no user
  if (authChecked && (!user || !user.id)) {
    console.warn('⚠️ No user found after auth check, redirecting to landing');
    return <Navigate to="/landing" replace />;
  }

  // Show faculty login if not authenticated
  if (!facultyAuthenticated) {
    return <FacultyLogin onLogin={() => setFacultyAuthenticated(true)} />;
  }

  console.log('✅ Loading faculty dashboard for user:', user.id);
  return <FacultyEarlyWarningDashboard facultyId={user.id} />;
};
