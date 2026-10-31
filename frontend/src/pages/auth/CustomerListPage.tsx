import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Building2, UserPlus, Search, ChevronRight, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../api/auth';
import { Customer } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SlideOver } from '../../components/ui/SlideOver';

const customerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [slideOverOpen, setSlideOverOpen] = useState(false);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', search, statusFilter],
    queryFn: () =>
      authApi.getCustomers({
        search: search || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const createMutation = useMutation({
    mutationFn: authApi.createCustomer,
    onSuccess: (newCust) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(`Customer ${newCust.name} added successfully`);
      setSlideOverOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to create customer');
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    createMutation.mutate(data);
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.is_active).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer Management</h1>
          <p className="text-sm text-slate-500">
            Organize subscriber client accounts, commercial contracts, and contact data.
          </p>
        </div>
        <Button onClick={() => setSlideOverOpen(true)} icon={<UserPlus className="w-4 h-4" />}>
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Accounts</p>
            <p className="text-2xl font-bold text-slate-900">{totalCustomers}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Subscribers</p>
            <p className="text-2xl font-bold text-slate-900">{activeCustomers}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-violet-500 focus:bg-white transition"
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label className="text-xs font-medium text-slate-500">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Accounts</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="space-y-3 max-w-sm mx-auto">
                      <div className="h-4 bg-slate-200 rounded-full animate-pulse" />
                      <div className="h-4 bg-slate-100 rounded-full animate-pulse" />
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No customers found matching the criteria.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr
                    key={cust.id}
                    onClick={() => navigate(`/customers/${cust.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center shrink-0 border border-violet-200">
                          {cust.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-violet-600 transition">
                            {cust.name}
                          </p>
                          <p className="text-xs text-slate-400">{cust.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {cust.company || <span className="text-slate-400 italic">Individual</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5 text-xs">
                        {cust.phone && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{cust.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{cust.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={cust.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center text-xs font-semibold text-violet-600 group-hover:translate-x-1 transition-transform">
                        <span>View</span>
                        <ChevronRight className="w-4 h-4 ml-0.5" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer SlideOver */}
      <SlideOver
        isOpen={slideOverOpen}
        onClose={() => setSlideOverOpen(false)}
        title="Add New Customer"
        description="Register a new subscriber account with billing and contact information."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="Aarav Mehra"
            {...register('name')}
            error={errors.name?.message}
          />
          <Input
            label="Email Address *"
            type="email"
            placeholder="aarav@company.in"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Phone Number"
            placeholder="+91 98765 00000"
            {...register('phone')}
          />
          <Input
            label="Company Name"
            placeholder="Apex Technologies"
            {...register('company')}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Billing Address</label>
            <textarea
              rows={3}
              placeholder="Suite 102, Cyber Heights, Hyderabad"
              {...register('address')}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setSlideOverOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create Customer
            </Button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
};
