import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";

type Props = {
  label?: string;
  value?: string | null;          // uri
  onChange: (uri: string | null) => void;
};

export default function ImagePickerField({
  label = "Upload PNG/JPEG",
  value,
  onChange,
}: Props) {
  const [busy, setBusy] = useState(false);

  const ensurePermission = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow Photos permission to pick an image.");
      return false;
    }
    return true;
  }, []);

  const pick = useCallback(async () => {
    if (!(await ensurePermission())) return;
    try {
      setBusy(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
        quality: 0.9,
      });
      if (!result.canceled) {
        onChange(result.assets[0]?.uri ?? null);
      }
    } catch (e) {
      console.warn("pick error", e);
    } finally {
      setBusy(false);
    }
  }, [ensurePermission, onChange]);

  const clear = () => onChange(null);

  return (
    <View className="w-full">
      <Text className="mb-2 text-[16px] font-semibold text-[#11181C]">{label} <Text className="text-red-500">*</Text></Text>

      {value ? (
        <View className="rounded-2xl border border-dashed border-gray-400 p-3">
          <Image
            source={{ uri: value }}
            className="h-40 w-full rounded-xl bg-gray-100"
            resizeMode="cover"
          />
          <View className="mt-3 flex-row gap-3">
            <Pressable
              onPress={pick}
              className="rounded-xl bg-gray-100 px-3 py-2 active:opacity-80"
            >
              <Text className="text-[#11181C]">Replace</Text>
            </Pressable>
            <Pressable
              onPress={clear}
              className="rounded-xl bg-red-50 px-3 py-2 active:opacity-80"
            >
              <Text className="text-red-600">Remove</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          disabled={busy}
          onPress={pick}
          className="h-36 items-center justify-center rounded-2xl border border-dashed border-gray-400 bg-white active:opacity-90"
        >
          <Text className="text-[16px] text-[#11181C]">{busy ? "Opening…" : "Upload PNG/JPEG"}</Text>
        </Pressable>
      )}
    </View>
  );
}
