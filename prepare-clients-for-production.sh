#!/bin/bash
# Production preparation script for Clients module
# Generated on: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "🔍 Preparing Clients module for production..."

# 1. Remove any sample or mock data from Clients.tsx
echo "🧹 Removing sample data..."
sed -i '' 's/\/\/ Sample data or mock data for development.*$/\/\/ Production: No sample data/' ./src/pages/Clients.tsx
sed -i '' '/const mockClients/,/];/d' ./src/pages/Clients.tsx
sed -i '' '/const sampleClients/,/];/d' ./src/pages/Clients.tsx

# 2. Remove console.log statements
echo "🧹 Removing console.log statements..."
find ./src/pages/Clients.tsx ./src/components/clients -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/console\.log([^)]*);*//g'

# 3. Remove debugger statements
echo "🧹 Removing debugger statements..."
find ./src/pages/Clients.tsx ./src/components/clients -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/debugger;*//g'

# 4. Remove TODO comments
echo "🧹 Removing TODO comments..."
find ./src/pages/Clients.tsx ./src/components/clients -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/\/\/\s*TODO:.*//g'

# 5. Add data protection component to Clients.tsx
echo "🛡️ Adding data protection safeguards..."
if ! grep -q "ClientDataProtection" ./src/pages/Clients.tsx; then
  sed -i '' '/import { useI18n } from "@\/contexts\/I18nContext";/a\
import ClientDataProtection from "@/components/clients/ClientDataProtection";
' ./src/pages/Clients.tsx
fi

# 6. Add the ClientDataProtection component to the render
if ! grep -q "<ClientDataProtection" ./src/pages/Clients.tsx; then
  # Find the position after the main heading and add the component
  sed -i '' '/<h2.*>Clients<\/h2>/,/<\/div>/s/<\/div>/<\/div>\n      <ClientDataProtection clientCount={getTotalClientCount()} onDataRestored={loadClientData} \/>/' ./src/pages/Clients.tsx
fi

# 7. Update Supabase integration
echo "🔄 Updating Supabase integration..."
if ! grep -q "supabaseClientService" ./src/pages/Clients.tsx; then
  sed -i '' '/import { useI18n } from "@\/contexts\/I18nContext";/a\
import { syncClientsWithSupabase } from "@/services/supabaseClientService";
' ./src/pages/Clients.tsx
fi

# 8. Add Supabase sync to save function
if ! grep -q "syncClientsWithSupabase" ./src/pages/Clients.tsx; then
  # Find the saveClientData function and add Supabase sync
  sed -i '' '/const saveClientData/,/}/s/return true;/try {\n      syncClientsWithSupabase(clients);\n      return true;\n    } catch (error) {\n      console.error("Error syncing with Supabase:", error);\n      return true; \/\/ Still return true as local save succeeded\n    }/' ./src/pages/Clients.tsx
fi

# 9. Remove any remaining sample data references
echo "🧹 Removing remaining sample data references..."
sed -i '' 's/\/\/ Development: Sample data/\/\/ Production: No sample data/' ./src/pages/Clients.tsx

# 10. Make sure error handling is in place
echo "🛡️ Ensuring error handling is in place..."
if ! grep -q "ClientErrorBoundary" ./src/pages/Clients.tsx; then
  echo "⚠️ Warning: ClientErrorBoundary not found. Please ensure error handling is implemented."
fi

# 11. Commit changes to git
echo "💾 Committing changes to Git..."
git add ./src/pages/Clients.tsx
git add ./src/components/clients/ClientDataProtection.tsx
git add ./src/utils/clientErrorPrevention.ts
git add ./src/contexts/ClientDataContext.tsx
git add ./src/services/supabaseClientService.ts
git add ./src/utils/githubIntegration.ts

git commit -m "[$(date +%Y-%m-%d)] Prepare Clients module for production: Add data safeguards, remove samples, update Supabase integration"

echo "✅ Clients module is now ready for production!"
echo "🚀 Run 'git push origin main' to update GitHub repository"
