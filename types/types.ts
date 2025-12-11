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
  priceDelta: number;
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
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  options: OptionTemplateInput[];
};

export type CreateMenuItemForm = {
  merchantId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  basePrice: number;
  originalPrice: number | null;
  leftoverQty: number;
  expiresAt: Date | null;
  status: MenuStatus;
  photoUri: string | null;
  expireLabelUrl: string | null;
  groupTemplates: GroupTemplate[];
};

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
  id: string;
  customerName: string;
  message: string;
  tags: WarningTag[];
  createdAt: string;
  expiresAt?: string | null;
};

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";
export type OrderPreference = "CONTACT" | "REMOVE" | "CANCELLED";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";
export type Role = "ADMIN" | "MERCHANT" | "CUSTOMER" | "STAFF";

export interface OrderCustomer {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status: UserStatus;
  createdAt: string;
  dob?: string | null;
}

export interface Option {
  id: string;
  optionGroupId: string;
  name: string;
  priceDelta: string;
  active: boolean;
}

export interface OrderItemOption {
  id: string;
  orderItemId: string;
  optionId: string;
  priceDelta: string;
  option?: Option | null;
}

export type OrderMenuItem = {
  id: string;
  merchantId: string;
  name: string;
  description?: string | null;
  basePrice: string;
  originalPrice?: string | null;
  leftoverQty: number;
  expiresAt: string;
  status: MenuStatus;
  createdAt: string;
  photoUrl?: string | null;
  expireLabelUrl: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  options: OrderItemOption[];
  menu?: OrderMenuItem;
};

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "READY"
  | "PICKED_UP"
  | "CANCELLED";

export interface Order {
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

export type ApiOrderListResponse = Order[];

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

export type OpenStatus = "CLOSED" | "PAUSE" | "BUSY" | "OPEN";
export type MerchantStatus = "PENDING" | "APPROVED" | "SUSPENDED";

export interface MerchantOwner {
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

export interface MerchantStatusAPI {
  openStatus: OpenStatus
}

export type OpenHoursSlot = {
  open: string;  // "17:00"
  close: string; // "23:30" or "00:30"
};

export type OpenHoursWeekly = Partial<
  Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", OpenHoursSlot[]>
>;

export type OpenHoursException = {
  date?: string; // ISO date if you later add it
  slots?: OpenHoursSlot[];
  closed?: boolean;
  note?: string | null;
};

export interface MerchantOpenHours {
  weekly: OpenHoursWeekly;
  timezone: string; // e.g. "Asia/Bangkok"
  exceptions: OpenHoursException[];
}

export interface ReviewLite {
  id: string;
  orderId: string;
  customerId: string;
  rating: number;
  comment?: string | null;
  tags?: string | null;
  createdAt: string; // ISO
}

// Orders embedded inside GET /:merchantId response
export interface MerchantOrderLite {
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
  createdAt: string; // ISO
  preference: OrderPreference;
  note?: string | null;
  review?: ReviewLite | null;
  items?: OrderItem[] | null;
}

export interface Merchant {
  id: string;
  ownerUserId: string;
  displayName: string;
  branchName?: string | null;
  description?: string | null;

  categoryId: string;
  addressId: string;

  openHours?: MerchantOpenHours | null;
  openStatus: OpenStatus;

  status: MerchantStatus;
  createdAt: string; // ISO

  listImageUrl?: string | null;
  StoreImageUrl?: string | null;

  owner?: MerchantOwner | null;
  orders?: MerchantOrderLite[] | null;
}

export interface CreateMerchantBody  {
  ownerUserId: string;              // required by backend
  displayName: string;         // required
  branchName?: string | null;
  description?: string | null;
  categoryId: string;          // required

  address: {
    label?: string | null;
    line1: string;
    line2?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    lat?: number | null;
    lng?: number | null;
  };
  openHours?: any;

  listImageUrl?: string | null;
  storeImageUrl?: string | null;

  files?: {
    kind: "COMMERCIAL_REG" | "OWNER_ID" | "STORE_IMAGE" | "OTHER";
    url: string;
    label?: string | null;
  }[];
};

export type PopularMenuRow = {
  id: string;
  imageUrl: string;
  title: string;
  price: number;
  orders: number;
  leftOverQty: number;
};