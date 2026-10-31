import api from './client';
import { Invoice, Payment, FinanceStats } from '../types';

export const financeApi = {
  // Invoices
  getInvoices: async (params?: {
    status?: string;
    customer_id?: number;
    from_date?: string;
    to_date?: string;
    search?: string;
  }): Promise<Invoice[]> => {
    const res = await api.get('/api/invoices', { params });
    return res.data;
  },
  getInvoice: async (id: number): Promise<Invoice> => {
    const res = await api.get(`/api/invoices/${id}`);
    return res.data;
  },
  generateInvoices: async (): Promise<Invoice[]> => {
    const res = await api.post('/api/invoices/generate');
    return res.data;
  },
  confirmInvoice: async (id: number): Promise<Invoice> => {
    const res = await api.post(`/api/invoices/${id}/confirm`);
    return res.data;
  },
  cancelInvoice: async (id: number): Promise<Invoice> => {
    const res = await api.post(`/api/invoices/${id}/cancel`);
    return res.data;
  },
  getOverdueInvoices: async (): Promise<Invoice[]> => {
    const res = await api.get('/api/invoices/overdue');
    return res.data;
  },

  // Payments
  getPayments: async (params?: { method?: string; from_date?: string; to_date?: string; search?: string }): Promise<Payment[]> => {
    const res = await api.get('/api/payments', { params });
    return res.data;
  },
  getInvoicePayments: async (invoiceId: number): Promise<Payment[]> => {
    const res = await api.get(`/api/invoices/${invoiceId}/payments`);
    return res.data;
  },
  createPayment: async (data: {
    invoice_id: number;
    amount: number;
    payment_method: string;
    payment_date?: string;
    reference?: string;
    notes?: string;
  }): Promise<Payment> => {
    const res = await api.post('/api/payments', data);
    return res.data;
  },

  // Dashboard & Reports
  getFinanceStats: async (): Promise<FinanceStats> => {
    const res = await api.get('/api/dashboard/finance');
    return res.data;
  },
  getRevenueReport: async (params?: { from_date?: string; to_date?: string }) => {
    const res = await api.get('/api/reports/revenue', { params });
    return res.data;
  },
};
