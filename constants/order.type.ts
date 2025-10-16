export type ORDER_STATUS = 'upcoming' | 'ready' | 'history';

export interface OrderListItem {
  bookingId: string;
  userName: string;
  pickupTime: Date;
  status: ORDER_STATUS;
}
