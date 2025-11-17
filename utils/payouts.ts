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

// Guard: only consider transactions with valid paidAt
  const valid = txns.filter((t) => {
    const d = dayjs(t.paidAt);
    return d.isValid();
  });
  if (valid.length === 0) return [];

  const round2 = (n: number) => Math.round(n * 100) / 100;


  const byPaidDate = groupBy(valid, (t) => dayjs(t.paidAt).format('YYYY-MM-DD'));

  const payouts: Payout[] = Object.entries(byPaidDate).map(([paidDate, list]) => {
    const gross = list.reduce((s, t) => s + t.amountTHB, 0);
    const feeTHB = round2(gross * feeRate);
    const net = round2(gross - feeTHB);

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
