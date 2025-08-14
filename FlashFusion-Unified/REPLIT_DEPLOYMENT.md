# FlashFusion Replit Deployment

## Deployment Status
- Bundle optimized for Replit
- Size reduced to minimum
- Only production dependencies installed

## Quick Start
```bash
npm start
```

## Environment Variables Required
- ANTHROPIC_API_KEY
- SUPABASE_URL
- SUPABASE_ANON_KEY
- JWT_SECRET

## Endpoints
- Health: /api/health
- Main API: /api

## Restore Full Version
```bash
cp package-full.json package.json
npm install
```
