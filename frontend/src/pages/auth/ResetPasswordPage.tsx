import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, ArrowRight } from 'lucide-react';
import { authApi } from '../../api/auth';
import { Button } from '../../components/ui/Button';

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export const ResetPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'demo-token';
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    setLoading(true);
    try {
      await authApi.resetPassword({
        token,
        new_password: data.password,
      });
      toast.success('Password updated successfully. Please sign in.');
      navigate('/login');
    } catch (err: any) {
      toast.error('Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-2xl text-white">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">Set New Password</h1>
          <p className="text-xs text-violet-200/80 mt-1">Please enter your new secure password below.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="block text-xs font-semibold text-slate-200">New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-violet-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full rounded-xl bg-white/10 border border-white/20 pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition"
              />
            </div>
            {errors.password && <p className="text-xs text-rose-300">{errors.password.message}</p>}
          </div>

          <div className="space-y-1 text-left">
            <label className="block text-xs font-semibold text-slate-200">Confirm New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-violet-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                className="w-full rounded-xl bg-white/10 border border-white/20 pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-rose-300">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" loading={loading} className="w-full py-2.5">
            <span>Reset Password</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
