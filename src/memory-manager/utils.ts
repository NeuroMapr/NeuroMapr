/**
 * Utility functions for Memory Manager
 */

import type { SessionData, MapSessionInfo, SaveSessionRequest } from './interfaces';

// In-memory storage for testing (in production, this would use SmartMemory)
const sessions = new Map<string, SessionData>();
const userMaps = new Map<string, MapSessionInfo[]>();

/**
 * Save map session to working memory
 */
export async function saveMapSession(request: SaveSessionRequest): Promise<string> {
  const sessionId = `session_${crypto.randomUUID().substring(0, 8)}`;

  const sessionData: SessionData = {
    sessionId,
    userId: request.userId,
    mapId: request.mapId,
    lastActivity: new Date().toISOString(),
    data: {
      mapData: request.mapData
    }
  };

  sessions.set(sessionId, sessionData);

  // Also save to user's maps list
  const mapInfo: MapSessionInfo = {
    mapId: request.mapId,
    title: request.mapData.title || 'Untitled Map',
    nodeCount: request.mapData.nodes.length,
    edgeCount: request.mapData.edges.length,
    createdAt: new Date().toISOString()
  };

  const userMapsList = userMaps.get(request.userId) || [];
  userMapsList.unshift(mapInfo);
  userMaps.set(request.userId, userMapsList);

  return sessionId;
}

/**
 * Get recent maps for user from episodic memory
 */
export async function getRecentMaps(userId: string, limit: number): Promise<MapSessionInfo[]> {
  const maps = userMaps.get(userId) || [];
  return maps.slice(0, limit);
}

/**
 * Flush session to episodic memory
 */
export async function flushSessionToEpisodic(sessionId: string): Promise<void> {
  // In production, this would move data from working memory to episodic storage
  // For now, just verify session exists
  const session = sessions.get(sessionId);
  if (session) {
    // Session flushed successfully (no-op for testing)
  }
}

/**
 * Restore session from episodic memory
 */
export async function restoreSession(sessionId: string): Promise<SessionData | null> {
  return sessions.get(sessionId) || null;
}
