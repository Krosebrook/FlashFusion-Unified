# Replit Deployment Guide for FlashFusion-United

## Quick Deploy to Replit

### Method 1: Import from GitHub (Recommended)
1. Push your project to GitHub first
2. Go to [replit.com](https://replit.com)
3. Click "Create Repl"
4. Select "Import from GitHub"
5. Paste your repository URL
6. Replit will auto-detect the configuration

### Method 2: Upload Directly
1. Go to [replit.com](https://replit.com)
2. Click "Create Repl"
3. Select "Upload files"
4. Upload your project folder
5. Replit will detect the `.replit` configuration

## Environment Variables in Replit

Set these in the Replit "Secrets" tab:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_ENV=production
```

## Post-Deployment Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build the Project**:
   ```bash
   npm run build
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **For Production**:
   ```bash
   npm run preview
   ```

## Replit Features Available

- ✅ **Auto-reload**: Changes reflect immediately
- ✅ **Built-in terminal**: Full command line access
- ✅ **Database**: Can connect to Supabase easily
- ✅ **Custom domains**: Add your own domain
- ✅ **Collaborative editing**: Share with team members
- ✅ **Version control**: Built-in Git integration

## Connecting to Supabase from Replit

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Add them to Replit Secrets (not in code)
4. The app will automatically connect

## Custom Domain Setup

1. Go to your Repl settings
2. Click "Custom Domain"
3. Add your domain (e.g., `flashfusion.yoursite.com`)
4. Update DNS records as instructed

## Troubleshooting

### Port Issues
- Replit uses port 3000 by default
- FlashFusion is configured for 5173 (dev) and 4173 (prod)
- The `.replit` file handles this automatically

### Build Issues
- Make sure all dependencies are in `package.json`
- Run `npm ci` instead of `npm install` for production

### Environment Variables
- Use Replit Secrets tab, not `.env` files
- Variables must start with `VITE_` to be accessible in frontend

## Performance Tips

1. **Optimize Bundle Size**:
   ```bash
   npm run build -- --report
   ```

2. **Enable Compression**:
   - Replit automatically handles Gzip compression

3. **Use CDN**:
   - Consider moving assets to external CDN for better performance

## Monitoring

- Check Replit console for logs
- Use browser dev tools for frontend debugging
- Monitor Supabase dashboard for database queries

---

**Ready to deploy!** 🚀