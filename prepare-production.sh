#!/bin/bash
# Production preparation script for MokMzansi Books

echo "🚀 Preparing MokMzansi Books for production deployment..."

# Check for .env file
if [ ! -f ".env" ]; then
  echo "⚠️ No .env file found, creating from example..."
  cp .env.example .env
  echo "✅ Created .env file. Please update with your actual credentials."
fi

# Remove sample/test data
echo "🧹 Removing sample data for production..."
find ./src -type f -name "*.tsx" -exec sed -i '' 's/const mock.*\[\]/const mock = \[\]/g' {} \; 2>/dev/null || true
find ./src -type f -name "*.ts" -exec sed -i '' 's/const mock.*\[\]/const mock = \[\]/g' {} \; 2>/dev/null || true

# Run TypeScript check
echo "🔍 Running TypeScript type check..."
npm run type-check || {
  echo "❌ TypeScript check failed. Please fix the errors before deploying to production."
  exit 1
}

# Run linting
echo "🧪 Running code linting..."
npm run lint || {
  echo "⚠️ Linting reported issues. Consider fixing them before production deployment."
}

# Build the app
echo "🏗️ Building production bundle..."
npm run build || {
  echo "❌ Build failed! Please check the errors above."
  exit 1
}

# Check build size
echo "📊 Analyzing build size..."
du -sh dist/

# Run security audit
echo "🔒 Running security audit..."
npm audit --production || {
  echo "⚠️ Security audit found issues. Please review them before deploying."
}

# Test Supabase connection
echo "🔌 Testing Supabase connection..."
echo "import { supabase } from './src/integrations/supabase/client'; async function testConnection() { const { data, error } = await supabase.from('companies').select('count(*)', { count: 'exact' }); console.log(error ? 'Error: ' + error.message : 'Connected successfully! Count: ' + data); } testConnection();" > test-supabase.js
node -r esm test-supabase.js
rm test-supabase.js

echo "✅ Production preparation complete!"
echo ""
echo "Next steps:"
echo "1. Review any warnings or errors above"
echo "2. Test the application thoroughly"
echo "3. Commit and push to GitHub to trigger deployment"
echo ""
echo "Your application is now ready for production! 🎉"
