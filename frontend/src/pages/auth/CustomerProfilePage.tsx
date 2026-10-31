import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  ChevronLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Power,
  Repeat,
  FileText,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { authApi } from '../../api/auth';
import { subscriptionsApi } from '../../api/subscriptions';
import { financeApi } from '../../api/finance';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

const editSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
});

type EditFormData = z.infer<typeof editSchema>;

export const CustomerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const customerId = Number(id);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'details' | 'subscriptions' | 'invoices'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => authApi.getCustomer(customerId),
    enabled: !!customerId,
  });

  const { data: customerSubs = [] } = useQuery({
    queryKey: ['customer-subscriptions', customerId],
    queryFn: () => subscriptionsApi.getSubscriptions({ customer_id: customerId }),
    enabled: !!customerId,
  });

  const { data: customerInvoices = [] } = useQuery({
    queryKey: ['customer-invoices', customerId],
    queryFn: () => financeApi.getInvoices({ customer_id: customerId }),
    enabled: !!customerId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormData>();

  React.useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        company: customer.company || '',
        address: customer.address || '',
      });
    }
  }, [customer, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: EditFormData) => authApi.updateCustomer(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      toast.success('Customer details updated');
      setIsEditing(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to update customer');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: () => authApi.toggleCustomerStatus(customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      toast.success('Customer account status updated');
      setConfirmDeactivate(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    },
  });

  if (isLoading || !customer) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mx-auto" />
        <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/customers" className="hover:text-violet-600 transition flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Customers</span>
        </Link>
        <span>/</span>
        <span className="text-slate-900">{customer.name}</span>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-violet-600/30">
            {customer.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{customer.name}</h1>
              <StatusBadge status={customer.is_active ? 'active' : 'inactive'} />
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{customer.company || 'Individual Client'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            icon={<Edit3 className="w-4 h-4" />}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setConfirmDeactivate(true)}
            icon={<Power className="w-4 h-4" />}
            className={customer.is_active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}
          >
            {customer.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>

      {/* Inline Edit Form if enabled */}
      {isEditing && (
        <div className="bg-white rounded-2xl p-6 border border-violet-200 shadow-md animate-in fade-in duration-200">
          <h2 className="text-base font-bold text-slate-900 mb-4">Edit Customer Contact Details</h2>
          <form
            onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Input label="Name" {...register('name')} error={errors.name?.message} />
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
            <Input label="Phone" {...register('phone')} />
            <Input label="Company" {...register('company')} />
            <div className="sm:col-span-2">
              <Input label="Address" {...register('address')} />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-8">
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            activeTab === 'details'
              ? 'border-violet-600 text-violet-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Overview & Info
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'subscriptions'
              ? 'border-violet-600 text-violet-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Subscriptions</span>
          <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
            {customerSubs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'invoices'
              ? 'border-violet-600 text-violet-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Billing History</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            {customerInvoices.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Details */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Contact Channels
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-4 h-4 text-violet-600 shrink-0" />
                <span className="text-slate-400 w-24">Email:</span>
                <span className="font-semibold text-slate-900">{customer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-4 h-4 text-violet-600 shrink-0" />
                <span className="text-slate-400 w-24">Phone:</span>
                <span className="font-semibold text-slate-900">{customer.phone || '—'}</span>
              </div>
              <div className="flex items-start gap-3 text-slate-700">
                <MapPin className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                <span className="text-slate-400 w-24">Address:</span>
                <span className="font-semibold text-slate-900">{customer.address || '—'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Subscription Account Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="w-4 h-4 text-violet-600 shrink-0" />
                <span className="text-slate-400 w-32">Customer Since:</span>
                <span className="font-semibold text-slate-900">
                  {format(new Date(customer.created_at), 'dd MMMM yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Repeat className="w-4 h-4 text-violet-600 shrink-0" />
                <span className="text-slate-400 w-32">Active Plans:</span>
                <span className="font-bold text-emerald-600">
                  {customerSubs.filter((s) => s.status === 'active').length}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <FileText className="w-4 h-4 text-violet-600 shrink-0" />
                <span className="text-slate-400 w-32">Total Billed:</span>
                <span className="font-bold text-slate-900">
                  ₹
                  {customerInvoices
                    .reduce((acc, inv) => acc + (inv.total_amount || 0), 0)
                    .toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Subscriptions */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {customerSubs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Repeat className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-600">No subscriptions created yet.</p>
              <Link to="/quotations/new" className="text-xs text-violet-600 font-semibold hover:underline mt-1 block">
                Create a quotation for {customer.name} →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {customerSubs.map((sub) => (
                <div key={sub.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">{sub.subscription_number}</span>
                      <StatusBadge status={sub.status} />
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">
                        {sub.plan?.name || 'Standard Plan'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Started: {format(new Date(sub.start_date), 'dd MMM yyyy')} • Next billing:{' '}
                      {sub.next_billing_date ? format(new Date(sub.next_billing_date), 'dd MMM yyyy') : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-base font-bold text-slate-900">
                      ₹{sub.total_amount.toLocaleString('en-IN')}
                    </span>
                    <Link
                      to={`/subscriptions/${sub.id}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white hover:text-violet-600 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Invoices */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {customerInvoices.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-600">No invoices generated yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {customerInvoices.map((inv) => (
                <div key={inv.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-violet-700">{inv.invoice_number}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Issued: {format(new Date(inv.issue_date), 'dd MMM yyyy')} • Due:{' '}
                      {format(new Date(inv.due_date), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-base font-bold text-slate-900">
                        ₹{inv.total_amount.toLocaleString('en-IN')}
                      </p>
                      {inv.outstanding_amount > 0 && (
                        <p className="text-xs text-rose-600 font-medium">
                          Due: ₹{inv.outstanding_amount.toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                    <Link
                      to={`/invoices/${inv.id}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white hover:text-violet-600 transition"
                    >
                      View Invoice
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deactivate Confirm */}
      <ConfirmDialog
        isOpen={confirmDeactivate}
        onClose={() => setConfirmDeactivate(false)}
        onConfirm={() => toggleStatusMutation.mutate()}
        title={customer.is_active ? 'Deactivate Customer' : 'Activate Customer'}
        message={`Are you sure you want to ${
          customer.is_active ? 'deactivate' : 'reactivate'
        } ${customer.name}? This controls active billing eligibility.`}
        confirmText={customer.is_active ? 'Deactivate Account' : 'Activate Account'}
        variant={customer.is_active ? 'danger' : 'warning'}
        loading={toggleStatusMutation.isPending}
      />
    </div>
  );
};
