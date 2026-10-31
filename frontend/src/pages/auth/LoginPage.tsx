import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { BrandLogo } from '../../components/ui/BrandLogo';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
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

  const performLogin = async (email: string, pass: string) => {
    setLoading(true);
    setBackendError(null);
    try {
      const response = await authApi.login({ email, password: pass });
      setAuth(response.user, response.access_token);
      toast.success(`Welcome back, ${response.user.name}!`);
      if (response.user.role === 'customer') {
        navigate('/my-subscriptions');
      } else {
        navigate('/quotations');
      }
    } catch (err: any) {
      console.error("Login attempt error:", err);
      const isNetworkError = !err.response || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error');
      
      if (isNetworkError) {
        setBackendError(
          "Backend server is not responding at http://localhost:8000. Please ensure 'start-backend.bat' is running."
        );
        toast.error("Cannot connect to backend server on port 8000");
      } else {
        toast.error(err.response?.data?.detail || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    await performLogin(data.email, data.password);
  };

  // Instant Dev Bypass for Member 3
  const bypassLoginAs = (role: 'admin' | 'staff' | 'customer') => {
    const mockUsers = {
      admin: {
        id: 1,
        name: 'Alex Morgan (Admin)',
        email: 'admin@brightloop.com',
        role: 'admin' as const,
        is_active: true,
      },
      staff: {
        id: 2,
        name: 'Rohan Verma (Staff)',
        email: 'staff@brightloop.com',
        role: 'staff' as const,
        is_active: true,
      },
      customer: {
        id: 3,
        name: 'Priya Sharma (Customer)',
        email: 'customer@acme.com',
        role: 'customer' as const,
        is_active: true,
      },
    };

    const target = mockUsers[role];
    // Set a dev token in storage so frontend ProtectedRoute allows instant entry
    setAuth(target, 'dev-offline-access-token');
    toast.success(`Dev Bypass: Entered workspace as ${target.name}`);
    if (role === 'customer') {
      navigate('/my-subscriptions');
    } else {
      navigate('/quotations');
    }
  };

  return (
    <div className="min-h-screen bg-[#112722] flex flex-col justify-center items-center p-4 selection:bg-[#E5C690] selection:text-[#183630]">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#183630] rounded-full blur-3xl pointer-events-none opacity-60" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#E5C690]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#183630]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl text-white relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#112722] border border-[#E5C690]/40 flex items-center justify-center shadow-lg p-2 mb-3">
            <BrandLogo size={36} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Brightloop</h1>
          <p className="text-xs text-[#E5C690] font-bold uppercase tracking-wider mt-0.5">
            Team Syntax | Quotations & Subscriptions
          </p>
        </div>

        {/* 1-Click Fast Login Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#E5C690] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Instant Sign In</span>
            </span>
            <span className="text-[10px] text-white/50">Member 3 Quick Access</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              disabled={loading}
              onClick={() => performLogin('admin@brightloop.com', 'admin123')}
              className="px-2.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-white font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => performLogin('staff@brightloop.com', 'staff123')}
              className="px-2.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 text-white font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4 text-sky-400" />
              <span>Staff</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => performLogin('customer@acme.com', 'customer123')}
              className="px-2.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-white font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Customer</span>
            </button>
          </div>
        </div>

        {/* Backend Offline Alert & Direct Bypass Button */}
        {backendError && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-xs space-y-2">
            <div className="flex items-start gap-2 text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p>{backendError}</p>
            </div>
            <button
              type="button"
              onClick={() => bypassLoginAs('admin')}
              className="w-full py-2 px-3 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>⚡ Bypass Login & Enter Quotations Directly</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-200">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#E5C690] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                placeholder="name@brightloop.com"
                {...register('email')}
                className="w-full rounded-xl bg-white/10 border border-white/20 pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#E5C690] focus:ring-2 focus:ring-[#E5C690]/20 transition"
              />
            </div>
            {errors.email && <p className="text-xs text-rose-300">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-200">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#E5C690] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full rounded-xl bg-white/10 border border-white/20 pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#E5C690] focus:ring-2 focus:ring-[#E5C690]/20 transition"
              />
            </div>
            {errors.password && <p className="text-xs text-rose-300">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full py-3 bg-[#E5C690] hover:bg-[#d4b57e] text-[#183630] rounded-xl font-bold transition mt-2 cursor-pointer shadow-md"
          >
            <span>Sign In to Brightloop</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Direct Dev Bypass link at bottom */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => bypassLoginAs('admin')}
            className="text-xs text-white/50 hover:text-[#E5C690] transition underline"
          >
            Skip to Member 3 Quotations Workspace (Dev Mode)
          </button>
        </div>
      </div>
    </div>
  );
};
