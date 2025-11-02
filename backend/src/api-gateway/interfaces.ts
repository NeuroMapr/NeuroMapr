/**
 * Type definitions for API Gateway component
 */

// Request/Response types for POST /maps/new
export interface CreateMapRequest {
  input: string;
  inputType: 'text' | 'voice';
  userId?: string;
  options?: {
    generateMedia?: boolean;
    voiceNarration?: boolean;
    layoutAlgorithm?: 'force-directed' | 'hierarchical' | 'radial';
  };
}

export interface NodePosition {
  x: number;
  y: number;
  z: number;
}

export interface NodeMetadata {
  color: string;
  size: number;
}

export interface NodeMedia {
  image?: string;
  audio?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  conceptType: string;
  emotionalTone: string;
  position: NodePosition;
  metadata: NodeMetadata;
  media?: NodeMedia;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationshipType: string;
  weight: number;
}

export interface CreateMapResponse {
  mapId: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  createdAt: string;
}

// Response types for GET /maps/:id
export interface GetMapResponse {
  mapId: string;
  userId: string;
  title: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  createdAt: string;
  updatedAt: string;
}

// Response types for GET /users/:id/recent
export interface MapSummary {
  mapId: string;
  title: string;
  nodeCount: number;
  edgeCount: number;
  createdAt: string;
}

export interface RecentMapsResponse {
  userId: string;
  maps: MapSummary[];
  total: number;
  hasMore: boolean;
}

// Request/Response types for POST /nodes/:id/media
export interface GenerateMediaRequest {
  mediaTypes: string[];
  imageOptions?: {
    style?: string;
    size?: '256x256' | '512x512' | '1024x1024';
  };
  audioOptions?: {
    voice?: string;
    speed?: number;
  };
}

export interface MediaAsset {
  url: string;
  size?: number;
  duration?: number;
  contentType: string;
}

export interface GenerateMediaResponse {
  nodeId: string;
  media: {
    image?: MediaAsset;
    audio?: MediaAsset;
  };
  generatedAt: string;
}

// Health check response
export interface HealthCheckResponse {
  status: string;
  version: string;
  uptime: number;
  services: {
    database: string;
    storage: string;
    ai: string;
    memory: string;
  };
}

// Error response type
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
