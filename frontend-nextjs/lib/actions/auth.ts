'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signToken } from '@/lib/auth';
import { loginSchema, registerSchema } from '@/lib/validations';

// In Server Actions, we can only use BACKEND_URL (not NEXT_PUBLIC_*)
// NEXT_PUBLIC_* variables are only available on the client side
// Note: Environment variables must be available at build/runtime
// Make sure .env.local is in the frontend-nextjs directory and Next.js server is restarted
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8888';

export interface AuthActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Login action
 */
export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const rawFormData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  // Validate input
  const validatedFields = loginSchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Get backend URL - try multiple sources
    // In Next.js Server Actions, process.env might not be available immediately
    // So we use the constant as fallback
    const backendUrl = (process.env.BACKEND_URL || BACKEND_URL || 'http://localhost:8888').trim();
    
    // Debug: Log the backend URL being used (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔵 Login Action Debug:');
      console.log('  - BACKEND_URL constant:', BACKEND_URL);
      console.log('  - process.env.BACKEND_URL:', process.env.BACKEND_URL);
      console.log('  - Final backendUrl:', backendUrl);
      console.log('  - Full URL:', `${backendUrl}/api/admin/login`);
    }
    
    // Call backend API
    // Use 127.0.0.1 instead of localhost if localhost fails (some systems have localhost resolution issues)
    const apiUrl = `${backendUrl}/api/admin/login`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedFields.data),
    });

    if (!response.ok) {
      // Handle non-OK responses
      const errorData = await response.json().catch(() => ({ message: 'Backend server error' }));
      return {
        success: false,
        message: errorData.message || `Backend returned ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.success && data.result) {
      // Use backend token if available (includes loggedSessions), otherwise create one
      let token = data.result.token;
      
      if (!token) {
        // Create JWT token with both 'id' (backend format) and 'userId' (Next.js format)
        token = await signToken({ 
          id: data.result._id, 
          userId: data.result._id, 
          email: data.result.email 
        });
      }
      
      // Set HTTP-only cookie
      (await cookies()).set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      // Redirect to dashboard
      redirect('/dashboard');
    }

    return {
      success: false,
      message: data.message || 'Login failed. Please check your credentials.',
    };
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      cause: error.cause,
      stack: error.stack?.substring(0, 200),
    });
    
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED') || error.cause?.code === 'ECONNREFUSED') {
      return {
        success: false,
        message: `Cannot connect to backend server at ${BACKEND_URL}. 

Troubleshooting steps:
1. Verify backend is running: cd backend && npm run dev
2. Check .env.local has BACKEND_URL=http://localhost:8888
3. Restart Next.js dev server after changing .env.local
4. Test backend directly: curl http://localhost:8888/api/admin/login`,
      };
    }
    
    return {
      success: false,
      message: error.message || 'An error occurred during login. Please try again.',
    };
  }
}

/**
 * Register action
 */
export async function registerAction(formData: FormData): Promise<AuthActionResult> {
  const rawFormData = {
    name: formData.get('name') as string,
    surname: formData.get('surname') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  // Validate input
  const validatedFields = registerSchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Get backend URL
    const backendUrl = (process.env.BACKEND_URL || BACKEND_URL || 'http://localhost:8888').trim();
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔵 Register Action Debug:');
      console.log('  - Backend URL:', backendUrl);
      console.log('  - Endpoint:', `${backendUrl}/api/admin/signup`);
    }
    
    // Call backend API - use /signup endpoint (matches backend route)
    const response = await fetch(`${backendUrl}/api/admin/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: validatedFields.data.name.trim(),
        surname: validatedFields.data.surname?.trim() || '',
        email: validatedFields.data.email.toLowerCase().trim(),
        password: validatedFields.data.password,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.message || data.errorMessage || 'Registration failed. Please try again.',
      };
    }

    if (data.success && data.result) {
      // Use backend token if available, otherwise create one
      let token = data.result.token;
      
      if (!token) {
        // Create token for cookie-based sessions
        token = await signToken({ id: data.result._id, userId: data.result._id, email: data.result.email });
      }
      
      (await cookies()).set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      redirect('/dashboard');
    }

    return {
      success: false,
      message: data.message || 'Registration failed. Please try again.',
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'An error occurred during registration. Please try again.',
    };
  }
}

/**
 * Logout action
 */
export async function logoutAction(): Promise<void> {
  (await cookies()).delete('auth-token');
  redirect('/login');
}

