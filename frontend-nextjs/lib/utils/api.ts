/**
 * API client utilities for making requests to the backend
 * 
 * Note: For client-side code, use NEXT_PUBLIC_BACKEND_URL
 * For server-side code (Server Actions/Components), use BACKEND_URL
 */

// Client-side: Use NEXT_PUBLIC_* (available in browser)
// Server-side: Use BACKEND_URL (available in Server Actions/Components)
const API_BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8888')
  : (process.env.BACKEND_URL || 'http://localhost:8888');

export interface ApiResponse<T = any> {
  success: boolean;
  result?: T;
  message?: string;
  error?: any;
}

export interface RequestOptions {
  page?: number;
  items?: number;
  search?: string;
  filter?: Record<string, any>;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Get authentication token from cookies (client-side)
 */
export function getAuthTokenClient(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Get token from cookie (for client-side requests)
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
}

/**
 * Make API request (client-side)
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthTokenClient();
  
  const url = `${API_BASE_URL}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Cookie': `x-auth-token=${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    return {
      success: false,
      error,
      message: error.message || 'Request failed',
    };
  }

  const data = await response.json();
  return data;
}

/**
 * Server-side API request (for Server Components and Server Actions)
 */
export async function serverApiRequest<T = any>(
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Cookie': `x-auth-token=${token}` }),
      ...options.headers,
    },
    cache: options.cache || 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    return {
      success: false,
      error,
      message: error.message || 'Request failed',
    };
  }

  const data = await response.json();
  return data;
}

