#!/bin/bash

echo "🚀 Starting build process..."

# Clean and create directories
rm -rf netlify
mkdir -p netlify/functions

# Copy functions
if [ -d "functions" ]; then
    echo "✅ Found functions directory"
    cp -r functions/* netlify/functions/
    
    # Convert any remaining ES modules to CommonJS
    echo "🔄 Ensuring CommonJS syntax..."
    find netlify/functions -name "*.js" -type f | while read file; do
        # Quick conversion
        sed -i.bak 's/export const handler =/exports.handler =/g' "$file"
        sed -i.bak '/^export /d' "$file"
        rm -f "$file.bak"
    done
fi

# Copy shared libs
if [ -d "shared" ]; then
    cp -r shared netlify/functions/
fi

echo "✅ Build completed!"
