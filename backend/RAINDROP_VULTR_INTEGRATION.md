# Raindrop + Vultr Integration Guide

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────┐
│         Raindrop Services               │
│         (src/)                          │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  api-gateway (PUBLIC)            │  │
│  │  - Routes requests               │  │
│  │  - Handles CORS                  │  │
│  └──────────────────────────────────┘  │
│              │                          │
│              ↓                          │
│  ┌──────────────────────────────────┐  │
│  │  graph-processor (PRIVATE)       │  │
│  │  - Gemini AI parsing             │  │
│  │  - Calls Vultr API               │  │
│  └──────────────────────────────────┘  │
│              │                          │
└──────────────┼──────────────────────────┘
               │ HTTP calls
               ↓
┌─────────────────────────────────────────┐
│         Vultr REST API                  │
│         (src.old/)                      │
│                                         │
│  - POST /api/maps                      │
│  - POST /api/nodes                     │
│  - POST /api/nodes/edges               │
│  - GET  /api/maps/:id                  │
│                                         │
└─────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│      Vultr Infrastructure               │
│                                         │
│  - PostgreSQL (data storage)           │
│  - Valkey (caching)                    │
│  - Object Storage (media files)        │
└─────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### **Step 1: Start Vultr Backend**

```bash
# Terminal 1: Start your Vultr API
cd backend
node src.old/index.js

# Should see:
# ✅ Cache service initialized
# ✅ Server running on port 5000
```

### **Step 2: Set Environment Variables**

Create/update `backend/.env`:

```env
# Vultr Services (already configured)
VULTR_DB_HOST=your-db-host.vultrdb.com
VULTR_DB_PORT=16751
VULTR_DB_NAME=defaultdb
VULTR_DB_USER=vultradmin
VULTR_DB_PASSWORD=your_password
VULTR_REDIS_HOST=your-redis-host.vultrdb.com
VULTR_REDIS_PORT=16752
VULTR_REDIS_PASSWORD=your_redis_password
VULTR_S3_ENDPOINT=https://ewr1.vultrobjects.com
VULTR_S3_ACCESS_KEY=your_access_key
VULTR_S3_SECRET_KEY=your_secret_key
VULTR_S3_BUCKET=neuromapr-assets

# NEW: Raindrop Integration
VULTR_API_URL=http://localhost:5000
GEMINI_API_KEY=AIza_your_gemini_key_here

# Frontend
FRONTEND_URL=http://localhost:3000
```

### **Step 3: Install Dependencies**

```bash
cd backend
npm install @google/generative-ai
```

### **Step 4: Test Integration**

```bash
node test-raindrop-integration.js
```

Expected output:
```
✅ Vultr API is healthy
✅ Gemini AI is working
✅ Parsed concept graph
✅ Map created
✅ Node created
✅ Retrieved complete map
🎉 Raindrop + Vultr integration is working!
```

---

## 📋 How It Works

### **1. User Creates a Map**

**Request to Raindrop:**
```bash
POST https://your-raindrop-app.raindrop.ai/maps/new
Content-Type: application/json

{
  "userId": "user-123",
  "userInput": "Explain neural networks and how they learn"
}
```

**What Happens:**

1. **api-gateway** receives request
2. Routes to **graph-processor** service
3. **graph-processor**:
   - Calls Gemini AI to parse input
   - Gets concept graph (nodes + edges)
   - Calls Vultr API to create map
   - Calls Vultr API to create nodes
   - Calls Vultr API to create edges
4. Returns map ID and summary

**Response:**
```json
{
  "success": true,
  "mapId": "map-uuid-123",
  "title": "Neural Networks",
  "nodeCount": 5,
  "edgeCount": 4
}
```

---

### **2. Frontend Gets Map**

**Request:**
```bash
GET https://your-raindrop-app.raindrop.ai/maps/map-uuid-123
```

**What Happens:**

1. **api-gateway** receives request
2. Proxies to Vultr API: `GET http://localhost:5000/api/maps/map-uuid-123`
3. Vultr API queries PostgreSQL
4. Returns complete map with nodes and edges

**Response:**
```json
{
  "id": "map-uuid-123",
  "title": "Neural Networks",
  "nodes": [
    {
      "id": "node-1",
      "concept": "Perceptron",
      "description": "...",
      "position_x": 0,
      "position_y": 0,
      "position_z": 0
    }
  ],
  "edges": [
    {
      "source_node_id": "node-1",
      "target_node_id": "node-2",
      "relationship_type": "leads_to"
    }
  ]
}
```

---

## 🔧 Configuration

### **Raindrop Environment Variables**

Set these in your Raindrop deployment:

```env
VULTR_API_URL=https://your-vultr-backend.com:5000
GEMINI_API_KEY=AIza_your_key
```

### **Vultr Backend Environment Variables**

Already configured in `src.old/.env`:

```env
VULTR_DB_HOST=...
VULTR_REDIS_HOST=...
VULTR_S3_ENDPOINT=...
RAINDROP_URL=https://*.raindrop.ai  # Allow Raindrop to call API
```

---

## 🧪 Testing

### **Test Vultr API Directly**

```bash
# Create map
curl -X POST http://localhost:5000/api/maps \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-123","title":"Test Map"}'

# Get map
curl http://localhost:5000/api/maps/MAP_ID
```

### **Test Gemini AI**

```bash
node -e "
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
model.generateContent('Say hello').then(r => console.log(r.response.text()));
"
```

### **Test Complete Flow**

```bash
node test-raindrop-integration.js
```

---

## 📊 Data Flow Example

**Input:** "Explain quantum computing"

**Gemini Parses:**
```json
{
  "title": "Quantum Computing",
  "concepts": [
    {"name": "Qubit", "description": "..."},
    {"name": "Superposition", "description": "..."},
    {"name": "Entanglement", "description": "..."}
  ],
  "relationships": [
    {"from": "Qubit", "to": "Superposition", "type": "enables"}
  ]
}
```

**Raindrop Calls Vultr API:**
```
POST /api/maps → Creates map
POST /api/nodes → Creates "Qubit" node
POST /api/nodes → Creates "Superposition" node
POST /api/nodes → Creates "Entanglement" node
POST /api/nodes/edges → Creates relationship
```

**Vultr Stores in PostgreSQL:**
```sql
INSERT INTO maps (id, user_id, title) VALUES (...)
INSERT INTO nodes (id, map_id, concept, ...) VALUES (...)
INSERT INTO edges (id, source_node_id, target_node_id) VALUES (...)
```

**Frontend Retrieves:**
```
GET /maps/map-id → Returns complete map with all nodes and edges
```

---

## 🚀 Deployment

### **1. Deploy Vultr Backend**

Your Vultr backend can run on:
- Vultr Compute instance
- Any server with Node.js
- Keep it at `http://localhost:5000` for local dev

### **2. Deploy Raindrop Services**

```bash
cd backend
npm run build
raindrop deploy
```

### **3. Update Environment**

Set `VULTR_API_URL` in Raindrop to your deployed Vultr backend URL.

---

## ✅ Benefits of This Architecture

1. **Meets Sponsor Requirements**: Uses Raindrop ✅
2. **Uses Your Work**: Vultr infrastructure you built ✅
3. **Separation of Concerns**: AI in Raindrop, data in Vultr ✅
4. **Easy to Debug**: Test each part independently ✅
5. **Scalable**: Both Raindrop and Vultr can scale ✅

---

## 🐛 Troubleshooting

### **"Failed to create map"**
- Check Vultr API is running: `curl http://localhost:5000/health`
- Check CORS allows Raindrop origin
- Check network connectivity

### **"Gemini API error"**
- Verify `GEMINI_API_KEY` is set
- Check API key is valid at https://aistudio.google.com/app/apikey
- Check rate limits (60 req/min free tier)

### **"Connection refused"**
- Ensure Vultr backend is running
- Check `VULTR_API_URL` is correct
- Check firewall allows connections

---

## 📞 Next Steps

1. ✅ Test integration locally
2. ✅ Deploy Vultr backend
3. ✅ Deploy Raindrop services
4. ✅ Connect frontend
5. ✅ Test end-to-end
6. ✅ Prepare demo

---

**You're ready to go! 🎉**
