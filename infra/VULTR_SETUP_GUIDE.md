# Vultr Infrastructure Setup Guide for NeuroMapr

## Overview
This guide walks you through setting up all required Vultr services for the NeuroMapr backend infrastructure.

---

## 🎯 Services to Set Up

1. **Vultr Managed Database (PostgreSQL)** - Primary database backup & analytics
2. **Vultr Object Storage** - S3-compatible storage for media assets
3. **Vultr Valkey (Redis-compatible)** - Session cache & real-time updates
4. **Vultr Compute Instance** (Optional) - For heavy ML/image processing

---

## 📋 Step-by-Step Setup

### **Step 1: Create Vultr Account & Get API Key**

1. Go to [Vultr.com](https://www.vultr.com) and create an account
2. Navigate to **Account** → **API** → **Generate API Key**
3. Save your API key securely (you'll need it for automation)
4. Add billing information to activate services

---

### **Step 2: Set Up Vultr Managed Database (PostgreSQL)**

**Via Vultr Dashboard:**

1. Go to **Products** → **Databases**
2. Click **Deploy Database**
3. Configure:
   - **Database Engine**: PostgreSQL 16
   - **Plan**: Choose based on needs (start with $15/month plan)
   - **Location**: Choose closest to your users (e.g., New York, London)
   - **Label**: `neuromapor-postgres-db`
   - **Database Name**: `neuromapor_db`
   - **Username**: `neuromapor_admin`
4. Click **Deploy Now**
5. Wait 5-10 minutes for provisioning

**After Deployment:**

1. Go to your database instance
2. Copy the **Connection Details**:
   - Host
   - Port (default: 16751)
   - Username
   - Password
   - Database name
3. Save these to your `.env` file (see Step 6)

**Test Connection:**
```bash
psql -h [HOST] -p [PORT] -U [USERNAME] -d [DATABASE]
```

---

### **Step 3: Set Up Vultr Object Storage**

**Via Vultr Dashboard:**

1. Go to **Products** → **Object Storage**
2. Click **Add Object Storage**
3. Configure:
   - **Location**: Same as your database (e.g., New Jersey)
   - **Label**: `neuromapor-media-storage`
4. Click **Add Object Storage**

**After Deployment:**

1. Go to your Object Storage instance
2. Click **Access Keys** → **Add Access Key**
3. Save:
   - **Access Key ID** (S3_ACCESS_KEY)
   - **Secret Key** (S3_SECRET_KEY)
   - **Hostname** (e.g., `ewr1.vultrobjects.com`)
4. Create a bucket named `neuromapor-assets`:
   - Click **Buckets** → **Create Bucket**
   - Name: `neuromapor-assets`
   - ACL: Private (default)

**Test with AWS CLI:**
```bash
aws s3 ls --endpoint-url=https://ewr1.vultrobjects.com
```

---

### **Step 4: Set Up Vultr Valkey (Redis-compatible)**

**Via Vultr Dashboard:**

1. Go to **Products** → **Databases**
2. Click **Deploy Database**
3. Configure:
   - **Database Engine**: Valkey (Redis-compatible)
   - **Plan**: Start with $15/month plan
   - **Location**: Same region as PostgreSQL
   - **Label**: `neuromapor-valkey-cache`
4. Click **Deploy Now**

**After Deployment:**

1. Copy **Connection Details**:
   - Host
   - Port (default: 16752)
   - Password
2. Save to `.env` file

**Test Connection:**
```bash
redis-cli -h [HOST] -p [PORT] -a [PASSWORD]
# Then run: PING
# Should return: PONG
```

---

### **Step 5: (Optional) Set Up Vultr Compute Instance**

Only needed if you're self-hosting Stable Diffusion or heavy ML models.

**Via Vultr Dashboard:**

1. Go to **Products** → **Compute**
2. Click **Deploy Server**
3. Configure:
   - **Server Type**: Cloud Compute - High Frequency (or GPU if needed)
   - **Location**: Same region
   - **Plan**: 2 vCPU, 4GB RAM minimum
   - **OS**: Ubuntu 22.04 LTS
   - **Label**: `neuromapor-ml-compute`
4. Add SSH key for access
5. Click **Deploy Now**

**After Deployment:**

1. SSH into the instance
2. Install Docker:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

---

### **Step 6: Update Environment Variables**

Update your `backend/.env` file with all Vultr credentials:

```env
# Vultr Managed Database (PostgreSQL)
VULTR_DB_HOST=your-db-host.vultrdb.com
VULTR_DB_PORT=16751
VULTR_DB_NAME=neuromapor_db
VULTR_DB_USER=neuromapor_admin
VULTR_DB_PASSWORD=your_secure_password

# Vultr Object Storage (S3-compatible)
VULTR_S3_ENDPOINT=https://ewr1.vultrobjects.com
VULTR_S3_ACCESS_KEY=your_access_key
VULTR_S3_SECRET_KEY=your_secret_key
VULTR_S3_BUCKET=neuromapor-assets
VULTR_S3_REGION=ewr1

# Vultr Valkey (Redis)
VULTR_REDIS_HOST=your-redis-host.vultrdb.com
VULTR_REDIS_PORT=16752
VULTR_REDIS_PASSWORD=your_redis_password

# Vultr Compute (Optional)
VULTR_COMPUTE_IP=your.compute.ip.address
VULTR_API_KEY=your_vultr_api_key
```

---

### **Step 7: Configure Firewall Rules**

For each Vultr service, configure firewall rules:

**PostgreSQL Database:**
- Allow connections from your backend server IP
- Allow connections from your local IP (for development)

**Valkey (Redis):**
- Same as PostgreSQL

**Object Storage:**
- Public read access for media assets (if needed)
- Private write access only

---

### **Step 8: Set Up Monitoring & Alerts**

1. Go to each service in Vultr Dashboard
2. Enable **Monitoring**
3. Set up alerts for:
   - High CPU usage (>80%)
   - High memory usage (>85%)
   - Low disk space (<20%)
   - Connection failures

---

## 🧪 Testing Your Setup

Run these tests to verify everything works:

### Test PostgreSQL Connection
```bash
cd backend
node -e "
const { Client } = require('pg');
const client = new Client({
  host: process.env.VULTR_DB_HOST,
  port: process.env.VULTR_DB_PORT,
  database: process.env.VULTR_DB_NAME,
  user: process.env.VULTR_DB_USER,
  password: process.env.VULTR_DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});
client.connect().then(() => {
  console.log('✅ PostgreSQL connected!');
  client.end();
}).catch(err => console.error('❌ Error:', err));
"
```

### Test Object Storage
```bash
# Install AWS SDK if not already
npm install @aws-sdk/client-s3

node -e "
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const client = new S3Client({
  endpoint: process.env.VULTR_S3_ENDPOINT,
  region: process.env.VULTR_S3_REGION,
  credentials: {
    accessKeyId: process.env.VULTR_S3_ACCESS_KEY,
    secretAccessKey: process.env.VULTR_S3_SECRET_KEY
  }
});
client.send(new ListBucketsCommand({})).then(data => {
  console.log('✅ Object Storage connected!');
  console.log('Buckets:', data.Buckets);
}).catch(err => console.error('❌ Error:', err));
"
```

### Test Valkey (Redis)
```bash
npm install redis

node -e "
const redis = require('redis');
const client = redis.createClient({
  socket: {
    host: process.env.VULTR_REDIS_HOST,
    port: process.env.VULTR_REDIS_PORT
  },
  password: process.env.VULTR_REDIS_PASSWORD
});
client.connect().then(() => {
  console.log('✅ Valkey connected!');
  return client.ping();
}).then(reply => {
  console.log('PING response:', reply);
  client.quit();
}).catch(err => console.error('❌ Error:', err));
"
```

---

## 📊 Cost Estimation

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| PostgreSQL Database | 1GB RAM, 25GB Storage | $15 |
| Valkey (Redis) | 1GB RAM | $15 |
| Object Storage | 250GB + 1TB transfer | $5 |
| Compute (Optional) | 2 vCPU, 4GB RAM | $24 |
| **Total** | | **$35-59/month** |

---

## 🔐 Security Best Practices

1. **Never commit credentials** - Use `.env` files (already in `.gitignore`)
2. **Use SSL/TLS** - Enable for all database connections
3. **Restrict IP access** - Whitelist only necessary IPs in firewall
4. **Rotate credentials** - Change passwords every 90 days
5. **Enable backups** - Vultr provides automated daily backups
6. **Use IAM roles** - For production, use role-based access

---

## 🚀 Next Steps

After completing this setup:

1. ✅ Update `backend/.env` with all credentials
2. ✅ Test all connections using the test scripts above
3. ✅ Install required npm packages (pg, @aws-sdk/client-s3, redis)
4. ✅ Create database schema using SmartSQL
5. ✅ Implement storage service for SmartBuckets integration
6. ✅ Set up Redis caching layer for SmartMemory

---

## 📞 Support

- **Vultr Docs**: https://www.vultr.com/docs/
- **Vultr Support**: Open ticket in dashboard
- **Community**: Vultr Discord/Forum

---

## ✅ Checklist

- [ ] Vultr account created
- [ ] API key generated
- [ ] PostgreSQL database deployed
- [ ] Object Storage created & bucket configured
- [ ] Valkey (Redis) deployed
- [ ] All credentials saved to `.env`
- [ ] Firewall rules configured
- [ ] Connection tests passed
- [ ] Monitoring enabled
- [ ] Ready to integrate with backend code
