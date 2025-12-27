# Connection Refused Troubleshooting

## Issue: ECONNREFUSED 127.0.0.1:8888 in Server Actions

### Root Cause
Next.js Server Actions run in a separate runtime context. If environment variables aren't loaded properly, or if there's a network resolution issue, the connection will fail.

### Solutions

#### 1. Restart Next.js Dev Server
**Most Common Fix**: Environment variables are only loaded when the server starts.

```bash
# Stop the Next.js server (Ctrl+C)
# Then restart it
cd frontend-nextjs
npm run dev
```

#### 2. Verify .env.local File
Make sure `.env.local` exists in `frontend-nextjs/` directory:

```bash
cd frontend-nextjs
cat .env.local
```

Should contain:
```env
BACKEND_URL=http://localhost:8888
NEXT_PUBLIC_BACKEND_URL=http://localhost:8888
```

#### 3. Check Backend is Running
```bash
# Check if backend is running
lsof -i :8888
# or
curl http://localhost:8888/api/admin/login
```

#### 4. Use 127.0.0.1 Instead of localhost
If `localhost` doesn't resolve, try using `127.0.0.1`:

```env
BACKEND_URL=http://127.0.0.1:8888
```

#### 5. Check Next.js Configuration
Make sure `next.config.ts` doesn't have any restrictions:

```typescript
const nextConfig: NextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8888',
  },
};
```

#### 6. Verify Environment Variable Loading
Add debug logging to see what URL is being used:

The code now includes debug logging in development mode. Check the console when you try to login.

### Common Issues

1. **Environment variable not loaded**
   - Solution: Restart Next.js dev server
   - Check: `.env.local` file exists and has correct format

2. **Backend not running**
   - Solution: Start backend with `cd backend && npm run dev`
   - Verify: Backend shows "Express running → On PORT : 8888"

3. **Port conflict**
   - Check: Another service using port 8888
   - Solution: Change backend port or stop conflicting service

4. **Network resolution**
   - Issue: `localhost` doesn't resolve in Server Action context
   - Solution: Use `127.0.0.1` instead

### Debug Steps

1. Check backend is running:
   ```bash
   curl http://localhost:8888/api/admin/login
   ```

2. Check environment variable:
   ```bash
   cd frontend-nextjs
   node -e "console.log(process.env.BACKEND_URL)"
   ```

3. Check Next.js logs:
   - Look for debug output when login is attempted
   - Should show the backend URL being used

### Quick Fix Checklist

- [ ] Backend server is running (`npm run dev` in backend directory)
- [ ] `.env.local` exists in `frontend-nextjs/` directory
- [ ] `.env.local` contains `BACKEND_URL=http://localhost:8888`
- [ ] Next.js dev server has been restarted after creating/updating `.env.local`
- [ ] No port conflicts (check with `lsof -i :8888`)
- [ ] Backend responds to curl test

### Still Not Working?

Try using `127.0.0.1` instead of `localhost` in `.env.local`:

```env
BACKEND_URL=http://127.0.0.1:8888
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8888
```

Then restart both servers.

