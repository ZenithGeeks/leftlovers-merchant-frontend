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
  // multi-group selection from templates (client chooses which templates to apply)
  groupTemplates: GroupTemplate[];
};



export type UpdateMenuItemForm = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  originalPrice: number | null;
  leftoverQty: number;
  expiresAt: Date | null;
  photoUri: string | null;
  expirePhotoUri: string | null;
  categoryId: string | null;
  groupTemplates: GroupTemplate[];
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