import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  CircleDollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Eye,
  FileText,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { financeApi } from '../../api/finance';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { format } from 'date-fns';

const PIE_COLORS = {
  Paid: '#7c3aed',     // violet-600
  Pending: '#f59e0b',  // amber-500
  Overdue: '#e11d48',  // rose-600
  Draft: '#94a3b8',    // slate-400
};

export const FinanceDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['finance-stats'],
    queryFn: financeApi.getFinanceStats,
  });

  const { data: recentInvoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['recent-invoices'],
    queryFn: () => financeApi.getInvoices({}),
    select: (data) => data.slice(0, 5),
  });

  const pieData = stats?.invoice_distribution
    ? Object.entries(stats.invoice_distribution).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const totalInvoicesInDonut = pieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-8">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finance & Executive Overview</h1>
          <p className="text-sm text-slate-500">
            Real-time subscription billing metrics, collected revenue, and outstanding receivables.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/invoices"
            className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition flex items-center gap-1.5 shadow-sm shadow-violet-200"
          >
            <span>Manage Invoices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Row (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${(stats?.total_revenue || 0).toLocaleString('en-IN')}`}
          change="+12.8%"
          positive={true}
          icon={CircleDollarSign}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          subtitle="Cumulative paid subscription receipts"
        />

        <StatCard
          title="Outstanding Receivables"
          value={`₹${(stats?.outstanding || 0).toLocaleString('en-IN')}`}
          change="-3.1%"
          positive={false}
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          subtitle="Uncollected confirmed invoices"
        />

        <StatCard
          title="Invoices Settled"
          value={stats?.invoices_paid || 0}
          change="+8.2%"
          positive={true}
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          subtitle="Fully paid client statements"
        />

        <StatCard
          title="Overdue Accounts"
          value={stats?.overdue_count || 0}
          change="+2"
          positive={false}
          icon={AlertCircle}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          subtitle="Invoices exceeding payment term"
        />
      </div>

      {/* Charts Grid: Left 2/3 AreaChart + Right 1/3 Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 2/3: Revenue Area Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Revenue Overview</h2>
              <p className="text-xs text-slate-400">Monthly collected subscriptions cashflow</p>
            </div>
            <span className="text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full">
              Last 6 Months
            </span>
          </div>

          <div className="h-72 w-full">
            {stats?.monthly_revenue && stats.monthly_revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.monthly_revenue}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#1e1b4b',
                      borderRadius: '12px',
                      color: '#ffffff',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    }}
                    labelStyle={{ color: '#c4b5fd', fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#violetGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No revenue history logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Right 1/3: Invoice Status Donut */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Invoice Distribution</h2>
            <p className="text-xs text-slate-400">Status ratio across all invoices</p>
          </div>

          <div className="relative h-60 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={88}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={(PIE_COLORS as any)[entry.name] || '#7c3aed'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} Invoices`, name]}
                  contentStyle={{
                    backgroundColor: '#1e1b4b',
                    borderRadius: '10px',
                    color: '#fff',
                    border: 'none',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">{totalInvoicesInDonut}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Invoices</span>
            </div>
          </div>

          {/* Custom Colored Dot Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: (PIE_COLORS as any)[entry.name] || '#7c3aed' }}
                />
                <span className="text-slate-600 font-medium">
                  {entry.name}: <strong className="text-slate-900">{entry.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Invoices</h2>
            <p className="text-xs text-slate-400">Latest generated subscription statements</p>
          </div>
          <Link
            to="/invoices"
            className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition flex items-center gap-1"
          >
            <span>View All Invoices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {invoicesLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Loading invoices...
                  </td>
                </tr>
              ) : recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No recent invoices logged.
                  </td>
                </tr>
              ) : (
                recentInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition group"
                  >
                    <td className="px-6 py-4 font-bold text-violet-600 group-hover:underline">
                      {inv.invoice_number}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {inv.customer?.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {inv.subscription?.plan?.name || 'SaaS Plan'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ₹{inv.total_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {format(new Date(inv.due_date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="inline-flex p-1.5 text-slate-400 hover:text-violet-600 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
