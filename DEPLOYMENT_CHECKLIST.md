# 🚀 FlashFusion.co Go-Live Checklist

## ✅ STEP 1: GoDaddy DNS Configuration

**Login to GoDaddy:** https://dcc.godaddy.com/manage/dns

**Delete existing records for:**
- @ (root domain)
- www

**Add these EXACT records:**
```
Record Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 1 Hour

Record Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: 1 Hour
```

**✅ Mark when complete:** [ ]

---

## ✅ STEP 2: Vercel Domain Setup

**Go to:** https://vercel.com/chaos-collective/flashfusion/settings/domains

**Add these domains:**
1. Click "Add Domain" → Enter: `flashfusion.co` → Click "Add"
2. Click "Add Domain" → Enter: `www.flashfusion.co` → Click "Add"

**Wait for:** "Valid Configuration" status on both domains

**✅ Mark when complete:** [ ]

---

## ✅ STEP 3: GitHub Secrets (Auto-Deployment)

**First, get your Vercel IDs:**
```bash
cd C:\Users\kyler\FlashFusion-Unified
vercel whoami
vercel project ls
```

**Then go to:** https://github.com/Krosebrook/FlashFusion-Unified/settings/secrets/actions

**Add these secrets:**

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `VERCEL_TOKEN` | (from your .env file) | Your VERCEL_TOKEN value |
| `VERCEL_ORG_ID` | (from vercel whoami) | Team ID or username |
| `VERCEL_PROJECT_ID` | (from vercel project ls) | Project ID for flashfusion |

**✅ Mark when complete:** [ ]

---

## ✅ STEP 4: Test & Verify

**Run these commands:**
```bash
cd C:\Users\kyler\FlashFusion-Unified

# Test the pipeline
npm run verify-pipeline

# Test deployment
npm run test-deployment

# Trigger auto-deployment
git commit -m "🚀 Go live!" --allow-empty
git push origin master
```

**Check these URLs:**
- https://flashfusion.co
- https://www.flashfusion.co  
- https://flashfusion.co/health

**✅ Mark when complete:** [ ]

---

## 🎉 SUCCESS CRITERIA

When complete, you should see:
- ✅ FlashFusion.co loads the beautiful interface
- ✅ SSL certificate (🔒 in browser)
- ✅ GitHub Actions show successful deployment
- ✅ Auto-deployment works on Git push

**🌐 Your live site:** https://flashfusion.co

---

## 🆘 Need Help?

If stuck, run:
```bash
npm run domain-setup    # Setup guide
npm run verify-pipeline # Test status
```

Or check:
- Vercel deployment logs
- GitHub Actions tab
- DNS propagation: https://dnschecker.org