# NeuroMapr Backend API Documentation

**Base URL:** `http://localhost:5000` (Development)  
**Version:** 1.0.0  
**Last Updated:** October 31, 2024

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Rate Limits](#rate-limits)
3. [Error Responses](#error-responses)
4. [Maps API](#maps-api)
5. [Nodes API](#nodes-api)
6. [Assets API](#assets-api)
7. [Health Check](#health-check)

---

## 🔐 Authentication

**Status:** Not yet implemented (handled by Raindrop Auth Kit)

When authentication is added, all requests will require:
```
Authorization: Bearer <token>
```

---

## ⏱️ Rate Limits

All API endpoints are rate-limited to prevent abuse:

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Global (all requests) | 100 requests | 15 minutes |
| Map/Node Creation | 20 requests | 1 hour |
| File Uploads | 10 requests | 1 hour |

**Rate Limit Headers:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1698765432
```

**Rate Limit Exceeded Response:**
```json
{
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": "15 minutes"
}
```

---

## ❌ Error Responses

### Standard Error Format

```json
{
  "error": "Error message description"
}
```

### Validation Error Format

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "userId",
      "message": "userId must be a valid UUID"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

## 🗺️ Maps API

### Create Map

Creates a new mind map/museum.

**Endpoint:** `POST /api/maps`

**Request Body:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Neural Networks Study",
  "description": "My exploration of neural network concepts"
}
```

**Required Fields:**
- `userId` (UUID) - User who owns the map
- `title` (string, 1-255 chars) - Map title

**Optional Fields:**
- `description` (string, max 1000 chars) - Map description

**Response:** `201 Created`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Neural Networks Study",
  "description": "My exploration of neural network concepts",
  "thumbnail_url": null,
  "is_public": false,
  "created_at": "2024-10-31T10:30:45.123Z",
  "updated_at": "2024-10-31T10:30:45.123Z"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:5000/api/maps \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Neural Networks Study",
    "description": "My exploration of neural network concepts"
  }'
```

**Example (JavaScript):**
```javascript
const response = await fetch('http://localhost:5000/api/maps', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Neural Networks Study',
    description: 'My exploration of neural network concepts'
  })
});
const map = await response.json();
```

---

### Get Map by ID

Retrieves a complete map with all nodes and edges.

**Endpoint:** `GET /api/maps/:id`

**URL Parameters:**
- `id` (UUID) - Map ID

**Response:** `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Neural Networks Study",
  "description": "My exploration of neural network concepts",
  "thumbnail_url": "https://storage.com/thumbnails/123.jpg",
  "is_public": false,
  "created_at": "2024-10-31T10:30:45.123Z",
  "updated_at": "2024-10-31T10:30:45.123Z",
  "nodes": [
    {
      "id": "node-uuid-1",
      "concept": "Perceptron",
      "description": "Basic building block of neural networks",
      "artwork_url": "https://storage.com/artwork/node-1.png",
      "narration_url": "https://storage.com/narration/node-1.mp3",
      "position_x": 0,
      "position_y": 0,
      "position_z": 0,
      "emotion": "curious",
      "created_at": "2024-10-31T10:31:00.000Z"
    }
  ],
  "edges": [
    {
      "id": "edge-uuid-1",
      "source_node_id": "node-uuid-1",
      "target_node_id": "node-uuid-2",
      "relationship_type": "leads_to",
      "strength": 1.0
    }
  ]
}
```

**Example (curl):**
```bash
curl http://localhost:5000/api/maps/123e4567-e89b-12d3-a456-426614174000
```

**Example (JavaScript):**
```javascript
const response = await fetch(`http://localhost:5000/api/maps/${mapId}`);
const map = await response.json();
```

---

### Get User's Maps

Retrieves all maps for a specific user.

**Endpoint:** `GET /api/maps/user/:userId`

**URL Parameters:**
- `userId` (UUID) - User ID

**Response:** `200 OK`
```json
[
  {
    "id": "map-uuid-1",
    "title": "Neural Networks Study",
    "description": "...",
    "thumbnail_url": "...",
    "created_at": "2024-10-31T10:30:45.123Z",
    "updated_at": "2024-10-31T10:30:45.123Z"
  },
  {
    "id": "map-uuid-2",
    "title": "Philosophy Notes",
    "description": "...",
    "thumbnail_url": "...",
    "created_at": "2024-10-30T09:15:30.000Z",
    "updated_at": "2024-10-30T09:15:30.000Z"
  }
]
```

**Example (curl):**
```bash
curl http://localhost:5000/api/maps/user/550e8400-e29b-41d4-a716-446655440000
```

---

### Update Map

Updates map metadata.

**Endpoint:** `PUT /api/maps/:id`

**URL Parameters:**
- `id` (UUID) - Map ID

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "thumbnailUrl": "https://storage.com/new-thumbnail.jpg",
  "isPublic": true
}
```

**Response:** `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Updated Title",
  "description": "Updated description",
  "thumbnail_url": "https://storage.com/new-thumbnail.jpg",
  "is_public": true,
  "updated_at": "2024-10-31T11:00:00.000Z"
}
```

---

### Delete Map

Deletes a map and all associated nodes/edges.

**Endpoint:** `DELETE /api/maps/:id`

**URL Parameters:**
- `id` (UUID) - Map ID

**Response:** `200 OK`
```json
{
  "message": "Map deleted successfully"
}
```

**Example (curl):**
```bash
curl -X DELETE http://localhost:5000/api/maps/123e4567-e89b-12d3-a456-426614174000
```

---

## 🔵 Nodes API

### Create Node

Creates a new concept node in a map.

**Endpoint:** `POST /api/nodes`

**Request Body:**
```json
{
  "mapId": "123e4567-e89b-12d3-a456-426614174000",
  "concept": "Backpropagation",
  "description": "Algorithm for training neural networks",
  "artworkUrl": "https://storage.com/artwork/node-2.png",
  "narrationUrl": "https://storage.com/narration/node-2.mp3",
  "positionX": 5.0,
  "positionY": 2.0,
  "positionZ": 0.0,
  "stylePrompt": "Abstract visualization of gradient descent",
  "emotion": "focused"
}
```

**Required Fields:**
- `mapId` (UUID) - Parent map ID
- `concept` (string, 1-255 chars) - Concept name

**Optional Fields:**
- `description` (string, max 2000 chars)
- `artworkUrl` (string) - URL to artwork image
- `narrationUrl` (string) - URL to narration audio
- `positionX`, `positionY`, `positionZ` (float) - 3D coordinates
- `stylePrompt` (string) - Prompt used for art generation
- `emotion` (string, max 100 chars) - Emotional tone

**Response:** `201 Created`
```json
{
  "id": "node-uuid-2",
  "map_id": "123e4567-e89b-12d3-a456-426614174000",
  "concept": "Backpropagation",
  "description": "Algorithm for training neural networks",
  "artwork_url": "https://storage.com/artwork/node-2.png",
  "narration_url": "https://storage.com/narration/node-2.mp3",
  "position_x": 5.0,
  "position_y": 2.0,
  "position_z": 0.0,
  "style_prompt": "Abstract visualization of gradient descent",
  "emotion": "focused",
  "created_at": "2024-10-31T10:35:00.000Z",
  "updated_at": "2024-10-31T10:35:00.000Z"
}
```

**Example (JavaScript):**
```javascript
const response = await fetch('http://localhost:5000/api/nodes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mapId: '123e4567-e89b-12d3-a456-426614174000',
    concept: 'Backpropagation',
    description: 'Algorithm for training neural networks',
    positionX: 5.0,
    positionY: 2.0,
    positionZ: 0.0
  })
});
const node = await response.json();
```

---

### Get Node by ID

Retrieves a single node.

**Endpoint:** `GET /api/nodes/:id`

**URL Parameters:**
- `id` (UUID) - Node ID

**Response:** `200 OK`
```json
{
  "id": "node-uuid-1",
  "map_id": "map-uuid-1",
  "concept": "Perceptron",
  "description": "Basic building block",
  "artwork_url": "https://storage.com/artwork/node-1.png",
  "narration_url": "https://storage.com/narration/node-1.mp3",
  "position_x": 0,
  "position_y": 0,
  "position_z": 0,
  "emotion": "curious",
  "created_at": "2024-10-31T10:31:00.000Z"
}
```

---

### Get Nodes for Map

Retrieves all nodes in a map.

**Endpoint:** `GET /api/nodes/map/:mapId`

**URL Parameters:**
- `mapId` (UUID) - Map ID

**Response:** `200 OK`
```json
[
  {
    "id": "node-uuid-1",
    "concept": "Perceptron",
    "description": "...",
    "position_x": 0,
    "position_y": 0,
    "position_z": 0
  },
  {
    "id": "node-uuid-2",
    "concept": "Backpropagation",
    "description": "...",
    "position_x": 5,
    "position_y": 2,
    "position_z": 0
  }
]
```

---

### Update Node

Updates node data.

**Endpoint:** `PUT /api/nodes/:id`

**URL Parameters:**
- `id` (UUID) - Node ID

**Request Body:** (all fields optional)
```json
{
  "concept": "Updated Concept",
  "description": "Updated description",
  "artworkUrl": "https://storage.com/new-artwork.png",
  "positionX": 10.0
}
```

**Response:** `200 OK` (returns updated node)

---

### Delete Node

Deletes a node.

**Endpoint:** `DELETE /api/nodes/:id`

**URL Parameters:**
- `id` (UUID) - Node ID

**Response:** `200 OK`
```json
{
  "message": "Node deleted successfully"
}
```

---

### Create Edge (Relationship)

Creates a relationship between two nodes.

**Endpoint:** `POST /api/nodes/edges`

**Request Body:**
```json
{
  "mapId": "map-uuid-1",
  "sourceNodeId": "node-uuid-1",
  "targetNodeId": "node-uuid-2",
  "relationshipType": "leads_to",
  "strength": 0.8
}
```

**Required Fields:**
- `mapId` (UUID)
- `sourceNodeId` (UUID)
- `targetNodeId` (UUID)

**Optional Fields:**
- `relationshipType` (string) - e.g., "leads_to", "related_to", "causes"
- `strength` (float, 0-1) - Connection strength

**Response:** `201 Created`
```json
{
  "id": "edge-uuid-1",
  "map_id": "map-uuid-1",
  "source_node_id": "node-uuid-1",
  "target_node_id": "node-uuid-2",
  "relationship_type": "leads_to",
  "strength": 0.8,
  "created_at": "2024-10-31T10:40:00.000Z"
}
```

---

## 📁 Assets API

### Upload Artwork

Uploads artwork image for a node.

**Endpoint:** `POST /api/assets/artwork/:nodeId`

**URL Parameters:**
- `nodeId` (UUID) - Node ID

**Request:** `multipart/form-data`
- Field name: `artwork`
- Allowed types: `image/jpeg`, `image/png`, `image/webp`
- Max size: 10MB

**Response:** `200 OK`
```json
{
  "url": "https://ewr1.vultrobjects.com/neuromapr-assets/artwork/node-uuid-1.png",
  "nodeId": "node-uuid-1"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:5000/api/assets/artwork/node-uuid-1 \
  -F "artwork=@/path/to/image.png"
```

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('artwork', fileInput.files[0]);

const response = await fetch(`http://localhost:5000/api/assets/artwork/${nodeId}`, {
  method: 'POST',
  body: formData
});
const result = await response.json();
```

---

### Upload Narration

Uploads narration audio for a node.

**Endpoint:** `POST /api/assets/narration/:nodeId`

**URL Parameters:**
- `nodeId` (UUID) - Node ID

**Request:** `multipart/form-data`
- Field name: `narration`
- Allowed types: `audio/mpeg`, `audio/mp3`, `audio/wav`
- Max size: 10MB

**Response:** `200 OK`
```json
{
  "url": "https://ewr1.vultrobjects.com/neuromapr-assets/narration/node-uuid-1.mp3",
  "nodeId": "node-uuid-1"
}
```

---

### Upload Thumbnail

Uploads thumbnail for a map.

**Endpoint:** `POST /api/assets/thumbnail/:mapId`

**URL Parameters:**
- `mapId` (UUID) - Map ID

**Request:** `multipart/form-data`
- Field name: `thumbnail`
- Allowed types: `image/jpeg`, `image/png`, `image/webp`
- Max size: 10MB

**Response:** `200 OK`
```json
{
  "url": "https://ewr1.vultrobjects.com/neuromapr-assets/thumbnails/map-uuid-1.jpg",
  "mapId": "map-uuid-1"
}
```

---

### Check File Exists

Checks if a file exists in storage.

**Endpoint:** `GET /api/assets/exists/:key`

**URL Parameters:**
- `key` (string) - File key (e.g., `artwork/node-uuid-1.png`)

**Response:** `200 OK`
```json
{
  "exists": true,
  "key": "artwork/node-uuid-1.png"
}
```

---

### Get Presigned URL

Generates a temporary URL for file access.

**Endpoint:** `GET /api/assets/presigned/:key`

**URL Parameters:**
- `key` (string) - File key

**Query Parameters:**
- `expiresIn` (number, optional) - Expiration in seconds (default: 3600)

**Response:** `200 OK`
```json
{
  "url": "https://ewr1.vultrobjects.com/neuromapr-assets/artwork/node-1.png?signature=...",
  "key": "artwork/node-1.png",
  "expiresIn": 3600
}
```

---

### Delete File

Deletes a file from storage.

**Endpoint:** `DELETE /api/assets/:key`

**URL Parameters:**
- `key` (string) - File key

**Response:** `200 OK`
```json
{
  "message": "File deleted successfully",
  "key": "artwork/node-1.png"
}
```

---

## 🏥 Health Check

### Health Status

Check if the API is running.

**Endpoint:** `GET /health`

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2024-10-31T10:30:45.123Z"
}
```

**Example (curl):**
```bash
curl http://localhost:5000/health
```

---

## 🔄 Real-Time Updates

The API publishes real-time updates via Redis pub/sub on the `map:updates` channel.

**Event Format:**
```json
{
  "mapId": "map-uuid-1",
  "action": "node_added",
  "nodeId": "node-uuid-2"
}
```

**Actions:**
- `node_added` - New node created
- `node_updated` - Node modified
- `node_deleted` - Node removed

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- All IDs are UUIDv4 format
- File uploads use multipart/form-data
- Responses use snake_case for database fields
- Requests accept camelCase or snake_case

---

## 🐛 Common Issues

### 400 Bad Request
- Check that all required fields are present
- Verify UUIDs are valid format
- Ensure field lengths are within limits

### 404 Not Found
- Verify the resource ID exists
- Check that the resource hasn't been deleted

### 429 Too Many Requests
- Wait for the rate limit window to reset
- Check `RateLimit-Reset` header for reset time

### 500 Internal Server Error
- Check server logs for details
- Verify database and cache connections
- Ensure Object Storage is accessible

---

**Need Help?** Contact the backend team or check the integration guide.
