#!/bin/bash

# Exit if any command fails
set -e

echo "🚀 Starting manual deployment..."

# Step 1: Build frontend
echo "📦 Installing frontend dependencies..."
cd client
npm install

echo "🛠️ Building frontend..."
npm run build

# Step 2: Copy build to server/client-build
echo "📁 Copying frontend build to server/client-build..."
rm -rf ../server/client-build
mkdir -p ../server/client-build
cp -r dist/* ../server/client-build/

# Step 3: Install backend dependencies
echo "📦 Installing backend dependencies..."
cd ../server
npm install

# Step 4: Deploy to App Engine
echo "🚀 Deploying to App Engine..."
gcloud app deploy app.yaml --quiet

echo "✅ Deployment complete!"
