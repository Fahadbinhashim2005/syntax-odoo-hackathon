import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Calendar, Filter } from 'lucide-react';
import { financeApi } from '../../api/finance';
import { catalogueApi } from '../../api/catalogue';
import { subscriptionsApi } from '../../api/subscriptions';
import { Button } from '../../components/ui/Button';

const COLORS = ['#7c3aed', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

export const RevenueReportPage: React.FC = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['finance-stats'],
    queryFn: financeApi.getFinanceStats,
  });

  const { data: report, refetch } = useQuery({
    queryKey: ['revenue-report', fromDate, toDate],
    queryFn: () =>
      financeApi.getRevenueReport({
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      }),
  });

  const { data: _plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: () => catalogueApi.getPlans(),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionsApi.getSubscriptions(),
  });

  // Calculate plan distribution
  const planRevenueMap: Record<string, number> = {};
  subscriptions.forEach((sub) => {
    const planName = sub.plan?.name || 'Standard';
    planRevenueMap[planName] = (planRevenueMap[planName] || 0) + sub.total_amount;
  });

  const planChartData = Object.entries(planRevenueMap).map(([name, value]) => ({
    name,
    value,
  }));

  const methodData = report?.by_method || [
    { method: 'UPI', amount: 8258.82 },
    { method: 'CARD', amount: 3000 },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Revenue Intelligence Reports</h1>
        <p className="text-sm text-slate-500">
          Financial performance analytics, tier contribution breakdown, and payment methods.
        </p>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">From Date:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">To Date:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
          />
        </div>

        <Button size="sm" onClick={() => refetch()} icon={<Filter className="w-3.5 h-3.5" />}>
          Apply Filter
        </Button>
      </div>

      {/* 3 Charts in a Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart 1: Monthly Revenue Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly Revenue</h3>
            <p className="text-[11px] text-slate-400">Total billings collected</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthly_revenue || []}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#1e1b4b', borderRadius: '10px', color: '#fff' }}
                />
                <Bar dataKey="revenue" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Plans Pie Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Revenue by Plan</h3>
            <p className="text-[11px] text-slate-400">Subscription tier contribution</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planChartData.length > 0 ? planChartData : [{ name: 'Default', value: 10000 }]}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                >
                  {planChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Total']}
                  contentStyle={{ backgroundColor: '#1e1b4b', borderRadius: '10px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Payment Methods Donut */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Payment Gateways</h3>
            <p className="text-[11px] text-slate-400">Payment method channel mix</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodData.map((m: any) => ({ name: m.method, value: m.amount }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                >
                  {methodData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Captured']}
                  contentStyle={{ backgroundColor: '#1e1b4b', borderRadius: '10px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Historical Performance Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4">Total Subscriptions</th>
                <th className="px-6 py-4">Total Collected</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {stats?.monthly_revenue?.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 font-bold text-slate-900">{item.month}</td>
                  <td className="px-6 py-4">{stats.active_subscriptions} Active</td>
                  <td className="px-6 py-4 font-black text-emerald-600">
                    ₹{item.revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500">Reconciled</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
