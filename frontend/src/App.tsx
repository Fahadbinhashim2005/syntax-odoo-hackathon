import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Products from "./pages/products";
import {
  LayoutDashboard,
  Package,
  Layers3,
  Percent,
  Receipt,
  Settings,
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  MoreHorizontal,
  ChevronDown,
  Box,
  CircleDollarSign,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";

const products = [
  {
    id: 1,
    name: "Basic Subscription",
    category: "Subscription",
    price: "₹499.00",
    status: "Active",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: 2,
    name: "Premium Package",
    category: "Service",
    price: "₹1,499.00",
    status: "Active",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: 3,
    name: "Enterprise Plan",
    category: "Subscription",
    price: "₹4,999.00",
    status: "Active",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: 4,
    name: "Support Add-on",
    category: "Service",
    price: "₹299.00",
    status: "Archived",
    color: "bg-orange-100 text-orange-700",
  },
];

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Products", icon: Package },
  { label: "Product Variants", icon: Layers3 },
  { label: "Subscription Plans", icon: ShoppingBag },
  { label: "Discounts", icon: Percent },
  { label: "Tax Settings", icon: Receipt },
];

function AppContent() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-800">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
            <Box size={21} />
          </div>

          <div>
            <h1 className="text-base font-bold tracking-tight">
              Syntax Odoo
            </h1>
            <p className="text-xs text-slate-500">Subscription Manager</p>
          </div>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
  {navigation.map((item) => {
    const Icon = item.icon;
    const active = item.label === "Dashboard";

    return (
      <button
        key={item.label}
        type="button"
        onClick={() => {
          if (item.label === "Dashboard") {
            navigate("/");
          } else if (item.label === "Products") {
            navigate("/products");
          }
        }}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
          active
            ? "bg-violet-50 font-semibold text-violet-700"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <Icon size={19} />
        <span>{item.label}</span>
      </button>
    );
  })}
</nav>
        </div>

        <div className="mt-auto border-t border-slate-100 p-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700">
              M2
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Product Manager</p>
              <p className="text-xs text-slate-500">Member 2</p>
            </div>

            <Settings size={17} className="text-slate-400" />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div>
            <p className="text-xs text-slate-500">
              Workspace / Product Management
            </p>
            <h2 className="text-sm font-semibold">Overview</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <Bell size={19} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold">
                FA
              </div>
              <span className="hidden text-sm font-medium sm:block">
                Admin
              </span>
              <ChevronDown size={15} className="text-slate-400" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-5 sm:p-8">
          {/* Page title */}
          <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Product Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your products, subscription plans and pricing.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
              onClick={() => alert("Add Product form will be implemented next.")}
            >
              <Plus size={18} />
              Add Product
            </button>
          </section>

          {/* Summary cards */}
          <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Products"
              value="24"
              subtitle="Products in catalogue"
              change="+4 this month"
              icon={Package}
              iconStyle="bg-violet-50 text-violet-600"
            />

            <StatCard
              title="Active Plans"
              value="12"
              subtitle="Available subscription plans"
              change="+2 this month"
              icon={Layers3}
              iconStyle="bg-blue-50 text-blue-600"
            />

            <StatCard
              title="Active Discounts"
              value="5"
              subtitle="Currently configured"
              change="2 expiring soon"
              icon={Percent}
              iconStyle="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              title="Catalogue Value"
              value="₹48,500"
              subtitle="Illustrative product value"
              change="View catalogue"
              icon={CircleDollarSign}
              iconStyle="bg-orange-50 text-orange-600"
            />
          </section>

          {/* Secondary information */}
          <section className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 xl:col-span-2">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Catalogue Overview
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Summary of your product catalogue.
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="More catalogue options"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                    <Package size={18} />
                  </div>
                  <p className="text-sm text-slate-500">Products</p>
                  <p className="mt-1 text-xl font-bold">24</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Goods and services
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <Layers3 size={18} />
                  </div>
                  <p className="text-sm text-slate-500">Variants</p>
                  <p className="mt-1 text-xl font-bold">18</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Configured variations
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <TrendingUp size={18} />
                  </div>
                  <p className="text-sm text-slate-500">Plans</p>
                  <p className="mt-1 text-xl font-bold">12</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Active billing plans
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Quick Actions
                </h3>
                <ArrowUpRight size={18} className="text-slate-400" />
              </div>

              <div className="space-y-3">
                <QuickAction
                  icon={Package}
                  title="Create a product"
                  description="Add a new catalogue item"
                />

                <QuickAction
                  icon={ShoppingBag}
                  title="Create a plan"
                  description="Configure subscription pricing"
                />

                <QuickAction
                  icon={Percent}
                  title="Add a discount"
                  description="Set up promotional pricing"
                />

                <QuickAction
                  icon={Receipt}
                  title="Configure taxes"
                  description="Manage tax rates"
                />
              </div>
            </div>
          </section>

          {/* Products table */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Recent Products
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  A quick look at your catalogue.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                  <Search size={17} className="text-slate-400" />
                  <input
                    type="search"
                    placeholder="Search products..."
                    className="w-full bg-transparent text-sm outline-none sm:w-44"
                    aria-label="Search products"
                  />
                </label>

                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                >
                  All products
                  <ChevronDown size={15} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Sales Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${product.color}`}
                          >
                            <Package size={19} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              PRD-{String(product.id).padStart(3, "0")}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {product.category}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                        {product.price}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            product.status === "Active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          aria-label={`More actions for ${product.name}`}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <MoreHorizontal size={19} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing 4 sample products
              </p>

              <button
                type="button"
                className="text-sm font-semibold text-violet-700 hover:text-violet-900"
              >
                View all products →
              </button>
            </div>
          </section>

          <p className="mt-6 text-center text-xs text-slate-400">
            Syntax Odoo · Product, Plan & Discount Management
          </p>
        </main>
      </div>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  change: string;
  icon: typeof Package;
  iconStyle: string;
};

function StatCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  iconStyle,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon size={22} />
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">{subtitle}</p>

      <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
        <TrendingUp size={14} />
        {change}
      </div>
    </div>
  );
}

type QuickActionProps = {
  icon: typeof Package;
  title: string;
  description: string;
};

function QuickAction({
  icon: Icon,
  title,
  description,
}: QuickActionProps) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg border border-slate-100 p-3 text-left transition hover:border-violet-200 hover:bg-violet-50/50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      <ArrowUpRight size={16} className="shrink-0 text-slate-400" />
    </button>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;