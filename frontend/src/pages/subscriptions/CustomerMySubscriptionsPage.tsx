import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Repeat, Calendar, CheckCircle2, Layers } from 'lucide-react';
import { subscriptionsApi } from '../../api/subscriptions';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const CustomerMySubscriptionsPage: React.FC = () => {
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['my-subscriptions'],
    queryFn: () => subscriptionsApi.getSubscriptions(),
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-[#183630] text-[#E5C690] flex items-center justify-center text-sm font-bold shadow-sm">
            <Repeat className="w-4 h-4" />
          </span>
          My Subscriptions
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Review your enrolled active SaaS plans, billing schedules, and contracted seats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 p-16 text-center text-slate-400">Loading your subscriptions...</div>
        ) : subscriptions.length === 0 ? (
          <div className="col-span-3 bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-xs">
            <Repeat className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No active subscriptions found</p>
            <p className="text-xs text-slate-400 mt-1">Contact your account manager to activate a plan.</p>
          </div>
        ) : (
          subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#183630] uppercase tracking-wider block">
                      {sub.subscription_number}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{sub.plan?.name}</h3>
                  </div>
                  <StatusBadge status={sub.status} />
                </div>

                <div className="space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>
                      Started: {format(new Date(sub.start_date), 'dd MMM yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-slate-400" />
                    <span>Contracted seats: {sub.quantity} unit(s)</span>
                  </div>
                  {sub.next_billing_date && (
                    <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Next renewal: {format(new Date(sub.next_billing_date), 'dd MMM yyyy')}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-900">
                      ₹{sub.total_amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400 font-medium ml-1">
                      /{sub.plan?.billing_frequency || 'month'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  to={`/subscriptions/${sub.id}`}
                  className="w-full block py-2.5 rounded-xl bg-[#183630]/10 text-[#183630] font-bold text-xs text-center hover:bg-[#183630] hover:text-[#E5C690] transition"
                >
                  View Details & Audit Trail
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
