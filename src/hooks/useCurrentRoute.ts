import { useLocation } from "react-router-dom";

export const useCurrentRoute = () => {
  const location = useLocation();
  
  // Extract the main route from the pathname
  const getActiveView = (pathname: string): string => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'dashboard';
    
    // Map route segments to view names
    const routeMap: Record<string, string> = {
      'dashboard': 'dashboard',
      'files-notes': 'files-notes',
      'files': 'files-notes', // Redirect old route
      'notes': 'files-notes', // Redirect old route
      'tasks': 'tasks',
      'calendar': 'calendar',
      'meetings': 'meetings',
      'journal': 'journal',
      'chat': 'chat',
      'tools': 'tools',
      'flashcards': 'tools', // Redirect old route
      'study-plans': 'tools', // Redirect old route
      'interview': 'interview',
      'team': 'team',
      'meeting': 'meeting',
      'community': 'community',
      'about': 'about'
    };
    
    return routeMap[segments[0]] || 'dashboard';
  };
  
  const activeView = getActiveView(location.pathname);
  
  return {
    activeView,
    pathname: location.pathname,
    search: location.search,
    hash: location.hash
  };
};
