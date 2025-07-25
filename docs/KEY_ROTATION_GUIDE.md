# API Key Rotation Guide

## 🔐 Overview

Regular API key rotation is a critical security practice that helps protect FlashFusion from unauthorized access and potential breaches.

## 🚀 Quick Start

### Rotate All Keys
```bash
npm run rotate-keys
```

### Validate Keys Before Deployment
```bash
npm run validate-keys
```

## 📋 Manual Rotation Steps

### 1. Generate New Keys

Visit each service provider to generate new keys:

- **OpenAI**: https://platform.openai.com/api-keys
  - Click "Create new secret key"
  - Copy immediately (won't be shown again)

- **Anthropic**: https://console.anthropic.com/settings/keys
  - Click "Create Key"
  - Set appropriate permissions

- **Supabase**: https://supabase.com/dashboard/project/_/settings/api
  - Project Settings → API
  - Copy URL and anon key

- **GitHub**: https://github.com/settings/tokens
  - Generate new token (classic)
  - Select required scopes

- **Vercel**: https://vercel.com/account/tokens
  - Create new token
  - Set expiration date

### 2. Update Local Environment

```bash
# Use the rotation tool
npm run rotate-keys

# Or manually edit .env
nano .env
```

### 3. Validate New Keys

```bash
# Run validation
npm run validate-keys

# Should see:
# ✅ All critical keys are valid
```

### 4. Update Production Environment

#### Vercel Dashboard
1. Go to Project Settings → Environment Variables
2. Update each key value
3. Redeploy to apply changes

#### Other Platforms
Update environment variables in:
- AWS Secrets Manager
- Google Secret Manager
- Heroku Config Vars
- Railway Variables

### 5. Test Deployment

```bash
# Deploy to staging first
vercel --env preview

# Test all integrations
npm run test:integrations

# Deploy to production
vercel --prod
```

## 🔄 Automated Rotation

### GitHub Actions Reminder
- Runs monthly on the 1st
- Creates issue with checklist
- Tracks rotation history

### Rotation Schedule
- **Critical Keys**: Monthly
- **Non-critical Keys**: Quarterly
- **After Breach**: Immediately

## 🛡️ Security Best Practices

### DO:
- ✅ Rotate keys regularly (monthly)
- ✅ Use strong, unique keys
- ✅ Store keys in environment variables
- ✅ Use different keys for dev/staging/prod
- ✅ Monitor key usage
- ✅ Revoke old keys after rotation

### DON'T:
- ❌ Commit keys to git
- ❌ Share keys in plain text
- ❌ Use same key across environments
- ❌ Ignore rotation reminders
- ❌ Keep unused keys active

## 📊 Key Validation Rules

| Service | Format | Example |
|---------|--------|---------|
| OpenAI | `sk-...` | `sk-proj-abc123...` |
| Anthropic | `sk-ant-api...` | `sk-ant-api03-xyz...` |
| GitHub | `ghp_...` or `github_pat_...` | `ghp_1234abcd...` |
| Supabase URL | `https://[project].supabase.co` | `https://abc.supabase.co` |
| JWT | 32+ characters | Random secure string |

## 🚨 Emergency Rotation

If keys are compromised:

1. **Immediately revoke** compromised keys
2. **Generate new keys** for all services
3. **Update** all environments
4. **Audit** access logs for unauthorized use
5. **Document** the incident

```bash
# Emergency rotation script
npm run rotate-keys -- --emergency
```

## 📝 Rotation Log

Check rotation history:
```bash
npm run rotate-keys
# Select option 4: Check rotation history
```

Log location: `.key-rotation-log.json` (gitignored)

## 🔧 Troubleshooting

### "Invalid key format"
- Check key starts with correct prefix
- Ensure no extra spaces or quotes
- Verify key hasn't expired

### "Key validation failed"
- Run `npm run validate-keys` for details
- Check `.env` file formatting
- Ensure all required keys present

### "Deployment fails after rotation"
- Verify keys updated in Vercel dashboard
- Check environment variable names match
- Test with single service first

## 📅 Rotation Checklist

Monthly tasks:
- [ ] Backup current `.env`
- [ ] Run rotation tool
- [ ] Generate new keys for each service
- [ ] Update local `.env`
- [ ] Run validation
- [ ] Update Vercel environment
- [ ] Deploy to staging
- [ ] Test all integrations
- [ ] Deploy to production
- [ ] Revoke old keys
- [ ] Update rotation log

## 🔗 Quick Links

- [Security Policy](../SECURITY.md)
- [Environment Setup](../.env.example)
- [Deployment Guide](./DEPLOYMENT.md)

---

Remember: Security is not a one-time task but an ongoing practice. Stay vigilant! 🛡️