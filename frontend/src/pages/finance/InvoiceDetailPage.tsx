import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  ChevronLeft,
  Printer,
  CreditCard,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { financeApi } from '../../api/finance';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RecordPaymentModal } from './RecordPaymentModal';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const invoiceId = Number(id);
  const queryClient = useQueryClient();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => financeApi.getInvoice(invoiceId),
    enabled: !!invoiceId,
  });

  const confirmMutation = useMutation({
    mutationFn: () => financeApi.confirmInvoice(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      toast.success('Invoice confirmed');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => financeApi.cancelInvoice(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      toast.success('Invoice cancelled');
      setCancelConfirmOpen(false);
    },
  });

  if (isLoading || !invoice) {
    return <div className="p-12 text-center text-slate-400">Loading invoice document...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/invoices" className="hover:text-violet-600 transition flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Invoices</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900">{invoice.invoice_number}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
            Print / PDF
          </Button>

          {invoice.status === 'draft' && (
            <Button
              loading={confirmMutation.isPending}
              onClick={() => confirmMutation.mutate()}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm Invoice
            </Button>
          )}

          {!['paid', 'cancelled'].includes(invoice.status) && (
            <Button
              onClick={() => setPaymentModalOpen(true)}
              icon={<CreditCard className="w-4 h-4" />}
            >
              Record Payment
            </Button>
          )}

          {invoice.status !== 'cancelled' && (
            <Button
              variant="ghost"
              onClick={() => setCancelConfirmOpen(true)}
              className="text-rose-600 hover:bg-rose-50"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Printable Document */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-violet-600/30">
                <Sparkles className="w-6 h-6 fill-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">Brightloop</span>
                <p className="text-xs text-slate-400">Team Syntax Enterprise SaaS</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed">
              Cyber City, DLF Phase 2<br />
              Gurugram, HR 122002, India<br />
              GSTIN: 07AAAAA0000A1Z5
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <h1 className="text-2xl font-black text-violet-700 tracking-tight">
              {invoice.invoice_number}
            </h1>
            <div className="flex sm:justify-end py-1">
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-xs text-slate-500">
              Issue Date: {format(new Date(invoice.issue_date), 'dd MMM yyyy')}
            </p>
            <p className="text-xs font-semibold text-rose-600">
              Due Date: {format(new Date(invoice.due_date), 'dd MMM yyyy')}
            </p>
          </div>
        </div>

        {/* Bill To & Contract Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/80 p-6 rounded-2xl border border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Billed To:</span>
            <p className="font-bold text-slate-900 text-base mt-1">{invoice.customer?.name}</p>
            <p className="text-xs text-slate-600 font-medium">{invoice.customer?.company}</p>
            <p className="text-xs text-slate-500 mt-1">{invoice.customer?.email}</p>
            <p className="text-xs text-slate-500">{invoice.customer?.address}</p>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Subscription Reference:
            </span>
            <p className="font-bold text-slate-900 text-base mt-1">
              {invoice.subscription?.subscription_number || 'Direct Contract Invoice'}
            </p>
            <p className="text-xs text-slate-600">
              Plan: {invoice.subscription?.plan?.name || 'SaaS Cloud Suite'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Terms: 30 Net Days • Recurring Contract
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3">Description</th>
                <th className="py-3 text-right">Subtotal</th>
                <th className="py-3 text-right">Discount</th>
                <th className="py-3 text-right">Tax</th>
                <th className="py-3 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              <tr>
                <td className="py-4 font-semibold text-slate-900">
                  {invoice.subscription?.plan?.name || 'Brightloop Cloud Subscription Service'}
                  <span className="block text-xs font-normal text-slate-400">
                    Cycle period billing statement
                  </span>
                </td>
                <td className="py-4 text-right font-medium">₹{invoice.subtotal.toLocaleString('en-IN')}</td>
                <td className="py-4 text-right text-rose-600 font-medium">
                  -₹{invoice.discount_amount.toLocaleString('en-IN')}
                </td>
                <td className="py-4 text-right font-medium">
                  +₹{invoice.tax_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </td>
                <td className="py-4 text-right font-extrabold text-slate-900">
                  ₹{invoice.total_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Box */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-100 pt-6">
          <div className="max-w-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Notes:</span>
            <p className="text-xs text-slate-600 italic">
              {invoice.notes || 'Payment due within 30 days of issuance. Thank you for your business!'}
            </p>
          </div>

          <div className="w-full sm:w-80 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discount:</span>
                <span>-₹{invoice.discount_amount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax (GST):</span>
              <span>+₹{invoice.tax_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
              <span>Total Invoice Amount:</span>
              <span>₹{invoice.total_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Paid to Date:</span>
              <span>₹{invoice.paid_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-baseline font-black">
              <span className="text-slate-900">Outstanding Due:</span>
              <span className="text-2xl text-rose-600">
                ₹{invoice.outstanding_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History Section */}
        <div className="border-t border-slate-100 pt-8 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-violet-600" />
            <span>Payments History</span>
          </h3>

          {!invoice.payments || invoice.payments.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No payments recorded against this invoice yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {invoice.payments.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition text-sm">
                  <div>
                    <span className="font-bold text-slate-900 block">{p.payment_number}</span>
                    <span className="text-xs text-slate-500">
                      {format(new Date(p.payment_date), 'dd MMM yyyy')} • Method:{' '}
                      <strong className="uppercase text-slate-700">{p.payment_method}</strong>
                      {p.reference && ` • Ref: ${p.reference}`}
                    </span>
                  </div>
                  <span className="font-black text-emerald-600">
                    +₹{p.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Record Payment SlideOver */}
      {paymentModalOpen && (
        <RecordPaymentModal
          invoice={invoice}
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
          }}
        />
      )}

      {/* Cancel Confirm Dialog */}
      <ConfirmDialog
        isOpen={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        onConfirm={() => cancelMutation.mutate()}
        title="Cancel Invoice"
        message="Are you sure you want to cancel this invoice? This action is permanent."
        confirmText="Cancel Invoice"
        variant="danger"
        loading={cancelMutation.isPending}
      />
    </div>
  );
};
