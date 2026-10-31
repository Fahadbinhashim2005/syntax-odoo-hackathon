import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Receipt, Plus, Check, Power, Edit2 } from 'lucide-react';
import { catalogueApi } from '../../api/catalogue';
import { Tax } from '../../types';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const TaxSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showAddRow, setShowAddRow] = useState(false);
  const [newTaxName, setNewTaxName] = useState('');
  const [newTaxPercentage, setNewTaxPercentage] = useState('18');

  const { data: taxes = [], isLoading } = useQuery({
    queryKey: ['taxes'],
    queryFn: catalogueApi.getTaxes,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      catalogueApi.createTax({
        name: newTaxName,
        percentage: parseFloat(newTaxPercentage) || 0,
        is_active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast.success('Tax rule created');
      setShowAddRow(false);
      setNewTaxName('');
      setNewTaxPercentage('18');
    },
    onError: () => toast.error('Failed to create tax rule'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      catalogueApi.updateTax(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast.success('Tax status updated');
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tax Configuration</h1>
          <p className="text-sm text-slate-500">
            Configure GST, VAT, and international tax assessment percentages.
          </p>
        </div>
        <Button onClick={() => setShowAddRow(true)} icon={<Plus className="w-4 h-4" />}>
          Add Tax Rule
        </Button>
      </div>

      {/* Inline Add Row Card */}
      {showAddRow && (
        <div className="bg-white rounded-2xl p-5 border-2 border-violet-200 shadow-sm flex flex-col sm:flex-row items-center gap-3 animate-in fade-in duration-200">
          <input
            type="text"
            placeholder="Tax Title (e.g. GST 18%, IGST, Exempt)"
            value={newTaxName}
            onChange={(e) => setNewTaxName(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-violet-500"
          />
          <div className="flex items-center gap-2 w-full sm:w-48">
            <input
              type="number"
              step="0.01"
              placeholder="18"
              value={newTaxPercentage}
              onChange={(e) => setNewTaxPercentage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-violet-500"
            />
            <span className="text-sm font-bold text-slate-500">%</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button variant="ghost" onClick={() => setShowAddRow(false)}>
              Cancel
            </Button>
            <Button
              disabled={!newTaxName}
              loading={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Save Tax
            </Button>
          </div>
        </div>
      )}

      {/* Taxes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Tax Name</th>
                <th className="px-6 py-4">Percentage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    Loading taxes...
                  </td>
                </tr>
              ) : taxes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No tax rules defined yet.
                  </td>
                </tr>
              ) : (
                taxes.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-violet-600" />
                      <span>{t.name}</span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">{t.percentage}%</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={t.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleMutation.mutate({ id: t.id, is_active: !t.is_active })}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title={t.is_active ? 'Deactivate' : 'Activate'}
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
    </div>
  );
};
