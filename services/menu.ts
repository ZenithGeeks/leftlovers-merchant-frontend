import { httpDelete, httpGet, postJSON, putJSON } from "@/lib/api";
import { uploadImageFile } from "@/services/upload";
import { MenuItemAPI, UpdateMenuItemForm } from "@/types/types";
export interface Option {
  id: string;
  optionGroupId: string;
  name: string;
  priceDelta: number;
  active: boolean;
  sortOrder: number;
}

export interface OptionGroup {
  id: string;
  name: string;
  menuItemId?: string;
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
  options: Option[];
}

// 🧾 GET all menu items
export async function getMenuItems(merchantId: string) {
  return httpGet<MenuItemAPI[]>(`/api/merchant/${merchantId}/menu`);
}

export async function createMenuItem(
  merchantId: string,
  data: Omit<MenuItemAPI, "id" | "createdAt">
) {
  let finalData = { ...data };
  const maybeLocalPhoto = data.photoUrl as any;
  const maybeLocalPhoto_Expired = data.expireLabelUrl as any;
  if (maybeLocalPhoto && typeof maybeLocalPhoto === "object") {
    const uploaded = await uploadImageFile(
      {
        uri: maybeLocalPhoto.uri,
        name: maybeLocalPhoto.name ?? "photo.jpg",
        type: maybeLocalPhoto.type ?? "image/jpeg",
      },
      "menu-photos"
    );

    finalData.photoUrl = uploaded.url;
  }

   if (maybeLocalPhoto_Expired && typeof maybeLocalPhoto_Expired === "object") {
    const uploaded = await uploadImageFile(
      {
        uri: maybeLocalPhoto_Expired.uri,
        name: maybeLocalPhoto_Expired.name ?? "photo.jpg",
        type: maybeLocalPhoto_Expired.type ?? "image/jpeg",
      },
      "expired-photos"
    );

    finalData.expireLabelUrl = uploaded.url;
  }

  return postJSON<MenuItemAPI>(
    `/api/merchant/${merchantId}/menu`,
    finalData
  );
} 

export async function DeleteMenuItem(merchantId: string, menuId: string) {
  const path = `/api/merchant/${merchantId}/menu/${menuId}`;
  return httpDelete<{ success: boolean; message?: string }>(path);
}

// 🧾 GET all option groups
export async function getOptionGroups(merchantId: string) {
  return httpGet<OptionGroup[]>(`/api/merchant/${merchantId}/group`);
}

// GET /api/menu/:id
export async function fetchMenuItem(merchantId:string, id: string): Promise<MenuItemAPI> {
  return httpGet<MenuItemAPI>(`/api/merchant/${merchantId}/menu/${id}`)
}

// PUT /api/menu/:id
export async function updateMenuItem(payload: UpdateMenuItemForm, merchantId:string): Promise<MenuItemAPI> {
  const body = {
    name: payload.name,
    description: payload.description,
    basePrice: payload.basePrice,
    originalPrice: payload.originalPrice,
    leftoverQty: payload.leftoverQty,
    expiresAt: payload.expiresAt ? payload.expiresAt.toString() : null,
    photoUrl: payload.photoUrl ?? "",
    expirePhotoUrl: payload.expirePhotoUri ?? "",
    groupTemplates: payload.groupTemplateIds ?? []
  }
  return putJSON<MenuItemAPI>(`/api/merchant/${merchantId}/menu/${payload.id}`, body)
}
