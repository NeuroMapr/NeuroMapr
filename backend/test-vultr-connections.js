// Test script for Vultr infrastructure connections
require('dotenv').config();
const {
    testConnections
} = require('./src/config/vultr');
const databaseService = require('./src/services/databaseService');
const cacheService = require('./src/services/cacheService');

async function runTests() {
    console.log('🧪 Testing Vultr Infrastructure Connections...\n');

    // Test basic connections
    console.log('--- Testing Basic Connections ---');
    const results = await testConnections();
    console.log('\nConnection Results:', results);

    // Test cache service
    if (results.redis) {
        console.log('\n--- Testing Cache Service ---');
        try {
            await cacheService.connect();

            // Test set/get
            await cacheService.set('test:key', {
                message: 'Hello Vultr!'
            }, 60);
            const value = await cacheService.get('test:key');
            console.log('✅ Cache set/get test:', value);

            // Test delete
            await cacheService.delete('test:key');
            const deleted = await cacheService.get('test:key');
            console.log('✅ Cache delete test:', deleted === null ? 'Success' : 'Failed');

            await cacheService.disconnect();
        } catch (error) {
            console.error('❌ Cache service test failed:', error.message);
        }
    }

    // Test database service
    if (results.postgres) {
        console.log('\n--- Testing Database Service ---');
        try {
            // Test simple query
            const result = await databaseService.query('SELECT NOW() as current_time');
            console.log('✅ Database query test:', result.rows[0]);

            // Note: Uncomment below to initialize schema (only run once!)
            // await databaseService.initializeSchema();
            // console.log('✅ Database schema initialized');

        } catch (error) {
            console.error('❌ Database service test failed:', error.message);
        }
    }

    console.log('\n✅ All tests completed!');
    process.exit(0);
}

runTests().catch((error) => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
});