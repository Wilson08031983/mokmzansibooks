#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to generate a secure random token
generate_token() {
    openssl rand -hex 32
}

# Function to help set up GitHub secrets
setup_github_secrets() {
    echo -e "${YELLOW}GitHub Secrets Setup Wizard${NC}"
    
    # Check if GitHub CLI is installed
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}GitHub CLI (gh) is not installed. Please install it first.${NC}"
        echo "You can install it with:"
        echo "- macOS (Homebrew): brew install gh"
        echo "- Other platforms: https://cli.github.com/"
        exit 1
    }

    # Authenticate GitHub CLI if not already authenticated
    if ! gh auth status &> /dev/null; then
        echo -e "${YELLOW}Authenticating with GitHub...${NC}"
        gh auth login
    fi

    # Repository details
    REPO="Wilson08031983/mokmzansibooks"

    # Supabase Access Token
    read -p "Enter your Supabase Access Token (or press Enter to generate): " SUPABASE_TOKEN
    if [ -z "$SUPABASE_TOKEN" ]; then
        SUPABASE_TOKEN=$(generate_token)
        echo -e "${GREEN}Generated Supabase Access Token: $SUPABASE_TOKEN${NC}"
    fi
    gh secret set SUPABASE_ACCESS_TOKEN "$SUPABASE_TOKEN" -R "$REPO"

    # Slack Webhook (optional)
    read -p "Do you want to set up a Slack Webhook for notifications? (y/n): " SLACK_CHOICE
    if [[ "$SLACK_CHOICE" == "y" || "$SLACK_CHOICE" == "Y" ]]; then
        read -p "Enter your Slack Webhook URL: " SLACK_WEBHOOK
        gh secret set SLACK_WEBHOOK "$SLACK_WEBHOOK" -R "$REPO"
    fi

    # Deployment Secrets
    read -p "Enter Netlify Site ID: " NETLIFY_SITE_ID
    gh secret set NETLIFY_SITE_ID "$NETLIFY_SITE_ID" -R "$REPO"

    read -p "Enter Netlify Auth Token: " NETLIFY_AUTH_TOKEN
    gh secret set NETLIFY_AUTH_TOKEN "$NETLIFY_AUTH_TOKEN" -R "$REPO"

    # Supabase Project Secrets
    read -p "Enter Supabase Project URL: " SUPABASE_URL
    gh secret set SUPABASE_URL "$SUPABASE_URL" -R "$REPO"

    read -p "Enter Supabase Anon Key: " SUPABASE_ANON_KEY
    gh secret set SUPABASE_ANON_KEY "$SUPABASE_ANON_KEY" -R "$REPO"

    # Optional: Production URL
    read -p "Enter Production URL (optional): " PRODUCTION_URL
    if [ -n "$PRODUCTION_URL" ]; then
        gh secret set PRODUCTION_URL "$PRODUCTION_URL" -R "$REPO"
    fi

    # Optional: Paystack Public Key
    read -p "Enter Paystack Public Key (optional): " PAYSTACK_PUBLIC_KEY
    if [ -n "$PAYSTACK_PUBLIC_KEY" ]; then
        gh secret set PAYSTACK_PUBLIC_KEY "$PAYSTACK_PUBLIC_KEY" -R "$REPO"
    fi

    echo -e "${GREEN}GitHub Secrets setup completed successfully!${NC}"
}

# Run the setup function
setup_github_secrets
