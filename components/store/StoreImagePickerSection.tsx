import React, { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import ImagePickerField from "@/components/ImagePickerField";

const RAW_API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  "https://backend-leftlovers-production.up.railway.app";

const API_BASE_URL = RAW_API_URL.replace(/\/+$/, "");

async function uploadToMinio(uri: string, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", {
    uri,
    name: "store-image.jpg",
    type: "image/jpeg",
  } as any);

  const res = await fetch(
    `${API_BASE_URL}/api/minio/upload?folder=${encodeURIComponent(folder)}`,
    {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Upload failed: ${res.status} ${txt}`);
  }

  const json = (await res.json()) as { url: string };
  return json.url;
}

export type StoreImagePickerSectionProps = {
  title: string;
  description: string;
  value: string | null;
  onChange: (url: string | null) => void;

  /** optional: which folder to upload into on MinIO */
  folder?: string;

  /** optional: notify parent when upload starts/ends */
  onUploadingChange?: (uploading: boolean) => void;
};

export default function StoreImagePickerSection({
  title,
  description,
  value,
  onChange,
  folder = "store-images",
  onUploadingChange,
}: StoreImagePickerSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUploadingState = (v: boolean) => {
    setUploading(v);
    if (onUploadingChange) onUploadingChange(v);
  };

  const handleChange = async (val: any) => {
    setError(null);

    // Clear
    if (!val) {
      onChange(null);
      return;
    }

    // Already a URL string
    if (typeof val === "string") {
      onChange(val);
      return;
    }

    // Object from image picker (e.g. { uri })
    const uri: string | undefined =
      typeof val === "object" && val !== null ? val.uri : undefined;

    if (!uri) {
      onChange(null);
      return;
    }

    // If it's already a remote URL (not local file)
    if (!uri.startsWith("file://")) {
      onChange(uri);
      return;
    }

    // Local file → upload immediately
    try {
      setUploadingState(true);
      const url = await uploadToMinio(uri, folder);
      onChange(url);
    } catch (e: any) {
      console.error("Image upload failed:", e);
      setError(e?.message ?? "Upload failed. Please try again.");
    } finally {
      setUploadingState(false);
    }
  };

  return (
    <View className="mt-8">
      <Text className="text-[18px] font-bold text-[#11181C] mb-2">
        {title}
      </Text>
      <Text className="text-[14px] text-[#6B7280] mb-3">
        {description}
      </Text>

      <ImagePickerField value={value ?? undefined} onChange={handleChange} />

      {uploading && (
        <View className="mt-2 flex-row items-center">
          <ActivityIndicator size="small" />
          <Text className="ml-2 text-[13px] text-gray-500">
            Uploading image…
          </Text>
        </View>
      )}

      {!!error && (
        <Text className="mt-2 text-[13px] text-red-500">
          {error}
        </Text>
      )}
    </View>
  );
}
