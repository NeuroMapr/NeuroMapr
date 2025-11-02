/**
 * Utility functions for API Gateway
 */

import type { CreateMapRequest } from './interfaces';

/**
 * Validate create map request
 */
export function validateCreateMapRequest(body: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Invalid request body'] };
  }

  const req = body as Partial<CreateMapRequest>;

  if (!req.input || typeof req.input !== 'string') {
    errors.push('Input is required');
  } else if (req.input.length === 0) {
    errors.push('Input is required');
  } else if (req.input.length > 5000) {
    errors.push('Input exceeds maximum length of 5000 characters');
  }

  if (!req.inputType) {
    errors.push('inputType is required');
  } else if (req.inputType !== 'text' && req.inputType !== 'voice') {
    errors.push('inputType must be "text" or "voice"');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate generate media request
 */
export function validateGenerateMediaRequest(body: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Invalid request body'] };
  }

  const req = body as any;

  if (!req.mediaTypes || !Array.isArray(req.mediaTypes)) {
    errors.push('mediaTypes is required and must be an array');
  } else if (req.mediaTypes.length === 0) {
    errors.push('mediaTypes must contain at least one type');
  }

  if (req.audioOptions?.speed !== undefined) {
    const speed = req.audioOptions.speed;
    if (typeof speed === 'number' && (speed < 0.5 || speed > 2.0)) {
      errors.push('audioOptions.speed must be between 0.5 and 2.0');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Format error response
 */
export function formatErrorResponse(message: string, statusCode: number): Response {
  const body = {
    error: 'Error',
    message,
    statusCode
  };

  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
