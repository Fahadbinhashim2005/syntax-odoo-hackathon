import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CreditCard } from 'lucide-react';
import { financeApi } from '../../api/finance';
import { Invoice } from '../../types';
import { SlideOver } from '../../components/ui/SlideOver';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface RecordPaymentModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const paymentSchema = z.object({
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  payment_method: z.string().min(1, 'Payment method is required'),
  payment_date: z.string().min(1, 'Payment date is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = {
  amount: number;
  payment_method: string;
  payment_date: string;
  reference?: string;
  notes?: string;
};

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const maxAllowed = invoice.outstanding_amount;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      amount: maxAllowed,
      payment_method: 'upi',
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      reference: '',
      notes: '',
    },
  });

  const paymentMutation = useMutation({
    mutationFn: (data: PaymentFormValues) =>
      financeApi.createPayment({
        invoice_id: invoice.id,
        amount: Number(data.amount),
        payment_method: data.payment_method,
        payment_date: data.payment_date,
        reference: data.reference,
        notes: data.notes,
      }),
    onSuccess: (payment) => {
      toast.success(`Payment ${payment.payment_number} recorded successfully!`);
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to record payment');
    },
  });

  const onSubmit = (data: PaymentFormValues) => {
    paymentMutation.mutate(data);
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Record Invoice Payment"
      description="Record an incoming payment transaction against this client invoice."
    >
      <div className="space-y-6">
        {/* Invoice Summary Card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Invoice Number:</span>
            <span className="font-bold text-slate-900">{invoice.invoice_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Customer:</span>
            <span className="font-semibold text-slate-900">{invoice.customer?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Billed:</span>
            <span className="font-semibold text-slate-900">
              ₹{invoice.total_amount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
            <span className="font-bold text-slate-700">Outstanding Balance:</span>
            <span className="text-base font-black text-rose-600">
              ₹{invoice.outstanding_amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-slate-700">
                Payment Amount (₹) *
              </label>
              <button
                type="button"
                onClick={() => setValue('amount', maxAllowed)}
                className="text-[11px] font-bold text-violet-600 hover:underline"
              >
                Pay Full (₹{maxAllowed.toLocaleString('en-IN')})
              </button>
            </div>
            <Input
              type="number"
              step="0.01"
              placeholder="5000"
              {...register('amount')}
              error={errors.amount?.message}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Payment Method *</label>
            <select
              {...register('payment_method')}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-violet-500"
            >
              <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
              <option value="bank_transfer">Direct Bank Transfer / NEFT / IMPS</option>
              <option value="card">Credit / Debit Card</option>
              <option value="cash">Cash / Cheque</option>
              <option value="other">Other Gateway</option>
            </select>
          </div>

          <Input
            label="Payment Date *"
            type="date"
            {...register('payment_date')}
            error={errors.payment_date?.message}
          />

          <Input
            label="Transaction ID / Reference"
            placeholder="e.g. UPI/6192847101 or NEFT-8812"
            {...register('reference')}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Payment Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Half advance installment received via HDFC"
              {...register('notes')}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={paymentMutation.isPending}
              icon={<CreditCard className="w-4 h-4" />}
            >
              Record Payment
            </Button>
          </div>
        </form>
      </div>
    </SlideOver>
  );
};
