import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import {
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  RotateCw,
  XCircle,
  Sparkles,
  FileSpreadsheet,
  Clock,
  UserCheck
} from 'lucide-react';
import { subscriptionsApi } from '../api/subscriptions';
import { Subscription, SubscriptionHistory } from '../types';

interface SubscriptionTimelineProps {
  subscription: Subscription;
}

export const SubscriptionTimeline: React.FC<SubscriptionTimelineProps> = ({ subscription }) => {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['subscription-history', subscription.id],
    queryFn: () => subscriptionsApi.getSubscriptionHistory(subscription.id),
    initialData: subscription.history || [],
  });

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'converted_from_quotation':
        return {
          icon: <FileSpreadsheet className="w-4 h-4 text-emerald-700" />,
          bg: 'bg-emerald-100 ring-2 ring-emerald-300/50',
          title: 'Converted from Quotation',
        };
      case 'created':
        return {
          icon: <Sparkles className="w-4 h-4 text-sky-700" />,
          bg: 'bg-sky-100 ring-2 ring-sky-300/50',
          title: 'Direct Subscription Initialized',
        };
      case 'confirmed':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-amber-700" />,
          bg: 'bg-amber-100 ring-2 ring-amber-300/50',
          title: 'Subscription Confirmed',
        };
      case 'activated':
        return {
          icon: <PlayCircle className="w-4 h-4 text-emerald-700" />,
          bg: 'bg-emerald-100 ring-2 ring-emerald-300/50',
          title: 'Subscription Activated',
        };
      case 'paused':
        return {
          icon: <PauseCircle className="w-4 h-4 text-amber-700" />,
          bg: 'bg-amber-100 ring-2 ring-amber-300/50',
          title: 'Subscription Paused',
        };
      case 'resumed':
        return {
          icon: <PlayCircle className="w-4 h-4 text-teal-700" />,
          bg: 'bg-teal-100 ring-2 ring-teal-300/50',
          title: 'Subscription Resumed',
        };
      case 'renewed':
        return {
          icon: <RotateCw className="w-4 h-4 text-violet-700" />,
          bg: 'bg-violet-100 ring-2 ring-violet-300/50',
          title: 'Contract Extended & Renewed',
        };
      case 'closed':
        return {
          icon: <XCircle className="w-4 h-4 text-rose-700" />,
          bg: 'bg-rose-100 ring-2 ring-rose-300/50',
          title: 'Subscription Terminated / Closed',
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-slate-700" />,
          bg: 'bg-slate-100 ring-2 ring-slate-300/50',
          title: eventType.replace('_', ' ').toUpperCase(),
        };
    }
  };

  if (isLoading && history.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        Loading audit history...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400 space-y-1">
        <Clock className="w-6 h-6 mx-auto text-slate-300" />
        <p className="font-medium text-slate-600">No events logged yet</p>
        <p className="text-[11px] text-slate-400">Lifecycle actions will be recorded here.</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item: SubscriptionHistory, idx: number) => {
          const isLast = idx === history.length - 1;
          const badge = getEventBadge(item.event_type);
          const dateObj = new Date(item.created_at);

          return (
            <li key={item.id} className="relative pb-8">
              {!isLast && (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3.5">
                {/* Event Icon */}
                <div
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${badge.bg}`}
                >
                  {badge.icon}
                </div>

                {/* Event Details */}
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <p className="text-xs font-bold text-slate-900">{badge.title}</p>
                    <time
                      dateTime={item.created_at}
                      className="text-[11px] text-slate-400 font-medium shrink-0"
                      title={format(dateObj, 'PPpp')}
                    >
                      {format(dateObj, 'dd MMM yyyy, HH:mm')}
                    </time>
                  </div>

                  {/* Status transition if present */}
                  {item.previous_status && item.new_status && (
                    <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold capitalize">
                        {item.previous_status}
                      </span>
                      <span className="text-slate-400 font-bold">→</span>
                      <span className="px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 font-semibold capitalize">
                        {item.new_status}
                      </span>
                    </div>
                  )}

                  {/* Notes & Reason */}
                  {item.notes && (
                    <p className="mt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      {item.notes}
                    </p>
                  )}

                  {/* Actor user */}
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-400">
                    <UserCheck className="w-3 h-3 text-slate-400" />
                    <span>Action by: <strong className="text-slate-600 font-semibold">{item.user_name || 'System Operator'}</strong></span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
