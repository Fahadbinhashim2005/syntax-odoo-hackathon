import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ChevronLeft, Layers, Check, Sparkles, Save } from 'lucide-react';
import { catalogueApi } from '../../api/catalogue';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const planSchema = z.object({
  name: z.string().min(2, 'Plan name is required'),
  description: z.string().optional(),
  product_id: z.coerce.number().min(1, 'Please select a product'),
  billing_frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  price: z.coerce.number().min(0, 'Price must be >= 0'),
  min_quantity: z.coerce.number().min(1, 'Minimum quantity is 1'),
  available_from: z.string().optional().nullable(),
  available_to: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

type PlanFormData = {
  name: string;
  description?: string;
  product_id: number;
  billing_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  price: number;
  min_quantity: number;
  available_from?: string | null;
  available_to?: string | null;
  is_active: boolean;
};

export const AddEditPlanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== 'new';
  const planId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => catalogueApi.getProducts({ is_active: true }),
  });

  const { data: plan, isLoading } = useQuery({
    queryKey: ['plan', planId],
    queryFn: () => catalogueApi.getPlan(planId),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      product_id: 0,
      billing_frequency: 'monthly',
      price: 0,
      min_quantity: 1,
      available_from: '',
      available_to: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name,
        description: plan.description || '',
        product_id: plan.product_id,
        billing_frequency: plan.billing_frequency,
        price: plan.price,
        min_quantity: plan.min_quantity,
        available_from: plan.available_from || '',
        available_to: plan.available_to || '',
        is_active: plan.is_active,
      });
    } else if (products.length > 0) {
      reset((prev) => ({ ...prev, product_id: products[0].id }));
    }
  }, [plan, products, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: PlanFormData) => {
      const payload = {
        ...data,
        available_from: data.available_from ? data.available_from : null,
        available_to: data.available_to ? data.available_to : null,
      };
      if (isEdit) {
        return catalogueApi.updatePlan(planId, payload as any);
      }
      return catalogueApi.createPlan(payload as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success(isEdit ? 'Plan updated successfully' : 'Plan created successfully');
      navigate('/plans');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to save plan');
    },
  });

  const watched = watch();
  const selectedProduct = products.find((p) => p.id === Number(watched.product_id));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/plans" className="hover:text-violet-600 transition flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Plans</span>
        </Link>
        <span>/</span>
        <span className="text-slate-900">{isEdit ? plan?.name : 'New Plan'}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {isEdit ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
        </h1>
        <p className="text-sm text-slate-500">
          Establish pricing rules, frequency cycles, and availability dates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (7 cols) */}
        <form
          onSubmit={handleSubmit((data: PlanFormData) => saveMutation.mutate(data))}
          className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5"
        >
          <Input
            label="Plan Name *"
            placeholder="e.g. Professional Growth Plan"
            {...register('name')}
            error={errors.name?.message}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Description</label>
            <textarea
              rows={3}
              placeholder="Features, audience, SLA guidelines..."
              {...register('description')}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Link to Core Product *</label>
            <select
              {...register('product_id')}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-violet-500"
            >
              <option value="">Select Product</option>
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} ({prod.product_type})
                </option>
              ))}
            </select>
            {errors.product_id && <p className="text-xs text-rose-500">{errors.product_id.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Billing Frequency</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((freq) => (
                <label
                  key={freq}
                  className={`flex items-center justify-center p-3 rounded-xl border text-xs font-bold uppercase tracking-wider cursor-pointer transition ${
                    watched.billing_frequency === freq
                      ? 'border-violet-600 bg-violet-50 text-violet-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    value={freq}
                    {...register('billing_frequency')}
                    className="sr-only"
                  />
                  <span>{freq}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Price (₹) *"
              type="number"
              step="0.01"
              placeholder="6999"
              {...register('price')}
              error={errors.price?.message}
            />
            <Input
              label="Minimum Quantity"
              type="number"
              min="1"
              placeholder="1"
              {...register('min_quantity')}
              error={errors.min_quantity?.message}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Available From (Optional)"
              type="date"
              {...register('available_from')}
            />
            <Input
              label="Available To (Optional)"
              type="date"
              {...register('available_to')}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              className="w-4 h-4 text-violet-600 rounded-md focus:ring-violet-500 border-slate-300"
            />
            <label htmlFor="is_active" className="text-sm font-semibold text-slate-700">
              Active and ready for quotations
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => navigate('/plans')}>
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isPending} icon={<Save className="w-4 h-4" />}>
              {isEdit ? 'Update Plan' : 'Save Plan'}
            </Button>
          </div>
        </form>

        {/* Live Preview Column (5 cols) */}
        <div className="lg:col-span-5 space-y-3 sticky top-24">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span>Live Plan Card Preview</span>
          </div>

          <div className="bg-white rounded-3xl p-7 border-2 border-violet-500 shadow-xl shadow-violet-500/10 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800">
                  {watched.billing_frequency || 'monthly'}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {watched.name || 'Sample Plan Title'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {watched.description || 'Live preview of how customers and sales representatives will see this plan in quotes.'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">
                  ₹{Number(watched.price || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  /{watched.billing_frequency || 'month'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Min {watched.min_quantity || 1} seat(s)
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Product: {selectedProduct?.name || 'Linked Product'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Automated recurring subscription generation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>GST Tax & discounts calculation ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
