export type OrderStatusGroup = "upcoming" | "ready" | "history";

export type OrderItem = {
  quantity: number;
  name: string;
  size?: string;
  withSoup?: boolean;
  additional?: string;
  optionsLabel?: string;
};

export type Order = {
  id: string;
  orderCode: string;
  statusGroup: OrderStatusGroup;
  customerName: string;
  telephone?: string;
  pickupTime: Date;
  rawStatus: string;
  orderItems: OrderItem[];
};
