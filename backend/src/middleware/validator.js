// Input Validation Middleware
const {
    body,
    param,
    validationResult
} = require('express-validator');

/**
 * Middleware to check validation results
 * If validation fails, returns 400 error with details
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

/**
 * Validate map creation request
 * Checks: userId (required, UUID), title (required, 1-255 chars), description (optional, max 1000 chars)
 */
const validateMapCreation = [
    body('userId')
    .notEmpty().withMessage('userId is required')
    .isUUID().withMessage('userId must be a valid UUID'),
    body('title')
    .notEmpty().withMessage('title is required')
    .isLength({
        min: 1,
        max: 255
    }).withMessage('title must be between 1 and 255 characters')
    .trim()
    .escape(), // Sanitize HTML
    body('description')
    .optional()
    .isLength({
        max: 1000
    }).withMessage('description must be less than 1000 characters')
    .trim()
    .escape(),
    handleValidationErrors
];

/**
 * Validate node creation request
 * Checks: mapId (required, UUID), concept (required, 1-255 chars), description (optional)
 */
const validateNodeCreation = [
    body('mapId')
    .notEmpty().withMessage('mapId is required')
    .isUUID().withMessage('mapId must be a valid UUID'),
    body('concept')
    .notEmpty().withMessage('concept is required')
    .isLength({
        min: 1,
        max: 255
    }).withMessage('concept must be between 1 and 255 characters')
    .trim()
    .escape(),
    body('description')
    .optional()
    .isLength({
        max: 2000
    }).withMessage('description must be less than 2000 characters')
    .trim(),
    body('positionX')
    .optional()
    .isFloat().withMessage('positionX must be a number'),
    body('positionY')
    .optional()
    .isFloat().withMessage('positionY must be a number'),
    body('positionZ')
    .optional()
    .isFloat().withMessage('positionZ must be a number'),
    body('emotion')
    .optional()
    .isLength({
        max: 100
    }).withMessage('emotion must be less than 100 characters')
    .trim(),
    handleValidationErrors
];

/**
 * Validate UUID parameter (for :id routes)
 */
const validateUUID = [
    param('id')
    .isUUID().withMessage('Invalid ID format'),
    handleValidationErrors
];

/**
 * Validate file upload
 * Checks file exists and is within size limits
 */
const validateFileUpload = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            error: 'No file uploaded'
        });
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
        return res.status(400).json({
            error: 'File too large',
            maxSize: '10MB',
            receivedSize: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`
        });
    }

    // Check file type for images
    if (req.path.includes('artwork') || req.path.includes('thumbnail')) {
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedImageTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                error: 'Invalid file type for image',
                allowed: allowedImageTypes,
                received: req.file.mimetype
            });
        }
    }

    // Check file type for audio
    if (req.path.includes('narration')) {
        const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
        if (!allowedAudioTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                error: 'Invalid file type for audio',
                allowed: allowedAudioTypes,
                received: req.file.mimetype
            });
        }
    }

    next();
};

/**
 * Sanitize text input - removes HTML tags and dangerous characters
 * Use this for user-generated content that might contain scripts
 */
const sanitizeInput = (text) => {
    if (!text) return text;

    // Remove HTML tags
    let sanitized = text.replace(/<[^>]*>/g, '');

    // Remove script tags and their content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
};

module.exports = {
    validateMapCreation,
    validateNodeCreation,
    validateUUID,
    validateFileUpload,
    sanitizeInput,
    handleValidationErrors
};