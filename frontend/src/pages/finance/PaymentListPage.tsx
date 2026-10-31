import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { CreditCard, Search, ArrowRight, ExternalLink } from 'lucide-react';
import { financeApi } from '../../api/finance';
import { Payment } from '../../types';

export const PaymentListPage: React.FC = () => {
  const [methodFilter, setMethodFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', methodFilter, search],
    queryFn: () =>
      financeApi.getPayments({
        method: methodFilter === 'all' ? undefined : methodFilter,
        search: search || undefined,
      }),
  });

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payments Ledger</h1>
          <p className="text-sm text-slate-500">
            Audit trial of incoming client funds, gateway receipts, and settlement transactions.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl flex items-center gap-3">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Total Captured
          </span>
          <span className="text-xl font-black text-emerald-700">
            ₹{totalCollected.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by payment reference or PAY number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-violet-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label className="text-xs font-medium text-slate-500">Method:</label>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Methods</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Payment #</th>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment Date</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Reference ID</th>
                <th className="px-6 py-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    <CreditCard className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No payment records found.</p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{p.payment_number}</td>
                    <td className="px-6 py-4 font-semibold text-violet-600">
                      <Link to={`/invoices/${p.invoice_id}`} className="hover:underline">
                        INV-{p.invoice_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {p.customer?.name || `Customer #${p.customer_id}`}
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-600">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {format(new Date(p.payment_date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="uppercase px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-100">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {p.reference || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/invoices/${p.invoice_id}`}
                        className="inline-flex p-1.5 text-slate-400 hover:text-violet-600 rounded-lg"
                        title="View Invoice"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
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
