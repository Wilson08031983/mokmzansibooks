#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Supabase Project Reference
PROJECT_REF="bazbbweawubxqfebliil"

# Validate Supabase CLI is installed
validate_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        echo -e "${RED}Supabase CLI is not installed.${NC}"
        echo -e "${YELLOW}Please run install-supabase-cli.sh first.${NC}"
        exit 1
    fi
}

# Authenticate with Supabase
authenticate_supabase() {
    echo -e "${YELLOW}Authenticating with Supabase...${NC}"
    supabase login || {
        echo -e "${RED}Supabase authentication failed.${NC}"
        exit 1
    }
}

# Link Supabase Project
link_project() {
    echo -e "${YELLOW}Linking Supabase Project...${NC}"
    supabase link --project-ref "$PROJECT_REF" || {
        echo -e "${RED}Failed to link project.${NC}"
        exit 1
    }
}

# Pull Migrations from Remote
pull_migrations() {
    echo -e "${YELLOW}Pulling latest migrations from Supabase...${NC}"
    supabase migration pull || {
        echo -e "${YELLOW}No new migrations to pull or pull failed.${NC}"
    }
}

# Apply Local Migrations
apply_migrations() {
    echo -e "${YELLOW}Applying local migrations...${NC}"
    supabase migration up || {
        echo -e "${RED}Failed to apply migrations.${NC}"
        exit 1
    }
}

# Push Local Migrations to Remote
push_migrations() {
    echo -e "${YELLOW}Pushing local migrations to Supabase...${NC}"
    supabase db push || {
        echo -e "${YELLOW}No local migrations to push or push failed.${NC}"
    }
}

# Git Synchronization
git_sync() {
    echo -e "${YELLOW}Preparing Git synchronization...${NC}"
    
    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        echo -e "${YELLOW}Committing migration changes...${NC}"
        git add supabase/migrations
        git commit -m "Sync Supabase migrations $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    # Pull latest changes
    git pull origin main
    
    # Push changes
    git push origin main
}

# Main Synchronization Function
sync_supabase() {
    echo -e "${GREEN}Starting Supabase-GitHub Synchronization${NC}"
    
    validate_supabase_cli
    authenticate_supabase
    link_project
    pull_migrations
    apply_migrations
    push_migrations
    git_sync
    
    echo -e "${GREEN}Synchronization completed successfully!${NC}"
}

# Run the synchronization
sync_supabase
