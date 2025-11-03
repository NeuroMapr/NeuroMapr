import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';

export default class extends Service<Env> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check
      if (path === '/' || path === '/health') {
        return Response.json({
          status: 'healthy',
          service: 'neuromapr-api-gateway',
          timestamp: new Date().toISOString()
        }, { headers: corsHeaders });
      }

      // POST /maps/new - Create new concept map
      if (path === '/maps/new' && method === 'POST') {
        const body = await request.json();

        // Validate input
        if (!body.userInput) {
          return Response.json({ error: 'userInput is required' }, {
            status: 400,
            headers: corsHeaders
          });
        }

        if (!body.userId) {
          return Response.json({ error: 'userId is required' }, {
            status: 400,
            headers: corsHeaders
          });
        }

        // Call graph-processor service
        const graphProcessor = this.env['graph-processor'];
        const response = await graphProcessor.fetch(new Request('http://internal/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }));

        const result = await response.json();
        return Response.json(result, {
          status: response.status,
          headers: corsHeaders
        });
      }

      // GET /maps/:id - Get map by ID (proxy to Vultr API)
      if (path.startsWith('/maps/') && method === 'GET') {
        const mapId = path.split('/')[2];
        const vultrApiUrl = process.env.VULTR_API_URL || 'http://localhost:5000';

        const response = await fetch(`${vultrApiUrl}/api/maps/${mapId}`);
        const data = await response.json();

        return Response.json(data, {
          status: response.status,
          headers: corsHeaders
        });
      }

      // GET /users/:id/recent - Get user's recent maps (proxy to Vultr API)
      if (path.match(/^\/users\/[^\/]+\/recent$/) && method === 'GET') {
        const userId = path.split('/')[2];
        const vultrApiUrl = process.env.VULTR_API_URL || 'http://localhost:5000';

        const response = await fetch(`${vultrApiUrl}/api/maps/user/${userId}`);
        const data = await response.json();

        return Response.json(data, {
          status: response.status,
          headers: corsHeaders
        });
      }

      // POST /nodes/:id/media - Generate media for node
      if (path.match(/^\/nodes\/[^\/]+\/media$/) && method === 'POST') {
        const nodeId = path.split('/')[2];
        const body = await request.json();

        // Call media-generator service
        const mediaGenerator = this.env['media-generator'];
        const response = await mediaGenerator.fetch(new Request('http://internal/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodeId, ...body })
        }));

        const result = await response.json();
        return Response.json(result, {
          status: response.status,
          headers: corsHeaders
        });
      }

      // 404 - Not found
      return Response.json({
        error: 'Not found',
        path,
        method,
        availableEndpoints: [
          'POST /maps/new',
          'GET /maps/:id',
          'GET /users/:id/recent',
          'POST /nodes/:id/media',
          'GET /health'
        ]
      }, {
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      console.error('API Gateway error:', error);
      return Response.json({
        error: error.message || 'Internal server error'
      }, {
        status: 500,
        headers: corsHeaders
      });
    }
  }
}
