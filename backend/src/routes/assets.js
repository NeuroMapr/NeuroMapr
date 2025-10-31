// Assets API Routes (File Upload/Download)
const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = require('../services/storageService');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// Upload artwork for a node
router.post('/artwork/:nodeId', upload.single('artwork'), async (req, res) => {
    try {
        const {
            nodeId
        } = req.params;

        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded'
            });
        }

        // Determine format from mimetype
        const format = req.file.mimetype.split('/')[1]; // e.g., 'image/png' -> 'png'

        const url = await storage.uploadArtwork(nodeId, req.file.buffer, format);

        res.json({
            url,
            nodeId
        });
    } catch (error) {
        console.error('Error uploading artwork:', error);
        res.status(500).json({
            error: 'Failed to upload artwork'
        });
    }
});

// Upload narration for a node
router.post('/narration/:nodeId', upload.single('narration'), async (req, res) => {
    try {
        const {
            nodeId
        } = req.params;

        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded'
            });
        }

        const url = await storage.uploadNarration(nodeId, req.file.buffer);

        res.json({
            url,
            nodeId
        });
    } catch (error) {
        console.error('Error uploading narration:', error);
        res.status(500).json({
            error: 'Failed to upload narration'
        });
    }
});

// Upload thumbnail for a map
router.post('/thumbnail/:mapId', upload.single('thumbnail'), async (req, res) => {
    try {
        const {
            mapId
        } = req.params;

        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded'
            });
        }

        const url = await storage.uploadThumbnail(mapId, req.file.buffer);

        res.json({
            url,
            mapId
        });
    } catch (error) {
        console.error('Error uploading thumbnail:', error);
        res.status(500).json({
            error: 'Failed to upload thumbnail'
        });
    }
});

// Generic file upload
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const {
            key,
            contentType
        } = req.body;

        if (!req.file || !key) {
            return res.status(400).json({
                error: 'File and key are required'
            });
        }

        const type = contentType || req.file.mimetype;
        const url = await storage.uploadFile(key, req.file.buffer, type);

        res.json({
            url,
            key
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({
            error: 'Failed to upload file'
        });
    }
});

// Check if file exists
router.get('/exists/:key', async (req, res) => {
    try {
        const {
            key
        } = req.params;
        const exists = await storage.fileExists(key);
        res.json({
            exists,
            key
        });
    } catch (error) {
        console.error('Error checking file:', error);
        res.status(500).json({
            error: 'Failed to check file'
        });
    }
});

// Get presigned URL for temporary access
router.get('/presigned/:key', async (req, res) => {
    try {
        const {
            key
        } = req.params;
        const {
            expiresIn
        } = req.query; // Optional: seconds until expiration

        const url = await storage.getPresignedUrl(key, expiresIn ? parseInt(expiresIn) : 3600);

        res.json({
            url,
            key,
            expiresIn: expiresIn || 3600
        });
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        res.status(500).json({
            error: 'Failed to generate presigned URL'
        });
    }
});

// Delete file
router.delete('/:key', async (req, res) => {
    try {
        const {
            key
        } = req.params;
        await storage.deleteFile(key);
        res.json({
            message: 'File deleted successfully',
            key
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({
            error: 'Failed to delete file'
        });
    }
});

module.exports = router;