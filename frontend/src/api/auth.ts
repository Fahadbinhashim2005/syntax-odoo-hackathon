import api from './client';
import { User, Customer, AuthResponse } from '../types';

export const authApi = {
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post('/api/auth/login', data);
    return res.data;
  },
  register: async (data: { name: string; email: string; password: string; role?: string }): Promise<AuthResponse> => {
    const res = await api.post('/api/auth/register', data);
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await api.post('/api/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (data: { token: string; new_password: string }) => {
    const res = await api.post('/api/auth/reset-password', data);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/api/users/me');
    return res.data;
  },
  updateMe: async (data: { name?: string; password?: string; current_password?: string }): Promise<User> => {
    const res = await api.put('/api/users/me', data);
    return res.data;
  },

  // Staff
  getStaff: async (): Promise<User[]> => {
    const res = await api.get('/api/staff');
    return res.data;
  },
  createStaff: async (data: { name: string; email: string; password: string; role: string }): Promise<User> => {
    const res = await api.post('/api/staff', data);
    return res.data;
  },
  updateStaff: async (id: number, data: { name?: string; email?: string; role?: string; is_active?: boolean }): Promise<User> => {
    const res = await api.put(`/api/staff/${id}`, data);
    return res.data;
  },
  toggleStaffStatus: async (id: number): Promise<User> => {
    const res = await api.patch(`/api/staff/${id}/deactivate`);
    return res.data;
  },

  // Customers
  getCustomers: async (params?: { search?: string; status?: string }): Promise<Customer[]> => {
    const res = await api.get('/api/customers', { params });
    return res.data;
  },
  getCustomer: async (id: number): Promise<Customer> => {
    const res = await api.get(`/api/customers/${id}`);
    return res.data;
  },
  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const res = await api.post('/api/customers', data);
    return res.data;
  },
  updateCustomer: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    const res = await api.put(`/api/customers/${id}`, data);
    return res.data;
  },
  toggleCustomerStatus: async (id: number): Promise<Customer> => {
    const res = await api.patch(`/api/customers/${id}/deactivate`);
    return res.data;
  },
};
