import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import {
  ChevronLeft,
  Building2,
  Receipt,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Percent,
  Calendar,
  Layers,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { authApi } from '../../api/auth';
import { catalogueApi } from '../../api/catalogue';
import { subscriptionsApi } from '../../api/subscriptions';
import { Customer, Plan, Tax, Discount } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const CreateQuotationPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 3-Step Wizard Navigation
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Customer & Plan selection
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [planId, setPlanId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [validUntil, setValidUntil] = useState<string>(
    format(addDays(new Date(), 30), 'yyyy-MM-dd')
  );

  // Step 2: Commercial Pricing, Discounts & Taxes
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'none' | 'fixed' | 'percentage' | 'preset'>('none');
  const [selectedDiscountId, setSelectedDiscountId] = useState<number | ''>('');
  const [manualDiscountValue, setManualDiscountValue] = useState<number>(0);
  const [taxPercentage, setTaxPercentage] = useState<number>(18.0);
  const [notes, setNotes] = useState<string>('');

  // Queries
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => authApi.getCustomers({ status: 'active' }),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: () => catalogueApi.getPlans({ is_active: true }),
  });

  const { data: discounts = [] } = useQuery({
    queryKey: ['discounts'],
    queryFn: catalogueApi.getDiscounts,
  });

  const { data: taxes = [] } = useQuery({
    queryKey: ['taxes'],
    queryFn: catalogueApi.getTaxes,
  });

  const selectedCustomer = customers.find((c) => c.id === Number(customerId));
  const selectedPlan = plans.find((p) => p.id === Number(planId));

  // Handle plan pick
  const handleSelectPlan = (plan: Plan) => {
    setPlanId(plan.id);
    setUnitPrice(plan.price);
  };

  // Filtered customer list
  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch.trim()) return true;
    const term = customerSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.company && c.company.toLowerCase().includes(term)) ||
      c.email.toLowerCase().includes(term)
    );
  });

  // Calculate discount amount
  const subtotal = Math.max(0, (unitPrice || 0) * (quantity || 1));
  let calculatedDiscount = 0;

  if (discountType === 'preset') {
    const preset = discounts.find((d) => d.id === Number(selectedDiscountId));
    if (preset) {
      if (preset.discount_type === 'percentage') {
        calculatedDiscount = (subtotal * preset.value) / 100;
      } else {
        calculatedDiscount = preset.value;
      }
    }
  } else if (discountType === 'percentage') {
    calculatedDiscount = (subtotal * (manualDiscountValue || 0)) / 100;
  } else if (discountType === 'fixed') {
    calculatedDiscount = manualDiscountValue || 0;
  }
  calculatedDiscount = Math.min(subtotal, Math.max(0, calculatedDiscount));

  const taxableAmount = Math.max(0, subtotal - calculatedDiscount);
  const taxAmount = (taxableAmount * (taxPercentage || 0)) / 100;
  const grandTotal = taxableAmount + taxAmount;

  // Mutation to create quotation
  const createMutation = useMutation({
    mutationFn: (status: 'draft' | 'sent') => {
      if (!customerId || !planId) {
        throw new Error('Please select both a Customer and a Plan');
      }
      return subscriptionsApi.createQuotation({
        customer_id: Number(customerId),
        plan_id: Number(planId),
        product_id: selectedPlan?.product_id || null,
        quantity: quantity,
        unit_price: unitPrice,
        discount_amount: Math.round(calculatedDiscount * 100) / 100,
        tax_amount: Math.round(taxAmount * 100) / 100,
        status: status,
        valid_until: validUntil,
        notes: notes || undefined,
      });
    },
    onSuccess: (qt) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success(`Quotation ${qt.quotation_number} generated successfully!`);
      navigate(`/quotations/${qt.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || 'Failed to create quotation');
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/quotations" className="hover:text-[#183630] transition flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Quotations</span>
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">New Commercial Proposal</span>
      </div>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#183630] text-[#E5C690] flex items-center justify-center text-sm font-bold shadow-sm">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            Create Quotation Proposal
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            3-Step interactive wizard for configuring client proposals and converting to active subscriptions.
          </p>
        </div>
      </div>

      {/* Wizard Progress Stepper */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {[
            { stepNum: 1, label: 'Customer & Plan' },
            { stepNum: 2, label: 'Pricing & Taxes' },
            { stepNum: 3, label: 'Review & Send' },
          ].map((s, idx) => (
            <React.Fragment key={s.stepNum}>
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                    step >= s.stepNum
                      ? 'bg-[#183630] text-[#E5C690] ring-4 ring-[#183630]/10'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {s.stepNum}
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:inline ${
                    step >= s.stepNum ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <div
                  className={`flex-1 h-0.5 mx-3 transition-colors ${
                    step > s.stepNum ? 'bg-[#183630]' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* STEP 1: CUSTOMER & PLAN SELECTION */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#183630]" />
              <span>Step 1: Select Target Customer & Subscription Plan</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Step 1 of 3</span>
          </div>

          <div className="space-y-5">
            {/* Customer Search & Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Customer *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Filter customers by name or company..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#183630] focus:bg-white"
                />
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(Number(e.target.value) || '')}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#183630]"
                >
                  <option value="">-- Choose verified customer ({filteredCustomers.length}) --</option>
                  {filteredCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''} — {c.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Selected Card */}
              {selectedCustomer && (
                <div className="mt-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      Client Profile Selected
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedCustomer.name}</h3>
                    <p className="text-xs text-slate-600 font-medium">{selectedCustomer.company || 'Private Customer'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedCustomer.email} {selectedCustomer.phone ? `• ${selectedCustomer.phone}` : ''}</p>
                    {selectedCustomer.address && (
                      <p className="text-xs text-slate-400 mt-0.5">{selectedCustomer.address}</p>
                    )}
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>
              )}
            </div>

            {/* Plan Cards Grid */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Subscription Plan Tier *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {plans.map((p) => {
                  const isSelected = planId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPlan(p)}
                      className={`p-4 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#183630] bg-[#183630]/5 ring-2 ring-[#183630]'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {p.billing_frequency}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#183630]" />
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 mt-2 text-sm">{p.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          Product: {p.product?.name || 'SaaS Service'}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                        <span className="text-lg font-black text-slate-900">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          /{p.billing_frequency}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quantity & Validity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                label="Contract Seats / License Units *"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
              <Input
                label="Proposal Validity / Expiry Date *"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          {/* Step 1 Actions */}
          <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
            <Button
              disabled={!customerId || !planId}
              onClick={() => setStep(2)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Next: Pricing & Commercial Terms
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: PRICING, DISCOUNTS & TAXES */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#183630]" />
              <span>Step 2: Commercial Pricing, Discounts & GST Tax</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Step 2 of 3</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Input
                label="Agreed Unit Price (₹) *"
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Math.max(0, Number(e.target.value) || 0))}
              />

              {/* Discount Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Discount Configuration
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'preset', label: 'Preset' },
                    { id: 'percentage', label: '% Percent' },
                    { id: 'fixed', label: '₹ Fixed' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setDiscountType(mode.id as any)}
                      className={`py-2 px-2.5 rounded-xl font-bold transition text-center ${
                        discountType === mode.id
                          ? 'bg-[#183630] text-[#E5C690]'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {discountType === 'preset' && (
                  <select
                    value={selectedDiscountId}
                    onChange={(e) => setSelectedDiscountId(Number(e.target.value) || '')}
                    className="w-full mt-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#183630]"
                  >
                    <option value="">-- Choose Catalogue Discount --</option>
                    {discounts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.discount_type === 'percentage' ? `${d.value}%` : `₹${d.value}`})
                      </option>
                    ))}
                  </select>
                )}

                {['percentage', 'fixed'].includes(discountType) && (
                  <Input
                    label={discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}
                    type="number"
                    step="0.01"
                    min="0"
                    value={manualDiscountValue}
                    onChange={(e) => setManualDiscountValue(Math.max(0, Number(e.target.value) || 0))}
                  />
                )}
              </div>

              {/* Tax Rule Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Applicable GST / Tax Rate
                </label>
                <select
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#183630]"
                >
                  {taxes.map((t) => (
                    <option key={t.id} value={t.percentage}>
                      {t.name} ({t.percentage}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Financial Calculation Card */}
            <div className="bg-[#183630]/5 p-6 rounded-3xl border border-[#183630]/15 space-y-4">
              <div className="flex items-center justify-between border-b border-[#183630]/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#183630]">
                  Live Commercial Summary
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  Cadence: {selectedPlan?.billing_frequency}
                </span>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-700">
                  <span>Gross Subtotal ({quantity} seat(s) × ₹{unitPrice.toLocaleString('en-IN')}):</span>
                  <span className="font-semibold text-slate-900">
                    ₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-rose-600">
                  <span>Discount Applied:</span>
                  <span className="font-semibold">
                    -₹{calculatedDiscount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-slate-700 pt-1 border-t border-[#183630]/10">
                  <span>Net Taxable Base:</span>
                  <span className="font-semibold text-slate-900">
                    ₹{taxableAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>GST / Tax ({taxPercentage}%):</span>
                  <span className="font-semibold text-slate-900">
                    +₹{taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="border-t-2 border-[#183630]/20 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-base font-extrabold text-[#183630]">Grand Total Amount:</span>
                    <p className="text-[11px] text-slate-500">Per recurring {selectedPlan?.billing_frequency}</p>
                  </div>
                  <span className="text-2xl font-black text-[#183630]">
                    ₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 Actions */}
          <div className="pt-6 flex justify-between gap-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setStep(1)} icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Customer & Plan
            </Button>
            <Button onClick={() => setStep(3)} icon={<ArrowRight className="w-4 h-4" />}>
              Next: Review Document
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW & CREATE DOCUMENT */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            {/* Proposal Document Preview Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-200 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#183630] text-[#E5C690] flex items-center justify-center font-black text-xl shadow-md">
                  BL
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-slate-900 leading-tight">Brightloop Enterprise SaaS</h3>
                  <p className="text-xs text-slate-400">Formal Commercial Quotation Proposal</p>
                </div>
              </div>
              <div className="text-left sm:text-right space-y-1">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                  Ready to Issue
                </span>
                <p className="text-xs text-slate-500">Valid Until: {format(new Date(validUntil), 'dd MMMM yyyy')}</p>
              </div>
            </div>

            {/* Recipient & Tier Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bill To Customer</p>
                <h4 className="font-bold text-slate-900 mt-1">{selectedCustomer?.name}</h4>
                <p className="text-xs text-slate-600">{selectedCustomer?.company || 'Personal Account'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{selectedCustomer?.email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subscription Package</p>
                <h4 className="font-bold text-slate-900 mt-1">{selectedPlan?.name}</h4>
                <p className="text-xs text-slate-600">Product: {selectedPlan?.product?.name || 'SaaS Service'}</p>
                <p className="text-xs text-slate-500 mt-0.5">Cadence: Every {selectedPlan?.billing_frequency} • Seats: {quantity}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-2.5">Item Description</th>
                    <th className="py-2.5 text-center">Seats</th>
                    <th className="py-2.5 text-right">Unit Price</th>
                    <th className="py-2.5 text-right">Discount</th>
                    <th className="py-2.5 text-right">GST ({taxPercentage}%)</th>
                    <th className="py-2.5 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">
                      {selectedPlan?.name}
                      <span className="block text-xs font-normal text-slate-400">
                        Billed {selectedPlan?.billing_frequency}
                      </span>
                    </td>
                    <td className="py-3 text-center font-medium">{quantity}</td>
                    <td className="py-3 text-right font-medium">₹{unitPrice.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right text-rose-600 font-medium">
                      -₹{calculatedDiscount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right font-medium">
                      +₹{taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right font-black text-[#183630]">
                      ₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Terms & Notes Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Commercial Notes, Contract SLA & Terms
              </label>
              <textarea
                rows={3}
                placeholder="Include custom terms, SLA guarantees, payment conditions or onboarding notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#183630]"
              />
            </div>

            {/* Total Highlight */}
            <div className="bg-[#183630] text-[#E3DAC9] p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#E5C690]">Final Proposal Total</p>
                <p className="text-xs text-[#E3DAC9]/80">Includes all applicable discounts & GST</p>
              </div>
              <span className="text-2xl font-black text-white">
                ₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Step 3 Actions */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setStep(2)} icon={<ArrowLeft className="w-4 h-4" />}>
                Back to Pricing
              </Button>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Button
                  variant="outline"
                  loading={createMutation.isPending}
                  onClick={() => createMutation.mutate('draft')}
                >
                  Save as Draft
                </Button>
                <Button
                  loading={createMutation.isPending}
                  onClick={() => createMutation.mutate('sent')}
                  icon={<Sparkles className="w-4 h-4 text-[#E5C690]" />}
                >
                  Save & Issue to Client
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
