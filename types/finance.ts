// types/finance.ts
export type DateKey =
  | 'Today' | 'Yesterday' | 'This week' | 'This month' | 'This year' | 'Last year';

export type TabKey = 'Summary' | 'Transaction' | 'Payout';

export type Summary = {
  netSales: number;
  deduction: number;
  netEarnings: number;
  earnings: number;
};

export type PayoutStatus = 'Transferred' | 'Pending' | 'Failed';

export type Payout = {
  id: string;
  detailDate: string;      // yyyy-mm-dd (transfer date = paidAt + 1 day)
  processedAt?: string;     // ISO or pretty string for “processed”
  amountTHB: number;       // net after fee
  feeTHB: number;          // fee applied
  balanceTHB: number;      // optional running balance (can be 0 in UI)
  oweTHB: number;          // optional owe (can be 0 in UI)
  status: PayoutStatus;
};

// ⬇︎ Make Transaction include paidAt + paymentId (matches your mock JSON)
export type Transaction = {
  paymentId: string;
  orderId: string;
  merchantId: string;
  provider: string;
  providerChargeId?: string | null;
  currency: 'THB';
  status: 'PAID' | 'UNPAID' | 'REFUNDED';
  amountTHB: number;
  paidAt: string;   // ISO string, e.g., "2025-10-16T09:45:00+07:00"

  // UI helpers already in your mock
  date: string;     // "yyyy-mm-dd"
  time: string;     // "01:43PM"
  id: string;       // duplicate of orderId for list keys
  title: string;    // "Order #LL-150"
};

// The payouts util expects PaymentTxn — just alias it to Transaction
export type PaymentTxn = Transaction;
