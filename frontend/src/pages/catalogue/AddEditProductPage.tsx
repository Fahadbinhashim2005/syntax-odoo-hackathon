import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ChevronLeft, Package, Plus, Trash2, Save, Layers } from 'lucide-react';
import { catalogueApi } from '../../api/catalogue';
import { ProductVariant } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().optional(),
  product_type: z.enum(['service', 'consumable', 'storable']),
  sales_price: z.coerce.number().min(0, 'Price must be >= 0'),
  cost_price: z.coerce.number().min(0, 'Cost must be >= 0'),
  is_active: z.boolean().default(true),
});

type ProductFormData = {
  name: string;
  description?: string;
  product_type: 'service' | 'consumable' | 'storable';
  sales_price: number;
  cost_price: number;
  is_active: boolean;
};

export const AddEditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== 'new';
  const productId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantPrice, setNewVariantPrice] = useState('0');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => catalogueApi.getProduct(productId),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      product_type: 'service',
      sales_price: 0,
      cost_price: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || '',
        product_type: product.product_type,
        sales_price: product.sales_price,
        cost_price: product.cost_price,
        is_active: product.is_active,
      });
    }
  }, [product, reset]);

  const saveProductMutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      if (isEdit) {
        return catalogueApi.updateProduct(productId, data);
      }
      return catalogueApi.createProduct(data);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(isEdit ? 'Product updated successfully' : 'Product created successfully');
      navigate('/products');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to save product');
    },
  });

  const addVariantMutation = useMutation({
    mutationFn: () =>
      catalogueApi.addVariant(productId, {
        name: newVariantName,
        additional_price: parseFloat(newVariantPrice) || 0,
        is_active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      toast.success('Variant added');
      setNewVariantName('');
      setNewVariantPrice('0');
    },
  });

  const deleteVariantMutation = useMutation({
    mutationFn: (variantId: number) => catalogueApi.deleteVariant(variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      toast.success('Variant removed');
    },
  });

  const onSubmit = (data: ProductFormData) => {
    saveProductMutation.mutate(data);
  };

  if (isEdit && isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading product information...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/products" className="hover:text-violet-600 transition flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Products</span>
        </Link>
        <span>/</span>
        <span className="text-slate-900">{isEdit ? product?.name : 'New Product'}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isEdit ? 'Edit Product' : 'Create New Product'}
          </h1>
          <p className="text-sm text-slate-500">
            Configure product metadata, commercial pricing, and optional variations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data: ProductFormData) => onSubmit(data))} className="space-y-6">
        {/* Core details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-violet-600" />
            <span>Product Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Product Name *"
                placeholder="Brightloop Cloud Platform"
                {...register('name')}
                error={errors.name?.message}
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Description</label>
              <textarea
                rows={3}
                placeholder="High performance subscription and billing platform..."
                {...register('description')}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Product Type</label>
              <select
                {...register('product_type')}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-violet-500"
              >
                <option value="service">Service / SaaS Subscription</option>
                <option value="consumable">Consumable API / Token</option>
                <option value="storable">Physical / Storable Asset</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="is_active"
                {...register('is_active')}
                className="w-4 h-4 text-violet-600 rounded-md focus:ring-violet-500 border-slate-300"
              />
              <label htmlFor="is_active" className="text-sm font-semibold text-slate-700 select-none">
                Active & Available for Quotations
              </label>
            </div>

            <div>
              <Input
                label="Base Sales Price (₹) *"
                type="number"
                step="0.01"
                placeholder="6999"
                {...register('sales_price')}
                error={errors.sales_price?.message}
              />
            </div>

            <div>
              <Input
                label="Internal Cost Price (₹)"
                type="number"
                step="0.01"
                placeholder="1200"
                {...register('cost_price')}
                error={errors.cost_price?.message}
              />
            </div>
          </div>
        </div>

        {/* Product Variants (only on edit) */}
        {isEdit && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-600" />
                <span>Product Variants</span>
              </span>
              <span className="text-xs font-normal text-slate-400">
                Tier variations, extra seats, addons
              </span>
            </h2>

            {/* List existing variants */}
            <div className="space-y-2">
              {product?.variants && product.variants.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {product.variants.map((v) => (
                    <div
                      key={v.id}
                      className="px-4 py-3 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{v.name}</p>
                        <p className="text-xs text-slate-500">
                          Additional cost: +₹{v.additional_price.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteVariantMutation.mutate(v.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No variants created yet.</p>
              )}
            </div>

            {/* Add Variant Inline */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-700 mb-2">+ Add Variant Row</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Variant name (e.g. Dedicated IP)"
                  value={newVariantName}
                  onChange={(e) => setNewVariantName(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-violet-500"
                />
                <input
                  type="number"
                  placeholder="Additional Price (₹)"
                  value={newVariantPrice}
                  onChange={(e) => setNewVariantPrice(e.target.value)}
                  className="w-full sm:w-40 rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-violet-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!newVariantName}
                  loading={addVariantMutation.isPending}
                  onClick={() => addVariantMutation.mutate()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={() => navigate('/products')}>
            Cancel
          </Button>
          <Button type="submit" loading={saveProductMutation.isPending} icon={<Save className="w-4 h-4" />}>
            {isEdit ? 'Update Product' : 'Save Product'}
          </Button>
        </div>
      </form>
    </div>
  );
};
