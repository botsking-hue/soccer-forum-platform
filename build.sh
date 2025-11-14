#!/bin/bash

echo "🚀 Starting build process..."

# Clean and create directories
echo "📁 Setting up directories..."
rm -rf netlify
mkdir -p netlify/functions

# Check if functions directory exists
if [ -d "functions" ]; then
    echo "✅ Found functions directory"
    
    # Copy all functions to netlify/functions (flat structure)
    echo "📋 Copying functions to flat structure..."
    
    # Copy root functions first
    if [ -n "$(find functions -maxdepth 1 -name '*.js' -print -quit)" ]; then
        echo "➡️ Copying root functions..."
        cp functions/*.js netlify/functions/ 2>/dev/null || echo "No root functions"
    fi
    
    # Copy and flatten auth functions
    if [ -d "functions/auth" ]; then
        echo "➡️ Flattening auth functions..."
        cp functions/auth/*.js netlify/functions/ 2>/dev/null || echo "No auth functions"
    fi
    
    # Copy and flatten admin functions
    if [ -d "functions/admin" ]; then
        echo "➡️ Flattening admin functions..."
        cp functions/admin/*.js netlify/functions/ 2>/dev/null || echo "No admin functions"
    fi
    
    # Copy and flatten tournament functions
    if [ -d "functions/tournament" ]; then
        echo "➡️ Flattening tournament functions..."
        cp functions/tournament/*.js netlify/functions/ 2>/dev/null || echo "No tournament functions"
    fi
    
    # Copy and flatten threads functions
    if [ -d "functions/threads" ]; then
        echo "➡️ Flattening threads functions..."
        cp functions/threads/*.js netlify/functions/ 2>/dev/null || echo "No threads functions"
    fi
    
    # Copy and flatten forum functions
    if [ -d "functions/forum" ]; then
        echo "➡️ Flattening forum functions..."
        # Handle nested forum structure
        find functions/forum -name "*.js" -type f | while read file; do
            filename=$(basename "$file")
            # Avoid overwriting files with same name
            if [ -f "netlify/functions/$filename" ]; then
                # Add prefix for duplicate names
                dirname=$(basename $(dirname "$file"))
                if [ "$dirname" != "forum" ]; then
                    new_name="${dirname}-${filename}"
                    echo "Renaming $file to $new_name (avoid duplicate)"
                    cp "$file" "netlify/functions/$new_name"
                else
                    cp "$file" "netlify/functions/$filename"
                fi
            else
                cp "$file" "netlify/functions/$filename"
            fi
        done
    fi
    
    # Copy and flatten follow functions
    if [ -d "functions/follow" ]; then
        echo "➡️ Flattening follow functions..."
        cp functions/follow/*.js netlify/functions/ 2>/dev/null || echo "No follow functions"
    fi
    
    # Ensure CommonJS syntax in all functions
    echo "🔄 Ensuring CommonJS syntax..."
    find netlify/functions -name "*.js" -type f | while read file; do
        # Convert export const handler to exports.handler
        sed -i.bak 's/export const handler =/exports.handler =/g' "$file"
        # Remove other export statements
        sed -i.bak '/^export /d' "$file"
        # Remove backup files
        rm -f "$file.bak"
    done
    
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
    
    # Convert shared libs to CommonJS too
    echo "🔄 Converting shared libraries to CommonJS..."
    find netlify/functions/shared -name "*.js" -type f | while read file; do
        sed -i.bak 's/export const /exports./g' "$file"
        sed -i.bak 's/export function /exports./g' "$file"
        sed -i.bak 's/export default /module.exports = /g' "$file"
        sed -i.bak '/^export /d' "$file"
        rm -f "$file.bak"
    done
fi

# Final check
echo "🔍 Final netlify/functions structure:"
find netlify/functions -type f -name "*.js" | head -20

echo "📊 Function count:"
find netlify/functions -name "*.js" -type f | wc -l

echo "✅ Build completed!"
