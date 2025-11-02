import { describe, it, expect } from 'vitest';
import { generateConceptImage, generateConceptAudio, uploadToBucket, generateBucketKey } from './utils';

describe('generateConceptImage', () => {
  it('should generate image for concept', async () => {
    const request = {
      nodeId: 'node_1',
      conceptLabel: 'Machine Learning',
      conceptType: 'technology',
      size: '512x512' as const
    };
    
    const result = await generateConceptImage(request);
    
    expect(result).toHaveProperty('url');
    expect(result).toHaveProperty('bucketKey');
    expect(result).toHaveProperty('contentType');
    expect(result.contentType).toBe('image/png');
  });
});

describe('generateConceptAudio', () => {
  it('should generate audio narration', async () => {
    const request = {
      nodeId: 'node_1',
      conceptLabel: 'Neural Networks',
      text: 'Neural networks mimic the brain structure',
      voice: 'default',
      speed: 1.0
    };
    
    const result = await generateConceptAudio(request);
    
    expect(result).toHaveProperty('url');
    expect(result).toHaveProperty('duration');
    expect(result.contentType).toBe('audio/mpeg');
  });
});

describe('uploadToBucket', () => {
  it('should upload data and return URL', async () => {
    const data = new Uint8Array([1, 2, 3]);
    const key = 'test/image.png';
    
    const url = await uploadToBucket(data, key, 'image/png');
    
    expect(url).toBeTruthy();
    expect(url).toContain('http');
  });
});

describe('generateBucketKey', () => {
  it('should generate bucket key with node ID and type', () => {
    const key = generateBucketKey('node_123', 'image');
    
    expect(key).toBeTruthy();
    expect(key).toContain('node_123');
    expect(key).toContain('image');
  });
});
