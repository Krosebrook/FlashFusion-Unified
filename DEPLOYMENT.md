# FlashFusion Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Environment Variables**: You'll need your database URL and API keys

## Step-by-Step Deployment

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository containing FlashFusion
4. Vercel will automatically detect it as a Node.js project

### 2. Configure Build Settings

Vercel should automatically detect the settings, but verify:

- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

### 3. Environment Variables

In the Vercel dashboard, add these environment variables:

**Required Variables:**
```
DATABASE_URL=your_neon_database_url
PGHOST=your_database_host
PGPORT=5432
PGUSER=your_database_user
PGPASSWORD=your_database_password
PGDATABASE=your_database_name
NODE_ENV=production
```

**Optional (for AI features):**
```
ANTHROPIC_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_key (if using)
```

### 4. Domain Configuration

- Vercel provides a free `.vercel.app` domain
- You can add a custom domain in the "Domains" section
- SSL is automatically handled by Vercel

### 5. Database Setup

**For Neon Database:**
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add it as `DATABASE_URL` in Vercel environment variables

**Run Database Migrations:**
```bash
# In your local environment
npm run db:push
```

### 6. Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be live at `https://your-project-name.vercel.app`

## Vercel Configuration Files

The following files have been created for optimal Vercel deployment:

### `vercel.json`
- Configures build process
- Sets up API routes
- Handles static file serving

### `.vercelignore`
- Excludes unnecessary files from deployment
- Reduces bundle size

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check build logs in Vercel dashboard
2. **API Routes Not Working**: Ensure `vercel.json` is configured correctly
3. **Database Connection**: Verify environment variables are set
4. **Static Assets**: Make sure build outputs to `dist/public`

### Build Commands Reference:

```bash
# Local development
npm run dev

# Build for production
npm run build

# Start production server locally
npm run start

# Push database schema
npm run db:push
```

## Production Optimizations

The app is configured with:

- ✅ Automatic builds on git push
- ✅ Edge caching for static assets
- ✅ Serverless functions for API routes
- ✅ Environment-specific configurations
- ✅ SSL/HTTPS by default
- ✅ Global CDN distribution

## Monitoring

Once deployed, you can monitor:

- **Analytics**: Built-in Vercel Analytics
- **Performance**: Web Vitals metrics
- **Logs**: Function logs in dashboard
- **Errors**: Automatic error tracking

## Custom Domain Setup

1. Go to Project Settings → Domains
2. Add your domain (e.g., `flashfusion.com`)
3. Configure DNS records as shown
4. Vercel handles SSL certificates automatically

Your FlashFusion app will be live and globally distributed! 🚀