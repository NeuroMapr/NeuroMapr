/**
 * Type definitions for Memory Manager component
 */

export interface SessionData {
  sessionId: string;
  userId: string;
  mapId?: string;
  lastActivity: string;
  data: Record<string, unknown>;
}

export interface MapSessionInfo {
  mapId: string;
  title: string;
  nodeCount: number;
  edgeCount: number;
  createdAt: string;
}

export interface SaveSessionRequest {
  userId: string;
  mapId: string;
  mapData: {
    title?: string;
    nodes: unknown[];
    edges: unknown[];
  };
}

export interface GetRecentMapsRequest {
  userId: string;
  limit?: number;
}
