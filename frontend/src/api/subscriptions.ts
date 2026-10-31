import api from './client';
import { Quotation, Subscription, SubscriptionHistory } from '../types';

export const subscriptionsApi = {
  // Quotations
  getQuotations: async (params?: {
    status?: string;
    customer_id?: number;
    search?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<Quotation[]> => {
    const res = await api.get('/api/quotations', { params });
    return res.data;
  },
  getQuotation: async (id: number): Promise<Quotation> => {
    const res = await api.get(`/api/quotations/${id}`);
    return res.data;
  },
  createQuotation: async (data: Partial<Quotation>): Promise<Quotation> => {
    const res = await api.post('/api/quotations', data);
    return res.data;
  },
  updateQuotation: async (id: number, data: Partial<Quotation>): Promise<Quotation> => {
    const res = await api.put(`/api/quotations/${id}`, data);
    return res.data;
  },
  cancelQuotation: async (id: number) => {
    const res = await api.delete(`/api/quotations/${id}`);
    return res.data;
  },
  sendQuotation: async (id: number): Promise<Quotation> => {
    const res = await api.post(`/api/quotations/${id}/send`);
    return res.data;
  },
  acceptQuotation: async (id: number): Promise<Quotation> => {
    const res = await api.post(`/api/quotations/${id}/accept`);
    return res.data;
  },
  rejectQuotation: async (id: number, reason?: string): Promise<Quotation> => {
    const res = await api.post(`/api/quotations/${id}/reject`, { reason });
    return res.data;
  },
  confirmQuotation: async (
    id: number,
    data?: { start_date?: string; notes?: string }
  ): Promise<Subscription> => {
    const res = await api.post(`/api/quotations/${id}/confirm`, data || {});
    return res.data;
  },
  convertQuotation: async (
    id: number,
    data?: { start_date?: string; notes?: string }
  ): Promise<Subscription> => {
    const res = await api.post(`/api/quotations/${id}/convert`, data || {});
    return res.data;
  },

  // Subscriptions
  getSubscriptions: async (params?: {
    status?: string;
    customer_id?: number;
    search?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<Subscription[]> => {
    const res = await api.get('/api/subscriptions', { params });
    return res.data;
  },
  getSubscription: async (id: number): Promise<Subscription> => {
    const res = await api.get(`/api/subscriptions/${id}`);
    return res.data;
  },
  getSubscriptionHistory: async (id: number): Promise<SubscriptionHistory[]> => {
    const res = await api.get(`/api/subscriptions/${id}/history`);
    return res.data;
  },
  createSubscription: async (data: Partial<Subscription>): Promise<Subscription> => {
    const res = await api.post('/api/subscriptions', data);
    return res.data;
  },
  updateSubscription: async (id: number, data: Partial<Subscription>): Promise<Subscription> => {
    const res = await api.put(`/api/subscriptions/${id}`, data);
    return res.data;
  },
  confirmSubscription: async (id: number): Promise<Subscription> => {
    const res = await api.post(`/api/subscriptions/${id}/confirm`);
    return res.data;
  },
  activateSubscription: async (id: number): Promise<Subscription> => {
    const res = await api.post(`/api/subscriptions/${id}/activate`);
    return res.data;
  },
  pauseSubscription: async (id: number, reason?: string): Promise<Subscription> => {
    const res = await api.post(`/api/subscriptions/${id}/pause`, { reason });
    return res.data;
  },
  resumeSubscription: async (id: number, effective_date?: string): Promise<Subscription> => {
    const res = await api.post(`/api/subscriptions/${id}/resume`, { effective_date });
    return res.data;
  },
  renewSubscription: async (id: number, renewal_periods: number = 1, start_date?: string): Promise<Subscription> => {
    const res = await api.post(`/api/subscriptions/${id}/renew`, { renewal_periods, start_date });
    return res.data;
  },
  closeSubscription: async (id: number, close_reason: string = "Customer requested termination"): Promise<Subscription> => {
    const res = await api.post(`/api/subscriptions/${id}/close`, { close_reason });
    return res.data;
  },
  getDueForBilling: async (): Promise<Subscription[]> => {
    const res = await api.get('/api/subscriptions/due-for-billing');
    return res.data;
  },
};
