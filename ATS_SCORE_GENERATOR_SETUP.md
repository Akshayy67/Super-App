# ATS Score Generator - Complete Setup Guide

A production-ready ATS (Applicant Tracking System) Score Generator that analyzes resumes against job descriptions using advanced NLP and provides actionable insights for improving ATS compatibility.

## 🎯 Features

### Core Functionality

- **Resume Analysis**: Parse PDF, DOCX, and TXT files with advanced text extraction
- **Job Description Processing**: Extract requirements, skills, and hard criteria
- **ATS Scoring**: Multi-factor scoring algorithm (Skills 40%, Experience 35%, Education 10%, Keywords 15%)
- **Semantic Matching**: Advanced NLP with similarity analysis and synonym mapping
- **Gate Validation**: Hard requirement checking that caps scores if not met
- **Improvement Suggestions**: Actionable bullet points and keyword recommendations
- **PDF Reports**: Professional, downloadable reports with detailed breakdowns

### User Experience

- **Quick Score**: No-login instant analysis for anonymous users
- **Saved Runs**: Authenticated users can save and track multiple analyses
- **Score History**: View past runs with statistics and trends
- **Bulk Analysis**: Compare multiple resumes against one job description
- **Export Options**: PDF reports and JSON data export

### Technical Features

- **Production Ready**: Comprehensive error handling, rate limiting, security
- **Clean Architecture**: Modular design with clear separation of concerns
- **Comprehensive Testing**: Unit, integration, and E2E tests
- **Privacy Focused**: Auto-delete anonymous data, GDPR compliant
- **Scalable**: Designed for high-volume usage with proper caching

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)

```
src/components/InterviewPrep/ATSScoreGenerator/
├── ATSScoreGenerator.tsx      # Main component with tab navigation
├── FileUploadZone.tsx         # File upload with drag-drop support
├── JobDescriptionInput.tsx    # JD input with analysis preview
├── ScoreDashboard.tsx         # Results visualization with charts
└── ScoreHistory.tsx           # User's score run history
```

### Backend (Node.js + Express + TypeScript)

```
server/src/
├── routes/                    # API endpoints
│   ├── parse.ts              # File parsing endpoints
│   ├── score.ts              # Scoring endpoints
│   ├── auth.ts               # Authentication
│   ├── runs.ts               # Score run management
│   └── health.ts             # Health checks
├── services/                  # Business logic
│   ├── fileParser.ts         # PDF/DOCX/TXT parsing
│   ├── nlpService.ts         # NLP processing
│   ├── scoringService.ts     # Scoring algorithm
│   ├── reportService.ts      # PDF generation
│   └── cleanupService.ts     # Data cleanup
└── middleware/               # Express middleware
    ├── auth.ts               # JWT authentication
    ├── errorHandler.ts       # Error handling
    └── requestLogger.ts      # Request logging
```

### Database (Prisma + SQLite/PostgreSQL)

```sql
Users ──┐
        ├── Resumes ──┐
        ├── JobDescs ──┼── ScoreRuns
        └── Config ────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Git

### 1. Clone and Install

```bash
git clone <repository-url>
cd ats-score-generator

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Backend Setup

```bash
cd server

# Copy environment file
cp .env.example .env

# Edit .env with your settings (JWT_SECRET is required)
nano .env

# Initialize database
npm run db:generate
npm run db:push
npm run db:seed

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
# In project root
# Add ATS API URL to your .env
echo "VITE_ATS_API_URL=http://localhost:3001/api" >> .env

# Start frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Access the Application

1. Open `http://localhost:5173`
2. Navigate to **Interview Prep** → **ATS Score**
3. Upload a resume and paste a job description
4. Click "Generate ATS Score" to see results

## 📋 Detailed Setup

### Environment Configuration

#### Backend (.env)

```env
# Database
DATABASE_URL="file:./dev.db"

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# JWT Secret (REQUIRED - generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# File Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Cleanup Configuration
AUTO_DELETE_ANONYMOUS_HOURS=24
CLEANUP_INTERVAL_HOURS=6

# NLP Configuration
ENABLE_SEMANTIC_SIMILARITY=true
SIMILARITY_THRESHOLD=0.7
DEFAULT_MODEL_VERSION=1.0

# Scoring Weights (JSON format)
SCORING_WEIGHTS={"skills":0.4,"experience":0.35,"education":0.1,"keywords":0.15}
```

#### Frontend (.env)

```env
# ATS API Configuration
VITE_ATS_API_URL=http://localhost:3001/api

# Optional: Enable debug mode
VITE_DEBUG_MODE=true
```

### Database Setup

#### Development (SQLite)

```bash
cd server

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed

# View database (optional)
npm run db:studio
```

#### Production (PostgreSQL)

```bash
# Set DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@localhost:5432/ats_db"

# Run migrations
npm run db:migrate

# Seed production data
npm run db:seed
```

## 🧪 Testing

### Backend Tests

```bash
cd server

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test suite
npm test -- --testPathPattern=scoring

# Watch mode
npm run test:watch
```

### Frontend Tests

```bash
# Run component tests
npm test

# E2E tests (requires both servers running)
npm run test:e2e
```

### Integration Testing

```bash
# Start both servers
npm run dev &
cd server && npm run dev &

# Run full integration tests
npm run test:integration
```

## 📊 API Documentation

### Authentication

```bash
# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### File Parsing

```bash
# Parse resume file
curl -X POST http://localhost:3001/api/parse/resume \
  -F "resume=@path/to/resume.pdf"

# Parse job description text
curl -X POST http://localhost:3001/api/parse/job-description \
  -H "Content-Type: application/json" \
  -d '{"text":"Job description text here..."}'
```

### Scoring

```bash
# Generate score
curl -X POST http://localhost:3001/api/score \
  -H "Content-Type: application/json" \
  -d '{
    "resume": {"text": "Resume text..."},
    "jobDescription": {"text": "Job description..."},
    "includeDebug": true
  }'
```

### Score Management

```bash
# Get score runs (requires auth)
curl -X GET http://localhost:3001/api/runs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Download PDF report
curl -X GET http://localhost:3001/api/runs/SCORE_RUN_ID/pdf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output report.pdf
```

## 🔧 Configuration

### Scoring Weights

Modify scoring weights in the database or environment:

```json
{
  "skills": 0.4, // 40% - Skills matching
  "experience": 0.35, // 35% - Experience relevance
  "education": 0.1, // 10% - Education matching
  "keywords": 0.15 // 15% - Keyword coverage
}
```

### Skill Synonyms

Add skill synonyms for better matching:

```json
{
  "javascript": ["js", "ecmascript", "es6"],
  "typescript": ["ts"],
  "react": ["reactjs", "react.js"],
  "node": ["nodejs", "node.js"]
}
```

### Hard Requirements Patterns

Configure patterns for extracting hard requirements:

```json
[
  "must have",
  "required",
  "mandatory",
  "essential",
  "minimum.*years",
  "at least.*years"
]
```

## 🚀 Production Deployment

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=secure-random-string-256-bits
CORS_ORIGIN=https://yourdomain.com
```

### Health Checks

```bash
# Kubernetes health checks
livenessProbe:
  httpGet:
    path: /api/health/live
    port: 3001

readinessProbe:
  httpGet:
    path: /api/health/ready
    port: 3001
```

## 🔒 Security Features

- **Input Validation**: Zod schemas for all inputs
- **File Security**: Type and size validation for uploads
- **Rate Limiting**: Configurable per-IP limits
- **CORS Protection**: Restricted origins
- **JWT Authentication**: Secure token-based auth
- **Data Privacy**: Auto-cleanup of anonymous data
- **SQL Injection Protection**: Prisma ORM with parameterized queries

## 📈 Performance Optimization

- **Database Indexing**: Optimized queries
- **File Streaming**: Efficient large file handling
- **Background Cleanup**: Automated data maintenance
- **Connection Pooling**: Prisma connection management
- **Caching**: Configuration and result caching

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**

   ```bash
   # Check if port 3001 is available
   lsof -i :3001

   # Check database connection
   cd server && npm run db:studio
   ```

2. **File upload fails**

   ```bash
   # Check file size limits
   echo $MAX_FILE_SIZE

   # Check file permissions
   ls -la server/uploads/
   ```

3. **Scoring returns errors**

   ```bash
   # Check NLP dependencies
   cd server && npm list natural compromise

   # Check sample data
   npm run db:seed
   ```

4. **Frontend can't connect to backend**
   ```bash
   # Check CORS configuration
   curl -H "Origin: http://localhost:5173" \
        -H "Access-Control-Request-Method: POST" \
        -X OPTIONS http://localhost:3001/api/health
   ```

### Debug Mode

Enable debug logging:

```bash
# Backend
DEBUG=ats:* npm run dev

# Frontend
VITE_DEBUG_MODE=true npm run dev
```

## 📚 Additional Resources

- [Backend API Documentation](./server/README.md)
- [Frontend Component Guide](./src/components/InterviewPrep/ATSScoreGenerator/README.md)
- [Scoring Algorithm Details](./docs/scoring-algorithm.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for better ATS compatibility and job search success!**
