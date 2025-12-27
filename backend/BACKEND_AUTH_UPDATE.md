# Backend Authentication Update

## Changes Made

### 1. Cookie-Based Authentication Support

The backend now supports authentication via cookies in addition to Authorization headers:

- **Cookie name**: `x-auth-token`
- **Priority**: Cookie is checked first, then Authorization header (for backward compatibility)

### 2. Token Format Compatibility

The backend now accepts tokens with either:
- `id` field (backend format)
- `userId` field (Next.js format)

Both formats are supported for maximum compatibility.

### 3. Session Management

- **Authorization Header tokens**: Still checked against `loggedSessions` array (session-based)
- **Cookie tokens**: Trusted based on JWT verification only (cookie-based sessions)
  - This allows cookie-based auth to work without requiring tokens in `loggedSessions`
  - Enables new devices to authenticate without localStorage tokens

### 4. Public Auth Routes

The following routes are **public** (no authentication required):
- `/api/admin/login` - Login
- `/api/admin/signup` - Registration
- `/api/admin/forgetpassword` - Password reset request
- `/api/admin/resetpassword` - Password reset

The following route **requires** authentication:
- `/api/admin/logout` - Logout (needs token to remove from loggedSessions)

## How It Works

### Login Flow

1. User submits login form (no token needed)
2. Backend validates credentials
3. Backend creates JWT token with `id` field
4. Backend adds token to `loggedSessions`
5. Backend returns token in response
6. Next.js stores token in HTTP-only cookie
7. Subsequent requests include cookie automatically

### Protected Route Access

1. Request comes with cookie `x-auth-token` OR Authorization header
2. Backend extracts token from cookie (priority) or header
3. Backend verifies JWT token
4. Backend extracts `id` or `userId` from token
5. Backend fetches user from database
6. For Authorization header tokens: checks `loggedSessions`
7. For cookie tokens: skips `loggedSessions` check (trusts JWT)
8. Request proceeds with authenticated user

## Benefits

1. **New Device Support**: Users can login on new devices without localStorage tokens
2. **Security**: HTTP-only cookies are more secure than localStorage
3. **Backward Compatibility**: Still supports Authorization header for old frontend
4. **Flexibility**: Supports both session-based and cookie-based authentication

## Testing

To test cookie-based authentication:

```bash
# Login (no token needed)
curl -X POST http://localhost:8888/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt

# Use protected route with cookie
curl -X GET http://localhost:8888/api/invoice/list \
  -b cookies.txt
```

