# 🚀 VonVault Deployment Guide

> **Complete deployment guide for production-ready DeFi Telegram Mini App**

---

## 🎯 **Deployment Overview**

VonVault uses a modern, scalable deployment architecture with separate frontend and backend services, ensuring high availability and performance.

```mermaid
graph TB
    subgraph "Production Infrastructure"
        A[Custom Domain] --> B[Vercel CDN]
        B --> C[React Frontend]
        C --> D[Render Backend]
        D --> E[MongoDB Atlas]
        D --> F[Redis Cache]
    end
    
    subgraph "External Services"
        G[CoinGecko API]
        H[Teller Banking API]
        I[MetaMask/Web3]
    end
    
    D --> G
    D --> H
    C --> I
```

---

## 🌐 **Frontend Deployment (Vercel)**

### **✅ Current Setup**
- **Domain:** www.vonartis.app
- **Platform:** Vercel
- **Framework:** React + TypeScript
- **Build Tool:** Create React App

### **Deployment Process**

#### **1. Vercel Configuration**
```json
{
  "name": "vonvault-frontend",
  "buildCommand": "yarn build",
  "outputDirectory": "build",
  "installCommand": "yarn install",
  "framework": "create-react-app"
}
```

#### **2. Environment Variables**
Set these in Vercel Dashboard → Settings → Environment Variables:

```env
# Production Environment
REACT_APP_BACKEND_URL=https://vonvault-backend.onrender.com
REACT_APP_ENVIRONMENT=production
REACT_APP_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
REACT_APP_ANALYTICS_ID=your_analytics_id

# Development Environment  
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_ENVIRONMENT=development
```

#### **3. Build Optimization**
```javascript
// Build performance optimizations in package.json
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "build:analyze": "npx build-analyzer"
  }
}
```

#### **4. Domain Configuration**
1. **Add Custom Domain** in Vercel Dashboard
2. **Configure DNS Records:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
3. **SSL Certificate** - Automatically provisioned by Vercel

#### **5. Performance Configuration**
```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://vonvault-backend.onrender.com/api/$1"
    }
  ]
}
```

---

## ⚙️ **Backend Deployment (Render)**

### **✅ Current Setup**
- **URL:** vonvault-backend.onrender.com
- **Platform:** Render
- **Framework:** FastAPI + Python
- **Database:** MongoDB Atlas

### **Deployment Process**

#### **1. Render Configuration**
```yaml
# render.yaml
services:
  - type: web
    name: vonvault-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python server.py
    envVars:
      - key: PORT
        value: 10000
      - key: PYTHON_VERSION
        value: 3.9.16
```

#### **2. Environment Variables**
Set these in Render Dashboard → Environment:

```env
# Database
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/vonvault?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-2025
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# External APIs
TELLER_API_KEY=your-teller-api-key
COINGECKO_API_KEY=your-coingecko-pro-api-key

# Application
ENVIRONMENT=production
PORT=10000
CORS_ORIGINS=https://www.vonartis.app,https://vonartis.app

# Optional: Redis Cache
REDIS_URL=redis://your-redis-instance:6379
```

#### **3. Health Check Configuration**
```python
# Health check endpoint for Render
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }
```

#### **4. Production Server Configuration**
```python
# server.py - Production configuration
if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PORT", 8001))
    host = "0.0.0.0"
    
    # Production settings
    uvicorn.run(
        app,
        host=host,
        port=port,
        workers=2,  # Adjust based on Render plan
        access_log=True,
        log_level="info"
    )
```

---

## 🍃 **Database Setup (MongoDB Atlas)**

### **✅ Current Setup**
- **Provider:** MongoDB Atlas
- **Tier:** M0 (Free) → Upgrade to M10+ for production
- **Region:** Closest to Render deployment region

### **Configuration Steps**

#### **1. Cluster Setup**
```javascript
// Recommended production settings
{
  "clusterType": "REPLICASET",
  "mongoDBMajorVersion": "7.0",
  "providerSettings": {
    "providerName": "AWS",
    "instanceSizeName": "M10",  // Production minimum
    "regionName": "US_EAST_1"   // Match Render region
  }
}
```

#### **2. Database Security**
```javascript
// Network Access - Production
{
  "ipWhitelist": [
    "0.0.0.0/0"  // Allow all IPs (Render uses dynamic IPs)
  ]
}

// Database Users
{
  "username": "vonvault-prod",
  "password": "generated-secure-password",
  "roles": [
    {
      "role": "readWrite",
      "db": "vonvault"
    }
  ]
}
```

#### **3. Backup Configuration**
```javascript
// Automated backups (M10+ clusters)
{
  "backupEnabled": true,
  "clusterCheckpointIntervalMin": 15,
  "referenceHourOfDay": 3,
  "referenceMinuteOfHour": 0,
  "restoreWindowDays": 7
}
```

#### **4. Indexes for Performance**
```javascript
// Create these indexes for optimal performance
db.users.createIndex({"user_id": 1}, {"unique": true})
db.users.createIndex({"email": 1}, {"unique": true})
db.investments.createIndex({"user_id": 1, "status": 1})
db.investments.createIndex({"created_at": -1})
db.portfolio.createIndex({"user_id": 1, "snapshot_date": -1})
```

---

## 🔧 **CI/CD Pipeline**

### **GitHub Actions Workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy VonVault

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
          
      - name: Install dependencies
        run: |
          cd frontend
          yarn install
          
      - name: Run tests
        run: |
          cd frontend
          yarn test --coverage
          
      - name: Build frontend
        run: |
          cd frontend
          yarn build
          
  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
          
  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Render
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"clearCache": false}' \
            "https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys"
```

---

## 📊 **Monitoring & Analytics**

### **Application Monitoring**

#### **1. Render Monitoring**
- **Built-in Metrics:** CPU, Memory, Response Time
- **Custom Metrics:** API endpoint performance
- **Alerts:** Set up for downtime and performance issues

#### **2. Vercel Analytics**
```javascript
// Add to frontend for performance monitoring
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <div>
      <YourApp />
      <Analytics />
    </div>
  );
}
```

#### **3. Error Tracking**
```python
# Backend error tracking with Sentry
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FastApiIntegration(auto_enable=True)],
    traces_sample_rate=0.1,
    environment="production"
)
```

### **Custom Monitoring Dashboard**

```python
# Health monitoring endpoint
@app.get("/metrics")
async def get_metrics():
    return {
        "database_status": await check_database_connection(),
        "external_apis": await check_external_apis(),
        "active_users": await get_active_user_count(),
        "response_times": await get_avg_response_times(),
        "error_rate": await get_error_rate()
    }
```

---

## 🔐 **Security Configuration**

### **SSL/TLS Setup**
- **Frontend:** Automatic SSL via Vercel
- **Backend:** Automatic SSL via Render
- **Database:** SSL/TLS enforced on MongoDB Atlas

### **CORS Configuration**
```python
# Production CORS settings
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.vonartis.app",
        "https://vonartis.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### **Security Headers**
```python
# Security middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000"
    return response
```

---

## 📈 **Scaling Considerations**

### **Horizontal Scaling**

#### **Frontend Scaling**
- **Vercel automatically scales** based on traffic
- **Global CDN** ensures fast loading worldwide
- **Edge Functions** for server-side rendering if needed

#### **Backend Scaling**
```python
# Render autoscaling configuration
{
  "autoDeploy": true,
  "scalingPolicy": {
    "minInstances": 1,
    "maxInstances": 10,
    "targetCPUPercent": 70,
    "targetMemoryPercent": 80
  }
}
```

#### **Database Scaling**
```javascript
// MongoDB Atlas auto-scaling
{
  "diskGBEnabled": true,
  "compute": {
    "enabled": true,
    "scaleDownEnabled": true,
    "minInstanceSize": "M10",
    "maxInstanceSize": "M30"
  }
}
```

### **Performance Optimization**

#### **Caching Strategy**
```python
# Redis caching for frequently accessed data
import redis
from functools import wraps

redis_client = redis.from_url(os.getenv("REDIS_URL"))

def cache_result(expiration=300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, expiration, json.dumps(result))
            
            return result
        return wrapper
    return decorator

@cache_result(expiration=60)  # Cache crypto prices for 1 minute
async def get_crypto_prices():
    # Fetch from CoinGecko API
    pass
```

---

## 🧪 **Testing & Quality Assurance**

### **Deployment Testing Checklist**

#### **Pre-deployment Tests**
- [ ] Unit tests pass (frontend & backend)
- [ ] Integration tests pass
- [ ] End-to-end tests pass
- [ ] Security scan completed
- [ ] Performance benchmarks met

#### **Post-deployment Tests**
- [ ] Health check endpoints respond
- [ ] Frontend loads without errors
- [ ] API endpoints return expected data
- [ ] Database connections established
- [ ] External API integrations working
- [ ] SSL certificates valid

### **Automated Testing**
```python
# Backend integration tests
import pytest
import httpx

@pytest.mark.asyncio
async def test_portfolio_endpoint():
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://vonvault-backend.onrender.com/api/health"
        )
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
```

---

## 🆘 **Troubleshooting & Support**

### **Common Deployment Issues**

#### **Frontend Issues**
```bash
# Build fails on Vercel
Error: Module not found: Can't resolve './component'

# Solution: Check import paths and case sensitivity
# Ensure all files are committed to git
```

#### **Backend Issues**
```python
# Database connection fails
Error: MongoServerError: Authentication failed

# Solution: Check MongoDB connection string
# Verify username/password and IP whitelist
```

#### **CORS Issues**
```javascript
// Frontend can't reach backend
Error: CORS policy: No 'Access-Control-Allow-Origin' header

# Solution: Update CORS_ORIGINS in backend environment
CORS_ORIGINS=https://www.vonartis.app,https://vonartis.app
```

### **Monitoring & Alerts**

#### **Set up alerts for:**
- API response time > 2 seconds
- Error rate > 1%
- Database connection failures
- External API failures
- SSL certificate expiration

### **Support Contacts**
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Render Support:** [render.com/support](https://render.com/support)
- **MongoDB Atlas:** [mongodb.com/support](https://mongodb.com/support)

---

## 📋 **Deployment Checklist**

### **Pre-launch Checklist**
- [ ] Domain configured and SSL active
- [ ] Environment variables set correctly
- [ ] Database backups configured
- [ ] Monitoring and alerts set up
- [ ] Security headers implemented
- [ ] Performance optimization complete
- [ ] Error tracking configured
- [ ] API documentation updated
- [ ] Load testing completed
- [ ] Disaster recovery plan in place

### **Go-live Checklist**
- [ ] Final smoke tests passed
- [ ] DNS propagation complete
- [ ] All team members notified
- [ ] Monitoring dashboards active
- [ ] Support team briefed
- [ ] Rollback plan prepared

---

**🎉 Your VonVault DeFi Mini App is now production-ready!**

*For deployment support: deployment@vonvault.com*