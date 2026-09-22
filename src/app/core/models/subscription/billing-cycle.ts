import { BillingCycle } from './subscription.models';

export const BILLING_CYCLES: BillingCycle[] = ['Monthly', 'Quarterly', 'Yearly', 'None'];

/** Months per period for cycle-based subscriptions; None has no period. */
const MONTHS_PER_CYCLE: Record<Exclude<BillingCycle, 'None'>, number> = { Monthly: 1, Quarterly: 3, Yearly: 12 };

/** Same semantics as .NET DateTime.AddMonths: the day is clamped to the target month's length. */
export function addMonthsClamped(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return d;
}

/**
 * Mirrors SubscriptionDateCalculator.ResolveEndDate on the backend.
 * Returns an ISO date (yyyy-MM-dd) or '' when it cannot be computed.
 */
export function computeEndDate(startDate: string, cycle: BillingCycle, cycleCount: number | null | undefined): string {
  if (cycle === 'None' || !startDate) return '';
  const start = new Date(startDate + 'T00:00:00');
  if (Number.isNaN(start.getTime())) return '';
  const count = Math.max(1, Math.floor(cycleCount || 1));
  const end = addMonthsClamped(start, MONTHS_PER_CYCLE[cycle] * count);
  const y = end.getFullYear(), m = String(end.getMonth() + 1).padStart(2, '0'), d = String(end.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
