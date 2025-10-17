import { buildMenuItemFormData } from "@/components/add-item/formData";
import { CreateMenuItemForm } from "@/types/types";
import type { UpdateMenuItemForm } from "@/types/types";



const BASE = "https://api.yourapp.com"; // <- change once

export async function createMenuItem(body: CreateMenuItemForm) {
  const form = buildMenuItemFormData(body);
  const res = await fetch(`${BASE}/menu-items`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Create failed (${res.status}): ${text}`);
  }
  return res.json().catch(() => ({}));
}

// stub – replace with real fetchers
export async function fetchMenuItem(id: string) {
  // call your backend: GET /menu-items/:id
  // return object including groupTemplates array
  return {
    id,
    name: "Sample Bowl",
    description: "Yummy",
    basePrice: 95,
    originalPrice: 120,
    leftoverQty: 5,
    expiresAt: new Date().toISOString(),
    photoUrl: null,
    expirePhotoUrl: null,
    categoryId: "CAT001",
    groupTemplates: [], // or existing templates
  };
}

export async function updateMenuItem(payload: UpdateMenuItemForm) {
  // PUT /menu-items/:id with payload
  // return updated item
  return payload;
}