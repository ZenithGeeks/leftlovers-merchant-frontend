// components/store/LogoutConfirmModal.tsx
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

type LogoutConfirmModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export default function LogoutConfirmModal({
  visible,
  onCancel,
  onConfirm,
  loading = false,
}: LogoutConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/40 items-center justify-center px-8">
        <View className="w-full rounded-2xl bg-white p-5">
          <Text className="text-lg font-semibold text-[#11181C]">
            Log out?
          </Text>
          <Text className="mt-2 text-[14px] text-gray-600">
            You will be logged out of this account on this device.
          </Text>

          <View className="mt-5 flex-row justify-end gap-3">
            <Pressable
              disabled={loading}
              onPress={onCancel}
              className="px-4 py-2 rounded-full bg-gray-100"
            >
              <Text className="text-[14px] text-[#11181C]">Cancel</Text>
            </Pressable>

            <Pressable
              disabled={loading}
              onPress={onConfirm}
              className={`px-4 py-2 rounded-full ${
                loading ? "bg-red-300" : "bg-red-500"
              }`}
            >
              <Text className="text-[14px] text-white">
                {loading ? "Logging out..." : "Log out"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
