/**
 * Type definitions for Media Generator component
 */

export interface GenerateImageRequest {
  nodeId: string;
  conceptLabel: string;
  conceptType: string;
  style?: string;
  size?: '256x256' | '512x512' | '1024x1024';
}

export interface GenerateAudioRequest {
  nodeId: string;
  conceptLabel: string;
  text: string;
  voice?: string;
  speed?: number;
}

export interface MediaAssetInfo {
  url: string;
  bucketKey: string;
  size: number;
  contentType: string;
  duration?: number;
}

export interface GeneratedMedia {
  nodeId: string;
  image?: MediaAssetInfo;
  audio?: MediaAssetInfo;
}
