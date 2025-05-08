#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check and install Homebrew
install_homebrew() {
    if ! command -v brew &> /dev/null; then
        echo -e "${YELLOW}Installing Homebrew...${NC}"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add Homebrew to PATH
        echo -e "${YELLOW}Adding Homebrew to PATH...${NC}"
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/$(whoami)/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
}

# Function to install Supabase CLI
install_supabase_cli() {
    echo -e "${YELLOW}Installing Supabase CLI...${NC}"
    
    # Try Homebrew first
    if command -v brew &> /dev/null; then
        brew install supabase/tap/supabase
    else
        # Fallback to npm
        if command -v npm &> /dev/null; then
            npm install -g supabase-cli
        else
            # If npm is not available, try to install Node.js
            brew install node
            npm install -g supabase-cli
        fi
    fi
    
    # Verify installation
    if command -v supabase &> /dev/null; then
        echo -e "${GREEN}Supabase CLI installed successfully!${NC}"
        supabase --version
    else
        echo -e "${RED}Failed to install Supabase CLI${NC}"
        exit 1
    fi
}

# Main execution
main() {
    install_homebrew
    install_supabase_cli
}

# Run the main function
main
