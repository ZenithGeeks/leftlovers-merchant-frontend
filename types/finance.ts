// types/finance.ts
export type DateKey =
  | 'Today'
  | 'Yesterday'
  | 'This week'
  | 'This month'
  | 'This year'
  | 'Last year'
  | 'All';

/**
 * The top tab keys in your Finance page
 */
export type TabKey = 'Summary' | 'Transaction' | 'Payout';

/**
 * A record of one successful payment (a "transaction").
 * This corresponds directly to your backend’s PaymentTxn object.
 */
export interface Transaction {
  paymentId: string;
  orderId: string;
  merchantId: string;
  provider: string;
  providerChargeId?: string | null;
  currency: string;
  status: 'PAID' | 'UNPAID' | 'REFUNDED';
  amountTHB: number;
  paidAt: string; // ISO string from backend
  date: string; // YYYY-MM-DD for pill filtering
  time: string; // hh:mma display
  id: string; // same as orderId (UI shorthand)
  title: string; // “Order #<id>”
}

/**
 * A payout record (aggregated per day, net after 15% fee).
 * Matches the backend’s Payout object from /finance/payouts.
 */
export type PayoutStatus = 'Transferred' | 'Pending' | 'Failed';

export interface Payout {
  id: string;
  detailDate: string; // transfer date (YYYY-MM-DD)
  processedAt: string; // ISO timestamp (backend may omit for Pending; normalized in frontend)
  amountTHB: number; // net (after fee)
  feeTHB: number; // deducted 15%
  status: PayoutStatus;
  balanceTHB: number;
  oweTHB: number;
}

/**
 * A summary of totals for the selected date range.
 * Used in SummaryTab.
 */
export interface Summary {
  netSales: number; // total before fee
  deduction: number; // total fee (15%)
  netEarnings: number; // net after fee
  earnings: number; // alias for display
}

/**
 * Utility type used in filters or components.
 * Example: filterByDateRange<T>(arr: T[], key: DateKey, getDate: (x:T)=>string)
 */
export type DateRangeFilter<T> = (arr: T[], key: DateKey, getDate: (x: T) => string) => T[];
