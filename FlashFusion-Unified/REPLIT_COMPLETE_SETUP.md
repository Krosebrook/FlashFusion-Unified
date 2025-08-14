# 🚀 Complete Replit Setup for FlashFusion Unified

## 📋 Quick Start Checklist

### Prerequisites ✅
- [ ] GitHub account with FlashFusion-Unified repository
- [ ] Replit account (free or paid)
- [ ] SSH key added to GitHub (completed in previous step)
- [ ] Required API keys (Anthropic, Supabase, etc.)

## 🎯 Step 1: Import Repository to Replit

### Method A: Direct GitHub Import (Recommended)

1. **Go to [Replit.com](https://replit.com)** and sign in
2. **Click "Create Repl"** (big + button)
3. **Select "Import from GitHub"** tab
4. **Enter your repository URL:**
   ```
   https://github.com/your-username/FlashFusion-Unified
   ```
   *Replace `your-username` with your actual GitHub username*

5. **Configure the import:**
   - **Repl name:** `flashfusion-unified`
   - **Language:** Node.js
   - **Public/Private:** Choose based on your repo settings
   - **Description:** "AI business operating system - FlashFusion Unified"

6. **Click "Import from GitHub"**
7. **Wait for import to complete** (may take 1-2 minutes)

### Method B: Manual Clone (If Import Fails)

1. **Create new Node.js Repl:**
   - Click "Create Repl"
   - Select "Node.js" template
   - Name it `flashfusion-unified`

2. **Delete default files:**
   ```bash
   rm index.js package.json
   ```

3. **Clone repository:**
   ```bash
   git clone https://github.com/your-username/FlashFusion-Unified.git .
   ```

## 🔧 Step 2: Environment Setup Automation

### Run the Setup Script
Once your repository is imported, run our automated setup:

```bash
# In Replit Shell
npm run replit:setup
```

This interactive script will:
- ✅ Detect Replit environment
- ✅ Collect all required environment variables
- ✅ Generate configuration files
- ✅ Create secrets guide for Replit

### Manual Environment Setup (Alternative)

If the script doesn't work, follow these steps:

#### Required Secrets in Replit
Go to **🔒 Secrets** tab and add these:

| Key | Value | Description |
|-----|-------|-------------|
| `SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | `eyJ...` | Supabase anonymous key |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Claude API key |
| `JWT_SECRET` | `your-secret-key` | JWT authentication secret |
| `OPENAI_API_KEY` | `sk-...` | OpenAI API key (optional) |
| `NOTION_API_KEY` | `secret_...` | Notion integration key (optional) |
| `ZAPIER_WEBHOOK_URL` | `https://hooks.zapier.com/...` | Zapier webhook (optional) |

#### Non-Secret Environment Variables
These can be set in your `.replit` file or Secrets:

```bash
NODE_ENV=development
PORT=3333
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

## 📦 Step 3: Install Dependencies

### Install All Dependencies
```bash
npm run replit:install
```

This command will:
1. Install main project dependencies
2. Install Lyra dashboard dependencies
3. Verify all packages are correctly installed

### Manual Installation (If Needed)
```bash
# Main project
npm install

# Lyra dashboard
cd agents/lyra/dashboard
npm install
cd ../../..
```

## 🚦 Step 4: Start the Application

### Option A: Use Replit Run Button
Simply click the **Run** button in Replit. This will execute `npm run dev`.

### Option B: Manual Start
```bash
npm run replit:dev
```

### Verify Everything Works
1. **Check Console Output** - Should see:
   ```
   ✅ Database connection established
   🚀 FlashFusion server running on port 3333
   📊 All services initialized successfully
   ```

2. **Test Health Endpoint:**
   ```bash
   curl https://your-repl-name.your-username.repl.co/api/health
   ```

3. **Open in Browser:**
   - Main app: `https://your-repl-name.your-username.repl.co`
   - API docs: `https://your-repl-name.your-username.repl.co/api`

## 🌐 Step 5: Configure Public Access

### Make Your Repl Public (Optional)
1. **Go to Repl settings** (gear icon)
2. **Privacy section**
3. **Set to "Public"** if you want to share

### Custom Domain (Paid Plans)
1. **Go to Repl settings**
2. **Domains section**
3. **Add custom domain** (e.g., `dev.flashfusion.co`)

## 🔄 Step 6: Development Workflow

### Daily Development
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Start development
npm run dev

# 4. Make your changes in Replit editor

# 5. Test your changes
npm run replit:test

# 6. Commit and push
git add .
git commit -m "Your feature description"
git push origin main
```

### Multiple Services
You can run different parts of the application in separate shell tabs:

**Tab 1: Main API**
```bash
npm run dev
```

**Tab 2: Lyra Dashboard**
```bash
cd agents/lyra/dashboard
npm run dev
```

**Tab 3: Database Setup**
```bash
npm run health
```

## 🎯 Step 7: Test Integration

### Run All Tests
```bash
npm run replit:test
```

### Individual Tests
```bash
# Health check
npm run health

# Security validation
npm run security-check

# Lint check
npm run lint

# Unit tests
npm test
```

### Database Connection Test
```bash
# Test PostgreSQL connection
npm run test-postgresql

# Test Supabase connection
node scripts/test-supabase.js
```

## 🔐 Step 8: Security Configuration

### Verify Environment Variables
```bash
# Check that secrets are loaded (in Replit Shell)
echo "Anthropic Key: ${ANTHROPIC_API_KEY:0:10}..."
echo "Supabase URL: ${SUPABASE_URL}"
echo "JWT Secret: ${JWT_SECRET:0:10}..."
```

### Test API Authentication
```bash
# Test protected endpoints
curl -H "Authorization: Bearer your-test-token" \
  https://your-repl-name.your-username.repl.co/api/agents
```

## 🚀 Step 9: Deployment Ready

### Production Build Test
```bash
npm run build
```

### Deploy to Production
```bash
npm run replit:deploy
```

This will:
1. Run security checks
2. Execute all tests
3. Build for production
4. Deploy to Vercel (if configured)

## 🛠️ Troubleshooting Guide

### Common Issues & Solutions

#### 1. Port Already in Use
```bash
# Kill existing processes
pkill -f "node.*3333"
npm run dev
```

#### 2. Environment Variables Not Loading
- **Check Secrets tab** - ensure all variables are added
- **Restart Repl** - click Stop, then Run
- **Verify secrets:**
  ```bash
  env | grep -E "(ANTHROPIC|SUPABASE|JWT)"
  ```

#### 3. Git Issues
```bash
# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Fix remote URL
git remote set-url origin git@github.com:your-username/FlashFusion-Unified.git
```

#### 4. Database Connection Failed
- **Check Supabase credentials** in Secrets
- **Verify network access** (Replit to Supabase)
- **Test connection:**
  ```bash
  node scripts/test-supabase.js
  ```

#### 5. Dependencies Installation Failed
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 6. Lyra Dashboard Not Loading
```bash
# Check Lyra dependencies
cd agents/lyra/dashboard
npm install
npm run build
cd ../../..
```

### Performance Issues
```bash
# Check CPU/Memory usage
top

# Optimize for Replit
echo "node_modules/" >> .replitignore
echo "dist/" >> .replitignore
echo "*.log" >> .replitignore
```

## ✅ Success Verification

### Final Checklist
- [ ] Repository imported successfully
- [ ] All environment secrets configured
- [ ] Dependencies installed without errors
- [ ] Application starts and health check passes
- [ ] Public URL accessible and functional
- [ ] Database connections working
- [ ] API endpoints responding correctly
- [ ] Lyra dashboard accessible (if using)
- [ ] Git push/pull works correctly
- [ ] Tests pass successfully

### Performance Benchmarks
- [ ] Initial page load < 3 seconds
- [ ] API response time < 500ms
- [ ] Health check responds < 100ms
- [ ] Memory usage < 500MB
- [ ] No JavaScript errors in console

## 🎉 You're Ready!

Once all checks pass, your FlashFusion Unified platform is fully operational in Replit!

### Next Steps
1. **Start developing features** using the existing architecture
2. **Invite team members** to collaborate
3. **Set up monitoring** for production deployments
4. **Configure CI/CD** for automatic deployments

### Useful URLs
- **Your App:** `https://your-repl-name.your-username.repl.co`
- **API Health:** `https://your-repl-name.your-username.repl.co/api/health`
- **Lyra Dashboard:** `https://your-repl-name.your-username.repl.co:8080`
- **Admin Panel:** `https://your-repl-name.your-username.repl.co/admin`

Happy coding! 🚀