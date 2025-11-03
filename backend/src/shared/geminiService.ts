/**
 * Gemini AI Service
 * Handles AI-powered concept extraction and image prompt generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface Concept {
    name: string;
    description: string;
    emotion: string;
    stylePrompt: string;
}

export interface Relationship {
    from: string;
    to: string;
    type: string;
    strength: number;
}

export interface ConceptGraph {
    title: string;
    summary?: string;
    concepts: Concept[];
    relationships: Relationship[];
}

/**
 * Parse user input into a structured concept graph
 */
export async function parseConceptGraph(userInput: string): Promise<ConceptGraph> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are an AI that extracts concepts and relationships from text to create educational mind maps.

Parse this input into a concept graph with nodes and edges:
"${userInput}"

Return ONLY valid JSON in this EXACT format (no markdown, no explanation):
{
  "title": "Brief title for this concept map (max 50 chars)",
  "summary": "One sentence summary",
  "concepts": [
    {
      "name": "Concept Name",
      "description": "Clear, educational description (2-3 sentences)",
      "emotion": "curious|focused|analytical|excited|contemplative",
      "stylePrompt": "Detailed visual description for AI art generation"
    }
  ],
  "relationships": [
    {
      "from": "Concept A",
      "to": "Concept B",
      "type": "leads_to|causes|related_to|part_of|enables",
      "strength": 0.8
    }
  ]
}

Rules:
- Extract 3-7 key concepts
- Create meaningful relationships between concepts
- Use educational, clear language
- Style prompts should describe abstract, modern visualizations
- Emotion should match the concept's nature
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response (Gemini sometimes adds markdown)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to extract JSON from Gemini response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Validate structure
        if (!parsed.title || !Array.isArray(parsed.concepts) || !Array.isArray(parsed.relationships)) {
            throw new Error('Invalid concept graph structure');
        }

        return parsed as ConceptGraph;

    } catch (error) {
        console.error('Gemini parsing error:', error);
        throw new Error(`Failed to parse concept graph: ${error.message}`);
    }
}

/**
 * Generate an enhanced image prompt for a concept
 */
export async function generateImagePrompt(concept: string, description: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Create a detailed visual prompt for AI image generation.

Concept: ${concept}
Description: ${description}

Generate a prompt for creating an abstract, educational visualization suitable for a 3D mind museum.

Style requirements:
- Modern, clean, slightly futuristic
- Abstract but recognizable
- Educational and inspiring
- Suitable for holographic display
- Rich colors with good contrast

Return ONLY the image prompt (no explanation, no quotes).
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Image prompt generation error:', error);
        // Fallback to basic prompt
        return `Abstract visualization of ${concept}, modern educational style, holographic effect, vibrant colors`;
    }
}

/**
 * Test Gemini connection
 */
export async function testGeminiConnection(): Promise<boolean> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent('Say "OK" if you can read this.');
        const response = await result.response;
        const text = response.text();
        return text.toLowerCase().includes('ok');
    } catch (error) {
        console.error('Gemini connection test failed:', error);
        return false;
    }
}
