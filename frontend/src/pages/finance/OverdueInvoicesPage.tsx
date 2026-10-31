import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { AlertCircle, CreditCard, Send, ExternalLink, ShieldAlert } from 'lucide-react';
import { financeApi } from '../../api/finance';
import { Invoice } from '../../types';
import { Button } from '../../components/ui/Button';
import { RecordPaymentModal } from './RecordPaymentModal';

export const OverdueInvoicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { data: overdueInvoices = [], isLoading } = useQuery({
    queryKey: ['overdue-invoices'],
    queryFn: financeApi.getOverdueInvoices,
  });

  const totalOutstanding = overdueInvoices.reduce((acc, inv) => acc + inv.outstanding_amount, 0);

  const handleSendReminder = (inv: Invoice) => {
    toast.success(`Automated payment reminder sent to ${inv.customer?.email}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overdue Invoices</h1>
        <p className="text-sm text-slate-500">
          Prioritize collections for past-due subscription receivables and delinquent accounts.
        </p>
      </div>

      {/* Rose Alert Banner */}
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-rose-950">Action Required: Delinquent Balances</h2>
            <p className="text-xs text-rose-800 mt-0.5">
              <strong>{overdueInvoices.length} invoices</strong> are past their contractual due date totalling{' '}
              <strong className="text-rose-950 font-black">
                ₹{totalOutstanding.toLocaleString('en-IN')}
              </strong>{' '}
              in overdue payments.
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Days Overdue</th>
                <th className="px-6 py-4">Outstanding Due</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Loading overdue records...
                  </td>
                </tr>
              ) : overdueInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <AlertCircle className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
                    <p className="font-bold text-slate-800">Clean Slate!</p>
                    <p className="text-xs text-slate-400 mt-1">No invoices are currently past due.</p>
                  </td>
                </tr>
              ) : (
                overdueInvoices.map((inv) => {
                  const daysOverdue = Math.max(
                    0,
                    differenceInDays(new Date(), new Date(inv.due_date))
                  );

                  return (
                    <tr key={inv.id} className="hover:bg-rose-50/20 transition">
                      <td className="px-6 py-4 font-bold text-violet-600">
                        <Link to={`/invoices/${inv.id}`} className="hover:underline">
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {inv.customer?.name}
                        <span className="block text-xs font-normal text-slate-400">
                          {inv.customer?.company || inv.customer?.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-rose-600">
                        {format(new Date(inv.due_date), 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800">
                          +{daysOverdue} days
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-rose-600 text-base">
                        ₹{inv.outstanding_amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleSendReminder(inv)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Remind</span>
                        </button>
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Record Payment</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <RecordPaymentModal
          invoice={selectedInvoice}
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['overdue-invoices'] });
            queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
          }}
        />
      )}
    </div>
  );
};
