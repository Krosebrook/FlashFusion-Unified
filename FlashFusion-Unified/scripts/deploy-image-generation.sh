#!/bin/bash

# Deploy Image Generation Function to Supabase
# This script deploys the Deno-based image generation function

set -e

echo "🚀 Deploying Image Generation Function to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Please login to Supabase first:"
    echo "supabase login"
    exit 1
fi

# Check required environment variables
if [ -z "$SUPABASE_PROJECT_REF" ]; then
    echo "❌ SUPABASE_PROJECT_REF environment variable is required"
    echo "Set it with: export SUPABASE_PROJECT_REF=your-project-ref"
    exit 1
fi

if [ -z "$RUNWARE_API_KEY" ]; then
    echo "❌ RUNWARE_API_KEY environment variable is required"
    echo "Set it with: export RUNWARE_API_KEY=your-runware-api-key"
    exit 1
fi

echo "✅ Environment variables check passed"

# Link to project if not already linked
echo "🔗 Linking to Supabase project..."
supabase link --project-ref "$SUPABASE_PROJECT_REF" || echo "Already linked or using existing configuration"

# Set secrets
echo "🔐 Setting environment secrets..."
supabase secrets set RUNWARE_API_KEY="$RUNWARE_API_KEY" --project-ref "$SUPABASE_PROJECT_REF"

# Deploy database schema
echo "📊 Deploying database schema..."
if [ -f "database/image-generation-schema.sql" ]; then
    supabase db push --project-ref "$SUPABASE_PROJECT_REF"
    echo "✅ Database schema deployed"
else
    echo "⚠️ Database schema file not found. Please run manually in Supabase SQL editor."
fi

# Deploy the function
echo "⚡ Deploying Edge Function..."
supabase functions deploy generate-image --project-ref "$SUPABASE_PROJECT_REF"

# Test the deployment
echo "🧪 Testing deployment..."
FUNCTION_URL="https://$SUPABASE_PROJECT_REF.supabase.co/functions/v1/generate-image"

# Test CORS preflight
echo "Testing CORS preflight..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$FUNCTION_URL" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: authorization, content-type")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ CORS preflight test passed"
else
    echo "❌ CORS preflight test failed (HTTP $HTTP_STATUS)"
fi

# Test authentication error (expected)
echo "Testing authentication (should return 401)..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$FUNCTION_URL" \
    -H "Content-Type: application/json" \
    -d '{"positivePrompt": "test"}')

if [ "$HTTP_STATUS" -eq 401 ]; then
    echo "✅ Authentication test passed (401 as expected)"
else
    echo "❌ Authentication test failed (expected 401, got $HTTP_STATUS)"
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Run the database schema in Supabase SQL editor:"
echo "   - Open https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF/sql"
echo "   - Execute the contents of database/image-generation-schema.sql"
echo ""
echo "2. Test the function with a valid JWT token:"
echo "   curl -X POST $FUNCTION_URL \\"
echo "     -H \"Authorization: Bearer YOUR_JWT_TOKEN\" \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"positivePrompt\": \"A beautiful sunset over mountains\"}'"
echo ""
echo "3. Monitor function logs:"
echo "   supabase functions logs generate-image --project-ref $SUPABASE_PROJECT_REF"
echo ""
echo "📚 Documentation: docs/IMAGE_GENERATION.md"
echo "🔧 Function URL: $FUNCTION_URL"