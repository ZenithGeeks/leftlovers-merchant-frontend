export type ShopStatus = "closed" | "pause" | "busy" | "open";
export type Option = { label: string; value: string };
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
