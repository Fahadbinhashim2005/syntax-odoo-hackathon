import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FileText, CreditCard, ArrowRight, CheckCircle2 } from 'lucide-react';
import { financeApi } from '../../api/finance';
import { Invoice } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RecordPaymentModal } from './RecordPaymentModal';

export const CustomerMyInvoicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['my-invoices'],
    queryFn: () => financeApi.getInvoices({}),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Invoices & Statements</h1>
        <p className="text-sm text-slate-500">
          Review generated bills, download PDF statements, and process online payments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 p-12 text-center text-slate-400">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="col-span-3 bg-white rounded-3xl p-16 text-center border border-slate-200">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No invoices on file</p>
            <p className="text-xs text-slate-400 mt-1">Invoices appear here once subscription terms are billed.</p>
          </div>
        ) : (
          invoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-violet-600 block text-base">
                      {inv.invoice_number}
                    </span>
                    <span className="text-xs text-slate-400">
                      Due: {format(new Date(inv.due_date), 'dd MMM yyyy')}
                    </span>
                  </div>
                  <StatusBadge status={inv.status} />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">Total Billed:</span>
                    <span className="text-xl font-black text-slate-900">
                      ₹{inv.total_amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {inv.outstanding_amount > 0 && (
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="text-xs font-bold text-rose-600">Balance Due:</span>
                      <span className="text-sm font-black text-rose-600">
                        ₹{inv.outstanding_amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex gap-2">
                <Link
                  to={`/invoices/${inv.id}`}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 text-center hover:bg-slate-50 transition"
                >
                  View Details
                </Link>
                {inv.outstanding_amount > 0 && (
                  <button
                    onClick={() => setPayInvoice(inv)}
                    className="flex-1 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold text-center hover:bg-violet-700 transition flex items-center justify-center gap-1 shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Now</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {payInvoice && (
        <RecordPaymentModal
          invoice={payInvoice}
          isOpen={!!payInvoice}
          onClose={() => setPayInvoice(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['my-invoices'] });
          }}
        />
      )}
    </div>
  );
};
