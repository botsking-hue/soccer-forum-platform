#!/bin/bash

echo "🚀 Starting build process..."

# Clean and create directories
echo "📁 Setting up directories..."
rm -rf netlify
mkdir -p netlify/functions

# Check if functions directory exists
if [ -d "functions" ]; then
    echo "✅ Found functions directory"
    
    # Copy all functions
    echo "📋 Copying functions..."
    cp -r functions/* netlify/functions/
    
    # Convert ES modules to CommonJS
    echo "🔄 Converting ES modules to CommonJS..."
    find netlify/functions -name "*.js" -type f | while read file; do
        echo "Converting: $file"
        # Replace export const handler with exports.handler
        sed -i 's/export const handler =/exports.handler =/g' "$file"
        # Remove other export statements
        sed -i '/^export /d' "$file"
        # Fix import statements to require()
        sed -i 's/import { \([^}]\+\) } from .\([^']\+\)./const { \1 } = require("\2")/g' "$file"
        sed -i 's/import \([^ ]\+\) from .\([^']\+\)./const \1 = require("\2")/g' "$file"
    done
else
    echo "❌ No functions directory found"
    # Create minimal test function
    cat > netlify/functions/test.js << 'EOF'
exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: "✅ Test function is working!",
      timestamp: new Date().toISOString()
    })
  };
}
EOF
fi

# Copy shared libs if they exist
if [ -d "shared" ]; then
    echo "📦 Copying shared libraries..."
    cp -r shared netlify/functions/
    
    # Convert shared libs to CommonJS too
    echo "🔄 Converting shared libraries to CommonJS..."
    find netlify/functions/shared -name "*.js" -type f | while read file; do
        echo "Converting shared: $file"
        sed -i 's/export const /exports./g' "$file"
        sed -i 's/export function /exports./g' "$file"
        sed -i 's/export default /module.exports = /g' "$file"
        sed -i '/^export /d' "$file"
    done
fi

# Final check
echo "🔍 Final netlify/functions structure:"
find netlify/functions -type f -name "*.js" | head -10

echo "✅ Build completed!"
