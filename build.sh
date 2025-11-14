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
    
    # Create a simple test function to ensure something works
    echo "📝 Creating simple test function..."
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
else
    echo "❌ No functions directory found"
    # Create minimal test function
    echo "📝 Creating minimal test function..."
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
fi

# Final check
echo "🔍 Final netlify/functions structure:"
find netlify/functions -type f -name "*.js" | head -10

echo "✅ Build completed!"
