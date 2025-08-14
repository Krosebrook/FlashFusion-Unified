# Replit Repository Import & Setup Guide

## 🚀 Step 1: Import Repository to Replit

### Option A: Direct GitHub Import (Recommended)
1. **Go to Replit.com** and sign in
2. **Click "Create Repl"**
3. **Select "Import from GitHub"**
4. **Enter Repository URL:**
   ```
   https://github.com/your-username/FlashFusion-Unified
   ```
   *Replace `your-username` with your actual GitHub username*

5. **Configure Import Settings:**
   - **Repl Name:** `flashfusion-unified`
   - **Language:** JavaScript/Node.js
   - **Template:** Node.js
   - **Private:** ✅ (if your repo is private)

6. **Click "Import from GitHub"**

### Option B: Manual Clone (Advanced)
If direct import doesn't work:
1. **Create a new Node.js Repl**
2. **Open the Shell tab**
3. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/FlashFusion-Unified.git .
   ```

## 🔧 Step 2: Post-Import Setup

### Install Dependencies
```bash
# In Replit Shell
npm install

# Install Lyra dashboard dependencies
cd agents/lyra/dashboard
npm install
cd ../../..
```

### Verify File Structure
Check that these key files are present:
- ✅ `package.json`
- ✅ `.replit` (configuration)
- ✅ `replit.nix` (dependencies)
- ✅ `src/index.js` (entry point)
- ✅ `agents/lyra/dashboard/` (Lyra agent)

## 🔑 Step 3: Environment Variables Setup

### Required Environment Variables

#### Core Application
```bash
# Node.js Configuration
NODE_ENV=development
PORT=3333

# Database Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
POSTGRES_URL=your_postgresql_connection_string

# AI Services
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
OPENAI_API_KEY=sk-your-openai-key
GEMINI_API_KEY=your-gemini-key

# Security
JWT_SECRET=your-super-secure-jwt-secret-key

# External Integrations
NOTION_API_KEY=secret_your-notion-integration-key
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-webhook
```

#### Optional Services
```bash
# Web Scraping
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Deployment
VERCEL_TOKEN=your_vercel_token
GITHUB_TOKEN=your_github_personal_access_token

# Analytics (if using)
GOOGLE_ANALYTICS_ID=GA-your-analytics-id
MIXPANEL_TOKEN=your_mixpanel_token
```

### How to Add Environment Variables in Replit

#### Method 1: Replit Secrets (Recommended)
1. **In your Repl, click the "🔒 Secrets" tab** (left sidebar)
2. **Add each environment variable:**
   - Click "New Secret"
   - Enter the key name (e.g., `ANTHROPIC_API_KEY`)
   - Enter the value
   - Click "Add Secret"
3. **Repeat for all required variables**

#### Method 2: .env File (Local Development)
1. **Create `.env` file in project root:**
   ```bash
   # In Replit Shell
   touch .env
   ```
2. **Edit the file and add variables:**
   ```bash
   NODE_ENV=development
   PORT=3333
   ANTHROPIC_API_KEY=your-key-here
   # ... add all other variables
   ```
3. **⚠️ Important:** Add `.env` to `.gitignore` to avoid committing secrets

## 🚦 Step 4: Test the Setup

### Start the Application
```bash
# Method 1: Use the Run button in Replit
# This will execute: npm run dev

# Method 2: Manual start in Shell
npm run dev
```

### Verify Services
1. **Main API:** Should be accessible on port 3333
2. **Dashboard:** Check if client loads properly
3. **Lyra Agent:** Verify agent dashboard works

### Health Check
```bash
# Test the health endpoint
curl http://localhost:3333/api/health

# Or visit in browser:
# https://your-repl-name.your-username.repl.co/api/health
```

## 🔧 Step 5: Development Workflow in Replit

### Daily Development
1. **Open your Repl**
2. **Pull latest changes:**
   ```bash
   git pull origin main
   ```
3. **Install new dependencies:**
   ```bash
   npm install
   ```
4. **Start development server:**
   ```bash
   npm run dev
   ```

### Making Changes
1. **Edit files in Replit editor**
2. **Test changes automatically** (hot reload enabled)
3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

### Multiple Services
```bash
# Start different services in separate shell tabs:

# Tab 1: Main API
npm run dev

# Tab 2: Lyra Dashboard
cd agents/lyra/dashboard && npm run dev

# Tab 3: Client Dashboard (if separate)
npm run dev:client
```

## 🌐 Step 6: Public URLs

### Access Your Application
- **Main App:** `https://your-repl-name.your-username.repl.co`
- **API Endpoints:** `https://your-repl-name.your-username.repl.co/api/`
- **Health Check:** `https://your-repl-name.your-username.repl.co/api/health`

### Share with Team
1. **Make Repl Public** (if needed)
2. **Share the URL** for collaboration
3. **Invite collaborators** through Replit

## 🛠️ Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# If port 3333 is busy, kill processes:
pkill -f "node.*3333"
npm run dev
```

#### Missing Dependencies
```bash
# Clear and reinstall:
rm -rf node_modules package-lock.json
npm install
```

#### Environment Variables Not Loading
1. **Check Secrets tab** - ensure all variables are added
2. **Restart the Repl** - click Stop, then Run
3. **Verify in Shell:**
   ```bash
   echo $ANTHROPIC_API_KEY
   # Should display your key (or part of it)
   ```

#### Git Issues
```bash
# Configure Git in Replit:
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Re-add remote:
git remote set-url origin git@github.com:your-username/FlashFusion-Unified.git
```

### Performance Optimization
```bash
# Add to .replitignore for better performance:
node_modules/
.next/
dist/
build/
logs/
*.log
```

## ✅ Success Checklist

- [ ] Repository successfully imported to Replit
- [ ] All environment variables configured in Secrets
- [ ] Dependencies installed (`npm install` completed)
- [ ] Application starts without errors (`npm run dev`)
- [ ] Health check endpoint responds successfully
- [ ] Can access application via public URL
- [ ] Git push/pull works correctly
- [ ] SSH key added to GitHub (from previous setup)
- [ ] Lyra dashboard accessible (if using)
- [ ] Database connections working

Once all items are checked, your FlashFusion Unified project is fully operational in Replit! 🎉