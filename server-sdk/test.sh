#!/bin/bash
# Test script for Avaya Infinity Server SDK

echo "=== Testing Avaya Infinity Server SDK ==="

# Test CommonJS usage
echo "Testing CommonJS usage..."
node -e "
try {
  const { AvayaInfinity } = require('./dist/avaya-infinity-server-sdk.cjs');
  console.log('✅ CommonJS import successful');
  
  const client = AvayaInfinity.init({
    host: 'test-host',
    account: 'test-account',
    connectorId: 'test-connector',
    clientId: 'test-client',
    clientSecret: 'test-secret'
  });
  
  console.log('✅ Client initialization successful');
  
  if (typeof client.sendMessage === 'function') {
    console.log('✅ Client methods available');
  } else {
    console.log('❌ Client methods not available');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ CommonJS test failed:', error);
  process.exit(1);
}
"

# Create temporary ESM test file
echo "Creating temporary ESM test file..."
cat > temp-esm-test.mjs << 'EOF'
import { AvayaInfinity } from './dist/avaya-infinity-server-sdk.js';

try {
  console.log('✅ ESM import successful');
  
  const client = AvayaInfinity.init({
    host: 'test-host',
    account: 'test-account',
    connectorId: 'test-connector',
    clientId: 'test-client',
    clientSecret: 'test-secret'
  });
  
  console.log('✅ Client initialization successful');
  
  if (typeof client.sendMessage === 'function') {
    console.log('✅ Client methods available');
  } else {
    console.log('❌ Client methods not available');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ ESM test failed:', error);
  process.exit(1);
}
EOF

# Test ESM usage
echo "Testing ESM usage..."
node temp-esm-test.mjs

# Clean up
rm temp-esm-test.mjs

echo ""
echo "=== All tests completed successfully ==="
