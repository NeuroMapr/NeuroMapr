import { describe, it, expect } from 'vitest';
import { extractConcepts, calculateNodePositions, generateMapId, generateNodeId, generateEdgeId } from './utils';

describe('extractConcepts', () => {
  it('should extract entities from text', async () => {
    const text = 'Machine learning enables computers to learn. Neural networks mimic the brain.';
    
    const result = await extractConcepts(text);
    
    expect(result.entities).toBeDefined();
    expect(result.entities.length).toBeGreaterThan(0);
    expect(result.entities[0]).toHaveProperty('label');
    expect(result.entities[0]).toHaveProperty('type');
    expect(result.entities[0]).toHaveProperty('emotionalTone');
  });

  it('should extract relationships between entities', async () => {
    const text = 'Deep learning uses neural networks for pattern recognition.';
    
    const result = await extractConcepts(text);
    
    expect(result.relationships).toBeDefined();
    expect(result.relationships.length).toBeGreaterThan(0);
    expect(result.relationships[0]).toHaveProperty('source');
    expect(result.relationships[0]).toHaveProperty('target');
    expect(result.relationships[0]).toHaveProperty('relationshipType');
    expect(result.relationships[0]).toHaveProperty('weight');
  });
});

describe('calculateNodePositions', () => {
  it('should calculate positions for nodes in 3D space', () => {
    const edges = [
      { id: 'edge_1', sourceNodeId: 'node_1', targetNodeId: 'node_2', relationshipType: 'uses', weight: 0.8 }
    ];
    
    const positions = calculateNodePositions(2, edges, 'force-directed');
    
    expect(positions).toHaveLength(2);
    expect(positions[0]).toHaveProperty('x');
    expect(positions[0]).toHaveProperty('y');
    expect(positions[0]).toHaveProperty('z');
  });

  it('should distribute nodes evenly in space', () => {
    const edges: any[] = [];
    const positions = calculateNodePositions(5, edges, 'force-directed');
    
    expect(positions).toHaveLength(5);
    // Verify positions are not all at origin
    const nonZeroCount = positions.filter(p => p.x !== 0 || p.y !== 0 || p.z !== 0).length;
    expect(nonZeroCount).toBeGreaterThan(0);
  });
});

describe('generateMapId', () => {
  it('should generate unique map ID', () => {
    const id1 = generateMapId();
    const id2 = generateMapId();
    
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });

  it('should generate ID with map_ prefix', () => {
    const id = generateMapId();
    
    expect(id).toMatch(/^map_/);
  });
});

describe('generateNodeId', () => {
  it('should generate node ID with index', () => {
    const id = generateNodeId(1);
    
    expect(id).toBeTruthy();
    expect(id).toMatch(/^node_/);
  });
});

describe('generateEdgeId', () => {
  it('should generate edge ID with index', () => {
    const id = generateEdgeId(1);
    
    expect(id).toBeTruthy();
    expect(id).toMatch(/^edge_/);
  });
});
