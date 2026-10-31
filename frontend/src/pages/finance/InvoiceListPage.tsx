import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format, isPast } from 'date-fns';
import {
  FileText,
  Sparkles,
  Search,
  CheckCircle2,
  CreditCard,
  Eye,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';
import { financeApi } from '../../api/finance';
import { Invoice } from '../../types';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RecordPaymentModal } from './RecordPaymentModal';

export const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', statusTab, search],
    queryFn: () =>
      financeApi.getInvoices({
        status: statusTab === 'all' ? undefined : statusTab,
        search: search || undefined,
      }),
  });

  const generateMutation = useMutation({
    mutationFn: financeApi.generateInvoices,
    onSuccess: (generated) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
      if (generated.length > 0) {
        toast.success(`Generated ${generated.length} invoices for subscriptions due for billing!`);
      } else {
        toast.info('No subscriptions are currently due for automatic billing.');
      }
    },
    onError: () => toast.error('Failed to trigger automatic invoice generation'),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => financeApi.confirmInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice confirmed');
    },
  });

  const handleSelectAll = () => {
    if (selectedIds.length === invoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(invoices.map((inv) => inv.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkConfirm = async () => {
    try {
      await Promise.all(selectedIds.map((id) => financeApi.confirmInvoice(id)));
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(`Confirmed ${selectedIds.length} invoices`);
      setSelectedIds([]);
    } catch {
      toast.error('Failed to confirm some invoices');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invoices & Statements</h1>
          <p className="text-sm text-slate-500">
            Track receivables, collect payments, and dispatch recurring client statements.
          </p>
        </div>
        <Button
          loading={generateMutation.isPending}
          onClick={() => generateMutation.mutate()}
          icon={<Sparkles className="w-4 h-4" />}
        >
          Generate Invoices
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['all', 'draft', 'confirmed', 'paid', 'partially_paid', 'overdue', 'cancelled'].map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusTab(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition ${
                statusTab === status
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          )
        )}
      </div>

      {/* Filter and Bulk Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice number or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-violet-500 focus:bg-white transition"
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 self-end sm:self-auto bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-bold text-violet-900">
              {selectedIds.length} invoice(s) selected
            </span>
            <button
              onClick={handleBulkConfirm}
              className="text-xs font-semibold px-2.5 py-1 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
            >
              Confirm Selected
            </button>
          </div>
        )}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === invoices.length}
                    onChange={handleSelectAll}
                    className="rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Outstanding</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-slate-400">
                    <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No invoices found matching criteria.</p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const isOverdue =
                    isPast(new Date(inv.due_date)) && !['paid', 'cancelled'].includes(inv.status);
                  const isSelected = selectedIds.includes(inv.id);

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition group ${
                        isSelected ? 'bg-violet-50/30' : ''
                      }`}
                    >
                      <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(inv.id)}
                          className="rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-violet-600 group-hover:underline">
                        {inv.invoice_number}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {inv.customer?.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {inv.subscription?.plan?.name || 'SaaS Plan'}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">
                        ₹{inv.total_amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {inv.outstanding_amount > 0 ? (
                          <span className="text-rose-600">
                            ₹{inv.outstanding_amount.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold">Settled</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                          {format(new Date(inv.due_date), 'dd MMM yyyy')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={isOverdue ? 'overdue' : inv.status} />
                      </td>
                      <td className="px-6 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/invoices/${inv.id}`}
                          className="inline-flex p-1.5 text-slate-400 hover:text-violet-600 rounded-lg transition"
                          title="View Document"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {inv.status === 'draft' && (
                          <button
                            onClick={() => confirmMutation.mutate(inv.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-semibold hover:bg-violet-100 transition"
                            title="Confirm Invoice"
                          >
                            <span>Confirm</span>
                          </button>
                        )}
                        {!['paid', 'cancelled'].includes(inv.status) && (
                          <button
                            onClick={() => setPaymentInvoice(inv)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition"
                            title="Record Payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment SlideOver Modal */}
      {paymentInvoice && (
        <RecordPaymentModal
          invoice={paymentInvoice}
          isOpen={!!paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
          }}
        />
      )}
    </div>
  );
};
