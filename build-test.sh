#!/bin/bash
# Production build test script for MokMzansi Books

echo "🏗️  Starting production build test..."

# Step 1: Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Step 2: Build the application
echo "🔨 Building production bundle..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "❌ Build failed! Please check the errors above."
  exit 1
fi

# Step 3: Start preview server
echo "🚀 Starting preview server..."
echo "Preview will be available at http://localhost:4173"
echo "Press Ctrl+C to stop the preview server"
npm run preview
