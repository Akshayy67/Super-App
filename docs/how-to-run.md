# How to Run the Interview Prep Application

## Prerequisites

### System Requirements
- **Node.js**: Version 16.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

### Development Environment
- **Code Editor**: VS Code recommended with the following extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Super-App
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify Installation
```bash
npm run dev
```

The application should start and be available at `http://localhost:5173/`

## Available Scripts

### Development
```bash
# Start development server with hot reload
npm run dev

# Start development server on specific port
npm run dev -- --port 3000
```

### Building
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Code Quality
```bash
# Run TypeScript type checking
npm run type-check

# Run linting (if configured)
npm run lint

# Run linting with auto-fix
npm run lint:fix

# Format code with Prettier
npm run format
```

### Testing
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
Super-App/
├── public/                 # Static assets
│   ├── SuperApp.png       # App icon
│   └── index.html         # HTML template
├── src/                   # Source code
│   ├── components/        # React components
│   │   ├── InterviewPrep/ # Interview prep module
│   │   │   ├── routes/    # Route components
│   │   │   ├── bank/      # Question banks
│   │   │   └── ...        # Other components
│   │   ├── AppRouter.tsx  # Main routing configuration
│   │   ├── Dashboard.tsx  # Dashboard component
│   │   └── ...            # Other components
│   ├── hooks/             # Custom React hooks
│   ├── styles/            # CSS and styling
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main App component
│   └── main.tsx           # Application entry point
├── docs/                  # Documentation
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md              # Project overview
```

## Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
# Development
VITE_APP_TITLE=Super Study App
VITE_API_BASE_URL=http://localhost:3001

# Firebase (if using authentication)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### TypeScript Configuration
The project uses TypeScript with strict mode enabled. Configuration is in `tsconfig.json`:
- Strict type checking
- Modern ES modules
- React JSX support
- Path mapping for imports

### Vite Configuration
Build tool configuration in `vite.config.ts`:
- React plugin enabled
- Hot module replacement
- TypeScript support
- Development server settings

## Running the Application

### Development Mode
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173/`

3. The application will automatically reload when you make changes

### Production Mode
1. Build the application:
   ```bash
   npm run build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   ```

3. Deploy the `dist/` folder to your hosting service

## Features and Navigation

### Main Application Routes
- **Dashboard** (`/dashboard`): Overview and quick actions
- **Interview Prep** (`/interview/*`): Comprehensive interview preparation
- **Tasks** (`/tasks`): Task management
- **Files** (`/files`): File upload and management
- **Notes** (`/notes`): Note-taking
- **Chat** (`/chat`): AI assistant
- **Team** (`/team`): Team collaboration

### Interview Prep Module
- **Overview** (`/interview/overview`): Feature introduction and statistics
- **Practice** (`/interview/practice`): Interactive practice sessions
- **Question Bank** (`/interview/question-bank`): Browse 500+ questions
- **View Code** (`/interview/view-code`): Code solutions in Python, TypeScript, Java
- **References** (`/interview/references`): Study materials and resources

## Testing

### Running Tests
```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- Dashboard.test.tsx

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Component and function testing
- **Integration Tests**: Route and feature testing
- **Test Files**: Located alongside source files with `.test.tsx` extension

### Example Test Commands
```bash
# Test routing functionality
npm run test -- AppRouter.test.tsx

# Test interview prep components
npm run test -- InterviewPrep

# Test question bank functionality
npm run test -- QuestionBank.test.tsx
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173

# Or start on different port
npm run dev -- --port 3000
```

#### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Build Errors
```bash
# Clear build cache
rm -rf dist

# Clean install
npm ci
npm run build
```

#### Hot Reload Not Working
1. Check if files are being watched correctly
2. Restart the development server
3. Clear browser cache
4. Check for file permission issues

### Performance Issues
- **Large Bundle Size**: Consider code splitting
- **Slow Development Server**: Check for large files in src/
- **Memory Issues**: Restart development server periodically

## Development Workflow

### Making Changes
1. Create a feature branch: `git checkout -b feature/new-feature`
2. Make your changes
3. Test your changes: `npm run test`
4. Check types: `npm run type-check`
5. Format code: `npm run format`
6. Commit changes: `git commit -m "Add new feature"`
7. Push branch: `git push origin feature/new-feature`

### Code Quality
- Follow TypeScript best practices
- Use meaningful component and variable names
- Add proper type annotations
- Write tests for new features
- Follow existing code patterns

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The `dist/` folder contains the production build and can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Any static hosting service

### Environment-Specific Builds
```bash
# Development build
npm run build:dev

# Staging build
npm run build:staging

# Production build
npm run build:prod
```

## Support and Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Router Documentation](https://reactrouter.com/)

### Getting Help
1. Check the troubleshooting section above
2. Review the project documentation in `docs/`
3. Check existing issues in the repository
4. Create a new issue with detailed information

### Contributing
1. Read the contributing guidelines
2. Follow the development workflow
3. Ensure all tests pass
4. Submit a pull request with clear description

## Performance Monitoring

### Development Metrics
- Bundle size analysis: `npm run build -- --analyze`
- Performance profiling: Use React DevTools
- Memory usage: Monitor in browser DevTools

### Production Monitoring
- Core Web Vitals tracking
- Error monitoring
- Performance analytics
- User experience metrics
