import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Layers,
  Plus,
  Check,
  Edit2,
  Power,
  Sparkles,
  Calendar,
  Zap,
  ArrowRight
} from 'lucide-react';
import { catalogueApi } from '../../api/catalogue';
import { Plan } from '../../types';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export const PlanListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deactivatingPlan, setDeactivatingPlan] = useState<Plan | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => catalogueApi.getPlans(),
  });

  const deleteMutation = useMutation({
    mutationFn: catalogueApi.deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan status updated');
      setDeactivatingPlan(null);
    },
    onError: () => toast.error('Failed to change plan status'),
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Subscription Plans</h1>
          <p className="text-sm text-slate-500">
            Define pricing packages, billing recurring frequencies, and availability tiers.
          </p>
        </div>
        <Button onClick={() => navigate('/plans/new')} icon={<Plus className="w-4 h-4" />}>
          Add Plan
        </Button>
      </div>

      {/* Featured 3-Column Plan Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Featured Tier Packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.slice(0, 3).map((plan, idx) => {
            const isPopular = idx === 1 || plan.name.toLowerCase().includes('professional');
            const isEnterprise = idx === 2 || plan.name.toLowerCase().includes('enterprise');

            let cardBorder = 'border-slate-200 hover:border-slate-300';
            let badgeBg = 'bg-slate-100 text-slate-700';

            if (isPopular) {
              cardBorder = 'border-violet-500 ring-2 ring-violet-500/20 shadow-md shadow-violet-500/10';
              badgeBg = 'bg-violet-100 text-violet-800';
            } else if (isEnterprise) {
              cardBorder = 'border-amber-400 hover:border-amber-500';
              badgeBg = 'bg-amber-100 text-amber-800';
            }

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-6 sm:p-7 border flex flex-col justify-between transition-all hover:-translate-y-1 ${cardBorder}`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-white" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badgeBg}`}>
                        {plan.billing_frequency}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-2">{plan.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {plan.description || `Linked to ${plan.product?.name || 'Brightloop'}`}
                      </p>
                    </div>
                    <StatusBadge status={plan.is_active ? 'active' : 'inactive'} />
                  </div>

                  {/* Price */}
                  <div className="pt-2 pb-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-900">
                        ₹{plan.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">/{plan.billing_frequency}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Min quantity: {plan.min_quantity} seat</p>
                  </div>

                  {/* Features list bullet points */}
                  <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Linked Product: {plan.product?.name || 'Cloud Platform'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Instant quotation generation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Automated recurring invoicing</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3 mt-6">
                  <button
                    onClick={() => navigate(`/plans/${plan.id}`)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-violet-600 transition flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Plan</span>
                  </button>
                  <button
                    onClick={() => setDeactivatingPlan(plan)}
                    title={plan.is_active ? 'Deactivate' : 'Activate'}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flat Table for All Plans */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">All Subscription Plans Table</h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Plan Name</th>
                  <th className="px-6 py-4">Linked Product</th>
                  <th className="px-6 py-4">Frequency</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Min Qty</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      Loading plans...
                    </td>
                  </tr>
                ) : (
                  plans.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">{p.name}</td>
                      <td className="px-6 py-4 text-slate-600">{p.product?.name || '—'}</td>
                      <td className="px-6 py-4 capitalize">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">
                          {p.billing_frequency}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">{p.min_quantity}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.is_active ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button
                          onClick={() => navigate(`/plans/${p.id}`)}
                          className="p-1.5 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirm Deactivate Dialog */}
      <ConfirmDialog
        isOpen={!!deactivatingPlan}
        onClose={() => setDeactivatingPlan(null)}
        onConfirm={() => deactivatingPlan && deleteMutation.mutate(deactivatingPlan.id)}
        title="Toggle Plan Status"
        message={`Are you sure you want to deactivate ${deactivatingPlan?.name}?`}
        confirmText="Deactivate"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};
