#!/bin/bash

echo "🚀 Starting build process..."

# Clean and create directories
echo "📁 Setting up directories..."
rm -rf netlify
mkdir -p netlify/functions

# Check if functions directory exists
if [ -d "functions" ]; then
    echo "✅ Found functions directory"
    echo "📂 Contents of functions/:"
    ls -la functions/
    
    # Copy all functions
    echo "📋 Copying functions..."
    cp -r functions/* netlify/functions/
    
    # Check what was copied
    echo "📂 Contents of netlify/functions after copy:"
    find netlify/functions -name "*.js" | head -10
else
    echo "❌ No functions directory found"
    # Create minimal test function
    echo "📝 Creating minimal test function..."
    mkdir -p netlify/functions
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
find netlify/functions -type f -name "*.js" | while read file; do
    echo "📄 $file"
done

echo "✅ Build completed!"
