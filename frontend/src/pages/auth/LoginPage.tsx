import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, Mail, Sparkles, ArrowRight, ShieldCheck, UserCheck, HelpCircle } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@brightloop.com',
      password: 'admin123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await authApi.login(data);
      setAuth(response.user, response.access_token);
      toast.success(`Welcome back, ${response.user.name}!`);
      if (response.user.role === 'customer') {
        navigate('/my-subscriptions');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 flex flex-col justify-center items-center p-4 selection:bg-violet-500 selection:text-white">
      {/* Decorative light elements */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-2xl text-white relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/40 mb-3 group hover:scale-105 transition-transform">
            <Sparkles className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Brightloop</h1>
          <p className="text-sm text-violet-200/80 mt-1">SaaS Subscription Management</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-200">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-violet-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                placeholder="name@company.com"
                {...register('email')}
                className="w-full rounded-xl bg-white/10 border border-white/20 pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition"
              />
            </div>
            {errors.email && <p className="text-xs text-rose-300">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-slate-200">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-violet-300 hover:text-white transition"
              >
                Forgot password?
              </Link>
            </div>
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

          <Button
            type="submit"
            loading={loading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-600/40 transition mt-2"
          >
            <span>Sign In to Brightloop</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Demo Fast Login Shortcuts */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <p className="text-xs text-white/50 text-center mb-2.5 font-medium">Demo 1-Click Accounts:</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoCredentials('admin@brightloop.com', 'admin123')}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/90 text-center transition flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('staff@brightloop.com', 'staff123')}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/90 text-center transition flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3 h-3 text-sky-400" />
              <span>Staff</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('customer@acme.com', 'customer123')}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/90 text-center transition flex items-center justify-center gap-1"
            >
              <HelpCircle className="w-3 h-3 text-amber-400" />
              <span>Customer</span>
            </button>
          </div>
        </div>

        {/* Register link */}
        <div className="mt-6 text-center text-xs text-violet-200/70">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-white hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
