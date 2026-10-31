
import { useState } from 'react'
import {
  LayoutDashboard,
  FileText,
  RefreshCw,
  Users,
  Package,
  Bell,
  Search,
  ChevronDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  CircleDollarSign,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const revenueData = [
  { month: 'May', revenue: 18000 },
  { month: 'Jun', revenue: 24000 },
  { month: 'Jul', revenue: 21000 },
  { month: 'Aug', revenue: 32000 },
  { month: 'Sep', revenue: 29000 },
  { month: 'Oct', revenue: 42000 },
]

const quotations = [
  { id: 'QT-2026-001', customer: 'Acme Corporation', plan: 'Enterprise', amount: '₹24,999', status: 'Accepted' },
  { id: 'QT-2026-002', customer: 'Bright Solutions', plan: 'Professional', amount: '₹12,499', status: 'Pending' },
  { id: 'QT-2026-003', customer: 'Nova Technologies', plan: 'Starter', amount: '₹4,999', status: 'Expired' },
  { id: 'QT-2026-004', customer: 'Global Systems', plan: 'Enterprise', amount: '₹24,999', status: 'Pending' },
]

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Quotations', icon: FileText },
  { name: 'Subscriptions', icon: RefreshCw },
]

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [mobileMenu, setMobileMenu] = useState(false)

  const stats = [
    {
      title: 'Total Revenue',
      value: '₹4,82,500',
      change: '+12.8%',
      positive: true,
      icon: CircleDollarSign,
      color: 'bg-violet-100 text-violet-600',
    },
    {
      title: 'Active Subscriptions',
      value: '248',
      change: '+8.2%',
      positive: true,
      icon: RefreshCw,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Pending Quotations',
      value: '32',
      change: '-2.4%',
      positive: false,
      icon: Clock3,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      title: 'Total Customers',
      value: '186',
      change: '+6.5%',
      positive: true,
      icon: Users,
      color: 'bg-emerald-100 text-emerald-600',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {mobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          mobileMenu ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-lg font-bold text-white">
              O
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Odoo</h1>
              <p className="text-xs text-slate-400">Subscription Manager</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setMobileMenu(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = activePage === item.name

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActivePage(item.name)
                    setMobileMenu(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon size={19} />
                  {item.name}
                  {item.name === 'Quotations' && (
                    <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      12
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          <p className="mb-3 mt-9 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Management
          </p>
          <div className="space-y-1">
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-50">
              <Users size={19} /> Customers
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-50">
              <Package size={19} /> Products & Plans
            </button>
          </div>
        </div>

        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700">
              FA
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">Admin User</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={21} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{activePage}</h2>
              <p className="hidden text-xs text-slate-400 sm:block">
                Manage your business operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
              <Search size={17} className="text-slate-400" />
              <input
                placeholder="Search anything..."
                className="w-36 bg-transparent text-sm outline-none"
              />
              <span className="text-xs text-slate-400">⌘ K</span>
            </div>
            <button className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100">
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
            </button>
            <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700 sm:flex">
              FA
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
          {activePage === 'Dashboard' && (
            <>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    Welcome back! 👋
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Here&apos;s what&apos;s happening with your business today.
                  </p>
                </div>
                <button
                  onClick={() => setActivePage('Quotations')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
                >
                  <Plus size={17} /> Create Quotation
                </button>
              </div>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500">{stat.title}</span>
                        <div className={`rounded-xl p-2.5 ${stat.color}`}>
                          <Icon size={20} />
                        </div>
                      </div>
                      <div className="mt-4 flex items-end justify-between gap-2">
                        <h4 className="text-2xl font-bold tracking-tight text-slate-900">{stat.value}</h4>
                        <span className={`flex items-center gap-1 text-xs font-semibold ${stat.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {stat.positive ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                          {stat.change}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">Compared to last month</p>
                    </div>
                  )
                })}
              </section>

              <section className="grid gap-6 xl:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900">Revenue Overview</h4>
                      <p className="mt-1 text-xs text-slate-400">Monthly revenue performance</p>
                    </div>
                    <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
                      Last 6 months <ChevronDown size={14} className="ml-1 inline" />
                    </button>
                  </div>
                  <div className="mt-6 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `₹${value / 1000}k`} />
                        <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']} />
                        <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} fill="url(#revenueFill)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h4 className="font-bold text-slate-900">Subscription Status</h4>
                  <p className="mt-1 text-xs text-slate-400">Current subscription breakdown</p>
                  <div className="my-7 flex justify-center">
                    <div className="relative flex h-40 w-40 items-center justify-center rounded-full" style={{ background: 'conic-gradient(#7c3aed 0% 68%, #38bdf8 68% 88%, #fbbf24 88% 100%)' }}>
                      <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                        <span className="text-3xl font-bold text-slate-900">248</span>
                        <span className="text-xs text-slate-400">Total</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <StatusLegend color="bg-violet-600" label="Active" value="168" />
                    <StatusLegend color="bg-sky-400" label="Trial" value="50" />
                    <StatusLegend color="bg-amber-400" label="Expiring" value="30" />
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:px-6">
                  <div>
                    <h4 className="font-bold text-slate-900">Recent Quotations</h4>
                    <p className="mt-1 text-xs text-slate-400">Latest quotation activity</p>
                  </div>
                  <button onClick={() => setActivePage('Quotations')} className="text-sm font-semibold text-violet-600 hover:text-violet-800">
                    View all →
                  </button>
                </div>
                <QuotationTable />
              </section>

              <section className="grid gap-4 sm:grid-cols-3">
                <QuickAction icon={FileText} title="Create Quotation" description="Prepare a new customer quotation" onClick={() => setActivePage('Quotations')} />
                <QuickAction icon={RefreshCw} title="View Subscriptions" description="Manage active subscriptions" onClick={() => setActivePage('Subscriptions')} />
                <QuickAction icon={Users} title="Customers" description="View your customer accounts" onClick={() => setActivePage('Dashboard')} />
              </section>
            </>
          )}

          {activePage === 'Quotations' && (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">All Quotations</h3>
                  <p className="mt-1 text-sm text-slate-400">Manage customer quotations</p>
                </div>
                <button className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
                  <Plus size={17} /> New Quotation
                </button>
              </div>
              <QuotationTable />
            </section>
          )}

          {activePage === 'Subscriptions' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Subscription Management</h3>
              <p className="mt-2 text-sm text-slate-500">
                Your subscription list and lifecycle management will be implemented here.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <StatusCard title="Active" value="168" icon={CheckCircle2} color="text-emerald-600 bg-emerald-50" />
                <StatusCard title="Trial" value="50" icon={Clock3} color="text-blue-600 bg-blue-50" />
                <StatusCard title="Expiring Soon" value="30" icon={AlertCircle} color="text-amber-600 bg-amber-50" />
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

function StatusLegend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-slate-600">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        {label}
      </div>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  )
}

function QuotationTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-6 py-4 font-semibold">Quotation ID</th>
            <th className="px-6 py-4 font-semibold">Customer</th>
            <th className="px-6 py-4 font-semibold">Plan</th>
            <th className="px-6 py-4 font-semibold">Amount</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {quotations.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/70">
              <td className="px-6 py-4 font-semibold text-violet-700">{item.id}</td>
              <td className="px-6 py-4 font-medium text-slate-700">{item.customer}</td>
              <td className="px-6 py-4 text-slate-500">{item.plan}</td>
              <td className="px-6 py-4 font-semibold text-slate-800">{item.amount}</td>
              <td className="px-6 py-4">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  item.status === 'Accepted'
                    ? 'bg-emerald-50 text-emerald-700'
                    : item.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-rose-50 text-rose-700'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <MoreHorizontal size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: typeof FileText
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-violet-200 hover:shadow-md">
      <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
        <Icon size={21} />
      </div>
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>
    </button>
  )
}

function StatusCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  icon: typeof CheckCircle2
  color: string
}) {
  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <div className={`mb-3 inline-flex rounded-lg p-2 ${color}`}>
        <Icon size={20} />
      </div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

export default App
