#!/bin/bash

# Exit if any command fails
set -e

echo "🚀 Starting manual deployment..."

# Step 0: Check and setup Google Cloud
echo "🔍 Checking Google Cloud configuration..."
PROJECT_ID=$(gcloud config get-value project)
echo "📍 Current project: $PROJECT_ID"

# Check if App Engine exists
if ! gcloud app describe >/dev/null 2>&1; then
    echo "⚠️ App Engine not found in project. Creating..."
    # Default to us-west2 (Los Angeles) if not specified
    gcloud app create --region=us-west2 || {
        echo "❌ Failed to create App Engine application. Please create it manually in the Google Cloud Console."
        exit 1
    }
fi

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
