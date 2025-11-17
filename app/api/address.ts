// src/api/address.ts
import { apiFetch } from "./users";

const PATHS = {
  createAddress: "/api/address",
};

export type CreateAddressBody = {
  line1: string;
  city: string;
  district?: string | null;
  subdistrict?: string | null;
  postalCode?: string | null;
  location?: { lat: number; lng: number } | null;
  // add other fields as your backend expects
};

export async function createAddress(body: CreateAddressBody, opts?: { token?: string }) {
  return apiFetch<{ address?: { id: string } }>(PATHS.createAddress, {
    method: "POST",
    body: JSON.stringify(body),
    token: opts?.token,
  });
}
