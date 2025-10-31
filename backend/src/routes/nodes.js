// Nodes API Routes
const express = require('express');
const router = express.Router();
const db = require('../services/databaseService');
const cache = require('../services/cacheService');

// Create a new node
router.post('/', async (req, res) => {
    try {
        const {
            mapId,
            concept,
            description,
            artworkUrl,
            narrationUrl,
            positionX,
            positionY,
            positionZ,
            stylePrompt,
            emotion
        } = req.body;

        if (!mapId || !concept) {
            return res.status(400).json({
                error: 'mapId and concept are required'
            });
        }

        const nodeData = {
            concept,
            description,
            artworkUrl,
            narrationUrl,
            positionX: positionX || 0,
            positionY: positionY || 0,
            positionZ: positionZ || 0,
            stylePrompt,
            emotion
        };

        const node = await db.createNode(mapId, nodeData);

        // Invalidate map cache
        await cache.invalidateMap(mapId);

        // Publish real-time update
        await cache.publish('map:updates', {
            mapId,
            action: 'node_added',
            nodeId: node.id
        });

        res.status(201).json(node);
    } catch (error) {
        console.error('Error creating node:', error);
        res.status(500).json({
            error: 'Failed to create node'
        });
    }
});

// Get node by ID
router.get('/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;

        // Try cache first
        let node = await cache.getCachedNode(id);

        if (!node) {
            node = await db.getNodeById(id);

            if (!node) {
                return res.status(404).json({
                    error: 'Node not found'
                });
            }

            // Cache for next time
            await cache.cacheNode(id, node);
        }

        res.json(node);
    } catch (error) {
        console.error('Error fetching node:', error);
        res.status(500).json({
            error: 'Failed to fetch node'
        });
    }
});

// Get all nodes for a map
router.get('/map/:mapId', async (req, res) => {
    try {
        const {
            mapId
        } = req.params;
        const nodes = await db.getMapNodes(mapId);
        res.json(nodes);
    } catch (error) {
        console.error('Error fetching nodes:', error);
        res.status(500).json({
            error: 'Failed to fetch nodes'
        });
    }
});

// Update node
router.put('/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const {
            concept,
            description,
            artworkUrl,
            narrationUrl,
            positionX,
            positionY,
            positionZ,
            stylePrompt,
            emotion
        } = req.body;

        const result = await db.query(
            `UPDATE nodes 
       SET concept = COALESCE($1, concept),
           description = COALESCE($2, description),
           artwork_url = COALESCE($3, artwork_url),
           narration_url = COALESCE($4, narration_url),
           position_x = COALESCE($5, position_x),
           position_y = COALESCE($6, position_y),
           position_z = COALESCE($7, position_z),
           style_prompt = COALESCE($8, style_prompt),
           emotion = COALESCE($9, emotion),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
            [concept, description, artworkUrl, narrationUrl, positionX, positionY, positionZ, stylePrompt, emotion, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Node not found'
            });
        }

        const node = result.rows[0];

        // Invalidate caches
        await cache.delete(`node:${id}`);
        await cache.invalidateMap(node.map_id);

        // Publish real-time update
        await cache.publish('map:updates', {
            mapId: node.map_id,
            action: 'node_updated',
            nodeId: id
        });

        res.json(node);
    } catch (error) {
        console.error('Error updating node:', error);
        res.status(500).json({
            error: 'Failed to update node'
        });
    }
});

// Delete node
router.delete('/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;

        const result = await db.query('DELETE FROM nodes WHERE id = $1 RETURNING map_id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Node not found'
            });
        }

        const mapId = result.rows[0].map_id;

        // Invalidate caches
        await cache.delete(`node:${id}`);
        await cache.invalidateMap(mapId);

        // Publish real-time update
        await cache.publish('map:updates', {
            mapId,
            action: 'node_deleted',
            nodeId: id
        });

        res.json({
            message: 'Node deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting node:', error);
        res.status(500).json({
            error: 'Failed to delete node'
        });
    }
});

// Create edge (relationship between nodes)
router.post('/edges', async (req, res) => {
    try {
        const {
            mapId,
            sourceNodeId,
            targetNodeId,
            relationshipType,
            strength
        } = req.body;

        if (!mapId || !sourceNodeId || !targetNodeId) {
            return res.status(400).json({
                error: 'mapId, sourceNodeId, and targetNodeId are required'
            });
        }

        const edge = await db.createEdge(mapId, sourceNodeId, targetNodeId, relationshipType, strength);

        // Invalidate map cache
        await cache.invalidateMap(mapId);

        res.status(201).json(edge);
    } catch (error) {
        console.error('Error creating edge:', error);
        res.status(500).json({
            error: 'Failed to create edge'
        });
    }
});

module.exports = router;