# MongoDB Connection Troubleshooting Guide

## Issue: Server Selection Timeout

If you see `MongooseServerSelectionError: Server selection timed out after 10000 ms`, here are the solutions:

### 1. Check MongoDB Atlas Network Access

**Problem**: Your IP address might not be whitelisted in MongoDB Atlas.

**Solution**:
1. Go to MongoDB Atlas Dashboard
2. Navigate to **Network Access**
3. Click **Add IP Address**
4. Add your current IP or use `0.0.0.0/0` for development (⚠️ not recommended for production)
5. Wait a few minutes for changes to propagate

### 2. Check Connection String Format

**Current format in .env**:
```env
DATABASE="mongodb+srv://erp:4USfiVJSGefEk8SO@cluster0.alo6dol.mongodb.net/erp"
```

**Important**: 
- No spaces around `=` sign
- Connection string should be in quotes
- Make sure the database name is correct

### 3. Test Connection Manually

```bash
# Test MongoDB connection
mongosh "mongodb+srv://erp:4USfiVJSGefEk8SO@cluster0.alo6dol.mongodb.net/erp"
```

### 4. Check Firewall/Network

- Ensure your network allows outbound connections to MongoDB Atlas (port 27017)
- Check if VPN is blocking the connection
- Try from a different network

### 5. MongoDB Atlas Cluster Status

- Check if your MongoDB Atlas cluster is running
- Verify cluster is not paused
- Check cluster health in Atlas dashboard

### 6. Connection String Options

If connection still fails, try adding connection options:

```env
DATABASE="mongodb+srv://erp:4USfiVJSGefEk8SO@cluster0.alo6dol.mongodb.net/erp?retryWrites=true&w=majority&serverSelectionTimeoutMS=30000"
```

### 7. Use Local MongoDB (Alternative)

For development, you can use local MongoDB:

```env
DATABASE="mongodb://localhost:27017/erp"
```

Then install and start MongoDB locally:
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community
brew services start mongodb-community

# Start MongoDB
sudo systemctl start mongod  # Linux
```

## Current Configuration

The backend now has:
- ✅ Increased timeout to 30 seconds
- ✅ Better error logging
- ✅ Connection event listeners
- ✅ Proper .env file format (no spaces around =)

## Next Steps

1. **Check MongoDB Atlas Network Access** (most common issue)
2. **Restart backend server** after fixing .env
3. **Check backend logs** for connection status
4. **Verify MongoDB Atlas cluster is running**

## Quick Test

After fixing, restart backend:
```bash
cd backend
npm run dev
```

You should see:
```
🔌 ===== MONGODB CONNECTION =====
🔄 Connecting to MongoDB...
✅ MongoDB connected successfully!
📊 Database: erp
```

