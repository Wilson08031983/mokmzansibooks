#!/bin/bash

# Set GitHub secrets from environment variables
gh secret set SUPABASE_URL --body "$SUPABASE_URL"
gh secret set SUPABASE_ANON_KEY --body "$SUPABASE_ANON_KEY"
gh secret set PRODUCTION_URL --body "$PRODUCTION_URL"
gh secret set PAYSTACK_PUBLIC_KEY --body "$PAYSTACK_PUBLIC_KEY"
gh secret set NETLIFY_SITE_ID --body "$NETLIFY_SITE_ID"
gh secret set NETLIFY_AUTH_TOKEN --body "$NETLIFY_AUTH_TOKEN"
gh secret set SLACK_WEBHOOK --body "$SLACK_WEBHOOK"
gh secret set SUPABASE_ACCESS_TOKEN --body "$SUPABASE_ACCESS_TOKEN"

echo "All secrets set successfully"
