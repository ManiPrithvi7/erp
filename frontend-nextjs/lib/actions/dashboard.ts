'use server';

import { getAuthToken } from '@/lib/auth';
import { serverApiRequest } from '@/lib/utils/api';

// Server Actions can only use BACKEND_URL (not NEXT_PUBLIC_*)
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8888';

export async function getDashboardData() {
  const token = await getAuthToken();

  if (!token) {
    return {
      invoices: [],
      payments: [],
      quotes: [],
      summary: {},
    };
  }

  try {
    // Fetch data in parallel
    const [invoicesRes, paymentsRes, quotesRes, summaryRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/invoice/list?page=1&items=5`, {
        headers: { 'Cookie': `x-auth-token=${token}` },
        cache: 'no-store',
      }),
      fetch(`${BACKEND_URL}/api/payment/list?page=1&items=5`, {
        headers: { 'Cookie': `x-auth-token=${token}` },
        cache: 'no-store',
      }),
      fetch(`${BACKEND_URL}/api/quote/list?page=1&items=5`, {
        headers: { 'Cookie': `x-auth-token=${token}` },
        cache: 'no-store',
      }),
      fetch(`${BACKEND_URL}/api/invoice/summary`, {
        headers: { 'Cookie': `x-auth-token=${token}` },
        cache: 'no-store',
      }),
    ]);

    const [invoices, payments, quotes, summary] = await Promise.all([
      invoicesRes.json().catch(() => ({ success: false, result: { items: [] } })),
      paymentsRes.json().catch(() => ({ success: false, result: { items: [] } })),
      quotesRes.json().catch(() => ({ success: false, result: { items: [] } })),
      summaryRes.json().catch(() => ({ success: false, result: {} })),
    ]);

    return {
      invoices: invoices.success ? invoices.result?.items || [] : [],
      payments: payments.success ? payments.result?.items || [] : [],
      quotes: quotes.success ? quotes.result?.items || [] : [],
      summary: summary.success ? summary.result || {} : {},
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      invoices: [],
      payments: [],
      quotes: [],
      summary: {},
    };
  }
}

