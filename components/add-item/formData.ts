import { CreateMenuItemForm } from "@/types/types";

const mimeFromUri = (uri?: string | null) => {
  if (!uri) return "image/jpeg";
  const ext = uri.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return "application/octet-stream";
};

const nameFromUri = (uri?: string | null) => {
  if (!uri) return "upload.jpg";
  const parts = uri.split("?")[0].split("/");
  return parts[parts.length - 1] || "upload.jpg";
};

/** Build multipart/form-data compatible with Prisma Decimal fields (as strings). */
export function buildMenuItemFormData(f: CreateMenuItemForm) {
  const fd = new FormData();

  fd.append("merchantId", f.merchantId);
  if (f.categoryId) fd.append("categoryId", f.categoryId);
  fd.append("name", f.name.trim());

  if (f.description?.trim()) fd.append("description", f.description.trim());

  fd.append("basePrice", f.basePrice.toFixed(2));
  if (typeof f.originalPrice === "number") {
    fd.append("originalPrice", f.originalPrice.toFixed(2));
  }

  fd.append("leftoverQty", String(Math.max(0, f.leftoverQty)));

  if (f.expiresAt) fd.append("expiresAt", f.expiresAt.toISOString());
  fd.append("status", f.status ?? "DRAFT");

  if (f.photoUri) {
    // @ts-expect-error RN file tuple
    fd.append("photo", {
      uri: f.photoUri,
      name: nameFromUri(f.photoUri),
      type: mimeFromUri(f.photoUri),
    });
  }

  return fd;
}
