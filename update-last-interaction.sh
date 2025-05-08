#!/bin/bash
# Update all client creation code to use formattedDate for lastInteraction

# Backup the file
cp src/pages/Clients.tsx src/pages/Clients.tsx.backup-$(date +%s)

# Replace all instances of "lastInteraction: timestamp" with "lastInteraction: formattedDate"
sed -i '' 's/lastInteraction: timestamp/lastInteraction: formattedDate/g' src/pages/Clients.tsx

echo "Successfully updated all client creation code to use formattedDate for lastInteraction"
