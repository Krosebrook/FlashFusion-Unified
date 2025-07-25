# Automated FlashFusion.co Pipeline

## 🔄 Complete Automation Flow

```
You → Claude Code → Git → Vercel → GoDaddy → FlashFusion.co
```

**Result:** Changes appear on FlashFusion.co within 2 minutes automatically!

## 🚀 Quick Setup Guide

### Step 1: Run Domain Setup
```bash
npm run domain-setup
```

### Step 2: Configure GoDaddy DNS
Add these DNS records in GoDaddy:

| Type  | Name | Value               |
|-------|------|---------------------|
| CNAME | @    | cname.vercel-dns.com |
| CNAME | www  | cname.vercel-dns.com |

### Step 3: Add Domain in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/chaos-collective/flashfusion/settings/domains)
2. Add domain: `flashfusion.co`
3. Add domain: `www.flashfusion.co`

### Step 4: Configure GitHub Secrets
Add these secrets in GitHub repository settings:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

## 🛠️ Available Commands

### Setup & Configuration
```bash
npm run domain-setup     # Setup domain pipeline
npm run verify-pipeline  # Test complete pipeline
```

### Development Workflow
```bash
# Make changes with Claude Code, then:
git add -A
git commit -m "your changes"  
git push origin master
# → Automatically deploys to FlashFusion.co!
```

### Testing & Verification
```bash
npm run test-deployment          # Test deployment safety
npm run verify-pipeline          # Test live pipeline
npm run deploy-safe             # Test + deploy manually
```

## ⚡ Automated Deployment Process

When you push to GitHub, this automatically happens:

1. **🔍 Pre-deployment Tests**
   - Deployment safety validation
   - API function syntax check
   - Environment validation

2. **🚀 Vercel Deployment**
   - Builds and deploys to Vercel
   - Updates flashfusion.co domain
   - Generates deployment URL

3. **✅ Post-deployment Verification**
   - Health check validation
   - Endpoint testing
   - Performance monitoring

4. **📝 Reporting**
   - GitHub deployment summary
   - Success/failure notifications
   - Automatic release creation

## 🌐 Domain Pipeline Details

### DNS Flow
```
flashfusion.co (GoDaddy)
        ↓
   CNAME Record
        ↓
 cname.vercel-dns.com
        ↓
   Vercel Infrastructure
        ↓
  Your Deployed App
```

### SSL/HTTPS
- **Automatic SSL** via Vercel
- **Let's Encrypt** certificates
- **Auto-renewal** every 90 days
- **HTTPS redirect** enabled

## 🔧 Pipeline Components

### 1. GitHub Repository
- **Source:** `Krosebrook/FlashFusion-Unified`
- **Branch:** `master` (auto-deploys)
- **Actions:** Automated testing & deployment

### 2. Vercel Platform
- **Project:** `flashfusion`
- **Organization:** `chaos-collective`
- **Functions:** Bulletproof deployment system

### 3. GoDaddy DNS
- **Domain:** `flashfusion.co`
- **Registrar:** GoDaddy
- **DNS Management:** CNAME to Vercel

### 4. GitHub Actions
- **Workflow:** `.github/workflows/deploy.yml`
- **Triggers:** Push to master
- **Features:** Testing, deployment, verification

## 📊 Monitoring & Health Checks

### Automatic Monitoring
- **Health endpoint:** `https://flashfusion.co/health`
- **API status:** `https://flashfusion.co/api/status`
- **Deployment verification:** Built into GitHub Actions

### Manual Verification
```bash
# Test complete pipeline
npm run verify-pipeline

# Expected output:
# 🎉 PIPELINE FULLY OPERATIONAL
# ✅ You → Claude → Git → Vercel → GoDaddy → FlashFusion.co
```

## 🚨 Troubleshooting

### Common Issues

**1. Domain not resolving**
```bash
# Check DNS propagation
nslookup flashfusion.co

# Should show Vercel IP or CNAME
```

**2. SSL certificate issues**
```bash
# Test SSL
curl -I https://flashfusion.co

# Should return 200 OK with SSL headers
```

**3. Deployment failures**
```bash
# Check deployment logs
npm run test-deployment

# View GitHub Actions logs
# Go to: https://github.com/Krosebrook/FlashFusion-Unified/actions
```

**4. Performance issues**
```bash
# Test performance
npm run verify-pipeline

# Should show Grade A or B
```

### Emergency Procedures

**If FlashFusion.co is down:**
1. Check Vercel status: https://vercel.com/status
2. Verify DNS: `npm run verify-pipeline`
3. Check GitHub Actions for failures
4. Manual deploy: `npm run deploy-safe`

**If DNS issues:**
1. Verify GoDaddy DNS records
2. Check DNS propagation (can take 24-48 hours)
3. Try alternative DNS: `8.8.8.8` for testing

## 🎯 Expected Performance

### Deployment Times
- **Git push to live:** ~2 minutes
- **DNS propagation:** Up to 48 hours (first time)
- **SSL certificate:** ~5 minutes (first time)

### Performance Targets
- **Page load:** <500ms (Grade A)
- **Health check:** <200ms
- **API response:** <100ms

### Availability
- **Uptime target:** 99.9%
- **Vercel SLA:** 99.99%
- **GoDaddy DNS:** 100% uptime guarantee

## 🔗 Useful Links

- **Live Site:** https://flashfusion.co
- **Health Check:** https://flashfusion.co/health
- **Vercel Dashboard:** https://vercel.com/chaos-collective/flashfusion
- **GitHub Actions:** https://github.com/Krosebrook/FlashFusion-Unified/actions
- **GoDaddy DNS:** https://dcc.godaddy.com/manage/dns

---

**Remember:** Once set up, you just need to push to Git and everything else happens automatically! 🎉