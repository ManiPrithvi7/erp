'use server';

import { getAuthToken } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { invoiceSchema, type InvoiceInput } from '@/lib/validations';
import { serverApiRequest } from '@/lib/utils/api';

// Server Actions can only use BACKEND_URL (not NEXT_PUBLIC_*)
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8888';

export interface InvoiceActionResult {
  success: boolean;
  result?: any;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Get invoice list
 */
export async function getInvoiceList({ page = 1, search = '' }: { page?: number; search?: string }) {
  const token = await getAuthToken();
  
  if (!token) {
    return { success: false, result: { items: [], pagination: {} } };
  }

  const params = new URLSearchParams({
    page: page.toString(),
    items: '10',
    ...(search && { search }),
  });

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/invoice/list?${params}`,
      {
        headers: { 'Cookie': `x-auth-token=${token}` },
        cache: 'no-store',
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching invoice list:', error);
    return { success: false, result: { items: [], pagination: {} } };
  }
}

/**
 * Get single invoice
 */
export async function getInvoice(id: string) {
  const token = await getAuthToken();
  
  if (!token) {
    return { success: false, result: null };
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/invoice/read/${id}`,
      {
        headers: { 'Cookie': `x-auth-token=${token}` },
        cache: 'no-store',
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return { success: false, result: null };
  }
}

/**
 * Create invoice
 */
export async function createInvoiceAction(formData: InvoiceInput): Promise<InvoiceActionResult> {
  const token = await getAuthToken();
  
  if (!token) {
    return { success: false, message: 'Not authenticated' };
  }

  // Validate input
  const validatedFields = invoiceSchema.safeParse(formData);
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/invoice/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `x-auth-token=${token}`,
      },
      body: JSON.stringify(validatedFields.data),
    });

    const data = await response.json();

    if (data.success) {
      revalidatePath('/invoice');
      revalidatePath('/dashboard');
      return { success: true, result: data.result };
    }

    return { success: false, message: data.message || 'Failed to create invoice' };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return { success: false, message: 'An error occurred while creating the invoice' };
  }
}

/**
 * Update invoice
 */
export async function updateInvoiceAction(id: string, formData: Partial<InvoiceInput>): Promise<InvoiceActionResult> {
  const token = await getAuthToken();
  
  if (!token) {
    return { success: false, message: 'Not authenticated' };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/invoice/update/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `x-auth-token=${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      revalidatePath('/invoice');
      revalidatePath(`/invoice/${id}`);
      revalidatePath('/dashboard');
      return { success: true, result: data.result };
    }

    return { success: false, message: data.message || 'Failed to update invoice' };
  } catch (error) {
    console.error('Error updating invoice:', error);
    return { success: false, message: 'An error occurred while updating the invoice' };
  }
}

/**
 * Delete invoice
 */
export async function deleteInvoiceAction(id: string): Promise<InvoiceActionResult> {
  const token = await getAuthToken();
  
  if (!token) {
    return { success: false, message: 'Not authenticated' };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/invoice/delete/${id}`, {
      method: 'DELETE',
      headers: { 'Cookie': `x-auth-token=${token}` },
    });

    const data = await response.json();

    if (data.success) {
      revalidatePath('/invoice');
      revalidatePath('/dashboard');
      return { success: true };
    }

    return { success: false, message: data.message || 'Failed to delete invoice' };
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return { success: false, message: 'An error occurred while deleting the invoice' };
  }
}

/**
 * Get invoice form initial data (settings, taxes, etc.)
 */
export async function getInvoiceFormData() {
  const token = await getAuthToken();
  
  if (!token) {
    return {
      financeSettings: {},
      moneyFormatSettings: {},
      taxes: [],
      clients: [],
    };
  }

  try {
    const [settingsRes, taxesRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/setting/listAll`, {
        headers: { 'Cookie': `x-auth-token=${token}` },
        cache: 'no-store',
      }),
      fetch(`${BACKEND_URL}/api/taxes/list`, {
        headers: { 'Cookie': `x-auth-token=${token}` },
        cache: 'no-store',
      }),
    ]);

    const [settings, taxes] = await Promise.all([
      settingsRes.json().catch(() => ({ success: false, result: {} })),
      taxesRes.json().catch(() => ({ success: false, result: [] })),
    ]);

    const financeSettings = settings.success ? settings.result?.finance_settings || {} : {};
    const moneyFormatSettings = settings.success ? settings.result?.money_format_settings || {} : {};

    return {
      financeSettings,
      moneyFormatSettings,
      taxes: taxes.success ? taxes.result || [] : [],
      lastInvoiceNumber: financeSettings.last_invoice_number || 0,
      defaultCurrency: moneyFormatSettings.default_currency_code || 'USD',
    };
  } catch (error) {
    console.error('Error fetching invoice form data:', error);
    return {
      financeSettings: {},
      moneyFormatSettings: {},
      taxes: [],
      lastInvoiceNumber: 0,
      defaultCurrency: 'USD',
    };
  }
}

