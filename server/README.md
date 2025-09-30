# ATS Score Generator Backend

A production-ready backend API for analyzing resumes against job descriptions using NLP and providing ATS compatibility scores.

## Features

- **File Parsing**: PDF, DOCX, and TXT resume parsing
- **NLP Analysis**: Advanced text processing with keyword extraction and semantic similarity
- **ATS Scoring**: Multi-factor scoring algorithm with configurable weights
- **Report Generation**: PDF reports with detailed insights and suggestions
- **User Management**: JWT-based authentication with optional magic links
- **Data Privacy**: Automatic cleanup of anonymous data
- **Rate Limiting**: Built-in protection against abuse
- **Comprehensive API**: RESTful endpoints with detailed documentation

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **File Processing**: pdf-parse, mammoth
- **NLP**: natural, compromise, stopword
- **PDF Generation**: puppeteer
- **Security**: helmet, cors, rate limiting
- **Testing**: Jest + Supertest

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- SQLite (for development)

### Installation

1. **Clone and install dependencies**

   ```bash
   cd server
   npm install
   ```

2. **Set up environment**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize database**

   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## Environment Configuration

```env
# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# File Upload
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Cleanup
AUTO_DELETE_ANONYMOUS_HOURS=24
CLEANUP_INTERVAL_HOURS=6
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/magic` - Magic link authentication
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### File Parsing

- `POST /api/parse/resume` - Parse resume file
- `POST /api/parse/resume-text` - Parse resume text
- `POST /api/parse/job-description` - Parse job description text
- `POST /api/parse/jd-file` - Parse job description file
- `GET /api/parse/supported-formats` - Get supported file formats

### Scoring

- `POST /api/score` - Generate ATS score
- `POST /api/score/bulk` - Score multiple resumes
- `POST /api/score/suggest-bullets` - Generate bullet suggestions
- `GET /api/score/weights` - Get scoring weights

### Score Runs

- `GET /api/runs` - Get user's score runs
- `GET /api/runs/:id` - Get specific score run
- `GET /api/runs/:id/pdf` - Download PDF report
- `DELETE /api/runs/:id` - Delete score run
- `GET /api/runs/stats/summary` - Get user statistics

### Health & Monitoring

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health check
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

## Scoring Algorithm

The ATS scoring system uses a multi-factor approach:

### Section Weights (Configurable)

- **Skills Match**: 40% - Direct and synonym matching
- **Experience Relevance**: 35% - Semantic similarity analysis
- **Education**: 10% - Degree and certification matching
- **Keywords**: 15% - TF-IDF weighted coverage

### Hard Requirements (Gates)

- Must-have requirements that cap the overall score if not met
- Extracted using pattern matching from job descriptions
- Examples: "Must have 5+ years", "Required: Python"

### Scoring Process

1. **Text Processing**: Clean, tokenize, lemmatize, remove stopwords
2. **Section Extraction**: Identify resume sections using NLP
3. **Requirement Analysis**: Extract hard requirements and skills from JD
4. **Similarity Calculation**: Compute semantic similarity between sections
5. **Gate Evaluation**: Check hard requirements compliance
6. **Final Scoring**: Apply weights and gates to generate final score

## Data Models

### User

```typescript
{
  id: string;
  email: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### Resume

```typescript
{
  id: string
  userId?: string
  title: string
  originalName: string
  text: string
  parsedJson: string  // Extracted sections
  createdAt: DateTime
}
```

### JobDesc

```typescript
{
  id: string
  userId?: string
  title: string
  source?: string
  text: string
  parsedJson: string  // Extracted requirements
  createdAt: DateTime
}
```

### ScoreRun

```typescript
{
  id: string
  userId?: string
  resumeId: string
  jobDescId: string
  overall: number     // 0-100
  sectionJson: string // Section scores
  gapsJson: string    // Missing keywords, failed gates
  suggestionsJson: string // Improvement suggestions
  modelVersion: string
  createdAt: DateTime
}
```

## Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --testPathPattern=scoring

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch
```

### Database Management

```bash
# Reset database
npm run db:push -- --force-reset

# View database
npm run db:studio

# Create migration
npm run db:migrate -- --name add_new_field
```

## Production Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Variables

- Set `NODE_ENV=production`
- Use PostgreSQL for `DATABASE_URL`
- Configure proper `JWT_SECRET`
- Set up SMTP for magic links
- Configure rate limiting for your traffic

### Health Checks

- Use `/api/health/ready` for readiness probes
- Use `/api/health/live` for liveness probes
- Monitor `/api/health/detailed` for system metrics

## Security Considerations

- **Input Validation**: All inputs validated with Zod schemas
- **File Upload Security**: File type and size validation
- **Rate Limiting**: Configurable rate limits per IP
- **CORS**: Restricted to allowed origins
- **Helmet**: Security headers enabled
- **JWT**: Secure token-based authentication
- **Data Cleanup**: Automatic removal of anonymous data

## Performance Optimization

- **Database Indexing**: Optimized queries with proper indexes
- **File Processing**: Streaming for large files
- **Caching**: In-memory caching for configuration
- **Cleanup Service**: Background cleanup of old data
- **Connection Pooling**: Prisma connection management

## Monitoring & Logging

- **Request Logging**: Detailed request/response logging
- **Error Tracking**: Comprehensive error handling
- **Health Metrics**: System health monitoring
- **Performance Metrics**: Response time tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details
