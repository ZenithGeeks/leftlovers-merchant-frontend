const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL;

export type UploadableFile = {
  uri: string;
  name: string;
  type: string;
};

export type UploadedFileResponse = {
  url: string;
};

export function normalizeFile(input: any): UploadableFile {
  if (!input) {
    throw new Error("normalizeFile: input file is empty");
  }

  // 1. Expo ImagePicker asset
  if (input.assets?.[0]) {
    const a = input.assets[0];
    return {
      uri: a.uri,
      name: a.fileName ?? "file",
      type: a.mimeType ?? a.type ?? "application/octet-stream",
    };
  }

  // 2. Expo DocumentPicker
  if (input.uri && input.mimeType && input.name) {
    return {
      uri: input.uri,
      name: input.name,
      type: input.mimeType,
    };
  }

  // 3. Web file input (React web)
  if (typeof File !== "undefined" && input instanceof File) {
    return {
      uri: URL.createObjectURL(input),
      name: input.name,
      type: input.type,
    };
  }

  // 4. Generic RN file-like object
  return {
    uri: input.uri,
    name: input.name ?? "file",
    type: input.type ?? "application/octet-stream",
  };
}

/**
 * Upload any file-like object
 */
export async function uploadFile(
  file: any,
  folder: string = "misc"
): Promise<UploadedFileResponse> {
  const f = normalizeFile(file);

  const formData = new FormData();
  formData.append("file", {
    uri: f.uri,
    name: f.name,
    type: f.type,
  } as any);

  const res = await fetch(
    `${API_BASE_URL}/api/minio/upload?folder=${folder}`,
    {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }

  return res.json();
}
