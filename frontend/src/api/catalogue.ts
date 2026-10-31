import api from './client';
import { Product, ProductVariant, Plan, Discount, Tax } from '../types';

export const catalogueApi = {
  // Products
  getProducts: async (params?: { search?: string; product_type?: string; is_active?: boolean }): Promise<Product[]> => {
    const res = await api.get('/api/products', { params });
    return res.data;
  },
  getProduct: async (id: number): Promise<Product> => {
    const res = await api.get(`/api/products/${id}`);
    return res.data;
  },
  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const res = await api.post('/api/products', data);
    return res.data;
  },
  updateProduct: async (id: number, data: Partial<Product>): Promise<Product> => {
    const res = await api.put(`/api/products/${id}`, data);
    return res.data;
  },
  deleteProduct: async (id: number) => {
    const res = await api.delete(`/api/products/${id}`);
    return res.data;
  },

  // Variants
  getVariants: async (productId: number): Promise<ProductVariant[]> => {
    const res = await api.get(`/api/products/${productId}/variants`);
    return res.data;
  },
  addVariant: async (productId: number, data: Partial<ProductVariant>): Promise<ProductVariant> => {
    const res = await api.post(`/api/products/${productId}/variants`, data);
    return res.data;
  },
  updateVariant: async (id: number, data: Partial<ProductVariant>): Promise<ProductVariant> => {
    const res = await api.put(`/api/variants/${id}`, data);
    return res.data;
  },
  deleteVariant: async (id: number) => {
    const res = await api.delete(`/api/variants/${id}`);
    return res.data;
  },

  // Plans
  getPlans: async (params?: { search?: string; is_active?: boolean; billing_frequency?: string }): Promise<Plan[]> => {
    const res = await api.get('/api/plans', { params });
    return res.data;
  },
  getPlan: async (id: number): Promise<Plan> => {
    const res = await api.get(`/api/plans/${id}`);
    return res.data;
  },
  createPlan: async (data: Partial<Plan>): Promise<Plan> => {
    const res = await api.post('/api/plans', data);
    return res.data;
  },
  updatePlan: async (id: number, data: Partial<Plan>): Promise<Plan> => {
    const res = await api.put(`/api/plans/${id}`, data);
    return res.data;
  },
  deletePlan: async (id: number) => {
    const res = await api.delete(`/api/plans/${id}`);
    return res.data;
  },

  // Discounts
  getDiscounts: async (): Promise<Discount[]> => {
    const res = await api.get('/api/discounts');
    return res.data;
  },
  createDiscount: async (data: Partial<Discount>): Promise<Discount> => {
    const res = await api.post('/api/discounts', data);
    return res.data;
  },
  updateDiscount: async (id: number, data: Partial<Discount>): Promise<Discount> => {
    const res = await api.put(`/api/discounts/${id}`, data);
    return res.data;
  },
  deleteDiscount: async (id: number) => {
    const res = await api.delete(`/api/discounts/${id}`);
    return res.data;
  },

  // Taxes
  getTaxes: async (): Promise<Tax[]> => {
    const res = await api.get('/api/taxes');
    return res.data;
  },
  createTax: async (data: Partial<Tax>): Promise<Tax> => {
    const res = await api.post('/api/taxes', data);
    return res.data;
  },
  updateTax: async (id: number, data: Partial<Tax>): Promise<Tax> => {
    const res = await api.put(`/api/taxes/${id}`, data);
    return res.data;
  },
};
