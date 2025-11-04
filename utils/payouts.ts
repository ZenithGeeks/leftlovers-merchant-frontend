// utils/payouts.ts
import dayjs from 'dayjs';
import type { PaymentTxn, Payout } from '@/types/finance'; // <-- use the shared types

/**
 * Build payouts from paid transactions.
 * - transfer date = paidAt + 1 day
 * - net = amountTHB * (1 - feeRate)
 * - today’s transfers are still "Pending"
 */
export function buildPayoutsFromPayments(
  txns: PaymentTxn[],
  feeRate = 0.15
): Payout[] {
  const now = dayjs();

  return txns.map((t, idx) => {
    const gross = t.amountTHB;
    const feeTHB = +(gross * feeRate).toFixed(2);
    const net = +(gross - feeTHB).toFixed(2);

    const transferAt = dayjs(t.paidAt).add(1, 'day');

    const payout: Payout = {
      id: t.paymentId || t.orderId || String(idx),
      detailDate: transferAt.format('YYYY-MM-DD'),
      processedAt: transferAt.toISOString(),
      amountTHB: net,
      feeTHB,
      // Fill required fields so the shape matches your types/finance.Payout
      balanceTHB: 0,
      oweTHB: 0,
      status: transferAt.isAfter(now) ? 'Pending' : 'Transferred',
    };

    return payout;
  });
}
