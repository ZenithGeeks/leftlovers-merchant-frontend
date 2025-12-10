// services/finance.ts
import dayjs from "dayjs";
import type { DateKey, Payout, Summary, Transaction } from "@/types/finance";
import { httpGet } from "@/lib/api";

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
    status: "PAID" | "UNPAID" | "REFUNDED";
    amountTHB: number;
    paidAt: string; // ISO
    date: string; // YYYY-MM-DD
    time: string; // hh:mma
    id: string;
    title: string;
  }>;
};

type PayoutsRes = {
  payouts: Array<{
    id: string;
    detailDate: string; // YYYY-MM-DD
    processedAt?: string | null;
    amountTHB: number;
    feeTHB: number;
    status: "Transferred" | "Pending" | "Failed";
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

function normalizeTxn(x: TxnRes["transactions"][number]): Transaction {
  return {
    paymentId: x.paymentId,
    orderId: x.orderId,
    merchantId: x.merchantId,
    provider: x.provider,
    providerChargeId: x.providerChargeId ?? null,
    currency: x.currency,
    status: x.status, // keep server status as-is
    amountTHB: x.amountTHB,
    paidAt: x.paidAt,
    date: x.date,
    time: x.time,
    id: x.id,
    title: x.title,
  };
}

function normalizePayout(p: PayoutsRes["payouts"][number]): Payout {
  const processedAt =
    p.processedAt ??
    dayjs(p.detailDate)
      .hour(9)
      .minute(0)
      .second(0)
      .millisecond(0)
      .toISOString();

  return {
    id: p.id,
    detailDate: p.detailDate,
    processedAt,
    amountTHB: p.amountTHB,
    feeTHB: p.feeTHB,
    status: p.status,
    balanceTHB: p.balanceTHB,
    oweTHB: p.oweTHB,
  };
}

function normalizeSummary(s: SummaryRes["summary"]): Summary {
  return {
    netSales: s.netSales,
    deduction: s.deduction,
    netEarnings: s.netEarnings,
    earnings: s.earnings,
  };
}

/** --------------------------
 * Query-string helper
 * -------------------------- */

function qs(params: Record<string, string | number | undefined>) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && `${v}`.length > 0) {
      u.set(k, String(v));
    }
  }
  return u.toString();
}

/** --------------------------
 * Public API (using lib/api)
 * -------------------------- */

export async function fetchFinanceTransactions(
  merchantId: string,
  range: DateKey,
  // kept for backward compatibility, currently unused
  _signal?: AbortSignal
): Promise<Transaction[]> {
  const query = qs({ range });
  const path = `/api/merchant/${encodeURIComponent(
    merchantId
  )}/finance/transactions?${query}`;

  const data = await httpGet<TxnRes>(path);
  return (data.transactions ?? []).map(normalizeTxn);
}

export async function fetchFinancePayouts(
  merchantId: string,
  range: DateKey,
  _signal?: AbortSignal
): Promise<Payout[]> {
  const query = qs({ range });
  const path = `/api/merchant/${encodeURIComponent(
    merchantId
  )}/finance/payouts?${query}`;

  const data = await httpGet<PayoutsRes>(path);
  return (data.payouts ?? []).map(normalizePayout);
}

export async function fetchFinanceSummary(
  merchantId: string,
  range: DateKey,
  _signal?: AbortSignal
): Promise<Summary> {
  const query = qs({ range });
  const path = `/api/merchant/${encodeURIComponent(
    merchantId
  )}/finance/summary?${query}`;

  const data = await httpGet<SummaryRes>(path);
  return normalizeSummary(data.summary);
}
