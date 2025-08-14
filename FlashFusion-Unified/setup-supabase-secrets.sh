#!/bin/bash
# FlashFusion Supabase Secrets Configuration Script
# Generated on 2025-07-27T16:41:00.674Z

echo "🔐 Setting up Supabase Edge Function secrets..."

supabase secrets set ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY"
# supabase secrets set MONGODB_URI="YOUR_ACTUAL_MONGODB_URI"
# supabase secrets set JWT_SECRET="YOUR_ACTUAL_JWT_SECRET"
supabase secrets set NOTION_API_KEY="your_actual_notion_token_here"

echo "✅ Secrets configuration complete!"
echo ""
echo "🚀 Deploy Edge Functions:"
echo "supabase functions deploy ai-orchestrator"
echo "supabase functions deploy generate-image"
echo ""
echo "📊 Check function logs:"
echo "supabase functions logs ai-orchestrator"
echo "supabase functions logs generate-image"
