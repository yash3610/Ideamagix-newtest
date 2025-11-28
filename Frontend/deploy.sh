#!/bin/bash

# Netlify Deployment Script
# This script will build and deploy your frontend to Netlify

echo "🚀 Starting Netlify Deployment Process..."
echo ""

# Check if netlify-cli is installed
if ! command -v netlify &> /dev/null
then
    echo "📦 Netlify CLI not found. Installing..."
    npm install -g netlify-cli
    echo "✅ Netlify CLI installed!"
    echo ""
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
echo ""
echo "Please follow the prompts:"
echo "  - If asked for publish directory, enter: build"
echo "  - Choose 'Create & configure a new site' or select existing site"
echo ""

netlify deploy --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "✅ Your frontend is now live!"
    echo "✅ Backend API: https://idea-testapi.onrender.com"
    echo ""
    echo "Next steps:"
    echo "  1. Test your deployed site"
    echo "  2. Verify login/authentication works"
    echo "  3. Check that data loads from the backend"
    echo "  4. Test all major features"
else
    echo ""
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
