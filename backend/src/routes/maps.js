// Maps API Routes
const express = require('express');
const router = express.Router();
const db = require('../services/databaseService');
const cache = require('../services/cacheService');

// Create a new map
router.post('/', async (req, res) => {
    try {
        const {
            userId,
            title,
            description
        } = req.body;

        if (!userId || !title) {
            return res.status(400).json({
                error: 'userId and title are required'
            });
        }

        const map = await db.createMap(userId, title, description);

        // Invalidate user's maps cache
        await cache.deletePattern(`user:${userId}:maps`);

        res.status(201).json(map);
    } catch (error) {
        console.error('Error creating map:', error);
        res.status(500).json({
            error: 'Failed to create map'
        });
    }
});

// Get map by ID
router.get('/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;

        // Try cache first
        let map = await cache.getCachedMap(id);

        if (!map) {
            // Cache miss - query database
            map = await db.getCompleteMap(id);

            if (!map) {
                return res.status(404).json({
                    error: 'Map not found'
                });
            }

            // Cache for next time
            await cache.cacheMap(id, map);
        }

        res.json(map);
    } catch (error) {
        console.error('Error fetching map:', error);
        res.status(500).json({
            error: 'Failed to fetch map'
        });
    }
});

// Get all maps for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const {
            userId
        } = req.params;

        const maps = await db.getUserMaps(userId);
        res.json(maps);
    } catch (error) {
        console.error('Error fetching user maps:', error);
        res.status(500).json({
            error: 'Failed to fetch maps'
        });
    }
});

// Update map
router.put('/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const {
            title,
            description,
            thumbnailUrl,
            isPublic
        } = req.body;

        const result = await db.query(
            `UPDATE maps 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           thumbnail_url = COALESCE($3, thumbnail_url),
           is_public = COALESCE($4, is_public),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
            [title, description, thumbnailUrl, isPublic, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Map not found'
            });
        }

        // Invalidate cache
        await cache.invalidateMap(id);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating map:', error);
        res.status(500).json({
            error: 'Failed to update map'
        });
    }
});

// Delete map
router.delete('/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;

        const result = await db.query('DELETE FROM maps WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Map not found'
            });
        }

        // Invalidate cache
        await cache.invalidateMap(id);

        res.json({
            message: 'Map deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting map:', error);
        res.status(500).json({
            error: 'Failed to delete map'
        });
    }
});

module.exports = router;