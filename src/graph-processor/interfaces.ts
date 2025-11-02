/**
 * Type definitions for Graph Processor component
 */

export interface ProcessInputRequest {
  input: string;
  inputType: 'text' | 'voice';
  options?: {
    layoutAlgorithm?: 'force-directed' | 'hierarchical' | 'radial';
  };
}

export interface ConceptEntity {
  label: string;
  type: string;
  emotionalTone: string;
}

export interface ConceptRelationship {
  source: string;
  target: string;
  relationshipType: string;
  weight: number;
}

export interface ExtractedConcepts {
  entities: ConceptEntity[];
  relationships: ConceptRelationship[];
}

export interface GraphNodeData {
  id: string;
  label: string;
  conceptType: string;
  emotionalTone: string;
  x: number;
  y: number;
  z: number;
  metadata: string;
}

export interface GraphEdgeData {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipType: string;
  weight: number;
}

export interface ProcessedGraph {
  mapId: string;
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
}
