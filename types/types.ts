export type ShopStatus = "closed" | "pause" | "busy" | "open";
export type Option = { label: string; value: string };

export interface MenuItemAPI {
  id: string;
  merchantId: string;
  name: string;
  description?: string | null;
  basePrice: number;
  originalPrice?: number | null;
  leftoverQty: number;
  expiresAt?: string | null;
  status: "DRAFT" | "LIVE" | "SOLD_OUT" | "EXPIRED";
  createdAt: string;
  photoUrl?: string | null;
  expireLabelUrl?: string | null;
}

// Reusable templates (selectable in the Add Item screen)
export type OptionTemplateInput = {
  name: string;
  priceDelta: number;   // number; server will serialize to Decimal
  sortOrder?: number;
  active?: boolean;
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
  expirePhotoUri: string | null;   // local file uri (expiry label)
  groupTemplates: GroupTemplate[];
};



export type UpdateMenuItemForm = {
  expirePhotoUri?: string | null
  photoUri?: string | null
  id: string
  name: string
  description: string | null
  basePrice: number
  originalPrice: number | null
  leftoverQty: number
  expiresAt: Date | null;  
  photoUrl?: string | null
  expireLabelUrl?: string | null
  groupTemplateIds?: string[]
}

export type WarningTag = string;

export type WarningCardDTO = {
  id: string;                 // warning id
  customerName: string;       // from Complaint.customer.name
  message: string;            // from Complaint.description
  tags: WarningTag[];         // derive from Complaint.type or moderation tags
  createdAt: string;          // warning.issuedAt
  expiresAt?: string | null;  // warning.expiresAt
};

export type MerchantStatus = "PENDING" | "APPROVED" | "SUSPENDED";

// If you later know the exact JSON shape, you can replace this
export type MerchantOpenHours = unknown;

export interface MerchantOwner {
  id: string;
  role: "ADMIN" | "MERCHANT" | "CUSTOMER" | "STAFF"; // inferred from your enums
  name: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";        // from UserStatus enum
  createdAt: string;
  dob: string | null;
}

export interface MerchantAPI {
  id: string;
  ownerUserId: string;
  displayName: string;
  branchName: string | null;
  description: string | null;
  categoryId: string;
  addressId: string;

  openHours: unknown | null;

  status: MerchantStatus;
  createdAt: string;

  listImageUrl: string | null;

  // backend sends "StoreImageUrl" with capital S → do NOT change
  StoreImageUrl: string | null;

  // relation
  owner: MerchantOwner;
}
