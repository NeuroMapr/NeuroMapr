const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cacheService = require('./services/cacheService');

// Import routes
const mapsRoutes = require('./routes/maps');
const nodesRoutes = require('./routes/nodes');
const assetsRoutes = require('./routes/assets');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health check
app.get('/', (req, res) => res.send('NeuroMapr backend is running 🚀'));

// API Routes
app.use('/api/maps', mapsRoutes);
app.use('/api/nodes', nodesRoutes);
app.use('/api/assets', assetsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error'
    });
});

const PORT = process.env.PORT || 5000;

// Initialize cache and start server
async function startServer() {
    try {
        // Connect to cache
        await cacheService.connect();
        console.log('✅ Cache service initialized');

        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`📍 API endpoints:`);
            console.log(`   - POST   /api/maps`);
            console.log(`   - GET    /api/maps/:id`);
            console.log(`   - GET    /api/maps/user/:userId`);
            console.log(`   - POST   /api/nodes`);
            console.log(`   - GET    /api/nodes/:id`);
            console.log(`   - POST   /api/assets/artwork/:nodeId`);
            console.log(`   - POST   /api/assets/narration/:nodeId`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await cacheService.disconnect();
    process.exit(0);
});

startServer();