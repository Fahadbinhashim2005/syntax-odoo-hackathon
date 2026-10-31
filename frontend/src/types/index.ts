export type UserRole = 'admin' | 'staff' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
}

export interface Customer {
  id: number;
  user_id?: number | null;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  additional_price: number;
  is_active: boolean;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  product_type: 'service' | 'consumable' | 'storable';
  sales_price: number;
  cost_price: number;
  is_active: boolean;
  created_at: string;
  variants?: ProductVariant[];
}

export interface Plan {
  id: number;
  name: string;
  description?: string;
  product_id: number;
  billing_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  price: number;
  min_quantity: number;
  available_from?: string | null;
  available_to?: string | null;
  is_active: boolean;
  created_at: string;
  product?: Product;
}

export interface Discount {
  id: number;
  name: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  applicable_to: 'all' | 'plan' | 'product';
  applicable_id?: number | null;
  valid_from?: string | null;
  valid_to?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Tax {
  id: number;
  name: string;
  percentage: number;
  is_active: boolean;
  created_at: string;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted' | 'cancelled';

export interface Quotation {
  id: number;
  quotation_number: string;
  customer_id: number;
  plan_id: number;
  product_id?: number | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  status: QuotationStatus;
  valid_until?: string | null;
  notes?: string | null;
  created_by?: number | null;
  created_at: string;
  updated_at: string;
  subscription_id?: number | null;
  subscription_number?: string | null;
  customer?: Customer;
  plan?: Plan;
  product?: Product;
}

export type SubscriptionStatus = 'draft' | 'confirmed' | 'active' | 'paused' | 'expired' | 'closed';

export interface SubscriptionHistory {
  id: number;
  subscription_id: number;
  event_type: string;
  user_id?: number | null;
  user_name?: string | null;
  previous_status?: string | null;
  new_status?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface Subscription {
  id: number;
  subscription_number: string;
  customer_id: number;
  plan_id: number;
  quotation_id?: number | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  status: SubscriptionStatus;
  start_date: string;
  end_date?: string | null;
  next_billing_date?: string | null;
  paused_at?: string | null;
  closed_at?: string | null;
  close_reason?: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  plan?: Plan;
  history?: SubscriptionHistory[];
}

export type InvoiceStatus = 'draft' | 'confirmed' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: number;
  invoice_number: string;
  subscription_id?: number | null;
  customer_id: number;
  issue_date: string;
  due_date: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  status: InvoiceStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  subscription?: Subscription;
  payments?: Payment[];
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'upi' | 'other';

export interface Payment {
  id: number;
  payment_number: string;
  invoice_id: number;
  customer_id: number;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference?: string | null;
  notes?: string | null;
  created_at: string;
  customer?: Customer;
  invoice?: Invoice;
}

export interface MonthlyRevenueItem {
  month: string;
  revenue: number;
}

export interface FinanceStats {
  total_revenue: number;
  outstanding: number;
  invoices_paid: number;
  overdue_count: number;
  active_subscriptions: number;
  monthly_revenue: MonthlyRevenueItem[];
  invoice_distribution: Record<string, number>;
}
