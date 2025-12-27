import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  surname: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const forgetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  userId: z.string(),
  resetToken: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Invoice schemas
export const invoiceSchema = z.object({
  client: z.string().min(1, 'Client is required'),
  company: z.string().optional(),
  number: z.number().min(1, 'Invoice number is required'),
  year: z.number().min(2020, 'Year is required'),
  date: z.date(),
  expiredDate: z.date(),
  items: z.array(z.object({
    itemName: z.string().min(1, 'Item name is required'),
    description: z.string().optional(),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    price: z.number().min(0, 'Price must be greater than or equal to 0'),
    total: z.number().min(0, 'Total must be greater than or equal to 0'),
  })).min(1, 'At least one item is required'),
  taxRate: z.number().min(0).max(100).optional(),
  subTotal: z.number().min(0),
  taxTotal: z.number().min(0),
  total: z.number().min(0),
  currency: z.string().min(1, 'Currency is required'),
  status: z.enum(['draft', 'pending', 'sent', 'refunded', 'cancelled', 'on hold']).optional(),
  notes: z.string().optional(),
});

// Quote schemas
export const quoteSchema = z.object({
  client: z.string().min(1, 'Client is required'),
  company: z.string().optional(),
  number: z.number().min(1, 'Quote number is required'),
  year: z.number().min(2020, 'Year is required'),
  date: z.date(),
  expiredDate: z.date(),
  items: z.array(z.object({
    itemName: z.string().min(1, 'Item name is required'),
    description: z.string().optional(),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    price: z.number().min(0, 'Price must be greater than or equal to 0'),
    total: z.number().min(0, 'Total must be greater than or equal to 0'),
  })).min(1, 'At least one item is required'),
  taxRate: z.number().min(0).max(100).optional(),
  subTotal: z.number().min(0),
  taxTotal: z.number().min(0),
  total: z.number().min(0),
  currency: z.string().min(1, 'Currency is required'),
  status: z.enum(['draft', 'pending', 'sent', 'accepted', 'declined', 'cancelled', 'on hold']).optional(),
  notes: z.string().optional(),
});

// Payment schemas
export const paymentSchema = z.object({
  client: z.string().min(1, 'Client is required'),
  company: z.string().optional(),
  invoice: z.string().min(1, 'Invoice is required'),
  number: z.number().min(1, 'Payment number is required'),
  date: z.date(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  paymentMode: z.string().optional(),
  ref: z.string().optional(),
  description: z.string().optional(),
});

// Client schemas
export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  enabled: z.boolean().optional(),
});

// Company schemas
export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  country: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  taxId: z.string().optional(),
  contact: z.string().optional(),
  notes: z.string().optional(),
  enabled: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type CompanyInput = z.infer<typeof companySchema>;

