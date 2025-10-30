import { httpDelete, httpGet, postJSON } from "@/lib/api";
import { MenuItemAPI } from "@/types/types";

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

// ➕ POST create new menu item
export async function createMenuItem(merchantId: string, data: Omit<MenuItemAPI, "id" | "createdAt">) {
  return postJSON<MenuItemAPI>(`/api/merchant/${merchantId}/menu`, data);
}

export async function DeleteMenuItem(merchantId: string, menuId: string) {
  const path = `/api/merchant/${merchantId}/menu/${menuId}`;
  return httpDelete<{ success: boolean; message?: string }>(path);
}

// 🧾 GET all option groups
export async function getOptionGroups(merchantId: string) {
  return httpGet<OptionGroup[]>(`/api/merchant/${merchantId}/group`);
}

