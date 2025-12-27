/**
 * Debug utility to check environment variables in Server Actions
 * Only use in development
 */

export function debugEnv() {
  if (process.env.NODE_ENV !== 'development') {
    return {};
  }

  return {
    BACKEND_URL: process.env.BACKEND_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NODE_ENV: process.env.NODE_ENV,
    // Log all env vars that start with BACKEND
    allBackendVars: Object.keys(process.env)
      .filter((key) => key.includes('BACKEND'))
      .reduce((acc, key) => {
        acc[key] = process.env[key];
        return acc;
      }, {} as Record<string, string | undefined>),
  };
}

