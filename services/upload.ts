const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export type UploadableFile = {
  uri: string;      // from ImagePicker
  name: string;     // e.g. "photo.jpg"
  type: string;     // e.g. "image/jpeg"
};

export type UploadedFileResponse = {
  url: string;
};

/**
 * Upload a file to MinIO (Elysia backend)
 */
export async function uploadImageFile(
  file: UploadableFile,
  folder: string = "misc"
): Promise<UploadedFileResponse> {
  const formData = new FormData();

  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.type,
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
