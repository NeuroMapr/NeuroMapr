// Storage Service - Handles Vultr Object Storage operations
const {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand
} = require('@aws-sdk/client-s3');
const {
    getSignedUrl
} = require('@aws-sdk/s3-request-presigner');
const {
    createS3Client,
    bucketName
} = require('../config/vultr');

const s3Client = createS3Client();

class StorageService {
    /**
     * Upload a file to Vultr Object Storage
     * @param {string} key - File path/key in bucket
     * @param {Buffer} body - File content
     * @param {string} contentType - MIME type
     * @returns {Promise<string>} - Public URL of uploaded file
     */
    async uploadFile(key, body, contentType) {
        try {
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: body,
                ContentType: contentType,
                ACL: 'public-read', // Make files publicly accessible
            });

            await s3Client.send(command);

            // Return public URL
            const publicUrl = `${process.env.VULTR_S3_ENDPOINT}/${bucketName}/${key}`;
            console.log(`✅ File uploaded: ${key}`);
            return publicUrl;
        } catch (error) {
            console.error('❌ Upload failed:', error);
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }

    /**
     * Get a file from storage
     * @param {string} key - File path/key in bucket
     * @returns {Promise<Buffer>} - File content
     */
    async getFile(key) {
        try {
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: key,
            });

            const response = await s3Client.send(command);
            const chunks = [];

            for await (const chunk of response.Body) {
                chunks.push(chunk);
            }

            return Buffer.concat(chunks);
        } catch (error) {
            console.error('❌ Get file failed:', error);
            throw new Error(`Failed to get file: ${error.message}`);
        }
    }

    /**
     * Delete a file from storage
     * @param {string} key - File path/key in bucket
     */
    async deleteFile(key) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: bucketName,
                Key: key,
            });

            await s3Client.send(command);
            console.log(`✅ File deleted: ${key}`);
        } catch (error) {
            console.error('❌ Delete failed:', error);
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    /**
     * Check if file exists
     * @param {string} key - File path/key in bucket
     * @returns {Promise<boolean>}
     */
    async fileExists(key) {
        try {
            const command = new HeadObjectCommand({
                Bucket: bucketName,
                Key: key,
            });

            await s3Client.send(command);
            return true;
        } catch (error) {
            if (error.name === 'NotFound') {
                return false;
            }
            throw error;
        }
    }

    /**
     * Generate a presigned URL for temporary access
     * @param {string} key - File path/key in bucket
     * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
     * @returns {Promise<string>} - Presigned URL
     */
    async getPresignedUrl(key, expiresIn = 3600) {
        try {
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: key,
            });

            const url = await getSignedUrl(s3Client, command, {
                expiresIn
            });
            return url;
        } catch (error) {
            console.error('❌ Presigned URL generation failed:', error);
            throw new Error(`Failed to generate presigned URL: ${error.message}`);
        }
    }

    /**
     * Upload artwork image
     * @param {string} nodeId - Node ID
     * @param {Buffer} imageBuffer - Image data
     * @param {string} format - Image format (png, jpg, etc.)
     * @returns {Promise<string>} - Public URL
     */
    async uploadArtwork(nodeId, imageBuffer, format = 'png') {
        const key = `artwork/${nodeId}.${format}`;
        const contentType = `image/${format}`;
        return this.uploadFile(key, imageBuffer, contentType);
    }

    /**
     * Upload narration audio
     * @param {string} nodeId - Node ID
     * @param {Buffer} audioBuffer - Audio data
     * @returns {Promise<string>} - Public URL
     */
    async uploadNarration(nodeId, audioBuffer) {
        const key = `narration/${nodeId}.mp3`;
        const contentType = 'audio/mpeg';
        return this.uploadFile(key, audioBuffer, contentType);
    }

    /**
     * Upload thumbnail
     * @param {string} mapId - Map ID
     * @param {Buffer} thumbnailBuffer - Thumbnail data
     * @returns {Promise<string>} - Public URL
     */
    async uploadThumbnail(mapId, thumbnailBuffer) {
        const key = `thumbnails/${mapId}.jpg`;
        const contentType = 'image/jpeg';
        return this.uploadFile(key, thumbnailBuffer, contentType);
    }
}

module.exports = new StorageService();