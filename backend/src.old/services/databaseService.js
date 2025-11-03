// Database Service - Handles Vultr PostgreSQL operations
const {
    Pool
} = require('pg');
const {
    postgresConfig
} = require('../config/vultr');

class DatabaseService {
    constructor() {
        this.pool = new Pool(postgresConfig);

        this.pool.on('error', (err) => {
            console.error('Unexpected database error:', err);
        });

        this.pool.on('connect', () => {
            console.log('✅ Database pool connected');
        });
    }

    /**
     * Execute a query
     * @param {string} text - SQL query
     * @param {array} params - Query parameters
     * @returns {Promise<object>} - Query result
     */
    async query(text, params) {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            console.log('Executed query', {
                text,
                duration,
                rows: result.rowCount
            });
            return result;
        } catch (error) {
            console.error('❌ Query failed:', error);
            throw error;
        }
    }

    /**
     * Get a client from the pool for transactions
     * @returns {Promise<object>} - Database client
     */
    async getClient() {
        return await this.pool.connect();
    }

    /**
     * Initialize database schema
     */
    async initializeSchema() {
        const client = await this.getClient();

        try {
            await client.query('BEGIN');

            // Users table
            await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          workos_id VARCHAR(255) UNIQUE,
          subscription_tier VARCHAR(50) DEFAULT 'free',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

            // Maps table
            await client.query(`
        CREATE TABLE IF NOT EXISTS maps (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          thumbnail_url TEXT,
          is_public BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

            // Nodes table
            await client.query(`
        CREATE TABLE IF NOT EXISTS nodes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          map_id UUID REFERENCES maps(id) ON DELETE CASCADE,
          concept VARCHAR(255) NOT NULL,
          description TEXT,
          artwork_url TEXT,
          narration_url TEXT,
          position_x FLOAT,
          position_y FLOAT,
          position_z FLOAT,
          style_prompt TEXT,
          emotion VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

            // Edges table (relationships between nodes)
            await client.query(`
        CREATE TABLE IF NOT EXISTS edges (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          map_id UUID REFERENCES maps(id) ON DELETE CASCADE,
          source_node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
          target_node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
          relationship_type VARCHAR(100),
          strength FLOAT DEFAULT 1.0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

            // User preferences table
            await client.query(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          theme VARCHAR(50) DEFAULT 'dark',
          language VARCHAR(10) DEFAULT 'en',
          narration_voice VARCHAR(100),
          auto_generate_art BOOLEAN DEFAULT true,
          preferences JSONB,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

            // Create indexes
            await client.query('CREATE INDEX IF NOT EXISTS idx_maps_user_id ON maps(user_id)');
            await client.query('CREATE INDEX IF NOT EXISTS idx_nodes_map_id ON nodes(map_id)');
            await client.query('CREATE INDEX IF NOT EXISTS idx_edges_map_id ON edges(map_id)');
            await client.query('CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_node_id)');
            await client.query('CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_node_id)');

            await client.query('COMMIT');
            console.log('✅ Database schema initialized');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Schema initialization failed:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Create a new user
     */
    async createUser(email, name, workosId) {
        const result = await this.query(
            'INSERT INTO users (email, name, workos_id) VALUES ($1, $2, $3) RETURNING *',
            [email, name, workosId]
        );
        return result.rows[0];
    }

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        const result = await this.query('SELECT * FROM users WHERE id = $1', [userId]);
        return result.rows[0];
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email) {
        const result = await this.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }

    /**
     * Create a new map
     */
    async createMap(userId, title, description) {
        const result = await this.query(
            'INSERT INTO maps (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
            [userId, title, description]
        );
        return result.rows[0];
    }

    /**
     * Get map by ID
     */
    async getMapById(mapId) {
        const result = await this.query('SELECT * FROM maps WHERE id = $1', [mapId]);
        return result.rows[0];
    }

    /**
     * Get all maps for a user
     */
    async getUserMaps(userId) {
        const result = await this.query(
            'SELECT * FROM maps WHERE user_id = $1 ORDER BY updated_at DESC',
            [userId]
        );
        return result.rows;
    }

    /**
     * Create a new node
     */
    async createNode(mapId, nodeData) {
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
        } = nodeData;
        const result = await this.query(
            `INSERT INTO nodes (map_id, concept, description, artwork_url, narration_url, 
       position_x, position_y, position_z, style_prompt, emotion) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [mapId, concept, description, artworkUrl, narrationUrl, positionX, positionY, positionZ, stylePrompt, emotion]
        );
        return result.rows[0];
    }

    /**
     * Get node by ID
     */
    async getNodeById(nodeId) {
        const result = await this.query('SELECT * FROM nodes WHERE id = $1', [nodeId]);
        return result.rows[0];
    }

    /**
     * Get all nodes for a map
     */
    async getMapNodes(mapId) {
        const result = await this.query(
            'SELECT * FROM nodes WHERE map_id = $1 ORDER BY created_at',
            [mapId]
        );
        return result.rows;
    }

    /**
     * Create an edge (relationship)
     */
    async createEdge(mapId, sourceNodeId, targetNodeId, relationshipType, strength = 1.0) {
        const result = await this.query(
            `INSERT INTO edges (map_id, source_node_id, target_node_id, relationship_type, strength) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [mapId, sourceNodeId, targetNodeId, relationshipType, strength]
        );
        return result.rows[0];
    }

    /**
     * Get all edges for a map
     */
    async getMapEdges(mapId) {
        const result = await this.query(
            'SELECT * FROM edges WHERE map_id = $1',
            [mapId]
        );
        return result.rows;
    }

    /**
     * Get complete map with nodes and edges
     */
    async getCompleteMap(mapId) {
        const map = await this.getMapById(mapId);
        if (!map) return null;

        const nodes = await this.getMapNodes(mapId);
        const edges = await this.getMapEdges(mapId);

        return {
            ...map,
            nodes,
            edges,
        };
    }

    /**
     * Close the database pool
     */
    async close() {
        await this.pool.end();
        console.log('Database pool closed');
    }
}

module.exports = new DatabaseService();