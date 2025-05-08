#!/bin/bash

# Supabase Synchronization Script

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo -e "${RED}Supabase CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Function to handle errors
handle_error() {
    echo -e "${RED}Error: $1${NC}"
    exit 1
}

# Validate environment
validate_env() {
    if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
        handle_error "SUPABASE_ACCESS_TOKEN is not set"
    fi
    if [ -z "$SUPABASE_PROJECT_ID" ]; then
        handle_error "SUPABASE_PROJECT_ID is not set"
    fi
}

# Main synchronization function
sync_supabase() {
    echo -e "${YELLOW}Starting Supabase Synchronization${NC}"
    
    # Validate environment
    validate_env
    
    # Pull latest migrations
    echo -e "${GREEN}Pulling latest migrations...${NC}"
    supabase migration pull || handle_error "Failed to pull migrations"
    
    # Apply local migrations
    echo -e "${GREEN}Applying local migrations...${NC}"
    supabase migration up || handle_error "Failed to apply migrations"
    
    # Push migrations to remote
    echo -e "${GREEN}Pushing migrations to Supabase...${NC}"
    supabase db push || handle_error "Failed to push database changes"
    
    echo -e "${GREEN}Supabase synchronization completed successfully!${NC}"
}

# Run synchronization
sync_supabase
