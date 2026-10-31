import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Repeat,
  Plus,
  Search,
  LayoutGrid,
  List,
  Pause,
  Play,
  RotateCw,
  XCircle,
  Eye,
  Calendar,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { subscriptionsApi } from '../../api/subscriptions';
import { Subscription } from '../../types';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';

export const SubscriptionListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Lifecycle Action Dialogs State
  const [targetSub, setTargetSub] = useState<Subscription | null>(null);
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState('Customer requested temporary pause');

  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeEffectiveDate, setResumeEffectiveDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );

  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [renewalPeriods, setRenewalPeriods] = useState<number>(1);

  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closeReason, setCloseReason] = useState('Customer contract concluded');

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions', statusFilter, search],
    queryFn: () =>
      subscriptionsApi.getSubscriptions({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
      }),
  });

  // Action mutations
  const activateMutation = useMutation({
    mutationFn: (id: number) => subscriptionsApi.activateSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription activated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to activate subscription');
    },
  });

  const pauseMutation = useMutation({
    mutationFn: () => {
      if (!targetSub) return Promise.reject();
      return subscriptionsApi.pauseSubscription(targetSub.id, pauseReason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription paused');
      setPauseModalOpen(false);
      setTargetSub(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to pause subscription');
    },
  });

  const resumeMutation = useMutation({
    mutationFn: () => {
      if (!targetSub) return Promise.reject();
      return subscriptionsApi.resumeSubscription(targetSub.id, resumeEffectiveDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription resumed to active');
      setResumeModalOpen(false);
      setTargetSub(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to resume subscription');
    },
  });

  const renewMutation = useMutation({
    mutationFn: () => {
      if (!targetSub) return Promise.reject();
      return subscriptionsApi.renewSubscription(targetSub.id, renewalPeriods);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription renewed and extended');
      setRenewModalOpen(false);
      setTargetSub(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to renew subscription');
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => {
      if (!targetSub) return Promise.reject();
      return subscriptionsApi.closeSubscription(targetSub.id, closeReason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription closed');
      setCloseModalOpen(false);
      setTargetSub(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to close subscription');
    },
  });

  // Analytics counts
  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const pausedCount = subscriptions.filter((s) => s.status === 'paused').length;
  const confirmedCount = subscriptions.filter((s) => s.status === 'confirmed').length;
  const closedCount = subscriptions.filter((s) => s.status === 'closed').length;

  const totalMRR = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#183630] text-[#E5C690] flex items-center justify-center text-sm font-bold shadow-sm">
              <Repeat className="w-4 h-4" />
            </span>
            Active Subscriptions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor client recurring contracts, renewals, pause/resumes, and lifecycle changes.
          </p>
        </div>
        <Button onClick={() => navigate('/quotations/new')} icon={<Plus className="w-4 h-4" />}>
          New Subscription Quote
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Subscriptions</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{activeCount}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">Generating recurring revenue</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Repeat className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Contract Run-Rate</p>
            <h3 className="text-2xl font-black text-[#183630] mt-1">₹{totalMRR.toLocaleString('en-IN')}</h3>
            <span className="text-[11px] text-slate-500 font-medium">Monthly committed value</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#183630]/10 text-[#183630] flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Paused Contracts</p>
            <h3 className="text-2xl font-black text-amber-700 mt-1">{pausedCount}</h3>
            <span className="text-[11px] text-amber-600 font-medium">Temporary billing halt</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Pause className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Activation</p>
            <h3 className="text-2xl font-black text-violet-700 mt-1">{confirmedCount}</h3>
            <span className="text-[11px] text-violet-600 font-medium">Confirmed quotes</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All', count: subscriptions.length },
            { id: 'active', label: 'Active', count: activeCount },
            { id: 'paused', label: 'Paused', count: pausedCount },
            { id: 'confirmed', label: 'Confirmed', count: confirmedCount },
            { id: 'closed', label: 'Closed', count: closedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-2 ${
                statusFilter === tab.id
                  ? 'bg-[#183630] text-[#E5C690] shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-[#183630] text-[#E5C690]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-[#183630] text-[#E5C690]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Data Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subscriptions by number (SUB-2026-...) or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#183630] focus:bg-white transition"
          />
        </div>
      </div>

      {/* CARD GRID VIEW */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-3 p-16 text-center text-slate-400">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="col-span-3 bg-white rounded-3xl p-16 text-center border border-slate-200">
              <Repeat className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700">No subscriptions found</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Accept a quotation proposal to launch an active contract.</p>
              <Button onClick={() => navigate('/quotations/new')}>Create Quotation</Button>
            </div>
          ) : (
            subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Customer Avatar & Number */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#183630] text-[#E5C690] font-bold text-sm flex items-center justify-center shadow-xs">
                        {sub.customer?.name?.slice(0, 2).toUpperCase() || 'CU'}
                      </div>
                      <div>
                        <Link
                          to={`/subscriptions/${sub.id}`}
                          className="font-bold text-slate-900 hover:text-[#183630] transition block text-sm"
                        >
                          {sub.customer?.name}
                        </Link>
                        <span className="text-xs text-slate-400">{sub.customer?.company || sub.customer?.email}</span>
                      </div>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>

                  {/* Plan & Pricing */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{sub.plan?.name}</p>
                      <p className="text-[11px] text-slate-500 capitalize">
                        {sub.quantity} seat(s) • {sub.plan?.billing_frequency}
                      </p>
                    </div>
                    <span className="text-base font-black text-[#183630]">
                      ₹{sub.total_amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Started:</span>
                      </span>
                      <span className="font-semibold text-slate-700">
                        {format(new Date(sub.start_date), 'dd MMM yyyy')}
                      </span>
                    </div>

                    {sub.next_billing_date && sub.status === 'active' && (
                      <div className="flex items-center justify-between text-emerald-800">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Next Invoice:</span>
                        </span>
                        <span className="font-bold">
                          {format(new Date(sub.next_billing_date), 'dd MMM yyyy')}
                        </span>
                      </div>
                    )}

                    {sub.quotation_id && (
                      <div className="flex items-center justify-between text-slate-400 pt-1">
                        <span>Source Quote:</span>
                        <Link
                          to={`/quotations/${sub.quotation_id}`}
                          className="font-bold text-[#183630] hover:underline"
                        >
                          Quote #{sub.quotation_id}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/subscriptions/${sub.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#183630] hover:underline"
                  >
                    <span>View Details</span>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    {sub.status === 'confirmed' && (
                      <button
                        onClick={() => activateMutation.mutate(sub.id)}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition text-xs font-semibold flex items-center gap-1"
                        title="Activate Subscription"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Activate</span>
                      </button>
                    )}

                    {sub.status === 'active' && (
                      <>
                        <button
                          onClick={() => {
                            setTargetSub(sub);
                            setPauseModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 transition"
                          title="Pause Subscription"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setTargetSub(sub);
                            setRenewModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-violet-700 hover:bg-violet-50 transition"
                          title="Renew Contract"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setTargetSub(sub);
                            setCloseModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                          title="Close Contract"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {sub.status === 'paused' && (
                      <>
                        <button
                          onClick={() => {
                            setTargetSub(sub);
                            setResumeModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition text-xs font-semibold flex items-center gap-1"
                          title="Resume Subscription"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Resume</span>
                        </button>
                        <button
                          onClick={() => {
                            setTargetSub(sub);
                            setCloseModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                          title="Close Contract"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Sub Number</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Plan & Cadence</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Next Invoice</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      Loading subscriptions...
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No subscriptions found.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      onClick={() => navigate(`/subscriptions/${sub.id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition group"
                    >
                      <td className="px-6 py-4 font-bold text-[#183630] group-hover:underline">
                        {sub.subscription_number}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 block">{sub.customer?.name}</span>
                        <span className="text-xs text-slate-400">{sub.customer?.company || sub.customer?.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#183630]/10 text-[#183630]">
                          {sub.plan?.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5 capitalize">
                          {sub.quantity} seat(s) • {sub.plan?.billing_frequency}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">
                        ₹{sub.total_amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {sub.next_billing_date ? (
                          <span className="font-semibold text-slate-700">
                            {format(new Date(sub.next_billing_date), 'dd MMM yyyy')}
                          </span>
                        ) : (
                          <span className="text-slate-400">Halted / Closed</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-6 py-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/subscriptions/${sub.id}`}
                          className="inline-flex p-1.5 text-slate-500 hover:text-[#183630] hover:bg-slate-100 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {sub.status === 'confirmed' && (
                          <button
                            onClick={() => activateMutation.mutate(sub.id)}
                            className="inline-flex p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Activate"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {sub.status === 'active' && (
                          <button
                            onClick={() => {
                              setTargetSub(sub);
                              setPauseModalOpen(true);
                            }}
                            className="inline-flex p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition"
                            title="Pause"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        {sub.status === 'paused' && (
                          <button
                            onClick={() => {
                              setTargetSub(sub);
                              setResumeModalOpen(true);
                            }}
                            className="inline-flex p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Resume"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAUSE MODAL */}
      <Modal
        isOpen={pauseModalOpen}
        onClose={() => setPauseModalOpen(false)}
        title={`Pause Subscription ${targetSub?.subscription_number}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Pausing this contract temporarily halts recurring invoice generation and service renewals.
          </p>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Reason for Pausing</label>
            <textarea
              rows={2}
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
        title={`Resume Subscription ${targetSub?.subscription_number}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Resuming transitions contract to Active status and schedules the next invoice cycle starting from the effective date.
          </p>
          <Input
            label="Resume Effective Date *"
            type="date"
            value={resumeEffectiveDate}
            onChange={(e) => setResumeEffectiveDate(e.target.value)}
          />
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setResumeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={resumeMutation.isPending}
              onClick={() => resumeMutation.mutate()}
              icon={<Play className="w-4 h-4" />}
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
        title={`Renew Subscription ${targetSub?.subscription_number}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Extend this contract's term duration. Next billing date will automatically adjust.
          </p>
          <Input
            label="Number of Renewal Cycles (Term Extension) *"
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

      {/* CLOSE CONFIRM MODAL */}
      <Modal
        isOpen={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        title={`Terminate Subscription ${targetSub?.subscription_number}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-rose-600 font-semibold">
            Warning: Closing this contract permanently stops automated recurring billing cycles.
          </p>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Closure Reason</label>
            <textarea
              rows={2}
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setCloseModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={closeMutation.isPending}
              onClick={() => closeMutation.mutate()}
            >
              Terminate Subscription
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
