# Vultr Infrastructure - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Set Up Vultr Services (Manual - One Time)

Go to [Vultr Dashboard](https://my.vultr.com) and create:

1. **PostgreSQL Database** (Products → Databases)
   - Engine: PostgreSQL 16
   - Plan: $15/month
   - Region: New Jersey (ewr)

2. **Valkey (Redis)** (Products → Databases)
   - Engine: Valkey
   - Plan: $15/month
   - Same region

3. **Object Storage** (Products → Object Storage)
   - Same region
   - Create bucket: `neuromapor-assets`

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your Vultr credentials
# (Get these from Vultr dashboard after services are created)
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Test Connections

```bash
node test-vultr-connections.js
```

You should see:
```
✅ PostgreSQL connection successful
✅ Object Storage connection successful
✅ Valkey (Redis) connection successful
```

### 5. Initialize Database

Uncomment this line in `test-vultr-connections.js`:
```javascript
await databaseService.initializeSchema();
```

Then run:
```bash
node test-vultr-connections.js
```

### 6. Start Development Server

```bash
npm run dev
```

---

## 📁 Key Files You'll Work With

```
backend/
├── src/
│   ├── config/
│   │   └── vultr.js              # Vultr connection configs
│   ├── services/
│   │   ├── databaseService.js    # PostgreSQL operations
│   │   ├── storageService.js     # Object Storage operations
│   │   └── cacheService.js       # Valkey (Redis) operations
│   └── routes/
│       ├── maps.js               # Map CRUD endpoints (YOU CREATE)
│       ├── nodes.js              # Node CRUD endpoints (YOU CREATE)
│       └── assets.js             # Asset upload endpoints (YOU CREATE)
├── .env                          # Your credentials (DO NOT COMMIT)
└── test-vultr-connections.js    # Connection test script
```

---

## 🔧 Common Operations

### Database Operations

```javascript
const db = require('./src/services/databaseService');

// Create a map
const map = await db.createMap(userId, 'My First Map', 'Description');

// Get user's maps
const maps = await db.getUserMaps(userId);

// Create a node
const node = await db.createNode(mapId, {
  concept: 'Neural Networks',
  description: 'AI concept',
  positionX: 0,
  positionY: 0,
  positionZ: 0
});

// Get complete map with nodes and edges
const fullMap = await db.getCompleteMap(mapId);
```

### Storage Operations

```javascript
const storage = require('./src/services/storageService');

// Upload artwork
const artworkUrl = await storage.uploadArtwork(
  nodeId, 
  imageBuffer, 
  'png'
);

// Upload narration
const narrationUrl = await storage.uploadNarration(
  nodeId, 
  audioBuffer
);

// Check if file exists
const exists = await storage.fileExists('artwork/node123.png');

// Delete file
await storage.deleteFile('artwork/node123.png');
```

### Cache Operations

```javascript
const cache = require('./src/services/cacheService');

// Connect first
await cache.connect();

// Cache a map
await cache.cacheMap(mapId, mapData);

// Get cached map
const cachedMap = await cache.getCachedMap(mapId);

// Cache user session
await cache.setUserSession(userId, sessionData);

// Publish real-time update
await cache.publish('map:updates', { mapId, action: 'node_added' });
```

---

## 🧪 Testing Your Work

### Test Database
```bash
node -e "
const db = require('./src/services/databaseService');
db.query('SELECT NOW()').then(r => console.log(r.rows[0]));
"
```

### Test Storage
```bash
node -e "
const storage = require('./src/services/storageService');
const buf = Buffer.from('test');
storage.uploadFile('test.txt', buf, 'text/plain')
  .then(url => console.log('Uploaded:', url));
"
```

### Test Cache
```bash
node -e "
const cache = require('./src/services/cacheService');
cache.connect()
  .then(() => cache.set('test', {msg: 'hello'}, 60))
  .then(() => cache.get('test'))
  .then(val => console.log('Cached:', val));
"
```

---

## 🐛 Troubleshooting

### "Connection refused"
- Check if services are running in Vultr dashboard
- Verify firewall rules allow your IP
- Check credentials in `.env`

### "Authentication failed"
- Double-check passwords in `.env`
- Ensure no extra spaces in credentials
- Try regenerating access keys

### "Bucket not found"
- Create bucket in Vultr Object Storage dashboard
- Verify bucket name matches `.env`
- Check region matches

---

## 📚 Next Steps

1. ✅ Complete connection tests
2. ✅ Initialize database schema
3. ✅ Create API routes for maps/nodes
4. ✅ Integrate with Raindrop Smart Components (other dev)
5. ✅ Add authentication middleware
6. ✅ Deploy to production

---

## 💡 Pro Tips

- Use cache for frequently accessed maps
- Set appropriate TTLs on cached data
- Always use connection pooling for database
- Enable SSL for all connections in production
- Monitor query performance with logging
- Use presigned URLs for large file downloads

---

## 🆘 Need Help?

- Check `infra/VULTR_SETUP_GUIDE.md` for detailed setup
- Check `VULTR_TASKS_CHECKLIST.md` for complete task list
- Review Vultr docs: https://www.vultr.com/docs/
- Ask your teammate working on SmartInference integration

---

Happy coding! 🎉
