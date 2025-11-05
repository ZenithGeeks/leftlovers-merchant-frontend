// utils/payouts.ts
import dayjs from 'dayjs';
import type { Transaction, Payout } from '@/types/finance';

/** tiny lodash-free helpers */
function groupBy<T>(arr: T[], keyFn: (x: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = keyFn(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {});
}
function sumBy<T>(arr: T[], sel: (x: T) => number): number {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += sel(arr[i]);
  return s;
}

export function buildDailyPayoutsFromPayments(
  txns: Transaction[],
  feeRate = 0.15
): Payout[] {
  if (!Array.isArray(txns) || txns.length === 0) return [];

  const byPaidDate = groupBy(txns, (t) => dayjs(t.paidAt).format('YYYY-MM-DD'));

  const payouts: Payout[] = Object.entries(byPaidDate).map(([paidDate, list]) => {
    const gross = sumBy(list, (t) => t.amountTHB);
    const feeTHB = +(gross * feeRate).toFixed(2);
    const net = +(gross - feeTHB).toFixed(2);

    const transferDate = dayjs(paidDate).add(1, 'day');
    const isTransferred = dayjs().isAfter(transferDate, 'day');

    const payout: Payout = {
      id: `payout-${paidDate}`,
      detailDate: transferDate.format('YYYY-MM-DD'),
      processedAt: transferDate.toISOString(), // required string
      amountTHB: net,
      feeTHB,
      status: isTransferred ? 'Transferred' : 'Pending',
      balanceTHB: 0,
      oweTHB: 0,
    };
    return payout;
  });


  payouts.sort((a, b) => (a.detailDate < b.detailDate ? 1 : -1));
  return payouts;
}
