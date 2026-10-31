import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, User, Mail, Lock } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
    role: z.enum(['staff', 'admin']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'staff',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const response = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      setAuth(response.user, response.access_token);
      toast.success(`Account created! Welcome to Brightloop, ${response.user.name}`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 flex flex-col justify-center items-center p-4 selection:bg-violet-500 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-2xl text-white relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/40 mb-3">
            <Sparkles className="w-7 h-7 text-white fill-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Create an Account</h1>
          <p className="text-xs text-violet-200/80 mt-1">Join Team Syntax on Brightloop</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="space-y-1 text-left">
            <label className="block text-xs font-semibold text-slate-200">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-violet-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Rohan Sharma"
                {...register('name')}
                className="w-full rounded-xl bg-white/10 border border-white/20 pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition"
              />
            </div>
            {errors.name && <p className="text-xs text-rose-300">{errors.name.message}</p>}
          </div>

          <div className="space-y-1 text-left">
            <label className="block text-xs font-semibold text-slate-200">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-violet-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                placeholder="rohan@brightloop.com"
                {...register('email')}
                className="w-full rounded-xl bg-white/10 border border-white/20 pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition"
              />
            </div>
            {errors.email && <p className="text-xs text-rose-300">{errors.email.message}</p>}
          </div>

          <div className="space-y-1 text-left">
            <label className="block text-xs font-semibold text-slate-200">System Role</label>
            <select
              {...register('role')}
              className="w-full rounded-xl bg-indigo-950 border border-white/20 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition"
            >
              <option value="staff" className="bg-slate-900 text-white">Staff (Billing & Ops)</option>
              <option value="admin" className="bg-slate-900 text-white">Admin (Full Control)</option>
            </select>
          </div>

          <div className="space-y-1 text-left">
            <label className="block text-xs font-semibold text-slate-200">Password (Min 8 chars)</label>
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
            <label className="block text-xs font-semibold text-slate-200">Confirm Password</label>
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

          <Button
            type="submit"
            loading={loading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-600/40 transition mt-2"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-violet-200/70">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-white hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
