import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format, isPast } from 'date-fns';
import {
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Check,
  Calendar,
  Repeat,
  ArrowRight,
  Filter
} from 'lucide-react';
import { subscriptionsApi } from '../../api/subscriptions';
import { Quotation } from '../../types';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';

export const QuotationListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Conversion Dialog State
  const [convertingQt, setConvertingQt] = useState<Quotation | null>(null);
  const [conversionStartDate, setConversionStartDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [conversionNotes, setConversionNotes] = useState('');

  // Cancel Dialog State
  const [cancellingQt, setCancellingQt] = useState<Quotation | null>(null);

  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ['quotations', statusTab, search, fromDate, toDate],
    queryFn: () =>
      subscriptionsApi.getQuotations({
        status: statusTab === 'all' ? undefined : statusTab,
        search: search || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      }),
  });

  // Conversion mutation
  const convertMutation = useMutation({
    mutationFn: (qtId: number) =>
      subscriptionsApi.confirmQuotation(qtId, {
        start_date: conversionStartDate,
        notes: conversionNotes || undefined,
      }),
    onSuccess: (sub) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success(`Quotation converted! Subscription ${sub.subscription_number} created.`);
      setConvertingQt(null);
      navigate(`/subscriptions/${sub.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to convert quotation');
    },
  });

  // Cancel quotation mutation
  const cancelMutation = useMutation({
    mutationFn: (qtId: number) => subscriptionsApi.cancelQuotation(qtId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation cancelled');
      setCancellingQt(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to cancel quotation');
    },
  });

  const allCount = quotations.length;
  const draftCount = quotations.filter((q) => q.status === 'draft').length;
  const sentCount = quotations.filter((q) => q.status === 'sent').length;
  const convertedCount = quotations.filter((q) => q.status === 'converted' || q.status === 'accepted').length;
  const expiredCount = quotations.filter((q) => q.valid_until && isPast(new Date(q.valid_until)) && !['converted', 'cancelled'].includes(q.status)).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#183630] text-[#E5C690] flex items-center justify-center text-sm font-bold shadow-sm">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            Quotations Pipeline
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create, manage commercial proposals and convert approved quotes to recurring active subscriptions.
          </p>
        </div>
        <Button onClick={() => navigate('/quotations/new')} icon={<Plus className="w-4 h-4" />}>
          New Quotation
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'All Quotations', count: allCount },
          { id: 'draft', label: 'Draft', count: draftCount },
          { id: 'sent', label: 'Sent to Client', count: sentCount },
          { id: 'converted', label: 'Converted to Subscriptions', count: convertedCount },
          { id: 'expired', label: 'Expired', count: expiredCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-2 ${
              statusTab === tab.id
                ? 'bg-[#183630] text-[#E5C690] shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quotations by number (QT-2026-...) or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#183630] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-[#183630]"
            title="From creation date"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-[#183630]"
            title="To creation date"
          />
          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
              className="text-xs font-semibold text-rose-600 hover:underline px-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">QT Number</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Subscription Plan</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Valid Until</th>
                <th className="px-6 py-4">Status / Linked Sub</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Loading quotation proposals...
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                    <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No quotations found.</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">
                      Create your first subscription proposal for prospective clients.
                    </p>
                    <Button onClick={() => navigate('/quotations/new')} icon={<Plus className="w-4 h-4" />}>
                      Create Quotation
                    </Button>
                  </td>
                </tr>
              ) : (
                quotations.map((qt) => {
                  const isExpired =
                    qt.valid_until &&
                    isPast(new Date(qt.valid_until)) &&
                    !['converted', 'cancelled'].includes(qt.status);

                  const canConvert =
                    !isExpired &&
                    ['draft', 'sent', 'accepted'].includes(qt.status) &&
                    qt.status !== 'converted' &&
                    !qt.subscription_id;

                  return (
                    <tr
                      key={qt.id}
                      onClick={() => navigate(`/quotations/${qt.id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition group"
                    >
                      <td className="px-6 py-4 font-bold text-[#183630] group-hover:underline">
                        {qt.quotation_number}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 block">{qt.customer?.name || 'Customer'}</span>
                        <span className="text-xs text-slate-400">{qt.customer?.company || qt.customer?.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#183630]/10 text-[#183630]">
                          {qt.plan?.name || 'Plan'}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5 capitalize">
                          {qt.quantity} seat(s) • {qt.plan?.billing_frequency}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">
                        ₹{qt.total_amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className={isExpired ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                          {qt.valid_until ? format(new Date(qt.valid_until), 'dd MMM yyyy') : 'No expiry'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <StatusBadge status={isExpired ? 'expired' : qt.status} />
                          {qt.subscription_number && (
                            <Link
                              to={`/subscriptions/${qt.subscription_id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:underline block"
                            >
                              <Repeat className="w-3 h-3 text-emerald-600" />
                              <span>{qt.subscription_number}</span>
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/quotations/${qt.id}`}
                          className="inline-flex p-1.5 text-slate-500 hover:text-[#183630] hover:bg-slate-100 rounded-lg transition"
                          title="View Document"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Conversion Action */}
                        {canConvert && (
                          <button
                            onClick={() => {
                              setConvertingQt(qt);
                              setConversionNotes(`Converted from quotation ${qt.quotation_number}`);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition shadow-xs"
                            title="Convert to Active Subscription"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Convert</span>
                          </button>
                        )}

                        {/* Cancel Draft */}
                        {qt.status === 'draft' && (
                          <button
                            onClick={() => setCancellingQt(qt)}
                            className="inline-flex p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Cancel Draft"
                          >
                            <XCircle className="w-4 h-4" />
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

      {/* CONVERSION MODAL */}
      <Modal
        isOpen={!!convertingQt}
        onClose={() => setConvertingQt(null)}
        title={`Convert ${convertingQt?.quotation_number} to Subscription`}
      >
        {convertingQt && (
          <div className="space-y-4">
            <div className="bg-[#183630]/5 p-4 rounded-2xl border border-[#183630]/15 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">{convertingQt.customer?.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Plan Tier:</span>
                <span className="font-bold text-slate-900">{convertingQt.plan?.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Recurring Price:</span>
                <span className="font-black text-[#183630]">
                  ₹{convertingQt.total_amount.toLocaleString('en-IN')} /{convertingQt.plan?.billing_frequency}
                </span>
              </div>
            </div>

            <Input
              label="Subscription Contract Start Date *"
              type="date"
              value={conversionStartDate}
              onChange={(e) => setConversionStartDate(e.target.value)}
            />

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Contract Notes / Terms</label>
              <textarea
                rows={2}
                value={conversionNotes}
                onChange={(e) => setConversionNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#183630]"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => setConvertingQt(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                loading={convertMutation.isPending}
                onClick={() => convertMutation.mutate(convertingQt.id)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Confirm & Create Subscription
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* CANCEL CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={!!cancellingQt}
        onClose={() => setCancellingQt(null)}
        onConfirm={() => cancellingQt && cancelMutation.mutate(cancellingQt.id)}
        title="Cancel Quotation Proposal"
        message={`Are you sure you want to cancel draft quotation ${cancellingQt?.quotation_number}? This action cannot be undone.`}
        confirmText="Yes, Cancel Proposal"
        variant="danger"
        loading={cancelMutation.isPending}
      />
    </div>
  );
};
