# 🚀 Vercel Deploy Hook Setup

## Quick Setup

1. **Create Deploy Hook:**
   ```bash
   node vercel-deploy-hook.js create
   ```

2. **Trigger Deployment:**
   ```bash
   node vercel-deploy-hook.js trigger
   ```

3. **Check Status:**
   ```bash
   node vercel-deploy-hook.js status
   ```

## Manual Hook Creation

If you prefer to create the hook manually via Vercel dashboard:

1. Go to: https://vercel.com/dashboard
2. Select your FlashFusion project
3. Go to Settings → Git → Deploy Hooks
4. Click "Create Hook"
5. Name: `FlashFusion Auto Deploy`
6. Branch: `main` (or your default branch)
7. Copy the generated webhook URL

## Environment Variables Required

Add these to your `.env` file:

```bash
# Get from: https://vercel.com/account/tokens
VERCEL_TOKEN=your_vercel_token_here

# Get from project settings URL or dashboard
VERCEL_PROJECT_ID=your_project_id_here

# Get from team settings (optional, for team accounts)
VERCEL_ORG_ID=your_org_id_here
```

## Direct Deploy Hook URLs

Once created, your deploy hook URL will look like:
```
https://api.vercel.com/v1/integrations/deploy/[project-id]/[hook-id]
```

## Usage in CI/CD

Add to GitHub Actions, etc:
```yaml
- name: Trigger Vercel Deploy
  run: |
    curl -X POST https://api.vercel.com/v1/integrations/deploy/[your-hook-url]
```

## Webhook Integration

For external triggers (webhooks, automation):
```bash
curl -X POST "https://api.vercel.com/v1/integrations/deploy/[hook-url]" \
  -H "Content-Type: application/json" \
  -d '{"ref": "main"}'
```