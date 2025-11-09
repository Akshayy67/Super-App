# n8n Automation Setup Guide

## Prerequisites
- Node.js 18+ installed
- npm or Docker installed
- Port 5678 available (default n8n port)

## Installation Options

### Option 1: Using npm (Recommended for development)

```bash
# Install n8n globally
npm install -g n8n

# Start n8n
n8n start

# Access n8n at: http://localhost:5678
```

### Option 2: Using Docker

```bash
# Pull n8n image
docker pull n8nio/n8n

# Run n8n container
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Access n8n at: http://localhost:5678
```

### Option 3: Using Docker Compose (Production)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=yourpassword
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - NODE_ENV=production
      - WEBHOOK_URL=http://localhost:5678/
    volumes:
      - ~/.n8n:/home/node/.n8n
      - ./n8n-workflows:/home/node/.n8n/workflows
```

Run with:
```bash
docker-compose up -d
```

## Environment Variables

Create `.env` file:

```env
# n8n Configuration
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=yourpassword

# Email Service (for daily emails workflow)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Job Scraping APIs
RAPIDAPI_KEY=your-rapidapi-key
SERPAPI_KEY=your-serpapi-key

# Database
FIREBASE_PROJECT_ID=super-app-54ae9
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# OpenAI for AI summaries
OPENAI_API_KEY=your-openai-api-key
```

## Workflow Files

Import the following workflow JSON files into n8n:

1. **job-hunt-scraper.json** - Scrapes jobs from 10+ sources
2. **daily-email-todos.json** - Sends daily calendar & todo emails
3. **monthly-summary.json** - Generates monthly activity reports
4. **contest-swot-trigger.json** - Triggers SWOT analysis after contests

## Importing Workflows

1. Open n8n at http://localhost:5678
2. Click "Workflows" → "Import from File"
3. Select the workflow JSON file
4. Configure credentials for each node
5. Activate the workflow

## Required Credentials in n8n

### 1. Email Account (Gmail)
- Go to Credentials → Add Credential → Gmail
- Use OAuth2 or App Password
- Test connection

### 2. HTTP Request Authentication
- For Firebase: Use Service Account JSON
- For RapidAPI: Use Header Auth with X-RapidAPI-Key
- For SerpAPI: Use Query Parameter with api_key

### 3. Webhook URLs
After creating workflows, get webhook URLs from n8n:
- Production URL format: `http://your-domain:5678/webhook/workflow-name`
- Use these URLs in your SuperApp to trigger workflows

## Testing Workflows

### Test Job Hunt Workflow
```bash
curl -X POST http://localhost:5678/webhook/job-hunt \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user", "preferences": {"role": "Software Engineer", "location": "Remote"}}'
```

### Test Daily Email Workflow
```bash
curl -X POST http://localhost:5678/webhook/daily-email \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user", "email": "user@example.com"}'
```

## Monitoring

- Access n8n dashboard at http://localhost:5678
- View execution history for each workflow
- Check logs for errors
- Set up email notifications for failed executions

## Security Notes

1. **Never commit credentials** - Use environment variables
2. **Secure webhook URLs** - Add authentication tokens
3. **Use HTTPS in production** - Set up SSL certificate
4. **Restrict IP access** - Use firewall rules
5. **Regular backups** - Export workflows regularly

## Troubleshooting

### n8n won't start
```bash
# Check port availability
netstat -ano | findstr :5678

# Kill process if needed
taskkill /PID <PID> /F

# Clear n8n cache
rm -rf ~/.n8n/cache
```

### Workflow execution fails
1. Check credentials are configured correctly
2. Verify API keys are valid
3. Check rate limits on external APIs
4. Review execution logs in n8n UI

## Next Steps

1. Start n8n: `npm install -g n8n && n8n start`
2. Import workflows from `./workflows/` directory
3. Configure credentials for each service
4. Test each workflow manually
5. Integrate webhook URLs into SuperApp
6. Set up monitoring and alerts
