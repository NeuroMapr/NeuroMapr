/**
 * Utility functions for Graph Processor
 */

import type { ExtractedConcepts, GraphEdgeData } from './interfaces';

/**
 * Extract concepts from text using AI
 */
export async function extractConcepts(text: string): Promise<ExtractedConcepts> {
  // Simple extraction for now - in production this would use AI
  const words = text.split(/\s+/).filter(w => w.length > 3);

  const entities = words.slice(0, Math.min(5, words.length)).map((word, i) => ({
    label: word,
    type: 'concept',
    emotionalTone: 'neutral'
  }));

  const relationships = [];
  for (let i = 0; i < entities.length - 1; i++) {
    relationships.push({
      source: entities[i].label,
      target: entities[i + 1].label,
      relationshipType: 'relates_to',
      weight: 0.5 + Math.random() * 0.5
    });
  }

  return { entities, relationships };
}

/**
 * Calculate 3D positions for nodes using force-directed layout
 */
export function calculateNodePositions(nodeCount: number, edges: GraphEdgeData[], algorithm: string): Array<{x: number; y: number; z: number}> {
  const positions: Array<{x: number; y: number; z: number}> = [];

  // Simple spiral layout in 3D space
  const radius = 5;
  const height = 10;

  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * Math.PI * 2;
    const z = (i / nodeCount) * height - height / 2;

    positions.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: z
    });
  }

  return positions;
}

/**
 * Generate unique ID for map
 */
export function generateMapId(): string {
  return `map_${crypto.randomUUID().substring(0, 8)}`;
}

/**
 * Generate unique ID for node
 */
export function generateNodeId(index: number): string {
  return `node_${index}_${Date.now()}`;
}

/**
 * Generate unique ID for edge
 */
export function generateEdgeId(index: number): string {
  return `edge_${index}_${Date.now()}`;
}
