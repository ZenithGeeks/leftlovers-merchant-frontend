export type ORDER_STATUS = 'upcoming' | 'ready' | 'history';

interface Option {
  label: string;
  value: string;
};

export interface OrderItem {
  name: string;
  options?: Option[];
  note?: string;
  quantity: number;
};

export interface OrderListItem {
  bookingId: string;
  userName: string;
  pickupTime: Date;
  telephone: string;
  status: ORDER_STATUS;
  orderItems: OrderItem[];
}
