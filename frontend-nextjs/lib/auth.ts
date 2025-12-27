import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
const key = new TextEncoder().encode(secretKey);

export interface TokenPayload {
  id?: string; // Backend format (for compatibility)
  userId?: string; // Next.js format
  email?: string;
}

/**
 * Sign a JWT token with user payload
 */
export async function signToken(payload: TokenPayload): Promise<string> {
  const token = await new SignJWT(payload as Record<string, any>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Get authentication token from cookies
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value || null;
}

/**
 * Set authentication token in cookies
 */
export async function setAuthToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Remove authentication token from cookies
 */
export async function removeAuthToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

/**
 * Get current authenticated user from backend
 */
export async function getCurrentUser() {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  try {
    const decoded = await verifyToken(token);
    
    // Support both 'id' and 'userId' from token
    const userId = decoded.id || decoded.userId;
    
    if (!userId) {
      return null;
    }
    
    // Fetch user from backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8888';
    const response = await fetch(`${backendUrl}/api/admin/read/${userId}`, {
      headers: {
        'Cookie': `x-auth-token=${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.result : null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  if (!token) {
    return false;
  }

  try {
    await verifyToken(token);
    return true;
  } catch {
    return false;
  }
}

