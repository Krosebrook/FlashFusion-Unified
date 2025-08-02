# 🚀 Deploy FlashFusion to Vercel

## Quick Deploy Links

### 1. **Deploy with Vercel Button**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKrosebrook%2Fflashfusion-unified&env=SUPABASE_URL,SUPABASE_ANON_KEY,SUPABASE_SERVICE_KEY,OPENAI_API_KEY,ANTHROPIC_API_KEY,JWT_SECRET&envDescription=FlashFusion%20Environment%20Variables&envLink=https%3A%2F%2Fgithub.com%2FKrosebrook%2Fflashfusion-unified%2Fblob%2Fmaster%2F.env.example&project-name=flashfusion-unified&repository-name=flashfusion-unified)

### 2. **Direct Vercel Import**
```
https://vercel.com/import/git?s=https://github.com/Krosebrook/flashfusion-unified
```

### 3. **Vercel CLI Deploy**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## 📋 Required Environment Variables

When deploying, you'll need to add these environment variables in Vercel:

### Core Requirements
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `JWT_SECRET` - Secret for JWT tokens (32+ chars)

### AI Services
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic Claude API key
- `GOOGLE_API_KEY` - Google AI API key (optional)

### OAuth (Optional)
- `GITHUB_CLIENT_ID` - GitHub OAuth app ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth secret
- `NOTION_API_KEY` - Notion integration key

## 🔗 Deployment URLs

### Preview Deployments
Your preview deployments will be available at:
```
https://flashfusion-unified-[hash]-[username].vercel.app
```

### Production Deployment
```
https://flashfusion-unified.vercel.app
```

### Custom Domain (Optional)
1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## 📝 Post-Deployment Steps

1. **Update OAuth Callback URLs**
   - GitHub: `https://your-deployment.vercel.app/api/auth/github/callback`
   - Google: `https://your-deployment.vercel.app/api/auth/google/callback`

2. **Configure Supabase**
   - Add your Vercel URL to Supabase Auth settings
   - Update CORS settings if needed

3. **Test Deployment**
   ```bash
   curl https://your-deployment.vercel.app/api/health
   ```

## 🛠️ Vercel Dashboard Links

- **New Project**: https://vercel.com/new
- **Import Git Repository**: https://vercel.com/import
- **Dashboard**: https://vercel.com/dashboard
- **Account Settings**: https://vercel.com/account

## 🚨 Troubleshooting

### Build Errors
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify Node.js version compatibility

### Runtime Errors
- Check function logs in Vercel
- Verify API routes match vercel.json
- Ensure database connection works

### Environment Variables
- Double-check all required vars are set
- No quotes needed in Vercel UI
- Redeploy after adding new variables

## 📊 Monitoring

- **Analytics**: https://vercel.com/analytics
- **Logs**: https://vercel.com/[username]/[project]/logs
- **Functions**: https://vercel.com/[username]/[project]/functions

---

Ready to deploy? Click the **Deploy with Vercel** button above to get started! 🚀