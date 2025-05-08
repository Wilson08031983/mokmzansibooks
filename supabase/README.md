# Supabase Project Synchronization

## Project Details
- **Project ID**: `bazbbweawubxqfebliil`
- **Project URL**: `https://bazbbweawubxqfebliil.supabase.co`

## Setup Instructions

### Prerequisites
- Supabase CLI installed
- GitHub account with access to the repository
- Supabase access token

### Local Development
1. Clone the repository
2. Copy `.env.example` to `.env`
3. Fill in the Supabase credentials

### Migrations
- Migrations are stored in `supabase/migrations/`
- Use `supabase migration up` to apply local migrations
- Use `supabase migration new [migration_name]` to create new migrations

### Continuous Integration
- GitHub Actions workflow automatically syncs migrations on push
- Requires `SUPABASE_ACCESS_TOKEN` secret in GitHub repository settings

### Recommended Workflow
1. Make database schema changes locally
2. Create a new migration
3. Test migrations locally
4. Commit and push changes
5. GitHub Actions will sync migrations to Supabase project

## Security Notes
- Never commit `.env` file with actual credentials
- Use environment-specific `.env` files
- Rotate access tokens periodically
