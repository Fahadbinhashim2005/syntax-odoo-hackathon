import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Package,
  Pencil,
  Power,
  X,
  ChevronDown,
} from "lucide-react";

type ProductType = "Service" | "Consumable" | "Storable";
type ProductStatus = "Active" | "Archived";

type Product = {
  id: number;
  name: string;
  description: string;
  productType: ProductType;
  salesPrice: number;
  costPrice: number;
  status: ProductStatus;
};

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Basic Subscription",
    description: "Basic monthly subscription package",
    productType: "Service",
    salesPrice: 499,
    costPrice: 200,
    status: "Active",
  },
  {
    id: 2,
    name: "Premium Package",
    description: "Premium subscription package",
    productType: "Service",
    salesPrice: 1499,
    costPrice: 700,
    status: "Active",
  },
  {
    id: 3,
    name: "Enterprise Plan",
    description: "Enterprise subscription package",
    productType: "Service",
    salesPrice: 4999,
    costPrice: 2500,
    status: "Active",
  },
  {
    id: 4,
    name: "Wireless Keyboard",
    description: "Wireless office keyboard",
    productType: "Storable",
    salesPrice: 1299,
    costPrice: 800,
    status: "Archived",
  },
];

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const emptyForm = {
  name: "",
  description: "",
  productType: "Service" as ProductType,
  salesPrice: "",
  costPrice: "",
  status: "Active" as ProductStatus,
};

function Products() {
  const [products, setProducts] = useState<Product[]>(() => { try { const saved = localStorage.getItem("syntax-products-v1"); return saved ? JSON.parse(saved) as Product[] : initialProducts; } catch { return initialProducts; } });
  useEffect(() => { localStorage.setItem("syntax-products-v1", JSON.stringify(products)); }, [products]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "All" || product.productType === typeFilter;

      const matchesStatus =
        statusFilter === "All" || product.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [products, search, typeFilter, statusFilter]);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setIsFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      productType: product.productType,
      salesPrice: String(product.salesPrice),
      costPrice: String(product.costPrice),
      status: product.status,
    });
    setError("");
    setIsFormOpen(true);
  }

  function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const salesPrice = Number(form.salesPrice);
    const costPrice = Number(form.costPrice);

    if (!name) {
      setError("Product name is required.");
      return;
    }

    if (
      form.salesPrice.trim() === "" ||
      form.costPrice.trim() === "" ||
      !Number.isFinite(salesPrice) ||
      !Number.isFinite(costPrice) ||
      salesPrice < 0 ||
      costPrice < 0
    ) {
      setError("Enter valid, non-negative sales and cost prices.");
      return;
    }

    const duplicate = products.some(
      (product) =>
        product.name.toLowerCase() === name.toLowerCase() &&
        product.id !== editingId,
    );

    if (duplicate) {
      setError("A product with this name already exists.");
      return;
    }

    if (editingId !== null) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingId
            ? {
                ...product,
                ...form,
                name,
                salesPrice,
                costPrice,
              }
            : product,
        ),
      );
    } else {
      const newProduct: Product = {
        id: Math.max(0, ...products.map((product) => product.id)) + 1,
        name,
        description: form.description.trim(),
        productType: form.productType,
        salesPrice,
        costPrice,
        status: form.status,
      };

      setProducts((current) => [...current, newProduct]);
    }

    setIsFormOpen(false);
    setForm(emptyForm);
  }

  function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Delete "${product.name}" from this sample product list?`,
    );

    if (confirmed) {
      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-5 sm:p-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs text-slate-500">
              Workspace / Product Management
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              Products
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage your product catalogue.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Total Products"
            value={products.length}
          />

          <SummaryCard
            label="Active Products"
            value={products.filter((p) => p.status === "Active").length}
          />

          <SummaryCard
            label="Archived Products"
            value={products.filter((p) => p.status === "Archived").length}
          />
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                All Products
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredProducts.length} product(s) displayed
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                <Search size={17} className="text-slate-400" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products..."
                  className="min-w-0 bg-transparent text-sm outline-none sm:w-48"
                  aria-label="Search products"
                />
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-xs text-slate-500">Type</span>

                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="bg-transparent text-sm outline-none"
                  aria-label="Filter by product type"
                >
                  <option value="All">All</option>
                  <option value="Consumable">Consumable</option>
                  <option value="Storable">Storable</option>
                  <option value="Service">Service</option>
                </select>

                <ChevronDown size={14} className="text-slate-400" />
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-xs text-slate-500">Status</span>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="bg-transparent text-sm outline-none"
                  aria-label="Filter by product status"
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4 font-semibold">Product</th>
                  <th className="px-5 py-4 font-semibold">Type</th>
                  <th className="px-5 py-4 font-semibold">Sales Price</th>
                  <th className="px-5 py-4 font-semibold">Cost Price</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                          <Package size={19} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {product.name}
                          </p>

                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {product.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {product.productType}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold">
                      {currency.format(product.salesPrice)}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {currency.format(product.costPrice)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(product)}
                          aria-label={`Edit ${product.name}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteProduct(product)}
                          aria-label={`${product.status === "Active" ? "Deactivate" : "Reactivate"} ${product.name}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Power size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center"
                    >
                      <Package
                        size={30}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <p className="font-medium text-slate-700">
                        No products found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Try another search or change your filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
            <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingId === null ? "Add Product" : "Edit Product"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter the product information below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  aria-label="Close form"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={saveProduct} className="space-y-5 p-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Product Name *
                  </label>

                  <input
                    required
                    maxLength={120}
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="e.g. Premium Package"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    maxLength={1000}
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    placeholder="Describe your product..."
                    className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Product Type *
                    </label>

                    <select
                      value={form.productType}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          productType: event.target.value as ProductType,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500"
                    >
                      <option value="Consumable">Consumable</option>
                  <option value="Storable">Storable</option>
                      <option value="Service">Service</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Status *
                    </label>

                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          status: event.target.value as ProductStatus,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Sales Price (₹) *
                    </label>

                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.salesPrice}
                      onChange={(event) =>
                        setForm({ ...form, salesPrice: event.target.value })
                      }
                      placeholder="499.00"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Cost Price (₹) *
                    </label>

                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.costPrice}
                      onChange={(event) =>
                        setForm({ ...form, costPrice: event.target.value })
                      }
                      placeholder="200.00"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                  >
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                  >
                    {editingId === null ? "Create Product" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default Products;
