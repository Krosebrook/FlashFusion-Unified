# FlashFusion Deployment Guide

## Vercel Deployment

FlashFusion is configured for seamless deployment on Vercel with the following setup:

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Anthropic API key

### Environment Variables Required
Set these in your Vercel dashboard:

```bash
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NODE_ENV=production
```

### Deployment Steps

1. **Connect Repository**
   - Connect your GitHub/GitLab repository to Vercel
   - Vercel will auto-detect the project configuration

2. **Configure Build Settings**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist/public` (configured in vercel.json)
   - Install Command: `npm install` (auto-detected)

3. **Set Environment Variables**
   - Add DATABASE_URL in Vercel dashboard
   - Add ANTHROPIC_API_KEY in Vercel dashboard
   - NODE_ENV is automatically set to "production"

4. **Deploy**
   - Push to main branch or manually trigger deployment
   - Vercel will build and deploy automatically

### Project Structure
```
FlashFusion/
├── client/               # React frontend
├── server/              # Express backend
├── shared/              # Shared types and schemas
├── dist/                # Build output
│   ├── public/         # Static frontend files
│   └── index.js        # Compiled server
├── vercel.json         # Vercel configuration
└── package.json        # Dependencies and scripts
```

### Build Process
1. **Frontend Build**: Vite compiles React app to `dist/public`
2. **Backend**: Server runs as serverless function
3. **Routing**: API routes go to server, static files served from dist/public

### Features Included
- ✅ 20 Advanced Enterprise Features
- ✅ AI-powered business idea generation
- ✅ Team collaboration workspace
- ✅ Advanced AI models integration
- ✅ Enterprise SSO capabilities
- ✅ Automation workflow engine
- ✅ Market research & analytics
- ✅ White-label platform options
- ✅ Mobile app & PWA support
- ✅ Comprehensive export capabilities

### Troubleshooting

**Build Failures:**
- Ensure all environment variables are set
- Check Node.js version compatibility (18+)
- Verify database connectivity

**Runtime Errors:**
- Check Vercel function logs
- Verify API endpoints are accessible
- Ensure database migrations are applied

**Performance:**
- Vercel functions have 30-second timeout
- Database connections are handled efficiently
- Static assets are CDN-optimized

### Production Optimization
- All routes properly configured in vercel.json
- Database connection pooling enabled
- Static assets served from CDN
- Serverless functions optimized for cold starts

For additional support, check Vercel documentation or contact support.