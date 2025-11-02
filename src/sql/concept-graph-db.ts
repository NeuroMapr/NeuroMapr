/**
 * SQL Schema for concept-graph-db (SmartSQL)
 * 
 * This file contains the database schema for storing concept maps,
 * including nodes, edges, and associated media references.
 */

export const schema = `
-- Maps table: stores high-level concept map metadata
CREATE TABLE IF NOT EXISTS maps (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Nodes table: stores individual concepts in the graph
CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  map_id TEXT NOT NULL,
  label TEXT NOT NULL,
  concept_type TEXT,
  emotional_tone TEXT,
  x REAL,
  y REAL,
  z REAL,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE
);

-- Edges table: stores relationships between nodes
CREATE TABLE IF NOT EXISTS edges (
  id TEXT PRIMARY KEY,
  map_id TEXT NOT NULL,
  source_node_id TEXT NOT NULL,
  target_node_id TEXT NOT NULL,
  relationship_type TEXT,
  weight REAL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE,
  FOREIGN KEY (source_node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (target_node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- Node_media table: stores references to generated media assets
CREATE TABLE IF NOT EXISTS node_media (
  id TEXT PRIMARY KEY,
  node_id TEXT NOT NULL,
  media_type TEXT NOT NULL,
  bucket_key TEXT NOT NULL,
  url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- Indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_maps_user_id ON maps(user_id);
CREATE INDEX IF NOT EXISTS idx_maps_created_at ON maps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nodes_map_id ON nodes(map_id);
CREATE INDEX IF NOT EXISTS idx_edges_map_id ON edges(map_id);
CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_node_media_node_id ON node_media(node_id);
`;
