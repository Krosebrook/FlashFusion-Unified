# Security Guidelines for FlashFusion

## 🔐 API Key Management

### CRITICAL: Regenerate Your Keys
If you've exposed API keys in your repository, you MUST regenerate them immediately:

1. **OpenAI**: https://platform.openai.com/api-keys
2. **Anthropic**: https://console.anthropic.com/settings/keys
3. **Supabase**: https://supabase.com/dashboard/project/_/settings/api
4. **GitHub**: https://github.com/settings/tokens
5. **GoDaddy**: https://developer.godaddy.com/keys
6. **Notion**: https://www.notion.so/my-integrations

### Secure Key Storage

#### Local Development
- Store keys in `.env` file (already in .gitignore)
- Never commit `.env` to version control
- Use placeholder values in committed files

#### Production (Vercel)
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add each key with the same names as in `.env`
3. Select appropriate environments (Production/Preview/Development)
4. Never hardcode keys in source files

### Environment Variable Template
Create a `.env.example` file with placeholders:
```
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 🛡️ Security Best Practices

### Code Security
- ✅ ESLint configured to catch common vulnerabilities
- ✅ No eval() or Function() constructors allowed
- ✅ Input validation on all API endpoints
- ✅ Rate limiting implemented (120 requests/minute)
- ✅ Security headers configured (XSS, CSRF protection)

### Dependencies
- Run `npm audit` regularly
- Update dependencies: `npm update`
- Fix vulnerabilities: `npm audit fix`
- Review dependency licenses

### API Security
- All endpoints use request validation
- CORS configured for controlled access
- Request IDs for tracking and debugging
- Error messages don't expose sensitive info

### Git Security
- `.env` file is gitignored
- No sensitive data in commit history
- Use environment variables for all secrets
- Review PRs for accidental key exposure

## 🚨 Incident Response

If keys are exposed:
1. **Immediately** regenerate affected keys
2. Review access logs for unauthorized use
3. Update keys in Vercel environment variables
4. Audit recent commits for other exposures
5. Consider using GitHub secret scanning

## 📋 Security Checklist

Before each deployment:
- [ ] No hardcoded API keys
- [ ] `.env` not in staged files
- [ ] Dependencies up to date
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Error handling doesn't leak info
- [ ] HTTPS enforced in production

## 🔍 Regular Audits

Weekly:
- Check `npm audit` results
- Review Vercel function logs
- Monitor API usage patterns

Monthly:
- Rotate API keys
- Review access permissions
- Update dependencies
- Security documentation review

## 📞 Security Contacts

For security issues:
- Create private GitHub issue
- Email: [your-security-email]
- Emergency: Revoke all keys immediately

---

Remember: Security is everyone's responsibility. When in doubt, ask!