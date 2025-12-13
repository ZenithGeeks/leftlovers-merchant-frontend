import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onAddItem?: () => void;
  onAddOption?: () => void;
};

export default function AddSheet({
  visible,
  onClose,
  onAddItem,
  onAddOption,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable
        testID="backdrop"
        className="flex-1 bg-black/40"
        onPress={onClose}
      />

      {/* Bottom Sheet */}
      <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white px-6 pt-3 pb-6">
        {/* Handle bar */}
        <View className="mb-4 items-center">
          <View className="h-1.5 w-12 rounded-full bg-gray-300" />
        </View>

        {/* Actions */}
        <Pressable
          testID="add-item"
          onPress={() => {
            onClose();
            onAddItem?.();
          }}
          className="rounded-xl px-4 py-4 active:bg-gray-100"
        >
          <Text className="text-base font-semibold text-gray-900">
            Add Item
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            Create a new menu item
          </Text>
        </Pressable>

        <View className="my-2 h-px bg-gray-200" />

        <Pressable
          testID="add-option"
          onPress={() => {
            onClose();
            onAddOption?.();
          }}
          className="rounded-xl px-4 py-4 active:bg-gray-100"
        >
          <Text className="text-base font-semibold text-gray-900">
            Add Option
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            Add selectable options
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}
