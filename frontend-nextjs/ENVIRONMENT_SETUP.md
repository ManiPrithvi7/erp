# Environment Setup Guide

## Backend URL Configuration

The Next.js app needs to know where the backend API is running. This is configured via environment variables.

## Environment Variables

Create a `.env.local` file in the `frontend-nextjs` directory:

```env
# Backend API URL (for Server Actions and Server Components)
# This is used by server-side code (Server Actions, Server Components)
BACKEND_URL=http://localhost:8888

# Public Backend URL (for client-side code if needed)
# This is exposed to the browser (use NEXT_PUBLIC_* prefix)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8888

# JWT Secret (should match your backend .env file)
JWT_SECRET=your-secret-key-here

# Node Environment
NODE_ENV=development
```

## Important Notes

### Server Actions vs Client Components

1. **Server Actions** (files with `'use server'`):
   - Use `process.env.BACKEND_URL` (without NEXT_PUBLIC)
   - These run on the server, so they can access server-only env vars
   - Example: `lib/actions/auth.ts`, `lib/actions/invoice.ts`

2. **Client Components** (files with `'use client'`):
   - Use `process.env.NEXT_PUBLIC_BACKEND_URL` (with NEXT_PUBLIC)
   - These run in the browser, so they need public env vars
   - Example: Client-side API calls

3. **Server Components** (default, no directive):
   - Use `process.env.BACKEND_URL` (without NEXT_PUBLIC)
   - These run on the server

## Starting the Backend

Before running the Next.js app, make sure the backend is running:

```bash
# In the backend directory
cd backend
npm run dev
```

The backend should start on `http://localhost:8888`

## Troubleshooting

### Error: `ECONNREFUSED 127.0.0.1:8888`

This means the backend server is not running. 

**Solution:**
1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Verify it's running:
   ```bash
   curl http://localhost:8888/api/admin/login
   # Should return an error (not connection refused)
   ```

### Error: Environment variable not found

**Solution:**
1. Make sure `.env.local` exists in `frontend-nextjs/` directory
2. Restart the Next.js dev server after creating/updating `.env.local`
3. Environment variables are only loaded at server start

### Backend URL is different

If your backend runs on a different port or URL:

1. Update `.env.local`:
   ```env
   BACKEND_URL=http://localhost:YOUR_PORT
   NEXT_PUBLIC_BACKEND_URL=http://localhost:YOUR_PORT
   ```

2. Restart the Next.js dev server

## Production Setup

For production, set environment variables in your hosting platform:

- **Vercel**: Add in Project Settings → Environment Variables
- **Docker**: Use `-e` flags or `.env` file
- **Other**: Set in your platform's environment variable configuration

Make sure to set:
- `BACKEND_URL` (your production backend URL)
- `JWT_SECRET` (same as backend)
- `NODE_ENV=production`

