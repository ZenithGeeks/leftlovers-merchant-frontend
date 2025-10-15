export type TabKey = 'Summary' | 'Transaction' | 'Payout';
export type DateKey = 'Today' | 'Yesterday' | 'This week' | 'This month';

export type Transaction = {
  date: string;
  title: string;
  id: string;
  amountTHB: number;
  time: string;
};

export type Payout = {
  balanceTHB: number;
  oweTHB: number;
  detailDate: string;
  processedAt: string;
  amountTHB: number;
  status: 'Transferred' | 'Pending' | 'Failed';
};
