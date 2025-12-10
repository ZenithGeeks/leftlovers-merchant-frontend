// services/category.ts
import { httpGet } from "@/lib/api";

export type Category = {
  id: string;
  name: string;
};

/**
 * Load all categories (for cuisine dropdown)
 * Uses backend route:
 *   GET /api/merchant/categories
 */
export async function fetchCategories(): Promise<Category[]> {
  return httpGet<Category[]>("/api/merchant/categories");
}
