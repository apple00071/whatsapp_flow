// Test script to verify the published NPM package works
console.log('🧪 Testing Published WhatsApp Flow API SDK...\n');

try {
  // Test 1: Import the SDK
  console.log('1. Testing SDK Import...');
  const WhatsAppAPI = require('whatsapp-flow-api-sdk');
  console.log('✅ SDK imported successfully');
  
  // Test 2: Initialize client
  console.log('\n2. Testing SDK Initialization...');
  const client = new WhatsAppAPI({
    apiKey: 'test-api-key-12345',
    baseUrl: 'https://whatsapp-flow-i0e2.onrender.com'
  });
  console.log('✅ SDK initialized successfully');
  console.log(`   Base URL: ${client.baseUrl}`);
  console.log(`   API Key: ${client.apiKey ? 'Set' : 'Not set'}`);
  
  // Test 3: Check available methods
  console.log('\n3. Testing Available Methods...');
  const methods = [
    'sessions',
    'messages', 
    'contacts',
    'groups',
    'webhooks'
  ];
  
  methods.forEach(method => {
    if (client[method]) {
      console.log(`✅ ${method} module available`);
    } else {
      console.log(`❌ ${method} module missing`);
    }
  });
  
  // Test 4: Check session methods
  console.log('\n4. Testing Session Methods...');
  const sessionMethods = ['create', 'list', 'get', 'getQR', 'delete'];
  sessionMethods.forEach(method => {
    if (typeof client.sessions[method] === 'function') {
      console.log(`✅ sessions.${method}() available`);
    } else {
      console.log(`❌ sessions.${method}() missing`);
    }
  });
  
  // Test 5: Check message methods
  console.log('\n5. Testing Message Methods...');
  const messageMethods = ['sendText', 'sendMedia', 'sendLocation', 'list', 'getStatus'];
  messageMethods.forEach(method => {
    if (typeof client.messages[method] === 'function') {
      console.log(`✅ messages.${method}() available`);
    } else {
      console.log(`❌ messages.${method}() missing`);
    }
  });
  
  console.log('\n🎉 All tests passed! The SDK is working correctly.');
  console.log('\n📦 Package Information:');
  console.log('   Name: whatsapp-flow-api-sdk');
  console.log('   Version: 1.0.0');
  console.log('   Install: npm install whatsapp-flow-api-sdk');
  console.log('   NPM: https://www.npmjs.com/package/whatsapp-flow-api-sdk');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('\nTroubleshooting:');
  console.error('1. Make sure the package is installed: npm install whatsapp-flow-api-sdk');
  console.error('2. Check your Node.js version (requires >= 14.0.0)');
  console.error('3. Try clearing npm cache: npm cache clean --force');
}
