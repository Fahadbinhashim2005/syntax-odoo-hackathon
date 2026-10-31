import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format, isPast } from 'date-fns';
import {
  ChevronLeft,
  Printer,
  CheckCircle2,
  Send,
  Building2,
  Calendar,
  Sparkles,
  Repeat,
  XCircle,
  Check,
  FileSpreadsheet,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { subscriptionsApi } from '../../api/subscriptions';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';

export const QuotationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const quotationId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Modals state
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [convertNotes, setConvertNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('Customer opted for competitor or requested cancellation');

  const { data: quotation, isLoading } = useQuery({
    queryKey: ['quotation', quotationId],
    queryFn: () => subscriptionsApi.getQuotation(quotationId),
    enabled: !!quotationId,
  });

  // Actions mutations
  const convertMutation = useMutation({
    mutationFn: () =>
      subscriptionsApi.confirmQuotation(quotationId, {
        start_date: startDate,
        notes: convertNotes || undefined,
      }),
    onSuccess: (sub) => {
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success(`Quotation converted! Subscription ${sub.subscription_number} generated.`);
      setConvertModalOpen(false);
      navigate(`/subscriptions/${sub.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to convert quotation');
    },
  });

  const sendMutation = useMutation({
    mutationFn: () => subscriptionsApi.sendQuotation(quotationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation proposal marked as Sent to Client');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to update quotation status');
    },
  });

  const acceptMutation = useMutation({
    mutationFn: () => subscriptionsApi.acceptQuotation(quotationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation accepted by client');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to accept quotation');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => subscriptionsApi.rejectQuotation(quotationId, rejectReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation marked as Rejected');
      setRejectModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to reject quotation');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => subscriptionsApi.cancelQuotation(quotationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation cancelled');
      setCancelModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to cancel quotation');
    },
  });

  if (isLoading || !quotation) {
    return (
      <div className="p-16 text-center text-slate-400">
        Loading quotation document...
      </div>
    );
  }

  const isExpired =
    quotation.valid_until &&
    isPast(new Date(quotation.valid_until)) &&
    !['converted', 'cancelled'].includes(quotation.status);

  const subtotal = quotation.unit_price * quotation.quantity;
  const canConvert =
    !isExpired &&
    ['draft', 'sent', 'accepted'].includes(quotation.status) &&
    quotation.status !== 'converted' &&
    !quotation.subscription_id;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Controls Bar (hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/quotations" className="hover:text-[#183630] transition flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Quotations</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{quotation.quotation_number}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => window.print()}
            icon={<Printer className="w-4 h-4" />}
          >
            Print / PDF
          </Button>

          {quotation.status === 'draft' && (
            <>
              <Button
                variant="outline"
                loading={sendMutation.isPending}
                onClick={() => sendMutation.mutate()}
                icon={<Send className="w-4 h-4" />}
              >
                Mark as Sent
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCancelModalOpen(true)}
                className="text-rose-600 hover:bg-rose-50 border-rose-200"
              >
                Cancel Draft
              </Button>
            </>
          )}

          {quotation.status === 'sent' && (
            <>
              <Button
                variant="outline"
                loading={acceptMutation.isPending}
                onClick={() => acceptMutation.mutate()}
                icon={<Check className="w-4 h-4" />}
              >
                Mark Accepted
              </Button>
              <Button
                variant="ghost"
                onClick={() => setRejectModalOpen(true)}
                className="text-rose-600 hover:bg-rose-50 border-rose-200"
              >
                Reject
              </Button>
            </>
          )}

          {canConvert && (
            <Button
              onClick={() => {
                setStartDate(format(new Date(), 'yyyy-MM-dd'));
                setConvertNotes(`Converted from proposal ${quotation.quotation_number}`);
                setConvertModalOpen(true);
              }}
              icon={<CheckCircle2 className="w-4 h-4 text-[#E5C690]" />}
            >
              Convert to Subscription
            </Button>
          )}

          {quotation.subscription_id && (
            <Link to={`/subscriptions/${quotation.subscription_id}`}>
              <Button icon={<Repeat className="w-4 h-4" />}>
                View Subscription ({quotation.subscription_number || `#${quotation.subscription_id}`})
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Converted Alert Banner */}
      {quotation.status === 'converted' && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                This Quotation Has Been Converted to an Active Subscription
              </h4>
              <p className="text-xs text-emerald-800">
                Linked contract reference: <strong className="font-bold">{quotation.subscription_number || `#${quotation.subscription_id}`}</strong>. Future billing schedules are now managed under Subscriptions.
              </p>
            </div>
          </div>
          {quotation.subscription_id && (
            <Link to={`/subscriptions/${quotation.subscription_id}`}>
              <Button size="sm" variant="outline">
                Open Subscription
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Printable Quotation Document Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#183630] text-[#E5C690] flex items-center justify-center font-black text-xl shadow-md">
                BL
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
                  Brightloop
                </span>
                <span className="text-[11px] text-[#183630] font-bold uppercase tracking-wider">
                  Team Syntax | Enterprise SaaS
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed">
              Cyber City, DLF Phase 2<br />
              Gurugram, HR 122002, India<br />
              contact@brightloop.io • GSTIN: 07AAACB1234F1Z5
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#183630] bg-[#183630]/10 px-2.5 py-1 rounded-full">
              Commercial Quotation
            </span>
            <h1 className="text-2xl font-black text-[#183630] tracking-tight pt-1">
              {quotation.quotation_number}
            </h1>
            <div className="flex sm:justify-end py-1">
              <StatusBadge status={isExpired ? 'expired' : quotation.status} />
            </div>
            <p className="text-xs text-slate-500">
              Proposal Date: {format(new Date(quotation.created_at), 'dd MMM yyyy')}
            </p>
            {quotation.valid_until && (
              <p className={`text-xs font-semibold ${isExpired ? 'text-rose-600' : 'text-slate-600'}`}>
                Proposal Valid Until: {format(new Date(quotation.valid_until), 'dd MMM yyyy')}
              </p>
            )}
          </div>
        </div>

        {/* Customer & Package Terms Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quotation Prepared For:
            </span>
            <p className="font-bold text-slate-900 text-base mt-1">{quotation.customer?.name}</p>
            <p className="text-xs text-slate-600 font-medium">{quotation.customer?.company || 'Personal Account'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{quotation.customer?.email}</p>
            {quotation.customer?.phone && (
              <p className="text-xs text-slate-500 mt-0.5">Phone: {quotation.customer?.phone}</p>
            )}
            {quotation.customer?.address && (
              <p className="text-xs text-slate-400 mt-1">{quotation.customer?.address}</p>
            )}
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Subscription Package Terms:
            </span>
            <p className="font-bold text-slate-900 text-base mt-1">{quotation.plan?.name}</p>
            <p className="text-xs text-slate-600">
              Billing Cadence: <span className="capitalize font-semibold">{quotation.plan?.billing_frequency}</span>
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Platform Product: {quotation.product?.name || quotation.plan?.product?.name || 'Cloud Platform'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Quantity / Active Seats: <strong>{quotation.quantity} Unit(s)</strong>
            </p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3">Item Description</th>
                <th className="py-3 text-center">Seats</th>
                <th className="py-3 text-right">Unit Rate</th>
                <th className="py-3 text-right">Discount</th>
                <th className="py-3 text-right">GST / Tax</th>
                <th className="py-3 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              <tr>
                <td className="py-4 font-semibold text-slate-900">
                  {quotation.plan?.name || 'SaaS Subscription'}
                  <span className="block text-xs font-normal text-slate-400">
                    Billed every {quotation.plan?.billing_frequency || 'cycle'}
                  </span>
                </td>
                <td className="py-4 text-center font-medium">{quotation.quantity}</td>
                <td className="py-4 text-right font-medium">₹{quotation.unit_price.toLocaleString('en-IN')}</td>
                <td className="py-4 text-right text-rose-600 font-medium">
                  -₹{quotation.discount_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </td>
                <td className="py-4 text-right font-medium">
                  +₹{quotation.tax_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </td>
                <td className="py-4 text-right font-black text-slate-900">
                  ₹{quotation.total_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Totals Calculation Box */}
        <div className="flex justify-end pt-2">
          <div className="w-full max-w-sm space-y-2 text-sm text-slate-600">
            <div className="flex justify-between py-1">
              <span>Gross Base Subtotal:</span>
              <span className="font-semibold text-slate-900">
                ₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between py-1 text-rose-600">
              <span>Total Promotional Discount:</span>
              <span className="font-semibold">
                -₹{quotation.discount_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span>Tax / GST:</span>
              <span className="font-semibold text-slate-900">
                +₹{quotation.tax_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="border-t-2 border-slate-200 pt-3 flex justify-between items-baseline">
              <div>
                <span className="text-base font-black text-[#183630]">Proposal Grand Total:</span>
                <p className="text-[10px] text-slate-400">Recurring every {quotation.plan?.billing_frequency}</p>
              </div>
              <span className="text-2xl font-black text-[#183630]">
                ₹{quotation.total_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Terms & Notes */}
        {quotation.notes && (
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Commercial Notes & Terms:
            </span>
            <p className="text-xs text-slate-600 whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
              {quotation.notes}
            </p>
          </div>
        )}

        {/* Legal Disclaimer Note */}
        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed text-center">
          <p>
            This document is a commercial price quotation proposal and does NOT constitute a tax invoice or demand for immediate payment.
            Conversion into an active subscription initiates recurring invoice cycles according to Brightloop Terms of Service.
          </p>
        </div>
      </div>

      {/* CONVERSION MODAL */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title={`Convert Proposal ${quotation.quotation_number} to Subscription`}
      >
        <div className="space-y-4">
          <div className="bg-[#183630]/5 p-4 rounded-2xl border border-[#183630]/15 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Customer:</span>
              <span className="font-bold text-slate-900">{quotation.customer?.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Plan Tier:</span>
              <span className="font-bold text-slate-900">{quotation.plan?.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Total Contract Value:</span>
              <span className="font-black text-[#183630]">
                ₹{quotation.total_amount.toLocaleString('en-IN')} /{quotation.plan?.billing_frequency}
              </span>
            </div>
          </div>

          <Input
            label="Contract Effective Start Date *"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Contract Notes</label>
            <textarea
              rows={2}
              value={convertNotes}
              onChange={(e) => setConvertNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#183630]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setConvertModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={convertMutation.isPending}
              onClick={() => convertMutation.mutate()}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Confirm Conversion
            </Button>
          </div>
        </div>
      </Modal>

      {/* REJECT MODAL */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Mark Quotation as Rejected"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Please enter any feedback or rejection reason from the customer for tracking.
          </p>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Reason for Rejection</label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#183630]"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={rejectMutation.isPending}
              onClick={() => rejectMutation.mutate()}
            >
              Mark Rejected
            </Button>
          </div>
        </div>
      </Modal>

      {/* CANCEL MODAL */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={() => cancelMutation.mutate()}
        title="Cancel Draft Quotation"
        message="Are you sure you want to cancel this draft quotation? It will no longer be eligible for conversion."
        confirmText="Confirm Cancel"
        variant="danger"
        loading={cancelMutation.isPending}
      />
    </div>
  );
};
