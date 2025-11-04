// utils/payouts.ts
import dayjs from 'dayjs';
import type { PaymentTxn, Payout } from '@/types/finance';

/**
 * Group an array by a string key function (tiny lodash-free helper).
 */
function groupBy<T>(arr: T[], keyFn: (x: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = keyFn(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {});
}

/**
 * Sum by numeric selector (tiny lodash-free helper).
 */
function sumBy<T>(arr: T[], sel: (x: T) => number): number {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += sel(arr[i]);
  return s;
}

/**
 * Build **one payout per paid day**, transferring **the next day**,
 * with net = gross - fee, where fee = gross * feeRate.
 *
 * - detailDate = transfer date (YYYY-MM-DD)
 * - processedAt = ISO string only if already transferred (today > transfer day)
 * - status = 'Transferred' if already transferred; otherwise 'Pending'
 * - balanceTHB / oweTHB = 0 (placeholders for future logic)
 */
export function buildDailyPayoutsFromPayments(
  txns: PaymentTxn[],
  feeRate = 0.15
): Payout[] {
  if (!Array.isArray(txns) || txns.length === 0) return [];

  // Group by the original PAID date (YYYY-MM-DD)
  const byPaidDate = groupBy(txns, (t) => dayjs(t.paidAt).format('YYYY-MM-DD'));

  const payouts: Payout[] = Object.entries(byPaidDate).map(([paidDate, list]) => {
    const gross = sumBy(list, (t) => t.amountTHB);
    const feeTHB = +(gross * feeRate).toFixed(2);
    const net = +(gross - feeTHB).toFixed(2);

    // Transfer is next calendar day
    const transferDate = dayjs(paidDate).add(1, 'day');

    // Consider 'Transferred' only when **today is after** the transfer day
    const isTransferred = dayjs().isAfter(transferDate, 'day');

    const payout: Payout = {
      id: `payout-${paidDate}`,                 // stable id for the group
      detailDate: transferDate.format('YYYY-MM-DD'), // transfer (detail) date
      processedAt: isTransferred ? transferDate.toISOString() : undefined,
      amountTHB: net,
      feeTHB,
      status: isTransferred ? 'Transferred' : 'Pending',
      balanceTHB: 0,
      oweTHB: 0,
    };
    return payout;
  });

  // Optional: sort newest transfer first
  payouts.sort((a, b) => (a.detailDate < b.detailDate ? 1 : -1));

  return payouts;
}
