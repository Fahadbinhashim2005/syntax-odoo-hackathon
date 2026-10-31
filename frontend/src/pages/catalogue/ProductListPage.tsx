import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Package, Plus, Search, Layers, Edit2, Power, Eye, AlertCircle } from 'lucide-react';
import { catalogueApi } from '../../api/catalogue';
import { Product } from '../../types';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deactivatingProduct, setDeactivatingProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', search, typeFilter],
    queryFn: () =>
      catalogueApi.getProducts({
        search: search || undefined,
        product_type: typeFilter === 'all' ? undefined : typeFilter,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: catalogueApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product status updated');
      setDeactivatingProduct(null);
    },
    onError: (err: any) => {
      toast.error('Failed to change product status');
    },
  });

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.is_active).length;
  const totalVariants = products.reduce((acc, p) => acc + (p.variants?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products & Offerings</h1>
          <p className="text-sm text-slate-500">
            Define your SaaS core products, tiers, services, and product variants.
          </p>
        </div>
        <Button onClick={() => navigate('/products/new')} icon={<Plus className="w-4 h-4" />}>
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Products</p>
            <p className="text-2xl font-bold text-slate-900">{totalProducts}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Offerings</p>
            <p className="text-2xl font-bold text-slate-900">{activeProducts}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Variants</p>
            <p className="text-2xl font-bold text-slate-900">{totalVariants}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-violet-500 focus:bg-white transition"
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label className="text-xs font-medium text-slate-500">Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Types</option>
            <option value="service">Service</option>
            <option value="consumable">Consumable</option>
            <option value="storable">Storable</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Sales Price</th>
                <th className="px-6 py-4">Cost Price</th>
                <th className="px-6 py-4">Variants</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="space-y-3 max-w-sm mx-auto">
                      <div className="h-4 bg-slate-200 rounded-full animate-pulse" />
                      <div className="h-4 bg-slate-100 rounded-full animate-pulse" />
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                    <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="font-semibold text-slate-700">No products yet.</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Add your first subscription service or software product.</p>
                    <Button onClick={() => navigate('/products/new')} icon={<Plus className="w-4 h-4" />}>
                      Create Product
                    </Button>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/products/${p.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition group"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900 group-hover:text-violet-600 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="block">{p.name}</span>
                          <span className="text-xs text-slate-400 font-normal line-clamp-1">
                            {p.description || 'No description provided'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {p.product_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ₹{p.sales_price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      ₹{p.cost_price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">
                        <Layers className="w-3 h-3" />
                        <span>{p.variants?.length || 0}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/products/${p.id}`)}
                        title="View / Edit"
                        className="p-1.5 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeactivatingProduct(p)}
                        title={p.is_active ? 'Deactivate' : 'Activate'}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Deactivate Dialog */}
      <ConfirmDialog
        isOpen={!!deactivatingProduct}
        onClose={() => setDeactivatingProduct(null)}
        onConfirm={() => deactivatingProduct && deleteMutation.mutate(deactivatingProduct.id)}
        title="Deactivate Product"
        message={`Are you sure you want to deactivate ${deactivatingProduct?.name}? It won't be available for new quotations.`}
        confirmText="Deactivate"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};
