import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Percent, Plus, Edit2, Power, Tag } from 'lucide-react';
import { catalogueApi } from '../../api/catalogue';
import { Discount } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SlideOver } from '../../components/ui/SlideOver';

const discountSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  discount_type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0, 'Value must be >= 0'),
  applicable_to: z.enum(['all', 'plan', 'product']),
  valid_from: z.string().optional().nullable(),
  valid_to: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

type DiscountFormData = {
  name: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  applicable_to: 'all' | 'plan' | 'product';
  valid_from?: string | null;
  valid_to?: string | null;
  is_active: boolean;
};

export const DiscountManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  const { data: discounts = [], isLoading } = useQuery({
    queryKey: ['discounts'],
    queryFn: catalogueApi.getDiscounts,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema) as any,
    defaultValues: {
      name: '',
      discount_type: 'percentage',
      applicable_to: 'all',
      value: 10,
      is_active: true,
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: DiscountFormData) => {
      const payload = {
        ...data,
        valid_from: data.valid_from || null,
        valid_to: data.valid_to || null,
      };
      if (editingDiscount) {
        return catalogueApi.updateDiscount(editingDiscount.id, payload as any);
      }
      return catalogueApi.createDiscount(payload as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success(editingDiscount ? 'Discount updated' : 'Discount created');
      setSlideOverOpen(false);
      setEditingDiscount(null);
      reset();
    },
    onError: (err: any) => {
      toast.error('Failed to save discount');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      catalogueApi.updateDiscount(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Discount status updated');
    },
  });

  const handleOpenAdd = () => {
    setEditingDiscount(null);
    reset({
      name: '',
      discount_type: 'percentage',
      value: 10,
      applicable_to: 'all',
      valid_from: '',
      valid_to: '',
      is_active: true,
    });
    setSlideOverOpen(true);
  };

  const handleOpenEdit = (disc: Discount) => {
    setEditingDiscount(disc);
    setValue('name', disc.name);
    setValue('discount_type', disc.discount_type);
    setValue('value', disc.value);
    setValue('applicable_to', disc.applicable_to);
    setValue('valid_from', disc.valid_from || '');
    setValue('valid_to', disc.valid_to || '');
    setValue('is_active', disc.is_active);
    setSlideOverOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Discount & Promotions</h1>
          <p className="text-sm text-slate-500">
            Define promotional coupon codes, percentage deductions, and flat-rate credits.
          </p>
        </div>
        <Button onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Add Discount
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Discount Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Applicable To</th>
                <th className="px-6 py-4">Valid Period</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Loading discounts...
                  </td>
                </tr>
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No discounts created yet.
                  </td>
                </tr>
              ) : (
                discounts.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-violet-600" />
                      <span>{d.name}</span>
                    </td>
                    <td className="px-6 py-4 capitalize">{d.discount_type}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {d.discount_type === 'percentage'
                        ? `${d.value}%`
                        : `₹${d.value.toLocaleString('en-IN')}`}
                    </td>
                    <td className="px-6 py-4 capitalize">{d.applicable_to}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {d.valid_from ? format(new Date(d.valid_from), 'dd MMM yyyy') : 'Anytime'} →{' '}
                      {d.valid_to ? format(new Date(d.valid_to), 'dd MMM yyyy') : 'Ongoing'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={d.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(d)}
                        className="p-1.5 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleMutation.mutate({ id: d.id, is_active: !d.is_active })}
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

      {/* Add / Edit SlideOver */}
      <SlideOver
        isOpen={slideOverOpen}
        onClose={() => setSlideOverOpen(false)}
        title={editingDiscount ? 'Edit Discount' : 'Create New Discount'}
      >
        <form onSubmit={handleSubmit((data: DiscountFormData) => saveMutation.mutate(data))} className="space-y-4">
          <Input label="Discount Title *" {...register('name')} error={errors.name?.message} />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Type</label>
            <select
              {...register('discount_type')}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-violet-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Deduction (₹)</option>
            </select>
          </div>

          <Input
            label="Discount Value *"
            type="number"
            step="0.01"
            {...register('value')}
            error={errors.value?.message}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Applies To</label>
            <select
              {...register('applicable_to')}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Plans & Invoices</option>
              <option value="plan">Specific Plan</option>
              <option value="product">Specific Product</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Valid From" type="date" {...register('valid_from')} />
            <Input label="Valid To" type="date" {...register('valid_to')} />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setSlideOverOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isPending}>
              Save Discount
            </Button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
};
