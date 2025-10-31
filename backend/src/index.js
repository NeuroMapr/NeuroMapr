const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cacheService = require('./services/cacheService');

// Import middleware
const logger = require('./middleware/logger');
const {
    globalLimiter,
    uploadLimiter,
    creationLimiter
} = require('./middleware/rateLimiter');

// Import routes
const mapsRoutes = require('./routes/maps');
const nodesRoutes = require('./routes/nodes');
const assetsRoutes = require('./routes/assets');

dotenv.config();

const app = express();

// Security Middleware (apply first)
app.use(helmet()); // Adds security headers

// CORS Configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Whitelist frontend
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body Parser
app.use(express.json({
    limit: '10mb'
})); // Limit JSON payload size

// Request Logger (logs all requests)
app.use(logger);

// Global Rate Limiter (applies to all routes)
app.use('/api', globalLimiter);

// Health check (no rate limit)
app.get('/', (req, res) => res.send('NeuroMapr backend is running 🚀'));
app.get('/health', (req, res) => res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
}));

// API Routes with specific rate limiters
app.use('/api/maps', creationLimiter, mapsRoutes); // Rate limit map creation
app.use('/api/nodes', creationLimiter, nodesRoutes); // Rate limit node creation
app.use('/api/assets', uploadLimiter, assetsRoutes); // Rate limit file uploads

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