# NeuroMapr Backend Integration Guide

**For:** Raindrop Smart Components Integration  
**Last Updated:** October 31, 2024

---

## 🎯 Overview

This guide explains how to integrate Raindrop Smart Components (SmartInference, SmartMemory, etc.) with the NeuroMapr Vultr backend.

---

## 🏗️ Architecture

```
User Input
    ↓
SmartInference (Parse thoughts → concept graph)
    ↓
Your Raindrop Backend
    ↓
NeuroMapr Vultr API (Store in PostgreSQL + Object Storage)
    ↓
Frontend (React Three Fiber visualization)
```

---

## 📊 Data Flow: Creating a Mind Map

### Step 1: User Input
User says: *"Explain neural networks to me"*

### Step 2: SmartInference Processing
Your code calls SmartInference to parse this into structured concepts:

```json
{
  "concepts": [
    {
      "name": "Perceptron",
      "description": "Basic building block of neural networks",
      "emotion": "curious",
      "stylePrompt": "Simple neuron diagram with inputs and outputs"
    },
    {
      "name": "Backpropagation",
      "description": "Algorithm for training neural networks",
      "emotion": "focused",
      "stylePrompt": "Abstract visualization of gradient descent"
    },
    {
      "name": "Activation Functions",
      "description": "Non-linear transformations in neural networks",
      "emotion": "analytical",
      "stylePrompt": "Mathematical curves showing sigmoid, ReLU, tanh"
    }
  ],
  "relationships": [
    {
      "from": "Perceptron",
      "to": "Backpropagation",
      "type": "leads_to",
      "strength": 0.9
    },
    {
      "from": "Perceptron",
      "to": "Activation Functions",
      "type": "uses",
      "strength": 0.8
    }
  ]
}
```

### Step 3: Create Map via Vultr API

```javascript
// 1. Create the map
const mapResponse = await fetch('http://localhost:5000/api/maps', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    title: 'Neural Networks Study',
    description: 'AI-generated exploration of neural network concepts'
  })
});
const map = await mapResponse.json();
const mapId = map.id;
```

### Step 4: Create Nodes

```javascript
// 2. Create nodes for each concept
const nodeIds = {};

for (const concept of concepts) {
  const nodeResponse = await fetch('http://localhost:5000/api/nodes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mapId: mapId,
      concept: concept.name,
      description: concept.description,
      emotion: concept.emotion,
      stylePrompt: concept.stylePrompt,
      positionX: calculatePosition(concept).x, // Your layout algorithm
      positionY: calculatePosition(concept).y,
      positionZ: 0
    })
  });
  
  const node = await nodeResponse.json();
  nodeIds[concept.name] = node.id;
}
```

### Step 5: Create Relationships (Edges)

```javascript
// 3. Create edges between nodes
for (const rel of relationships) {
  await fetch('http://localhost:5000/api/nodes/edges', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mapId: mapId,
      sourceNodeId: nodeIds[rel.from],
      targetNodeId: nodeIds[rel.to],
      relationshipType: rel.type,
      strength: rel.strength
    })
  });
}
```

### Step 6: Generate & Upload Assets

```javascript
// 4. Generate artwork for each node (using your AI image generation)
for (const [conceptName, nodeId] of Object.entries(nodeIds)) {
  const concept = concepts.find(c => c.name === conceptName);
  
  // Generate artwork using Stable Diffusion or similar
  const artworkBuffer = await generateArtwork(concept.stylePrompt);
  
  // Upload to Vultr Object Storage
  const formData = new FormData();
  formData.append('artwork', new Blob([artworkBuffer]), 'artwork.png');
  
  const uploadResponse = await fetch(`http://localhost:5000/api/assets/artwork/${nodeId}`, {
    method: 'POST',
    body: formData
  });
  
  const { url: artworkUrl } = await uploadResponse.json();
  
  // Update node with artwork URL
  await fetch(`http://localhost:5000/api/nodes/${nodeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artworkUrl })
  });
}
```

### Step 7: Generate & Upload Narrations

```javascript
// 5. Generate narrations using ElevenLabs
for (const [conceptName, nodeId] of Object.entries(nodeIds)) {
  const concept = concepts.find(c => c.name === conceptName);
  
  // Generate narration using ElevenLabs
  const narrationBuffer = await generateNarration(concept.description);
  
  // Upload to Vultr Object Storage
  const formData = new FormData();
  formData.append('narration', new Blob([narrationBuffer]), 'narration.mp3');
  
  const uploadResponse = await fetch(`http://localhost:5000/api/assets/narration/${nodeId}`, {
    method: 'POST',
    body: formData
  });
  
  const { url: narrationUrl } = await uploadResponse.json();
  
  // Update node with narration URL
  await fetch(`http://localhost:5000/api/nodes/${nodeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ narrationUrl })
  });
}
```

### Step 8: Return Complete Map

```javascript
// 6. Fetch complete map with all nodes and edges
const completeMapResponse = await fetch(`http://localhost:5000/api/maps/${mapId}`);
const completeMap = await completeMapResponse.json();

// Return to frontend for 3D visualization
return completeMap;
```

---

## 🔄 SmartMemory Integration

### Storing User Session

```javascript
// When user logs in or starts session
await cacheService.setUserSession(userId, {
  lastMapId: mapId,
  preferences: {
    narrationVoice: 'alloy',
    autoGenerateArt: true
  },
  learningProgress: {
    mapsCreated: 5,
    conceptsExplored: 23
  }
});
```

### Retrieving User Context

```javascript
// When user returns
const session = await cacheService.getUserSession(userId);

if (session && session.lastMapId) {
  // Load their last map
  const lastMap = await fetch(`http://localhost:5000/api/maps/${session.lastMapId}`);
  // Show "Continue where you left off"
}
```

### Tracking Last Visited Maps

```javascript
// When user views a map
const lastMaps = await cacheService.getLastMaps(userId);
lastMaps.unshift(mapId); // Add to front
await cacheService.setLastMaps(userId, lastMaps.slice(0, 5)); // Keep last 5
```

---

## 🔐 Authentication Flow (WorkOS via Raindrop Auth Kit)

### Expected Flow

1. User logs in via WorkOS (Google/GitHub)
2. Raindrop Auth Kit returns user token
3. Your backend validates token
4. You call Vultr API with userId

### What We Need from You

When authentication is implemented, we'll need:

```javascript
// Middleware to extract userId from token
const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  // Validate with WorkOS/Raindrop
  const user = await validateToken(token);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.userId = user.id;
  next();
};
```

Then we'll add it to routes:
```javascript
app.use('/api/maps', authenticateUser, mapsRoutes);
```

---

## 📡 Real-Time Collaboration

### Publishing Updates

When you create/update nodes, the Vultr API automatically publishes to Redis:

```javascript
// This happens automatically in our API
await cache.publish('map:updates', {
  mapId: 'map-uuid-1',
  action: 'node_added',
  nodeId: 'node-uuid-2'
});
```

### Subscribing to Updates

In your Raindrop backend:

```javascript
const cacheService = require('./services/cacheService');

// Subscribe to map updates
const subscriber = await cacheService.subscribe('map:updates', (message) => {
  console.log('Map updated:', message);
  // Notify connected clients via WebSocket
  io.to(message.mapId).emit('map_update', message);
});
```

---

## 🎨 Layout Algorithm Suggestion

For positioning nodes in 3D space:

```javascript
function calculatePosition(concept, index, total) {
  // Circular layout
  const radius = 10;
  const angle = (index / total) * 2 * Math.PI;
  
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
    z: 0
  };
}

// Or hierarchical layout
function calculateHierarchicalPosition(concept, level, indexInLevel) {
  return {
    x: indexInLevel * 5,
    y: level * 3,
    z: 0
  };
}
```

---

## 🐛 Error Handling

### Handle API Errors

```javascript
async function createMap(userId, title, description) {
  try {
    const response = await fetch('http://localhost:5000/api/maps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, description })
    });
    
    if (!response.ok) {
      const error = await response.json();
      
      if (response.status === 400) {
        // Validation error
        console.error('Validation failed:', error.details);
        throw new Error('Invalid input data');
      } else if (response.status === 429) {
        // Rate limited
        console.error('Rate limited:', error.retryAfter);
        throw new Error('Too many requests, please wait');
      } else {
        throw new Error('Failed to create map');
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating map:', error);
    throw error;
  }
}
```

---

## 🔗 Environment Variables

### Your Raindrop Backend Needs

```env
# Vultr Backend URL
VULTR_API_URL=http://localhost:5000

# Or in production
VULTR_API_URL=https://api.neuromapr.com
```

### Our Backend Has

```env
# Your frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Vultr services (already configured)
VULTR_DB_HOST=...
VULTR_REDIS_HOST=...
VULTR_S3_ENDPOINT=...
```

---

## 📦 Complete Example: End-to-End Flow

```javascript
// Complete function to create a mind map from user input
async function createMindMap(userId, userInput) {
  // 1. Parse with SmartInference
  const conceptGraph = await smartInference.parse(userInput);
  
  // 2. Create map
  const map = await fetch('http://localhost:5000/api/maps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      title: conceptGraph.title || 'New Mind Map',
      description: conceptGraph.summary
    })
  }).then(r => r.json());
  
  // 3. Create nodes
  const nodeIds = {};
  for (let i = 0; i < conceptGraph.concepts.length; i++) {
    const concept = conceptGraph.concepts[i];
    const position = calculatePosition(concept, i, conceptGraph.concepts.length);
    
    const node = await fetch('http://localhost:5000/api/nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mapId: map.id,
        concept: concept.name,
        description: concept.description,
        emotion: concept.emotion,
        stylePrompt: concept.stylePrompt,
        ...position
      })
    }).then(r => r.json());
    
    nodeIds[concept.name] = node.id;
  }
  
  // 4. Create edges
  for (const rel of conceptGraph.relationships) {
    await fetch('http://localhost:5000/api/nodes/edges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mapId: map.id,
        sourceNodeId: nodeIds[rel.from],
        targetNodeId: nodeIds[rel.to],
        relationshipType: rel.type,
        strength: rel.strength
      })
    });
  }
  
  // 5. Generate assets (async, don't wait)
  generateAssetsAsync(nodeIds, conceptGraph.concepts);
  
  // 6. Return map immediately (assets will be added later)
  return await fetch(`http://localhost:5000/api/maps/${map.id}`).then(r => r.json());
}

async function generateAssetsAsync(nodeIds, concepts) {
  for (const concept of concepts) {
    const nodeId = nodeIds[concept.name];
    
    // Generate and upload artwork
    const artwork = await generateArtwork(concept.stylePrompt);
    const artworkFormData = new FormData();
    artworkFormData.append('artwork', artwork);
    const artworkResult = await fetch(`http://localhost:5000/api/assets/artwork/${nodeId}`, {
      method: 'POST',
      body: artworkFormData
    }).then(r => r.json());
    
    // Generate and upload narration
    const narration = await generateNarration(concept.description);
    const narrationFormData = new FormData();
    narrationFormData.append('narration', narration);
    const narrationResult = await fetch(`http://localhost:5000/api/assets/narration/${nodeId}`, {
      method: 'POST',
      body: narrationFormData
    }).then(r => r.json());
    
    // Update node with URLs
    await fetch(`http://localhost:5000/api/nodes/${nodeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artworkUrl: artworkResult.url,
        narrationUrl: narrationResult.url
      })
    });
  }
}
```

---

## 🤝 Coordination Points

### What We Need to Agree On

1. **User ID Format**: UUID or WorkOS ID?
2. **Concept Graph JSON Structure**: Finalize the exact format
3. **Error Handling**: How to handle partial failures?
4. **Asset Generation**: Sync or async?
5. **Deployment**: How do Raindrop MCP Server and Vultr backend communicate?

### Next Steps

1. Review this integration guide
2. Test creating a map with sample data
3. Define the exact SmartInference output format
4. Implement authentication flow
5. Test end-to-end with real data

---

## 📞 Contact

Questions? Reach out to coordinate on:
- API contract details
- Authentication flow
- Deployment strategy
- Testing approach

---

**Let's build something amazing! 🚀**
