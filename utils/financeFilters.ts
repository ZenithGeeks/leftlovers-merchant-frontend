import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

import type { DateKey } from '@/types/finance';
dayjs.extend(isoWeek);

export function filterByDateRange<T>(
  data: T[],
  range: DateKey,
  getDate: (item: T) => string,
  now: Dayjs = dayjs()
): T[] {
  return data.filter((item) => {
    const d = dayjs(getDate(item));
    if (!d.isValid()) return false;

    switch (range) {
      case 'Today':
        return d.isSame(now, 'day');
      case 'Yesterday':
        return d.isSame(now.subtract(1, 'day'), 'day');
      case 'This week':
        return d.isSame(now, 'isoWeek');
      case 'This month':
        return d.isSame(now, 'month');
      case 'This year':
        return d.isSame(now, 'year');
      case 'Last year':
        return d.isSame(now.subtract(1, 'year'), 'year');
      default:
        return true;
    }
  });
}

// Computes a quick summary from transactions (for SummaryTab)
export function computeSummaryFromTransactions(
  transactions: { amountTHB: number }[],
  opts?: { feeRate?: number }
) {
  const feeRate = opts?.feeRate ?? 0.08;

  if (!transactions || transactions.length === 0) {
    return {
      netSales: 0,
      deduction: 0,
      netEarnings: 0,
      earnings: 0,
    };
  }

  const netSales = transactions.reduce((sum, t) => sum + t.amountTHB, 0);
  const deduction = netSales * feeRate;
  const netEarnings = netSales - deduction;
  const earnings = netEarnings; // simplified for mock data

  return { netSales, deduction, netEarnings, earnings };
}

