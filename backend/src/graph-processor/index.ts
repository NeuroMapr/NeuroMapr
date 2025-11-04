import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';
import { parseConceptGraph } from '../shared/geminiService';

export default class extends Service<Env> {
  async fetch(request: Request): Promise<Response> {
    try {
      // Parse request
      const { userInput, userId } = await request.json();

      if (!userInput) {
        return Response.json({ error: 'userInput is required' }, { status: 400 });
      }

      if (!userId) {
        return Response.json({ error: 'userId is required' }, { status: 400 });
      }

      console.log('Processing concept graph for user:', userId);
      console.log('Input:', userInput.substring(0, 100) + '...');

      // 1. Parse with Gemini AI
      console.log('Calling Gemini AI...');
      const conceptGraph = await parseConceptGraph(userInput);
      console.log(`Extracted ${conceptGraph.concepts.length} concepts`);

      // 2. Get Vultr API URL
      const vultrApiUrl = process.env.VULTR_API_URL || 'http://localhost:5000';
      console.log('Vultr API URL:', vultrApiUrl);

      // 3. Create map via Vultr API
      console.log('Creating map...');
      const mapResponse = await fetch(`${vultrApiUrl}/api/maps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: conceptGraph.title,
          description: conceptGraph.summary || ''
        })
      });

      if (!mapResponse.ok) {
        const error = await mapResponse.text();
        throw new Error(`Failed to create map: ${error}`);
      }

      const map = await mapResponse.json();
      console.log('Map created:', map.id);

      // 4. Create nodes via Vultr API
      const nodeIds: Record<string, string> = {};
      const totalConcepts = conceptGraph.concepts.length;

      for (let i = 0; i < totalConcepts; i++) {
        const concept = conceptGraph.concepts[i];

        // Calculate 3D position (circular layout)
        const angle = (i / totalConcepts) * 2 * Math.PI;
        const radius = 5;
        const x = radius * Math.cos(angle);
        const y = 0;
        const z = radius * Math.sin(angle);

        console.log(`Creating node ${i + 1}/${totalConcepts}: ${concept.name}`);

        const nodeResponse = await fetch(`${vultrApiUrl}/api/nodes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mapId: map.id,
            concept: concept.name,
            description: concept.description,
            emotion: concept.emotion,
            stylePrompt: concept.stylePrompt,
            positionX: x,
            positionY: y,
            positionZ: z
          })
        });

        if (!nodeResponse.ok) {
          console.error(`Failed to create node: ${concept.name}`);
          continue;
        }

        const node = await nodeResponse.json();
        nodeIds[concept.name] = node.id;
      }

      console.log(`Created ${Object.keys(nodeIds).length} nodes`);

      // 5. Create edges via Vultr API
      let edgesCreated = 0;
      for (const rel of conceptGraph.relationships) {
        const sourceId = nodeIds[rel.from];
        const targetId = nodeIds[rel.to];

        if (!sourceId || !targetId) {
          console.warn(`Skipping edge: ${rel.from} -> ${rel.to} (node not found)`);
          continue;
        }

        const edgeResponse = await fetch(`${vultrApiUrl}/api/nodes/edges`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mapId: map.id,
            sourceNodeId: sourceId,
            targetNodeId: targetId,
            relationshipType: rel.type,
            strength: rel.strength
          })
        });

        if (edgeResponse.ok) {
          edgesCreated++;
        }
      }

      console.log(`Created ${edgesCreated} edges`);

      // 6. Return success response
      return Response.json({
        success: true,
        mapId: map.id,
        title: conceptGraph.title,
        nodeCount: Object.keys(nodeIds).length,
        edgeCount: edgesCreated,
        message: 'Concept graph created successfully'
      });

    } catch (error) {
      console.error('Graph processing error:', error);
      return Response.json({
        error: error.message || 'Failed to process concept graph',
        details: error.stack
      }, { status: 500 });
    }
  }
}
