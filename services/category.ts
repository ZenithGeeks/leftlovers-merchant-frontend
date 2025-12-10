// services/category.ts
export type Category = {
  id: string;
  name: string;
};

const BASE =
  process.env.EXPO_PUBLIC_API_BASE ??
  "https://backend-leftlovers-production.up.railway.app/api";

/**
 * Load all categories (for cuisine dropdown)
 * Uses your existing backend route:
 *   GET /api/merchant/categories
 */
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE}/merchant/categories`);

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Fetch categories failed (${res.status}): ${msg}`);
  }

  return res.json();
}
