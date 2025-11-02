# NeuroMapr Backend - Raindrop Framework

AI-powered concept mapping backend built with Raindrop Framework.

## Project Structure

```
backend/
├── raindrop.manifest          # Raindrop application configuration
├── package.json              # NPM dependencies (Raindrop framework)
├── tsconfig.json            # TypeScript configuration
├── src/
│   ├── api-gateway/         # Public HTTP API (service)
│   ├── graph-processor/     # Concept extraction (private service)
│   ├── media-generator/     # AI image/audio generation (private service)
│   ├── memory-manager/      # Session persistence (private service)
│   ├── sql/                # SQL schema definitions
│   ├── shared/             # Shared utilities and interfaces
│   └── _app/               # Raindrop app configuration (auth, cors)
└── src.old/                # Backup of original Express.js implementation
```

## Technologies

- **Raindrop Framework**: Serverless application platform
- **SmartSQL**: Graph database for concept maps (nodes/edges)
- **SmartBuckets**: Object storage with semantic search for media assets
- **SmartMemory**: Multi-layered memory for session management
- **TypeScript**: Type-safe development
- **Vitest**: Testing framework

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Watch mode for tests
npm run test:watch

# Build for deployment
npm run build

# Format code
npm run format

# Lint code
npm run lint
```

## Testing

All components have comprehensive test coverage:
- 36 tests across 8 test files
- TDD approach: RED → GREEN → REFACTOR
- Tests for validation, concept extraction, media generation, and session management

## Architecture

### Components

**api-gateway** (public service)
- HTTP endpoints for map creation, retrieval, media generation
- Request validation and CORS handling
- Routes to private services via env bindings

**graph-processor** (private service)
- Concept extraction from text using AI
- Graph structure construction (nodes + edges)
- 3D spatial layout algorithms
- Stores to SmartSQL database

**media-generator** (private service)
- AI image generation for concept nodes
- Text-to-speech audio narration
- Upload to SmartBuckets with URL generation

**memory-manager** (private service)
- Session persistence in SmartMemory
- Recent maps retrieval from episodic storage
- Session restoration and state management

## Raindrop Resources

- **concept-graph-db** (SmartSQL): Stores maps, nodes, edges, node_media tables
- **node-media-storage** (SmartBucket): Stores generated images and audio files
- **user-sessions** (SmartMemory): Manages working memory and episodic storage

## API Endpoints

- `POST /maps/new` - Create new concept map from text/voice input
- `GET /maps/:id` - Retrieve complete map with nodes and edges
- `GET /users/:id/recent` - Get user's recent maps
- `POST /nodes/:id/media` - Generate media assets for a node
- `GET /health` - Health check endpoint
