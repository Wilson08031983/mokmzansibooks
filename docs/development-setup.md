# Development Setup Guide

## Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials

## CI/CD Secrets Management
```bash
# Install GitHub CLI
brew install gh

# Run setup script
./scripts/setup-secrets.sh
```

## Docker Development
```bash
docker-compose up --build
```

## Maintenance Scripts
- `npm run analyze:supabase` - Find invalid imports
- `npm run fix:supabase` - Auto-correct imports
- `npm run deprecate:supabase` - Phase out old clients
