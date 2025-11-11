# Screenshot Service

Standalone Express.js microservice for capturing website screenshots using Puppeteer.

## Why Separate Service?

- ✅ **No timeout limits** - Runs as long as needed
- ✅ **Better performance** - Dedicated resources
- ✅ **Can be scaled independently** - Deploy on any platform
- ✅ **Reusable** - Can be used by multiple apps

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Puppeteer Setup

Puppeteer automatically downloads Chromium during `npm install`. No additional setup needed.

### 3. Create .env file

```bash
cp env.example .env
```

Edit `.env` and set your configuration.

### 4. Start the Service

**Development** (with auto-reload):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

The service will run on `http://localhost:3001` by default.

## API Endpoints

### POST /screenshot

Captures a screenshot of a website.

**Request**:
```json
{
  "url": "https://example.com",
  "viewport": {
    "width": 1920,
    "height": 1080
  }
}
```

**Response** (Success):
```json
{
  "screenshot": "base64_encoded_png...",
  "url": "https://example.com",
  "strategy": "networkidle",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Response** (Error):
```json
{
  "error": "Error message here"
}
```

### GET /health

Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "service": "screenshot-service",
  "version": "1.0.0"
}
```

## Rate Limiting

- 20 requests per minute per IP
- Returns 429 status when exceeded
- Automatic cleanup of old rate limit records

## Deployment Options

### Option 1: Render (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: `screenshot-service`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Starter (minimum) or higher for better performance
6. Add Environment Variables (optional):
   - `NODE_ENV`: `production`
   - `PORT`: (auto-set by Render)
7. Click "Create Web Service"

**Render-specific notes:**
- The `render.yaml` file is included for automatic configuration
- Puppeteer automatically downloads Chromium during `npm install` (~150MB)
- No manual browser installation or system dependencies needed
- Health check endpoint is automatically configured at `/health`
- Minimum 512MB RAM recommended (Starter plan)
- For production, consider upgrading to Standard plan for better performance
- Build time: ~2-3 minutes (includes Chromium download)

### Option 2: Railway

1. Push to GitHub
2. Connect to Railway
3. Deploy from `server` directory
4. Railway will auto-detect and deploy

### Option 3: Fly.io

1. Install flyctl
2. Run `fly launch` in server directory
3. Deploy with `fly deploy`

### Option 4: DigitalOcean App Platform

1. Connect GitHub repo
2. Select `server` directory
3. Deploy as Node.js app

### Option 5: Self-hosted (VPS)

```bash
# On your server
git clone your-repo
cd server
npm install
npx playwright install chromium --with-deps
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start index.js --name screenshot-service
pm2 save
```

## Environment Variables

- `PORT` - Port number (auto-set by Render, defaults to 3001 locally)
- `SCREENSHOT_SERVICE_PORT` - Alternative port setting (fallback if PORT not set)
- `NODE_ENV` - Environment mode (`production` or `development`)
- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` - Set to `false` to ensure Chromium downloads (default behavior)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins (optional, defaults to `*` allowing all)
  - Example: `https://your-app.vercel.app,https://www.yourdomain.com`
  - **Note**: Server-to-server requests (from Next.js API routes) don't require CORS, but this is useful if you need browser access

## Testing

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test screenshot capture
curl -X POST http://localhost:3001/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## Performance

- Average capture time: 5-10 seconds
- Memory usage: ~200-300MB per request
- Concurrent requests: Handled automatically

## Troubleshooting

### "Failed to launch browser" or "Browser not found"

**On Render:**
- Puppeteer automatically downloads Chromium during `npm install`
- Check build logs to verify Chromium download succeeded
- Ensure `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` is not set to `true`
- If issues persist, try clearing cache and redeploying
- Upgrade to Standard plan if memory issues occur

**Local/Self-hosted:**
Puppeteer handles browser installation automatically. If issues occur:
```bash
npm install puppeteer
```

### High memory usage

Reduce concurrent requests or increase server memory.

### Slow screenshots

Check your network connection and target website speed.

