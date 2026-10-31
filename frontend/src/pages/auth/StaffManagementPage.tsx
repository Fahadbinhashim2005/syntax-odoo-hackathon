import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Users, UserPlus, Search, Edit2, Shield, UserCheck, Power } from 'lucide-react';
import { authApi } from '../../api/auth';
import { User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SlideOver } from '../../components/ui/SlideOver';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

const staffSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'staff']),
});

type StaffFormData = z.infer<typeof staffSchema>;

export const StaffManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<User | null>(null);

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: authApi.getStaff,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: { role: 'staff' },
  });

  const createMutation = useMutation({
    mutationFn: authApi.createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member created successfully');
      setSlideOverOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to create staff');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => authApi.updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff details updated');
      setSlideOverOpen(false);
      setEditingStaff(null);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to update staff');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: authApi.toggleStaffStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff status updated');
      setConfirmTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to change staff status');
    },
  });

  const handleOpenAdd = () => {
    setEditingStaff(null);
    reset({ name: '', email: '', password: '', role: 'staff' });
    setSlideOverOpen(true);
  };

  const handleOpenEdit = (staff: User) => {
    setEditingStaff(staff);
    setValue('name', staff.name);
    setValue('email', staff.email);
    setValue('password', 'dummyPassword'); // required by schema but ignored on update if blank
    setValue('role', staff.role as 'admin' | 'staff');
    setSlideOverOpen(true);
  };

  const onFormSubmit = (data: StaffFormData) => {
    if (editingStaff) {
      updateMutation.mutate({
        id: editingStaff.id,
        data: { name: data.name, email: data.email, role: data.role },
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalStaff = staffList.length;
  const activeStaff = staffList.filter((s) => s.is_active).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff Management</h1>
          <p className="text-sm text-slate-500">
            Control user access roles, permissions, and administrative staff.
          </p>
        </div>
        <Button onClick={handleOpenAdd} icon={<UserPlus className="w-4 h-4" />}>
          Add Staff
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Staff</p>
            <p className="text-2xl font-bold text-slate-900">{totalStaff}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Staff</p>
            <p className="text-2xl font-bold text-slate-900">{activeStaff}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Administrators</p>
            <p className="text-2xl font-bold text-slate-900">
              {staffList.filter((s) => s.role === 'admin').length}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-violet-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="space-y-3 max-w-sm mx-auto">
                      <div className="h-4 bg-slate-200 rounded-full animate-pulse" />
                      <div className="h-4 bg-slate-100 rounded-full animate-pulse" />
                    </div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No staff members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">
                        {staff.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{staff.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{staff.email}</td>
                    <td className="px-6 py-4">
                      <span className="capitalize px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={staff.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {staff.created_at ? format(new Date(staff.created_at), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(staff)}
                        title="Edit Staff"
                        className="p-1.5 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmTarget(staff)}
                        title={staff.is_active ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded-lg transition ${
                          staff.is_active
                            ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Slide-over */}
      <SlideOver
        isOpen={slideOverOpen}
        onClose={() => setSlideOverOpen(false)}
        title={editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
        description="Configure staff identity, access credentials, and permission role."
      >
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Kavita Rao"
            {...register('name')}
            error={errors.name?.message}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="kavita@brightloop.com"
            {...register('email')}
            error={errors.email?.message}
          />
          {!editingStaff && (
            <Input
              label="Temporary Password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />
          )}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Role</label>
            <select
              {...register('role')}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            >
              <option value="staff">Staff (Sales & Customer Invoices)</option>
              <option value="admin">Administrator (Full Control)</option>
            </select>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setSlideOverOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editingStaff ? 'Save Changes' : 'Create Staff'}
            </Button>
          </div>
        </form>
      </SlideOver>

      {/* Deactivate Confirm */}
      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => confirmTarget && toggleStatusMutation.mutate(confirmTarget.id)}
        title={confirmTarget?.is_active ? 'Deactivate Staff Account' : 'Reactivate Staff Account'}
        message={`Are you sure you want to ${
          confirmTarget?.is_active ? 'deactivate' : 'reactivate'
        } ${confirmTarget?.name}?`}
        confirmText={confirmTarget?.is_active ? 'Deactivate' : 'Activate'}
        variant={confirmTarget?.is_active ? 'danger' : 'warning'}
        loading={toggleStatusMutation.isPending}
      />
    </div>
  );
};
