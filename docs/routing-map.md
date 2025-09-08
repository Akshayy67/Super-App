# Application Routing Map

## Overview
This document provides a comprehensive map of all routes in the refactored Interview Prep application, showing the hierarchical structure and component relationships.

## Route Tree Structure

```
/ (Root)
├── AppRouter (src/components/AppRouter.tsx)
│   ├── / → Navigate to /dashboard
│   ├── /dashboard → Dashboard (src/components/Dashboard.tsx)
│   ├── /interview/* → InterviewPrep (src/components/InterviewPrep/InterviewPrep.tsx)
│   │   └── InterviewPrepRouter (src/components/InterviewPrep/InterviewPrepRouter.tsx)
│   │       ├── / → Navigate to /interview/overview
│   │       ├── /overview → InterviewOverview (src/components/InterviewPrep/routes/InterviewOverview.tsx)
│   │       ├── /practice → InterviewPractice (src/components/InterviewPrep/routes/InterviewPractice.tsx)
│   │       ├── /question-bank → InterviewQuestionBank (src/components/InterviewPrep/routes/InterviewQuestionBank.tsx)
│   │       ├── /view-code → InterviewViewCode (src/components/InterviewPrep/routes/InterviewViewCode.tsx)
│   │       ├── /references → InterviewReferences (src/components/InterviewPrep/routes/InterviewReferences.tsx)
│   │       └── /* → Navigate to /interview/overview
│   ├── /tasks → Tasks (src/components/Tasks.tsx)
│   ├── /files → Files (src/components/Files.tsx)
│   ├── /notes → Notes (src/components/Notes.tsx)
│   ├── /chat → Chat (src/components/Chat.tsx)
│   ├── /team → Team (src/components/Team.tsx)
│   └── /* → Navigate to /dashboard
```

## Route Details

### Main Application Routes

#### `/` (Root)
- **Component**: AppRouter
- **Behavior**: Redirects to `/dashboard`
- **Purpose**: Entry point for the application

#### `/dashboard`
- **Component**: Dashboard
- **File**: `src/components/Dashboard.tsx`
- **Purpose**: Main dashboard with statistics, quick actions, and navigation cards
- **Features**:
  - Task statistics and quick access
  - File upload shortcuts
  - AI assistant access
  - Team collaboration links

#### `/interview/*` (Interview Prep Module)
- **Component**: InterviewPrep → InterviewPrepRouter
- **File**: `src/components/InterviewPrep/InterviewPrep.tsx`
- **Purpose**: Comprehensive interview preparation module
- **Layout**: InterviewPrepLayout with tab navigation
- **Subroutes**: 5 specialized sections (see below)

#### `/tasks`
- **Component**: Tasks
- **File**: `src/components/Tasks.tsx`
- **Purpose**: Task management and tracking

#### `/files`
- **Component**: Files
- **File**: `src/components/Files.tsx`
- **Purpose**: File upload and management

#### `/notes`
- **Component**: Notes
- **File**: `src/components/Notes.tsx`
- **Purpose**: Note-taking and organization

#### `/chat`
- **Component**: Chat
- **File**: `src/components/Chat.tsx`
- **Purpose**: AI assistant interaction

#### `/team`
- **Component**: Team
- **File**: `src/components/Team.tsx`
- **Purpose**: Team collaboration features

### Interview Prep Subroutes

#### `/interview/overview`
- **Component**: InterviewOverview
- **File**: `src/components/InterviewPrep/routes/InterviewOverview.tsx`
- **Purpose**: Welcome page and feature overview
- **Features**:
  - Feature cards for each section
  - Statistics display (500+ questions, 15 categories, etc.)
  - Pro tips and guidance
  - Quick navigation to other sections

#### `/interview/practice`
- **Component**: InterviewPractice
- **File**: `src/components/InterviewPrep/routes/InterviewPractice.tsx`
- **Purpose**: Interactive practice sessions
- **Features**:
  - Practice session selection
  - Category and difficulty filtering
  - Progress tracking
  - Session statistics

#### `/interview/question-bank`
- **Component**: InterviewQuestionBank
- **File**: `src/components/InterviewPrep/routes/InterviewQuestionBank.tsx`
- **Purpose**: Comprehensive question collection
- **Features**:
  - Question browsing and filtering
  - Category-based organization
  - Difficulty level selection
  - Search functionality
- **Note**: Wraps existing QuestionBank component

#### `/interview/view-code`
- **Component**: InterviewViewCode
- **File**: `src/components/InterviewPrep/routes/InterviewViewCode.tsx`
- **Purpose**: Code solutions browser
- **Features**:
  - Multi-language code solutions (Python, TypeScript, Java)
  - Search and filtering by language, category, difficulty
  - Code viewer with syntax highlighting
  - Complexity analysis display

#### `/interview/references`
- **Component**: InterviewReferences
- **File**: `src/components/InterviewPrep/routes/InterviewReferences.tsx`
- **Purpose**: Study materials and external resources
- **Features**:
  - Curated resource collection
  - Category and type filtering
  - Free/paid resource filtering
  - External link management
  - Rating and difficulty indicators

## Navigation Patterns

### Primary Navigation
- **Location**: Sidebar (src/components/Sidebar.tsx)
- **Method**: React Router `useNavigate()` hook
- **Pattern**: Direct route navigation with `navigate(path)`

### Secondary Navigation (Interview Prep)
- **Location**: InterviewPrepLayout tabs
- **Method**: React Router navigation within module
- **Pattern**: Tab-based navigation with active state management

### Breadcrumb Navigation
- **Implementation**: useCurrentRoute hook
- **File**: `src/hooks/useCurrentRoute.ts`
- **Purpose**: Track current route and provide navigation context

## Route Guards and Protection

### Authentication
- **Implementation**: AuthenticatedApp wrapper in App.tsx
- **Behavior**: Redirects to login if not authenticated
- **Protected Routes**: All application routes require authentication

### Error Handling
- **Fallback Routes**: Wildcard routes redirect to appropriate defaults
- **404 Handling**: Unknown routes redirect to dashboard or module overview

## State Management

### Route State
- **Hook**: useCurrentRoute
- **Purpose**: Provides current route information and navigation helpers
- **Usage**: Used by layout components for active state management

### Navigation State
- **Method**: React Router's built-in state management
- **Benefits**: Browser history support, deep linking, refresh handling

## Performance Considerations

### Code Splitting
- **Current**: All routes loaded in main bundle
- **Future**: Consider lazy loading for large modules

### Route Caching
- **Implementation**: React Router handles route caching
- **Benefits**: Fast navigation between visited routes

## Accessibility

### Keyboard Navigation
- **Support**: Tab navigation through route elements
- **Focus Management**: Proper focus handling on route changes

### Screen Reader Support
- **Implementation**: Semantic HTML and ARIA labels
- **Route Announcements**: Route changes announced to screen readers

## Mobile Responsiveness

### Route Adaptation
- **Implementation**: Responsive design in all route components
- **Navigation**: Mobile-friendly navigation patterns
- **Touch Support**: Touch-optimized interactions

## Future Enhancements

### Potential New Routes
- `/interview/mock-interview` - AI-powered mock interviews
- `/interview/progress` - Detailed progress tracking
- `/interview/bookmarks` - Saved questions and solutions
- `/settings` - Application settings and preferences
- `/profile` - User profile management

### Route Optimization
- Implement lazy loading for better performance
- Add route preloading for frequently accessed paths
- Consider route-based code splitting

## Migration Notes

### From State-Based to Route-Based
- **Before**: Navigation managed by `activeView` state
- **After**: Navigation managed by React Router
- **Benefits**: 
  - Deep linking support
  - Browser history integration
  - Better SEO potential
  - Improved user experience
  - Easier testing and debugging

### Breaking Changes
- **Navigation Props**: Removed `onViewChange` props from components
- **State Management**: Replaced local state with route-based navigation
- **URL Structure**: New URL patterns for all sections

### Backward Compatibility
- **Redirects**: Automatic redirects from old patterns to new routes
- **API Stability**: No changes to data fetching or business logic
- **Component Interfaces**: Maintained existing component APIs where possible
