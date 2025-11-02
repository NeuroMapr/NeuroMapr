import { describe, it, expect } from 'vitest';
import { saveMapSession, getRecentMaps, flushSessionToEpisodic, restoreSession } from './utils';

describe('saveMapSession', () => {
  it('should save map session and return session ID', async () => {
    const request = {
      userId: 'user_123',
      mapId: 'map_abc',
      mapData: {
        title: 'Test Map',
        nodes: [],
        edges: []
      }
    };
    
    const sessionId = await saveMapSession(request);
    
    expect(sessionId).toBeTruthy();
    expect(typeof sessionId).toBe('string');
  });
});

describe('getRecentMaps', () => {
  it('should retrieve recent maps for user', async () => {
    const maps = await getRecentMaps('user_123', 10);
    
    expect(Array.isArray(maps)).toBe(true);
  });

  it('should respect limit parameter', async () => {
    const maps = await getRecentMaps('user_123', 5);
    
    expect(maps.length).toBeLessThanOrEqual(5);
  });

  it('should return maps sorted by creation date descending', async () => {
    const maps = await getRecentMaps('user_123', 10);
    
    if (maps.length > 1) {
      const dates = maps.map(m => new Date(m.createdAt).getTime());
      const sorted = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sorted);
    }
  });
});

describe('flushSessionToEpisodic', () => {
  it('should flush session without errors', async () => {
    await expect(flushSessionToEpisodic('session_123')).resolves.toBeUndefined();
  });
});

describe('restoreSession', () => {
  it('should restore existing session', async () => {
    const session = await restoreSession('session_123');
    
    if (session) {
      expect(session).toHaveProperty('sessionId');
      expect(session).toHaveProperty('userId');
      expect(session).toHaveProperty('data');
    }
  });

  it('should return null for non-existent session', async () => {
    const session = await restoreSession('invalid_session');
    
    expect(session).toBeNull();
  });
});
