// Vultr Service Configuration
require('dotenv').config();
const {
    Client
} = require('pg');
const {
    S3Client
} = require('@aws-sdk/client-s3');
const redis = require('redis');

/**
 * PostgreSQL Database Configuration
 */
const postgresConfig = {
    host: process.env.VULTR_DB_HOST,
    port: process.env.VULTR_DB_PORT || 16751,
    database: process.env.VULTR_DB_NAME || 'neuromapor_db',
    user: process.env.VULTR_DB_USER,
    password: process.env.VULTR_DB_PASSWORD,
    ssl: process.env.VULTR_DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false,
    max: 20, // connection pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

/**
 * Create PostgreSQL client
 */
const createPostgresClient = () => {
    return new Client(postgresConfig);
};

/**
 * S3-Compatible Object Storage Configuration
 */
const s3Config = {
    endpoint: process.env.VULTR_S3_ENDPOINT,
    region: process.env.VULTR_S3_REGION || 'ewr1',
    credentials: {
        accessKeyId: process.env.VULTR_S3_ACCESS_KEY,
        secretAccessKey: process.env.VULTR_S3_SECRET_KEY,
    },
    forcePathStyle: true, // Required for Vultr Object Storage
};

/**
 * Create S3 client
 */
const createS3Client = () => {
    return new S3Client(s3Config);
};

/**
 * Valkey (Redis) Configuration
 */
const redisConfig = {
    socket: {
        host: process.env.VULTR_REDIS_HOST,
        port: process.env.VULTR_REDIS_PORT || 16752,
    },
    password: process.env.VULTR_REDIS_PASSWORD,
};

/**
 * Create Redis client
 */
const createRedisClient = () => {
    const client = redis.createClient(redisConfig);

    client.on('error', (err) => {
        console.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
        console.log('✅ Connected to Vultr Valkey (Redis)');
    });

    return client;
};

/**
 * Test all Vultr connections
 */
const testConnections = async () => {
    const results = {
        postgres: false,
        s3: false,
        redis: false,
    };

    // Test PostgreSQL
    try {
        const pgClient = createPostgresClient();
        await pgClient.connect();
        await pgClient.query('SELECT NOW()');
        await pgClient.end();
        results.postgres = true;
        console.log('✅ PostgreSQL connection successful');
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
    }

    // Test S3
    try {
        const s3Client = createS3Client();
        const {
            ListBucketsCommand
        } = require('@aws-sdk/client-s3');
        await s3Client.send(new ListBucketsCommand({}));
        results.s3 = true;
        console.log('✅ Object Storage connection successful');
    } catch (error) {
        console.error('❌ Object Storage connection failed:', error.message);
    }

    // Test Redis
    try {
        const redisClient = createRedisClient();
        await redisClient.connect();
        await redisClient.ping();
        await redisClient.quit();
        results.redis = true;
        console.log('✅ Valkey (Redis) connection successful');
    } catch (error) {
        console.error('❌ Valkey (Redis) connection failed:', error.message);
    }

    return results;
};

module.exports = {
    postgresConfig,
    s3Config,
    redisConfig,
    createPostgresClient,
    createS3Client,
    createRedisClient,
    testConnections,
    bucketName: process.env.VULTR_S3_BUCKET || 'neuromapor-assets',
};