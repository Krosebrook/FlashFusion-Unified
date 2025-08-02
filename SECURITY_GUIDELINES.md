# 🔐 FlashFusion Security Guidelines

## Environment Variable Security

### ✅ What's Already Secure
- `.env` files are in `.gitignore` 
- Vercel environment variables are encrypted
- Production keys are separate from development
- No secrets committed to Git

### 🔄 Key Rotation Schedule
**Monthly Rotation (Recommended):**
- [ ] Anthropic API keys
- [ ] OpenAI API keys  
- [ ] JWT secrets
- [ ] Session secrets

**Quarterly Rotation:**
- [ ] Supabase service keys
- [ ] GitHub tokens
- [ ] Webhook secrets

### 🚨 Security Checklist
- [ ] Never commit `.env` files
- [ ] Use different keys for dev/staging/production
- [ ] Rotate API keys monthly
- [ ] Monitor API usage for anomalies
- [ ] Use least-privilege permissions
- [ ] Enable 2FA on all service accounts

### 🔧 Secure Key Management Commands

```bash
# Generate new JWT secret
openssl rand -hex 32

# Generate new session secret  
openssl rand -hex 32

# Generate new encryption key
openssl rand -hex 16

# Rotate Vercel environment variables
vercel env rm OLD_KEY_NAME
vercel env add NEW_KEY_NAME
```

### 🔍 Security Monitoring
- Check Vercel deployment logs for key exposure
- Monitor API usage in service dashboards
- Set up alerts for unusual activity
- Regular security audits

### 🆘 If Keys Are Compromised
1. **Immediately** rotate the compromised keys
2. Update all environments (dev, staging, prod)
3. Check logs for unauthorized usage
4. Update team members
5. Review access permissions

## Additional Recommendations

### Use Secrets Management
Consider upgrading to:
- **Vercel Secrets** (team-wide encrypted storage)
- **HashiCorp Vault** (enterprise)
- **AWS Secrets Manager** (cloud-native)

### Environment Separation
```bash
Development  → .env.local
Staging      → Vercel Preview environment 
Production   → Vercel Production environment
```

### Access Control
- Limit who can view/edit environment variables
- Use team-based permissions in Vercel
- Regular access reviews