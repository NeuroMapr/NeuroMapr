# Vultr Infrastructure - Your Task Checklist

## 🎯 Overview
You're responsible for setting up and integrating all Vultr services for NeuroMapr's backend infrastructure.

---

## 📋 Phase 1: Account Setup & Service Provisioning (Day 1)

### Step 1: Vultr Account Setup
- [ ] Create Vultr account at https://www.vultr.com
- [ ] Add billing information
- [ ] Generate API key (Account → API)
- [ ] Save API key securely

### Step 2: Deploy PostgreSQL Database
- [ ] Go to Products → Databases → Deploy Database
- [ ] Select PostgreSQL 16
- [ ] Choose plan ($15/month starter)
- [ ] Select region (e.g., New Jersey - ewr)
- [ ] Label: `neuromapor-postgres-db`
- [ ] Wait for provisioning (5-10 mins)
- [ ] Copy connection details (host, port, username, password)
- [ ] Test connection with `psql` or test script

### Step 3: Deploy Valkey (Redis)
- [ ] Go to Products → Databases → Deploy Database
- [ ] Select Valkey (Redis-compatible)
- [ ] Choose plan ($15/month starter)
- [ ] Same region as PostgreSQL
- [ ] Label: `neuromapor-valkey-cache`
- [ ] Wait for provisioning
- [ ] Copy connection details
- [ ] Test connection with `redis-cli`

### Step 4: Set Up Object Storage
- [ ] Go to Products → Object Storage → Add Object Storage
- [ ] Select same region
- [ ] Label: `neuromapor-media-storage`
- [ ] Create access keys (Access Keys → Add Access Key)
- [ ] Save Access Key ID and Secret Key
- [ ] Create bucket named `neuromapor-assets`
- [ ] Test with AWS CLI or test script

### Step 5: Update Environment Variables
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Fill in all Vultr credentials:
  - PostgreSQL: host, port, database, user, password
  - Valkey: host, port, password
  - Object Storage: endpoint, access key, secret key, bucket name
- [ ] Verify all values are correct

---

## 📋 Phase 2: Backend Integration (Day 2)

### Step 6: Install Dependencies
```bash
cd backend
npm install
```

Required packages (already added to package.json):
- [ ] `pg` - PostgreSQL client
- [ ] `@aws-sdk/client-s3` - S3-compatible storage
- [ ] `@aws-sdk/s3-request-presigner` - Presigned URLs
- [ ] `redis` - Redis/Valkey client

### Step 7: Test Connections
```bash
cd backend
node test-vultr-connections.js
```

Expected output:
- [ ] ✅ PostgreSQL connection successful
- [ ] ✅ Object Storage connection successful
- [ ] ✅ Valkey (Redis) connection successful
- [ ] ✅ Cache set/get test passed
- [ ] ✅ Database query test passed

### Step 8: Initialize Database Schema
- [ ] Review schema in `src/services/databaseService.js`
- [ ] Uncomment schema initialization in test script
- [ ] Run: `node test-vultr-connections.js`
- [ ] Verify tables created:
  - users
  - maps
  - nodes
  - edges
  - user_preferences
- [ ] Check indexes created

### Step 9: Test Storage Service
Create a test file: `backend/test-storage.js`
```javascript
require('dotenv').config();
const storageService = require('./src/services/storageService');
const fs = require('fs');

async function testStorage() {
  // Test upload
  const testData = Buffer.from('Hello Vultr!');
  const url = await storageService.uploadFile('test/hello.txt', testData, 'text/plain');
  console.log('Uploaded:', url);
  
  // Test file exists
  const exists = await storageService.fileExists('test/hello.txt');
  console.log('File exists:', exists);
  
  // Test delete
  await storageService.deleteFile('test/hello.txt');
  console.log('File deleted');
}

testStorage();
```

- [ ] Run storage test
- [ ] Verify file appears in Vultr dashboard
- [ ] Verify file deletion works

---

## 📋 Phase 3: API Endpoints (Day 3)

### Step 10: Create Database Routes
File: `backend/src/routes/maps.js`

- [ ] POST `/api/maps` - Create new map
- [ ] GET `/api/maps/:id` - Get map by ID
- [ ] GET `/api/maps/user/:userId` - Get user's maps
- [ ] PUT `/api/maps/:id` - Update map
- [ ] DELETE `/api/maps/:id` - Delete map

### Step 11: Create Node Routes
File: `backend/src/routes/nodes.js`

- [ ] POST `/api/nodes` - Create new node
- [ ] GET `/api/nodes/:id` - Get node by ID
- [ ] GET `/api/nodes/map/:mapId` - Get all nodes for map
- [ ] PUT `/api/nodes/:id` - Update node
- [ ] DELETE `/api/nodes/:id` - Delete node

### Step 12: Create Asset Routes
File: `backend/src/routes/assets.js`

- [ ] POST `/api/assets/artwork` - Upload artwork
- [ ] POST `/api/assets/narration` - Upload narration
- [ ] POST `/api/assets/thumbnail` - Upload thumbnail
- [ ] GET `/api/assets/:key` - Get asset URL
- [ ] DELETE `/api/assets/:key` - Delete asset

### Step 13: Integrate Cache Middleware
- [ ] Create cache middleware in `src/middleware/cache.js`
- [ ] Add cache-first logic for GET requests
- [ ] Implement cache invalidation on POST/PUT/DELETE
- [ ] Test cache hit/miss rates

---

## 📋 Phase 4: Advanced Features (Day 4)

### Step 14: Real-time Collaboration (Optional)
- [ ] Implement Redis pub/sub for live updates
- [ ] Create WebSocket endpoint
- [ ] Test multi-user map editing
- [ ] Handle conflict resolution

### Step 15: Performance Optimization
- [ ] Add database query logging
- [ ] Implement connection pooling
- [ ] Set up cache warming for popular maps
- [ ] Add rate limiting middleware

### Step 16: Backup & Recovery
- [ ] Enable automated backups in Vultr dashboard
- [ ] Test backup restoration process
- [ ] Document recovery procedures
- [ ] Set up backup monitoring

---

## 📋 Phase 5: Monitoring & Security (Day 5)

### Step 17: Configure Firewall Rules
- [ ] PostgreSQL: Whitelist backend server IP
- [ ] Valkey: Whitelist backend server IP
- [ ] Object Storage: Configure bucket ACLs
- [ ] Test connections from allowed/blocked IPs

### Step 18: Set Up Monitoring
- [ ] Enable Vultr monitoring for all services
- [ ] Set up alerts:
  - High CPU (>80%)
  - High memory (>85%)
  - Low disk space (<20%)
  - Connection failures
- [ ] Configure alert notifications (email/Slack)

### Step 19: Security Hardening
- [ ] Enable SSL/TLS for all connections
- [ ] Rotate database passwords
- [ ] Implement API rate limiting
- [ ] Add request validation middleware
- [ ] Enable CORS with whitelist
- [ ] Add security headers (helmet.js)

### Step 20: Documentation
- [ ] Document all API endpoints
- [ ] Create database schema diagram
- [ ] Write deployment guide
- [ ] Document environment variables
- [ ] Create troubleshooting guide

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Database service CRUD operations
- [ ] Storage service upload/download
- [ ] Cache service set/get/delete
- [ ] Error handling

### Integration Tests
- [ ] End-to-end map creation flow
- [ ] Asset upload and retrieval
- [ ] Cache invalidation
- [ ] Real-time updates

### Load Tests
- [ ] Concurrent user connections
- [ ] Large file uploads
- [ ] Database query performance
- [ ] Cache hit rates

---

## 📊 Success Metrics

By the end of your work, you should have:

- [ ] All 3 Vultr services running and connected
- [ ] Database schema initialized with all tables
- [ ] Storage service handling file uploads
- [ ] Cache service reducing database load
- [ ] API endpoints responding correctly
- [ ] Connection tests passing 100%
- [ ] Monitoring and alerts configured
- [ ] Documentation complete

---

## 🚨 Troubleshooting

### PostgreSQL Connection Issues
- Check firewall rules in Vultr dashboard
- Verify SSL settings in connection string
- Test with `psql` command line tool
- Check connection pool settings

### Object Storage Issues
- Verify endpoint URL format
- Check access key permissions
- Test with AWS CLI
- Verify bucket exists and is accessible

### Valkey (Redis) Issues
- Check password authentication
- Verify port is correct (usually 16752)
- Test with `redis-cli`
- Check connection timeout settings

---

## 📞 Resources

- **Vultr Docs**: https://www.vultr.com/docs/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Redis Docs**: https://redis.io/docs/
- **AWS S3 SDK**: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/

---

## ✅ Quick Start Commands

```bash
# Install dependencies
cd backend
npm install

# Test connections
node test-vultr-connections.js

# Initialize database
# (uncomment schema init in test script first)
node test-vultr-connections.js

# Start development server
npm run dev
```

---

## 🎯 Your Priority Order

1. **Day 1**: Complete Steps 1-5 (Account setup & service provisioning)
2. **Day 2**: Complete Steps 6-9 (Backend integration & testing)
3. **Day 3**: Complete Steps 10-13 (API endpoints)
4. **Day 4**: Complete Steps 14-16 (Advanced features)
5. **Day 5**: Complete Steps 17-20 (Monitoring & security)

---

Good luck! 🚀
