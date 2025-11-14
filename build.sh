#!/bin/bash

echo "🚀 Starting build process..."

# Clean and create directories
echo "📁 Setting up directories..."
rm -rf netlify
mkdir -p netlify/functions

# Function to sanitize filenames
sanitize_filename() {
    local filename="$1"
    # Replace square brackets with hyphens and remove other invalid characters
    echo "$filename" | sed 's/\[/--/g' | sed 's/\]/--/g' | sed 's/[^a-zA-Z0-9._-]/_/g'
}

# Check if functions directory exists
if [ -d "functions" ]; then
    echo "✅ Found functions directory"
    
    # Copy all functions to netlify/functions (flat structure)
    echo "📋 Copying functions to flat structure..."
    
    # Copy root functions first
    if [ -n "$(find functions -maxdepth 1 -name '*.js' -print -quit)" ]; then
        echo "➡️ Copying root functions..."
        for file in functions/*.js; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                sanitized=$(sanitize_filename "$filename")
                if [ "$filename" != "$sanitized" ]; then
                    echo "Renaming $filename to $sanitized"
                fi
                cp "$file" "netlify/functions/$sanitized"
            fi
        done
    fi
    
    # Copy and flatten auth functions
    if [ -d "functions/auth" ]; then
        echo "➡️ Flattening auth functions..."
        for file in functions/auth/*.js; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                sanitized=$(sanitize_filename "$filename")
                if [ "$filename" != "$sanitized" ]; then
                    echo "Renaming $filename to $sanitized"
                fi
                cp "$file" "netlify/functions/$sanitized"
            fi
        done
    fi
    
    # Copy and flatten admin functions
    if [ -d "functions/admin" ]; then
        echo "➡️ Flattening admin functions..."
        for file in functions/admin/*.js; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                sanitized=$(sanitize_filename "$filename")
                if [ "$filename" != "$sanitized" ]; then
                    echo "Renaming $filename to $sanitized"
                fi
                cp "$file" "netlify/functions/$sanitized"
            fi
        done
    fi
    
    # Copy and flatten tournament functions
    if [ -d "functions/tournament" ]; then
        echo "➡️ Flattening tournament functions..."
        for file in functions/tournament/*.js; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                sanitized=$(sanitize_filename "$filename")
                if [ "$filename" != "$sanitized" ]; then
                    echo "Renaming $filename to $sanitized"
                fi
                cp "$file" "netlify/functions/$sanitized"
            fi
        done
    fi
    
    # Copy and flatten threads functions
    if [ -d "functions/threads" ]; then
        echo "➡️ Flattening threads functions..."
        for file in functions/threads/*.js; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                sanitized=$(sanitize_filename "$filename")
                if [ "$filename" != "$sanitized" ]; then
                    echo "Renaming $filename to $sanitized"
                fi
                cp "$file" "netlify/functions/$sanitized"
            fi
        done
    fi
    
    # Copy and flatten forum functions - FIXED SECTION
    if [ -d "functions/forum" ]; then
        echo "➡️ Flattening forum functions..."
        find functions/forum -name "*.js" -type f | while read file; do
            filename=$(basename "$file")
            dirname=$(basename $(dirname "$file"))
            
            # Sanitize the filename first
            sanitized=$(sanitize_filename "$filename")
            
            # If filename was changed during sanitization, use the sanitized name
            if [ "$filename" != "$sanitized" ]; then
                new_name="$sanitized"
                echo "Sanitized $filename to $new_name"
            else
                # Avoid overwriting files with same name by adding prefix
                if [ -f "netlify/functions/$filename" ] && [ "$dirname" != "forum" ]; then
                    new_name="${dirname}-${filename}"
                    echo "Renaming $file to $new_name (avoid duplicate)"
                else
                    new_name="$filename"
                fi
            fi
            
            cp "$file" "netlify/functions/$new_name"
        done
    fi
    
    # Copy and flatten follow functions
    if [ -d "functions/follow" ]; then
        echo "➡️ Flattening follow functions..."
        for file in functions/follow/*.js; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                sanitized=$(sanitize_filename "$filename")
                if [ "$filename" != "$sanitized" ]; then
                    echo "Renaming $filename to $sanitized"
                fi
                cp "$file" "netlify/functions/$sanitized"
            fi
        done
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
