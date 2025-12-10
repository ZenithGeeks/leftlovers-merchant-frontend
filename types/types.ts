import { JSX } from "react";

export type ShopStatus = "closed" | "pause" | "busy" | "open";
export type MenuStatus = "DRAFT" | "LIVE" | "SOLD_OUT" | "EXPIRED";

export type MenuItemAPI = {
  groupTemplateIds: any;
  id: string;
  merchantId: string;
  name: string;
  description: string;
  basePrice: number;
  originalPrice: number;
  leftoverQty: number;
  expiresAt: string;
  status: MenuStatus;
  photoUrl: string;
  expireLabelUrl: string;
  createdAt: string;

  optionGroups: OptionGroupAPI[];
};

export type UpdateMenuItemForm = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  originalPrice: number | null;
  leftoverQty: number;
  expiresAt: Date | null;
  photoUrl: string | null;
  expireLabelUrl: string | null;
  groupTemplateIds: string[];
};

export type OptionTemplateInput = {
  name: string;
  priceDelta: number;   // number; server will serialize to Decimal
  sortOrder?: number;
  active?: boolean;
};


export type OptionGroupOptionAPI = {
  id: string;
  optionGroupId?: string;
  name: string;
  priceDelta: number;
  active: boolean;
};

export type OptionGroupAPI = {
  id: string;
  name: string;
  merchantId: string;
  minSelect: number;
  maxSelect: number;
  options: OptionGroupOptionAPI[];
};

export type GroupTemplate = {
  id: string;           // template id (from OptionGroupTemplate)
  name: string;
  minSelect: number;
  maxSelect: number;
  options: OptionTemplateInput[];
};

// Create MenuItem form (what the client assembles before sending)
export type CreateMenuItemForm = {
  merchantId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  basePrice: number;           // number; send as string in FormData if needed
  originalPrice: number | null;
  leftoverQty: number;
  expiresAt: Date | null;
  status: "DRAFT" | "LIVE" | "SOLD_OUT" | "EXPIRED";
  photoUri: string | null;         // local file uri
  expireLabelUrl: string | null;   // local file uri (expiry label)
  groupTemplates: GroupTemplate[];
};

export type MenuItemStatus = "DRAFT" | "LIVE" | "SOLD_OUT" | "EXPIRED";

export type GroupTemplateOptionBody = {
  name: string;
  priceDelta: number;
  active: boolean;
  sortOrder?: number;
};

export type GroupTemplateBody = {
  name: string;
  merchantId: string;
  minSelect: number;
  maxSelect: number;
  options: GroupTemplateOptionBody[];
};

export type WarningTag = string;

export type WarningCardDTO = {
  id: string;                 // warning id
  customerName: string;       // from Complaint.customer.name
  message: string;            // from Complaint.description
  tags: WarningTag[];         // derive from Complaint.type or moderation tags
  createdAt: string;          // warning.issuedAt
  expiresAt?: string | null;  // warning.expiresAt
};

// Order
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export type OrderPreference = "CONTACT" | "REMOVE" | "CANCELLED";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export type Role = "ADMIN" | "MERCHANT" | "CUSTOMER" | "STAFF";

// ---------- API User (embedded in order.customer) ----------
export interface OrderCustomer {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status: UserStatus;
  createdAt: string; // ISO
  dob?: string | null; // ISO
}

export interface Option {
  id: string;
  optionGroupId: string;
  name: string;
  priceDelta: string; // Decimal string
  active: boolean;
}
// ---------- API Order Item Option ----------
export interface OrderItemOption {
  id: string;
  orderItemId: string;
  optionId: string;
  priceDelta: string; // Decimal string
  option?: Option | null;
}

// ---------- API Order Item ----------
export type OrderItem = {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  options: OrderItemOption[];
  menu?: OrderMenuItem;
};

export type OrderMenuItem = {
  id: string;
  merchantId: string;
  name: string;
  description?: string | null;
  basePrice: string; // API returns string
  originalPrice?: string | null;
  leftoverQty: number;
  expiresAt: string; // ISO
  status: MenuItemStatus;
  createdAt: string; // ISO
  photoUrl?: string | null;
  expireLabelUrl: string; // your sample shows ""
};

// ---------- API Order ----------
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "READY"
  | "PICKED_UP"
  | "CANCELLED";

// ---------- API User 
export interface Order {
  map(arg0: (orderItem: any, index: any) => JSX.Element): import("react").ReactNode;
  id: string;
  customerId: string;
  merchantId: string;
  status: OrderStatus;
  subtotal: string;
  discountTotal: string;
  totalAmount: string;
  paymentStatus: PaymentStatus;
  pickupCode?: string | null;
  pickupDeadline?: string | null;
  cutlery: boolean;
  createdAt: string;
  preference: OrderPreference;
  note?: string | null;
  items?: OrderItem[] | null;
  customer?: OrderCustomer | null;
}

// ---------- List Response ----------
export type ApiOrderListResponse = Order[];

// ---------- Optional UI-friendly parsed types ----------
export interface ParsedOrderMoney {
  subtotal: number;
  discountTotal: number;
  totalAmount: number;
}

export function parseOrderMoney(order: Order): ParsedOrderMoney {
  return {
    subtotal: Number(order.subtotal ?? 0),
    discountTotal: Number(order.discountTotal ?? 0),
    totalAmount: Number(order.totalAmount ?? 0),
  };
}

export function parseOrderDates(order: Order) {
  return {
    createdAt: new Date(order.createdAt),
    pickupDeadline: order.pickupDeadline ? new Date(order.pickupDeadline) : null,
  };
}