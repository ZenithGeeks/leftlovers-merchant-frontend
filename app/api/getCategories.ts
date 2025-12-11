// src/api/categories.ts
import { apiFetch } from "./users";

// Category type — Orm ใช้จากหน้า frontend
export type Category = {
  id: number | string;
  name: string;
};

// API path
const PATHS = {
  list: "/api/merchant/categories",
};

/** Fetch merchant categories (public) */
export async function getCategories() {
  return apiFetch<Category[]>(PATHS.list, {
    method: "GET",
  });
}
