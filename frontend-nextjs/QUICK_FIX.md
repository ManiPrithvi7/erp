# Quick Fix for Connection Refused

## The Problem
Frontend Server Actions can't connect to backend even though backend is running.

## The Solution

### Step 1: Verify Backend is Running
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully!
Express running → On PORT : 8888
```

### Step 2: Restart Next.js Dev Server
**This is the most important step!**

Environment variables from `.env.local` are only loaded when the Next.js server starts.

```bash
# Stop the Next.js server (Ctrl+C in the terminal running it)
# Then restart:
cd frontend-nextjs
npm run dev
```

### Step 3: Verify .env.local
```bash
cd frontend-nextjs
cat .env.local
```

Should show:
```
BACKEND_URL=http://localhost:8888
NEXT_PUBLIC_BACKEND_URL=http://localhost:8888
```

### Step 4: Test Connection
After restarting, try logging in again. The debug logs will show what URL is being used.

## Why This Happens

Next.js Server Actions run in a separate runtime. Environment variables are loaded when the server starts, not when the action is called. If you:
- Created `.env.local` after starting the server
- Modified `.env.local` while server was running
- Started server before backend was ready

The environment variables won't be available.

## Alternative: Use 127.0.0.1

If `localhost` still doesn't work, try:

```env
BACKEND_URL=http://127.0.0.1:8888
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8888
```

Then restart the Next.js server.

