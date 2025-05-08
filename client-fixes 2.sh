#!/bin/bash
# Script to remove the standalone "Add Credit" buttons from client cards
# This preserves the hover menu buttons while removing the redundant standalone buttons

# Create a backup of the original file
cp src/pages/Clients.tsx src/pages/Clients.tsx.backup-$(date +%s)

# Remove the standalone "Add Credit" buttons
sed -i '' '/className="flex mb-3 mt-1"/,+8d' src/pages/Clients.tsx

echo "Removed standalone Add Credit buttons from client cards"
