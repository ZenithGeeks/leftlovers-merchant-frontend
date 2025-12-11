import { httpDelete, httpGet, httpPut, postJSON, putJSON } from "@/lib/api";
import { uploadFile } from "@/services/upload";
import { MenuItemAPI, MenuStatus, UpdateMenuItemForm } from "@/types/types";
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
    const uploaded = await uploadFile(
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
    const uploaded = await uploadFile(
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

type ImageLike =
  | string
  | {
      uri: string;
      name?: string;
      type?: string;
    }
  | null
  | undefined;

type UpdateMenuItemWithImages = UpdateMenuItemForm & {
  photoUrl?: ImageLike;
  expireLabelUrl?: ImageLike;
};

const isRemoteUrl = (value: string): boolean =>
  /^https?:\/\//.test(value);

const isImageObject = (
  value: ImageLike,
): value is { uri: string; name?: string; type?: string } =>
  typeof value === "object" &&
  value !== null &&
  "uri" in value &&
  typeof (value as { uri: string }).uri === "string";

const isLocalUri = (value: ImageLike): value is string =>
  typeof value === "string" &&
  !isRemoteUrl(value) &&
  (value.startsWith("file://") ||
    value.startsWith("content://") ||
    value.startsWith("/"));

export async function updateMenuItem(
  payload: UpdateMenuItemWithImages,
  merchantId: string
): Promise<MenuItemAPI> {
  let finalPhotoUrl: string | null = null;
  let finalExpireLabelUrl: string | null = null;
  if (isImageObject(payload.photoUrl)) {
    const uploaded = await uploadFile(
      {
        uri: payload.photoUrl.uri,
        name: payload.photoUrl.name ?? "photo.jpg",
        type: payload.photoUrl.type ?? "image/jpeg",
      },
      "menu-photos"
    );
    finalPhotoUrl = uploaded.url;
  } else if (isLocalUri(payload.photoUrl)) {
    const uploaded = await uploadFile(
      {
        uri: payload.photoUrl,
        name: "photo.jpg",
        type: "image/jpeg",
      },
      "menu-photos"
    );
    finalPhotoUrl = uploaded.url;
  } else if (typeof payload.photoUrl === "string" && isRemoteUrl(payload.photoUrl)) {
    finalPhotoUrl = payload.photoUrl;
  } else {
    finalPhotoUrl = null;
  }

  if (isImageObject(payload.expireLabelUrl)) {
    const uploaded = await uploadFile(
      {
        uri: payload.expireLabelUrl.uri,
        name: payload.expireLabelUrl.name ?? "expire-label.jpg",
        type: payload.expireLabelUrl.type ?? "image/jpeg",
      },
      "expired-photos"
    );
    finalExpireLabelUrl = uploaded.url;
  } else if (isLocalUri(payload.expireLabelUrl)) {
    const uploaded = await uploadFile(
      {
        uri: payload.expireLabelUrl,
        name: "expire-label.jpg",
        type: "image/jpeg",
      },
      "expired-photos"
    );
    finalExpireLabelUrl = uploaded.url;
  } else if (
    typeof payload.expireLabelUrl === "string" &&
    isRemoteUrl(payload.expireLabelUrl)
  ) {
    finalExpireLabelUrl = payload.expireLabelUrl;
  } else {
    finalExpireLabelUrl = null;
  }

  const body = {
    name: payload.name,
    description: payload.description ?? null,
    basePrice: payload.basePrice,
    originalPrice: payload.originalPrice,
    leftoverQty: payload.leftoverQty,
    expiresAt:
      payload.expiresAt instanceof Date
        ? payload.expiresAt.toISOString()
        : payload.expiresAt ?? null,
    photoUrl: finalPhotoUrl ?? "",
    expireLabelUrl: finalExpireLabelUrl ?? "",
    groupTemplateIds: payload.groupTemplateIds ?? [],
  };

  return putJSON<MenuItemAPI>(
    `/api/merchant/${merchantId}/menu/${payload.id}`,
    body
  );
}



export async function updateMenuStatus(
  merchantId: string,
  menuId: string,
  status: Extract<MenuStatus, "DRAFT" | "LIVE">
): Promise<MenuItemAPI> {
  return httpPut<MenuItemAPI>(`/api/merchant/${merchantId}/menu/${menuId}/status`, {
    status,
  });
}