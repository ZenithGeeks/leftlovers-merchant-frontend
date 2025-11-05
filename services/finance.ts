// services/finance.ts
import dayjs from 'dayjs';
import { API_BASE } from '@/utils/env';
import type { DateKey, Payout, Summary, Transaction } from '@/types/finance';

/** --------------------------
 * Response shapes from backend
 * -------------------------- */
type TxnRes = {
  transactions: Array<{
    paymentId: string;
    orderId: string;
    merchantId: string;
    provider: string;
    providerChargeId?: string | null;
    currency: string;
    status: 'PAID' | 'UNPAID' | 'REFUNDED';
    amountTHB: number;
    paidAt: string; // ISO
    date: string;   // YYYY-MM-DD
    time: string;   // hh:mma
    id: string;
    title: string;
  }>;
};

type PayoutsRes = {
  payouts: Array<{
    id: string;
    detailDate: string;       // YYYY-MM-DD (transfer date)
    processedAt?: string;     // ISO (optional on Pending in your backend)
    amountTHB: number;
    feeTHB: number;
    status: 'Transferred' | 'Pending' | 'Failed';
    balanceTHB: number;
    oweTHB: number;
  }>;
};

type SummaryRes = {
  summary: {
    netSales: number;
    deduction: number;
    netEarnings: number;
    earnings: number;
  };
};

/** --------------------------
 * Normalizers to your UI types
 * -------------------------- */

// Your UI `Transaction` is effectively the same as backend’s object
function normalizeTxn(x: TxnRes['transactions'][number]): Transaction {
  return {
    paymentId: x.paymentId,
    orderId: x.orderId,
    merchantId: x.merchantId,
    provider: x.provider,
    providerChargeId: x.providerChargeId ?? null,
    currency: x.currency,
    status: x.status as 'PAID', // server only returns PAID for finance anyway
    amountTHB: x.amountTHB,
    paidAt: x.paidAt,
    date: x.date,
    time: x.time,
    id: x.id,
    title: x.title,
  };
}

/**
 * Your UI `Payout` type usually has `processedAt: string` required.
 * Backend may omit it when status = Pending. To keep TS happy and your UI simple,
 * we DEFAULT it to the transfer day at 09:00 if missing.
 */
function normalizePayout(p: PayoutsRes['payouts'][number]): Payout {
  const processedAt =
    p.processedAt ??
    dayjs(p.detailDate).hour(9).minute(0).second(0).millisecond(0).toISOString();

  return {
    id: p.id,
    detailDate: p.detailDate,
    processedAt,              // guaranteed
    amountTHB: p.amountTHB,
    feeTHB: p.feeTHB,
    status: p.status,
    balanceTHB: p.balanceTHB,
    oweTHB: p.oweTHB,
  };
}

function normalizeSummary(s: SummaryRes['summary']): Summary {
  return {
    netSales: s.netSales,
    deduction: s.deduction,
    netEarnings: s.netEarnings,
    earnings: s.earnings,
  };
}

/** --------------------------
 * Fetch helpers
 * -------------------------- */

function qs(params: Record<string, string | number | undefined>) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && `${v}`.length > 0) u.set(k, String(v));
  }
  return u.toString();
}

async function getJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { method: 'GET', signal });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`GET ${url} failed (${res.status}): ${txt}`);
  }
  return res.json() as Promise<T>;
}

/** --------------------------
 * Public API
 * -------------------------- */

export async function fetchFinanceTransactions(
  merchantId: string,
  range: DateKey,
  signal?: AbortSignal
): Promise<Transaction[]> {
  const url = `${API_BASE}/merchant/${encodeURIComponent(merchantId)}/finance/transactions?${qs(
    { range }
  )}`;
  const data = await getJSON<TxnRes>(url, signal);
  return (data.transactions ?? []).map(normalizeTxn);
}

export async function fetchFinancePayouts(
  merchantId: string,
  range: DateKey,
  signal?: AbortSignal
): Promise<Payout[]> {
  const url = `${API_BASE}/merchant/${encodeURIComponent(merchantId)}/finance/payouts?${qs({
    range,
  })}`;
  const data = await getJSON<PayoutsRes>(url, signal);
  return (data.payouts ?? []).map(normalizePayout);
}

export async function fetchFinanceSummary(
  merchantId: string,
  range: DateKey,
  signal?: AbortSignal
): Promise<Summary> {
  const url = `${API_BASE}/merchant/${encodeURIComponent(merchantId)}/finance/summary?${qs({
    range,
  })}`;
  const data = await getJSON<SummaryRes>(url, signal);
  return normalizeSummary(data.summary);
}
