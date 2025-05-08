# Supabase GitHub Synchronization Guide

## Prerequisites
1. Supabase CLI installed
2. GitHub CLI authenticated
3. Supabase account with project access

## Setup Steps

### 1. Install Supabase CLI
```bash
./install-supabase-cli.sh
```

### 2. Authenticate Supabase
```bash
supabase login
```

### 3. Link Project
```bash
supabase link --project-ref bazbbweawubxqfebliil
```

## Synchronization Workflow

### Manual Sync
```bash
./supabase-github-sync.sh
```

### Automated Sync
- GitHub Actions workflow is configured in `.github/workflows/supabase-sync.yml`
- Triggers on migrations changes in `supabase/migrations/`

## Best Practices
- Always pull before pushing
- Resolve conflicts manually
- Test migrations locally before pushing

## Troubleshooting
- Ensure Supabase CLI is up to date
- Check network connectivity
- Verify project reference and authentication
