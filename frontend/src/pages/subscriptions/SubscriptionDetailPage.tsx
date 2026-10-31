import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  ChevronLeft,
  Building2,
  Calendar,
  CreditCard,
  Layers,
  Pause,
  Play,
  RotateCw,
  XCircle,
  FileText,
  Clock,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { subscriptionsApi } from '../../api/subscriptions';
import { financeApi } from '../../api/finance';
import { SubscriptionTimeline } from '../../components/SubscriptionTimeline';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';

export const SubscriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const subId = Number(id);
  const queryClient = useQueryClient();

  // Modals state
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState('Customer requested temporary pause');

  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeDate, setResumeDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [renewalPeriods, setRenewalPeriods] = useState<number>(1);

  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closeReason, setCloseReason] = useState('Customer opted out of renewal');

  // Subscription Query
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', subId],
    queryFn: () => subscriptionsApi.getSubscription(subId),
    enabled: !!subId,
  });

  // Associated Invoices Query
  const { data: invoices = [] } = useQuery({
    queryKey: ['subscription-invoices', subId],
    queryFn: () => financeApi.getInvoices({}),
    select: (allInvs) => allInvs.filter((inv) => inv.subscription_id === subId),
    enabled: !!subId,
  });

  // Lifecycle mutations
  const activateMutation = useMutation({
    mutationFn: () => subscriptionsApi.activateSubscription(subId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', subId] });
      queryClient.invalidateQueries({ queryKey: ['subscription-history', subId] });
      toast.success('Subscription activated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to activate subscription');
    },
  });

  const pauseMutation = useMutation({
    mutationFn: () => subscriptionsApi.pauseSubscription(subId, pauseReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', subId] });
      queryClient.invalidateQueries({ queryKey: ['subscription-history', subId] });
      toast.success('Subscription paused');
      setPauseModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to pause subscription');
    },
  });

  const resumeMutation = useMutation({
    mutationFn: () => subscriptionsApi.resumeSubscription(subId, resumeDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', subId] });
      queryClient.invalidateQueries({ queryKey: ['subscription-history', subId] });
      toast.success('Subscription resumed to active');
      setResumeModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to resume subscription');
    },
  });

  const renewMutation = useMutation({
    mutationFn: () => subscriptionsApi.renewSubscription(subId, renewalPeriods),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', subId] });
      queryClient.invalidateQueries({ queryKey: ['subscription-history', subId] });
      toast.success('Subscription term extended & renewed');
      setRenewModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to renew subscription');
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => subscriptionsApi.closeSubscription(subId, closeReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', subId] });
      queryClient.invalidateQueries({ queryKey: ['subscription-history', subId] });
      toast.success('Subscription closed');
      setCloseModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to close subscription');
    },
  });

  if (isLoading || !subscription) {
    return (
      <div className="p-16 text-center text-slate-400">
        Loading subscription contract details...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/subscriptions" className="hover:text-[#183630] transition flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Subscriptions</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{subscription.subscription_number}</span>
        </div>

        {/* Lifecycle Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {subscription.status === 'confirmed' && (
            <Button
              loading={activateMutation.isPending}
              onClick={() => activateMutation.mutate()}
              icon={<Play className="w-4 h-4 text-[#E5C690]" />}
            >
              Activate Subscription
            </Button>
          )}

          {subscription.status === 'active' && (
            <>
              <Button
                variant="outline"
                onClick={() => setPauseModalOpen(true)}
                icon={<Pause className="w-4 h-4" />}
              >
                Pause Contract
              </Button>
              <Button
                variant="outline"
                onClick={() => setRenewModalOpen(true)}
                icon={<RotateCw className="w-4 h-4" />}
              >
                Renew Term
              </Button>
              <Button
                variant="danger"
                onClick={() => setCloseModalOpen(true)}
                icon={<XCircle className="w-4 h-4" />}
              >
                Close Contract
              </Button>
            </>
          )}

          {subscription.status === 'paused' && (
            <>
              <Button
                loading={resumeMutation.isPending}
                onClick={() => setResumeModalOpen(true)}
                icon={<Play className="w-4 h-4 text-[#E5C690]" />}
              >
                Resume Active
              </Button>
              <Button
                variant="danger"
                onClick={() => setCloseModalOpen(true)}
                icon={<XCircle className="w-4 h-4" />}
              >
                Close Contract
              </Button>
            </>
          )}

          {subscription.status === 'expired' && (
            <Button
              onClick={() => setRenewModalOpen(true)}
              icon={<RotateCw className="w-4 h-4 text-[#E5C690]" />}
            >
              Renew Expired Subscription
            </Button>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {subscription.subscription_number}
            </h1>
            <StatusBadge status={subscription.status} />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Contract started on {format(new Date(subscription.start_date), 'dd MMMM yyyy')}
            {subscription.end_date && ` • Expires ${format(new Date(subscription.end_date), 'dd MMMM yyyy')}`}
          </p>
          {subscription.close_reason && (
            <p className="text-xs text-rose-600 mt-1 font-semibold">
              Closure Reason: {subscription.close_reason}
            </p>
          )}
        </div>

        <div className="text-left md:text-right">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Recurring Contract Rate
          </span>
          <span className="text-3xl font-black text-[#183630]">
            ₹{subscription.total_amount.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-semibold text-slate-400">
              /{subscription.plan?.billing_frequency || 'month'}
            </span>
          </span>
        </div>
      </div>

      {/* 4 Cards Information Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#183630]" />
            <span>Target Customer</span>
          </span>
          <Link
            to={`/customers/${subscription.customer_id}`}
            className="font-bold text-slate-900 hover:text-[#183630] block text-sm mt-1"
          >
            {subscription.customer?.name}
          </Link>
          <p className="text-xs text-slate-500">{subscription.customer?.company || subscription.customer?.email}</p>
        </div>

        {/* Plan Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#183630]" />
            <span>Plan & Seats</span>
          </span>
          <p className="font-bold text-slate-900 text-sm mt-1">{subscription.plan?.name}</p>
          <p className="text-xs text-slate-500">
            {subscription.quantity} Unit(s) • {subscription.plan?.billing_frequency}
          </p>
        </div>

        {/* Billing Schedule */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#183630]" />
            <span>Next Invoice Schedule</span>
          </span>
          <p className="font-bold text-slate-900 text-sm mt-1">
            {subscription.next_billing_date && subscription.status === 'active'
              ? format(new Date(subscription.next_billing_date), 'dd MMM yyyy')
              : subscription.status === 'paused'
              ? 'Halted (Paused)'
              : 'Terminated'}
          </p>
          <p className="text-xs text-slate-500">Automated Member 4 billing cycle</p>
        </div>

        {/* Quotation Origin Link */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-[#183630]" />
            <span>Origin Quotation</span>
          </span>
          <p className="font-bold text-slate-900 text-sm mt-1">
            {subscription.quotation_id ? (
              <Link to={`/quotations/${subscription.quotation_id}`} className="text-[#183630] font-bold hover:underline">
                View Quote #{subscription.quotation_id}
              </Link>
            ) : (
              'Direct Creation'
            )}
          </p>
          <p className="text-xs text-slate-500">Agreed commercial terms source</p>
        </div>
      </div>

      {/* Grid: Audit Timeline (5 cols) + Invoices (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Audit Timeline History */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#183630]" />
              <span>Lifecycle Audit Trail</span>
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              Full History
            </span>
          </div>

          <SubscriptionTimeline subscription={subscription} />
        </div>

        {/* Right: Member 4 Invoices for this subscription */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#183630]" />
              <span>Billing Invoices for this Subscription</span>
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {invoices.length} Generated
            </span>
          </div>

          {invoices.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Receipt className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No invoices generated yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Invoices are generated automatically by Member 4 when the subscription reaches its next billing date.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <div key={inv.id} className="py-3.5 flex items-center justify-between text-sm">
                  <div>
                    <Link
                      to={`/invoices/${inv.id}`}
                      className="font-bold text-[#183630] hover:underline block"
                    >
                      {inv.invoice_number}
                    </Link>
                    <span className="text-xs text-slate-400">
                      Issued {format(new Date(inv.issue_date), 'dd MMM yyyy')} • Due {format(new Date(inv.due_date), 'dd MMM yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900">
                      ₹{inv.total_amount.toLocaleString('en-IN')}
                    </span>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PAUSE MODAL */}
      <Modal
        isOpen={pauseModalOpen}
        onClose={() => setPauseModalOpen(false)}
        title={`Pause Subscription ${subscription.subscription_number}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Pausing this subscription stops recurring invoices and records a pause event in the lifecycle audit history.
          </p>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Pause Reason / Operational Note *</label>
            <textarea
              rows={3}
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#183630]"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setPauseModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={pauseMutation.isPending}
              onClick={() => pauseMutation.mutate()}
              icon={<Pause className="w-4 h-4" />}
            >
              Confirm Pause
            </Button>
          </div>
        </div>
      </Modal>

      {/* RESUME MODAL */}
      <Modal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        title={`Resume Subscription ${subscription.subscription_number}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Resuming restores Active status and schedules the next billing date from the specified effective date.
          </p>
          <Input
            label="Resume Effective Date *"
            type="date"
            value={resumeDate}
            onChange={(e) => setResumeDate(e.target.value)}
          />
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setResumeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={resumeMutation.isPending}
              onClick={() => resumeMutation.mutate()}
              icon={<Play className="w-4 h-4 text-[#E5C690]" />}
            >
              Confirm Resume
            </Button>
          </div>
        </div>
      </Modal>

      {/* RENEW MODAL */}
      <Modal
        isOpen={renewModalOpen}
        onClose={() => setRenewModalOpen(false)}
        title={`Renew Subscription ${subscription.subscription_number}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Extends this subscription's contract duration and schedules subsequent renewal cycles.
          </p>
          <Input
            label="Extension Duration (Number of Cycles) *"
            type="number"
            min="1"
            value={renewalPeriods}
            onChange={(e) => setRenewalPeriods(Math.max(1, Number(e.target.value) || 1))}
          />
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setRenewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={renewMutation.isPending}
              onClick={() => renewMutation.mutate()}
              icon={<RotateCw className="w-4 h-4" />}
            >
              Confirm Renewal
            </Button>
          </div>
        </div>
      </Modal>

      {/* CLOSE MODAL */}
      <Modal
        isOpen={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        title={`Terminate Subscription ${subscription.subscription_number}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-rose-600 font-semibold">
            Warning: Terminating this subscription ceases all ongoing and upcoming automated billing. Historical invoices and payments are retained.
          </p>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Reason for Termination *</label>
            <textarea
              rows={3}
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setCloseModalOpen(false)}>
              Keep Active
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={closeMutation.isPending}
              onClick={() => closeMutation.mutate()}
            >
              Confirm Termination
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
