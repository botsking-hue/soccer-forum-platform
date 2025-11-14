#!/bin/bash

echo "🔄 Converting all functions to CommonJS..."

find functions -name "*.js" -type f | while read file; do
  echo "Converting: $file"
  
  # Create a temporary file
  temp_file="${file}.tmp"
  
  # Convert ES modules to CommonJS
  sed 's/export const handler =/exports.handler =/g' "$file" | \
  sed '/^export /d' > "$temp_file"
  
  # Replace original file
  mv "$temp_file" "$file"
done

echo "✅ All functions converted to CommonJS!"
