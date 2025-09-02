#!/bin/bash

echo "=== Preparing Avaya Infinity Server SDK for publishing ==="

# Step 1: Clean up
echo "Step 1: Cleaning up..."
rm -rf dist

# Step 2: Build
echo "Step 2: Building..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Build failed. Please fix the errors and try again."
  exit 1
fi

# Step 3: Run tests
echo "Step 3: Running tests..."
npm run test:usage

# Step 4: Package files
echo "Step 4: Creating package..."
npm pack

echo ""
echo "=== Package ready for publishing ==="
echo "To publish to npm, run: npm publish"
echo "To use locally, run: npm link"
