import { describe, it, expect } from 'vitest';
import { validateCreateMapRequest, validateGenerateMediaRequest, formatErrorResponse, addCorsHeaders } from './utils';

describe('validateCreateMapRequest', () => {
  it('should accept valid text input request', () => {
    const request = {
      input: 'Machine learning is fascinating',
      inputType: 'text',
      userId: 'user_123'
    };
    
    const result = validateCreateMapRequest(request);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject empty input', () => {
    const request = {
      input: '',
      inputType: 'text'
    };
    
    const result = validateCreateMapRequest(request);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Input is required');
  });

  it('should reject input exceeding 5000 characters', () => {
    const request = {
      input: 'a'.repeat(5001),
      inputType: 'text'
    };
    
    const result = validateCreateMapRequest(request);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Input exceeds maximum length of 5000 characters');
  });

  it('should reject invalid inputType', () => {
    const request = {
      input: 'test',
      inputType: 'invalid'
    };
    
    const result = validateCreateMapRequest(request);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('inputType must be "text" or "voice"');
  });

  it('should accept valid options', () => {
    const request = {
      input: 'test',
      inputType: 'text',
      options: {
        generateMedia: true,
        voiceNarration: false,
        layoutAlgorithm: 'force-directed'
      }
    };
    
    const result = validateCreateMapRequest(request);
    expect(result.valid).toBe(true);
  });
});

describe('validateGenerateMediaRequest', () => {
  it('should accept valid media request', () => {
    const request = {
      mediaTypes: ['image', 'audio'],
      imageOptions: {
        style: 'abstract',
        size: '512x512'
      }
    };
    
    const result = validateGenerateMediaRequest(request);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject empty mediaTypes array', () => {
    const request = {
      mediaTypes: []
    };
    
    const result = validateGenerateMediaRequest(request);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('mediaTypes must contain at least one type');
  });

  it('should reject invalid audio speed', () => {
    const request = {
      mediaTypes: ['audio'],
      audioOptions: {
        speed: 3.0
      }
    };
    
    const result = validateGenerateMediaRequest(request);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('audioOptions.speed must be between 0.5 and 2.0');
  });
});

describe('formatErrorResponse', () => {
  it('should format error response with correct status code', () => {
    const response = formatErrorResponse('Not found', 404);
    
    expect(response.status).toBe(404);
  });

  it('should include error message in response body', async () => {
    const response = formatErrorResponse('Invalid request', 400);
    const body = await response.json();
    
    expect(body.error).toBeDefined();
    expect(body.message).toBe('Invalid request');
    expect(body.statusCode).toBe(400);
  });
});

describe('addCorsHeaders', () => {
  it('should add Access-Control-Allow-Origin header', () => {
    const originalResponse = new Response('test');
    const response = addCorsHeaders(originalResponse);
    
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('should add Access-Control-Allow-Methods header', () => {
    const originalResponse = new Response('test');
    const response = addCorsHeaders(originalResponse);
    
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  it('should add Access-Control-Allow-Headers header', () => {
    const originalResponse = new Response('test');
    const response = addCorsHeaders(originalResponse);
    
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Authorization');
  });
});
