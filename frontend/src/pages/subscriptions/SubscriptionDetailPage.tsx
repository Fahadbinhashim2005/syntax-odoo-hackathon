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
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { subscriptionsApi } from '../../api/subscriptions';
import { financeApi } from '../../api/finance';
import { SubscriptionTimeline } from '../../components/SubscriptionTimeline';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';

export const SubscriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const subId = Number(id);
  const queryClient = useQueryClient();

  // Modals
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState('Customer requested temporary pause');

  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [renewalPeriods, setRenewalPeriods] = useState<number>(1);

  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closeReason, setCloseReason] = useState('Customer opted out of renewal');

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', subId],
    queryFn: () => subscriptionsApi.getSubscription(subId),
    enabled: !!subId,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['subscription-invoices', subId],
    queryFn: () => financeApi.getInvoices({}),
    select: (allInvs) => allInvs.filter((inv) => inv.subscription_id === subId),
    enabled: !!subId,
  });

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
    mutationFn: () => subscriptionsApi.resumeSubscription(subId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', subId] });
      queryClient.invalidateQueries({ queryKey: ['subscription-history', subId] });
      toast.success('Subscription resumed to active');
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
      toast.success('Subscription contract renewed');
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
      toast.success('Subscription terminated and closed');
      setCloseModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to close subscription');
    },
  });

  if (isLoading || !subscription) {
    return <div className="p-12 text-center text-slate-400">Loading subscription details...</div>;
  }

  const subtotal = subscription.unit_price * subscription.quantity;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/subscriptions" className="hover:text-violet-600 transition flex items-center gap-1">
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
              icon={<Play className="w-4 h-4" />}
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
                Pause
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
                onClick={() => resumeMutation.mutate()}
                icon={<Play className="w-4 h-4" />}
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
        </div>
      </div>

      {/* Closed Banner Warning if terminated */}
      {subscription.status === 'closed' && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold">This subscription is closed.</span>
            <p className="text-xs text-rose-700 mt-0.5">
              Reason: {subscription.close_reason || 'Contract terminated'}. Future billing cycles and renewals are
              permanently deactivated.
            </p>
          </div>
        </div>
      )}

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
            Contract started {format(new Date(subscription.start_date), 'dd MMMM yyyy')}
            {subscription.end_date && ` • Valid until ${format(new Date(subscription.end_date), 'dd MMMM yyyy')}`}
          </p>
        </div>

        <div className="text-left md:text-right">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Recurring Cadence Rate
          </span>
          <span className="text-3xl font-black text-violet-700">
            ₹{subscription.total_amount.toLocaleString('en-IN')}{' '}
            <span className="text-sm font-semibold text-slate-400">
              /{subscription.plan?.billing_frequency || 'month'}
            </span>
          </span>
        </div>
      </div>

      {/* 4 Info Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-violet-600" />
            <span>Customer</span>
          </span>
          <Link
            to={`/customers/${subscription.customer_id}`}
            className="font-bold text-slate-900 hover:text-violet-600 block text-sm"
          >
            {subscription.customer?.name}
          </Link>
          <p className="text-xs text-slate-500">
            {subscription.customer?.company || subscription.customer?.email}
          </p>
        </div>

        {/* Plan Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-violet-600" />
            <span>Plan & Seats</span>
          </span>
          <p className="font-bold text-slate-900 text-sm">{subscription.plan?.name}</p>
          <p className="text-xs text-slate-500">
            {subscription.quantity} Unit(s) • <span className="capitalize">{subscription.plan?.billing_frequency}</span>
          </p>
        </div>

        {/* Billing Dates */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-violet-600" />
            <span>Next Invoice Date</span>
          </span>
          <p className="font-bold text-slate-900 text-sm">
            {subscription.next_billing_date
              ? format(new Date(subscription.next_billing_date), 'dd MMM yyyy')
              : 'N/A (Closed / Paused)'}
          </p>
          <p className="text-xs text-slate-500">Automated cycle</p>
        </div>

        {/* Quotation Ref */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-violet-600" />
            <span>Origin Quotation</span>
          </span>
          <p className="font-bold text-slate-900 text-sm">
            {subscription.quotation_id ? (
              <Link to={`/quotations/${subscription.quotation_id}`} className="text-violet-600 hover:underline">
                View Quote #{subscription.quotation_id}
              </Link>
            ) : (
              'Direct Creation'
            )}
          </p>
          <p className="text-xs text-slate-500">Commercial origin</p>
        </div>
      </div>

      {/* Commercial Terms Breakdown Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-violet-600" />
          <span>Agreed Commercial Terms</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-1">
          <div className="bg-slate-50 p-3.5 rounded-xl">
            <span className="text-xs text-slate-400 block font-medium">Unit Price</span>
            <span className="font-bold text-slate-900">₹{subscription.unit_price.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl">
            <span className="text-xs text-slate-400 block font-medium">Quantity / Seats</span>
            <span className="font-bold text-slate-900">{subscription.quantity} Unit(s)</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl">
            <span className="text-xs text-slate-400 block font-medium">Discount Applied</span>
            <span className="font-bold text-rose-600">
              {subscription.discount_amount > 0
                ? `-₹${subscription.discount_amount.toLocaleString('en-IN')}`
                : '₹0.00'}
            </span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl">
            <span className="text-xs text-slate-400 block font-medium">Tax (GST)</span>
            <span className="font-bold text-slate-900">
              +₹{subscription.tax_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Timeline Left (6 cols) + Invoices Right (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-600" />
            <span>Subscription Audit Timeline</span>
          </h2>
          <SubscriptionTimeline subscription={subscription} />
        </div>

        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-600" />
            <span>Billing Invoices for this Subscription</span>
          </h2>

          {invoices.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No invoices generated yet.</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Invoices will be auto-generated when billing is due.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <Link
                      to={`/invoices/${inv.id}`}
                      className="font-bold text-violet-600 hover:underline block"
                    >
                      {inv.invoice_number}
                    </Link>
                    <span className="text-xs text-slate-400">
                      Issued {format(new Date(inv.issue_date), 'dd MMM yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">
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
      {pauseModalOpen && (
        <Modal
          isOpen={pauseModalOpen}
          onClose={() => setPauseModalOpen(false)}
          title="Pause Subscription"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Pause recurring billing for{' '}
              <strong className="text-slate-900">{subscription.subscription_number}</strong>. Active service
              will be placed on hold until resumed.
            </p>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Pause Reason *</label>
              <textarea
                rows={2}
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setPauseModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                loading={pauseMutation.isPending}
                onClick={() => pauseMutation.mutate()}
                icon={<Pause className="w-4 h-4" />}
              >
                Confirm Pause
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* RENEW MODAL */}
      {renewModalOpen && (
        <Modal
          isOpen={renewModalOpen}
          onClose={() => setRenewModalOpen(false)}
          title="Renew Subscription Contract"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Extend and renew the contract duration for{' '}
              <strong className="text-slate-900">{subscription.subscription_number}</strong>.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-sm border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Cadence:</span>
                <span className="font-semibold text-slate-900 capitalize">
                  {subscription.plan?.billing_frequency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Expiry:</span>
                <span className="font-semibold text-slate-900">
                  {subscription.end_date
                    ? format(new Date(subscription.end_date), 'dd MMM yyyy')
                    : 'Perpetual / Ongoing'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Renewal Cycles</label>
              <select
                value={renewalPeriods}
                onChange={(e) => setRenewalPeriods(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-violet-500"
              >
                <option value={1}>1 Cycle ({subscription.plan?.billing_frequency})</option>
                <option value={2}>2 Cycles</option>
                <option value={3}>3 Cycles</option>
                <option value={6}>6 Cycles</option>
                <option value={12}>12 Cycles (Annual)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setRenewModalOpen(false)}>
                Cancel
              </Button>
              <Button
                loading={renewMutation.isPending}
                onClick={() => renewMutation.mutate()}
                icon={<RotateCw className="w-4 h-4" />}
              >
                Confirm Renewal
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CLOSE MODAL */}
      {closeModalOpen && (
        <Modal
          isOpen={closeModalOpen}
          onClose={() => setCloseModalOpen(false)}
          title="Terminate Subscription Contract"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to terminate subscription{' '}
              <strong className="text-slate-900">{subscription.subscription_number}</strong>? Future invoice
              schedules will cease immediately.
            </p>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Termination Reason *</label>
              <textarea
                rows={2}
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setCloseModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={closeMutation.isPending}
                onClick={() => closeMutation.mutate()}
                icon={<XCircle className="w-4 h-4" />}
              >
                Terminate Contract
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
