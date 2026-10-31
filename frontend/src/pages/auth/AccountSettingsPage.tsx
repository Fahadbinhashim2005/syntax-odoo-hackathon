import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { User, Lock, Mail, Shield, Save } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(8, 'New password must be at least 8 characters'),
    confirm_password: z.string().min(8, 'Please confirm new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "New passwords don't match",
    path: ['confirm_password'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export const AccountSettingsPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (data: ProfileForm) => {
    setProfileLoading(true);
    try {
      const updated = await authApi.updateMe({ name: data.name });
      updateUser(updated);
      toast.success('Profile name updated successfully');
    } catch (err: any) {
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const onUpdatePassword = async (data: PasswordForm) => {
    setPasswordLoading(true);
    try {
      await authApi.updateMe({
        password: data.new_password,
        current_password: data.current_password,
      });
      toast.success('Password changed successfully');
      resetPassword();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to change password. Verify your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500">Manage your profile, credentials, and authentication preferences.</p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-violet-600/30">
            {user?.name?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100 uppercase">
                <Shield className="w-3 h-3" />
                <span>{user?.role}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Name Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
            <p className="text-xs text-slate-500">Update your public display name</p>
          </div>

          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
            <Input
              label="Display Name"
              placeholder="Your name"
              {...registerProfile('name')}
              error={profileErrors.name?.message}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Email Address (Read-only)</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <Button type="submit" loading={profileLoading} icon={<Save className="w-4 h-4" />}>
              Save Profile
            </Button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Security & Password</h3>
            <p className="text-xs text-slate-500">Ensure your account uses a secure password</p>
          </div>

          <form onSubmit={handlePasswordSubmit(onUpdatePassword)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              {...registerPassword('current_password')}
              error={passwordErrors.current_password?.message}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              {...registerPassword('new_password')}
              error={passwordErrors.new_password?.message}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              {...registerPassword('confirm_password')}
              error={passwordErrors.confirm_password?.message}
            />

            <Button type="submit" variant="outline" loading={passwordLoading} icon={<Lock className="w-4 h-4" />}>
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
