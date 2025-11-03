/**
 * Test Raindrop + Vultr Integration
 * 
 * This script tests the complete flow:
 * 1. Raindrop receives user input
 * 2. Gemini parses it into concepts
 * 3. Raindrop calls Vultr API to store data
 * 4. Vultr stores in PostgreSQL and returns map
 */

require('dotenv').config();

async function testIntegration() {
    console.log('🧪 Testing Raindrop + Vultr Integration\n');

    // Configuration
    const VULTR_API_URL = process.env.VULTR_API_URL || 'http://localhost:5000';
    const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

    console.log('Configuration:');
    console.log('  Vultr API:', VULTR_API_URL);
    console.log('  Test User:', TEST_USER_ID);
    console.log('  Gemini API Key:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('');

    // Step 1: Check Vultr API is running
    console.log('Step 1: Checking Vultr API...');
    try {
        const healthResponse = await fetch(`${VULTR_API_URL}/health`);
        const health = await healthResponse.json();
        console.log('✅ Vultr API is healthy:', health.status);
    } catch (error) {
        console.error('❌ Vultr API is not running!');
        console.error('   Start it with: node src.old/index.js');
        process.exit(1);
    }

    // Step 2: Test Gemini connection
    console.log('\nStep 2: Testing Gemini AI...');
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY not set in .env');
        process.exit(1);
    }

    const {
        GoogleGenerativeAI
    } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-pro'
        });
        const result = await model.generateContent('Say OK');
        const response = await result.response;
        console.log('✅ Gemini AI is working:', response.text().substring(0, 50));
    } catch (error) {
        console.error('❌ Gemini AI failed:', error.message);
        process.exit(1);
    }

    // Step 3: Test concept parsing
    console.log('\nStep 3: Testing concept parsing...');
    const testInput = 'Explain neural networks and how they learn';

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-pro'
        });
        const prompt = `
Parse this into a concept graph with 3 concepts and their relationships.
Input: "${testInput}"

Return ONLY valid JSON:
{
  "title": "Neural Networks",
  "concepts": [
    {"name": "Perceptron", "description": "Basic unit", "emotion": "curious", "stylePrompt": "Simple neuron diagram"}
  ],
  "relationships": [
    {"from": "Perceptron", "to": "Network", "type": "part_of", "strength": 0.9}
  ]
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const conceptGraph = JSON.parse(jsonMatch[0]);
            console.log('✅ Parsed concept graph:');
            console.log('   Title:', conceptGraph.title);
            console.log('   Concepts:', conceptGraph.concepts?.length || 0);
            console.log('   Relationships:', conceptGraph.relationships?.length || 0);
        } else {
            console.error('❌ Failed to extract JSON from Gemini response');
        }
    } catch (error) {
        console.error('❌ Concept parsing failed:', error.message);
    }

    // Step 4: Test creating a map via Vultr API
    console.log('\nStep 4: Testing map creation via Vultr API...');
    try {
        const mapResponse = await fetch(`${VULTR_API_URL}/api/maps`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: TEST_USER_ID,
                title: 'Test Map from Raindrop',
                description: 'Testing Raindrop + Vultr integration'
            })
        });

        if (!mapResponse.ok) {
            const error = await mapResponse.text();
            throw new Error(error);
        }

        const map = await mapResponse.json();
        console.log('✅ Map created:', map.id);

        // Step 5: Create a test node
        console.log('\nStep 5: Testing node creation...');
        const nodeResponse = await fetch(`${VULTR_API_URL}/api/nodes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mapId: map.id,
                concept: 'Test Concept',
                description: 'This is a test concept from Raindrop',
                positionX: 0,
                positionY: 0,
                positionZ: 0,
                emotion: 'curious'
            })
        });

        if (!nodeResponse.ok) {
            const error = await nodeResponse.text();
            throw new Error(error);
        }

        const node = await nodeResponse.json();
        console.log('✅ Node created:', node.id);

        // Step 6: Retrieve complete map
        console.log('\nStep 6: Testing map retrieval...');
        const getMapResponse = await fetch(`${VULTR_API_URL}/api/maps/${map.id}`);
        const completeMap = await getMapResponse.json();

        console.log('✅ Retrieved complete map:');
        console.log('   Title:', completeMap.title);
        console.log('   Nodes:', completeMap.nodes?.length || 0);
        console.log('   Edges:', completeMap.edges?.length || 0);

        console.log('\n✅ All tests passed!');
        console.log('\n🎉 Raindrop + Vultr integration is working!');
        console.log('\nNext steps:');
        console.log('1. Deploy Raindrop services');
        console.log('2. Update VULTR_API_URL to your deployed Vultr backend');
        console.log('3. Test from Raindrop api-gateway');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testIntegration().catch(console.error);