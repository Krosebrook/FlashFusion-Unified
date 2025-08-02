# 🔴 Redis Installation Guide for FlashFusion
## Windows Installation Options - 2025

### ⚡ Quick Setup for Development

Redis is optional for FlashFusion but provides enhanced performance through caching. Your FlashFusion backend already runs without Redis (graceful degradation).

---

## 📥 INSTALLATION OPTIONS

### 1. **WSL2 (Recommended for Windows)**
Best option for Windows developers - runs official Redis builds.

```bash
# Enable WSL2 first (Windows 10 2004+ or Windows 11)
wsl --install

# After WSL2 setup, install Redis in Ubuntu:
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install redis

# Start Redis
sudo service redis-server start

# Test connection
redis-cli ping
```

### 2. **Native Windows Build (Quick & Easy)**
Direct Windows executable - no WSL needed.

**Download**: https://github.com/redis-windows/redis-windows/releases
- Latest: Redis 8.0.0 for Windows
- Also available: 7.4.3, 7.2.8, 7.0.15, 6.2.18

```bash
# Download and extract redis-windows
# Run redis-server.exe
# Default port: 6379
```

### 3. **Docker (Cross-platform)**
```bash
# Pull and run Redis container
docker run -d --name redis -p 6379:6379 redis:latest

# Connect to Redis CLI
docker exec -it redis redis-cli
```

### 4. **Memurai Developer Edition (Commercial)**
Free developer version of Redis-compatible server.
**Download**: https://www.memurai.com/get-started

---

## 🚀 QUICK START FOR FLASHFUSION

### Option A: Native Windows (Fastest)
1. Download: https://github.com/redis-windows/redis-windows/releases/latest
2. Extract to `C:\Redis\`
3. Run `redis-server.exe`
4. Redis starts on `localhost:6379`

### Option B: WSL2 (Most Compatible)
```bash
# In WSL2 Ubuntu
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

### Option C: Skip Redis (Already Working!)
Your FlashFusion backend already handles missing Redis gracefully:
- ✅ Backend runs without Redis
- ✅ Caching disabled but functional
- ✅ All features work (just slower)

---

## 🔧 FLASHFUSION CONFIGURATION

### Add to your `.env` file:
```env
# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Test Redis Connection:
```bash
# Test with curl (FlashFusion running)
curl http://localhost:3005/health

# Look for "redis": "connected" in response
```

---

## 📊 REDIS FEATURES FOR FLASHFUSION

When Redis is connected, FlashFusion gains:

1. **Session Storage** - User sessions cached
2. **API Rate Limiting** - Distributed rate limiting
3. **Agent Task Queue** - Task queueing and retry
4. **Real-time Updates** - WebSocket session management
5. **Performance Caching** - Database query caching

---

## 🎯 RECOMMENDED APPROACH

### For Development:
1. **Download Native Windows Build** (easiest)
   - https://github.com/redis-windows/redis-windows/releases
   - Extract and run `redis-server.exe`

### For Production:
1. **Use WSL2 or Linux** (official builds)
2. **Docker containers** (scalable)
3. **Cloud Redis** (AWS ElastiCache, Azure Cache, etc.)

---

## ✅ VERIFICATION

After installing Redis:

```bash
# Test Redis directly
redis-cli ping
# Should return: PONG

# Test FlashFusion integration
curl http://localhost:3005/health
# Should show "redis": "connected"
```

---

## 🚨 TROUBLESHOOTING

### Redis Not Starting:
- Check port 6379 isn't in use
- Run as Administrator if needed
- Check Windows Firewall settings

### FlashFusion Not Connecting:
- Verify REDIS_URL in .env
- Check Redis is running on correct port
- Review backend logs for connection errors

---

**Status**: Redis is **optional** for FlashFusion
**Current**: Backend runs without Redis (fully functional)
**Enhancement**: Redis adds performance and caching features

**Next Steps**:
1. Choose installation method above
2. Download and install Redis
3. Update `.env` configuration
4. Restart FlashFusion backend