#!/bin/bash
# Complete build script for Avaya Infinity Server SDK

echo "=== Building Avaya Infinity Server SDK ==="

# Create output directory if it doesn't exist
mkdir -p dist

# Step 1: TypeScript compilation 
echo "Step 1: TypeScript compilation..."
npm run build:types

# Step 2: Bundle with Rollup (both ESM and CommonJS)
echo "Step 2: Bundling with Rollup..."
npm run build:bundle

# Step 3: Verify the build artifacts
echo "Step 3: Verifying build artifacts..."
if [[ -f "dist/avaya-infinity-server-sdk.js" && -f "dist/avaya-infinity-server-sdk.cjs" ]]; then
  echo "✅ Build completed successfully!"
  echo "   - ESM bundle: dist/avaya-infinity-server-sdk.js"
  echo "   - CommonJS bundle: dist/avaya-infinity-server-sdk.cjs"
else
  echo "❌ Build failed! One or more output files are missing."
  exit 1
fi

# Output file sizes
echo ""
echo "Bundle sizes:"
ls -lh dist/avaya-infinity-server-sdk.* | awk '{print "   - " $9 ": " $5}'

echo ""
echo "=== Build completed ==="
