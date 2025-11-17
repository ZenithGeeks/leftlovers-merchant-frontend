import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { PlusIcon } from "react-native-heroicons/outline";

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
      {/* Dimmed background */}
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />

      {/* Bottom sheet */}
      <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-5 shadow-xl">
        <View className="flex flex-col justify-center w-full h-[120px] rounded-2xl gap-2">
          <Pressable
            onPress={() => {
              onClose();
              onAddItem?.();
            }}
            className="flex-row items-center gap-3 py-3"
          >
            <PlusIcon size={22} color="#11181C" />
            <Text className="text-lg font-semibold text-[#11181C]">
              Add Item
            </Text>
          </Pressable>

          <View className="h-[1px] bg-gray-200" />

          <Pressable
            onPress={() => {
              onClose();
              onAddOption?.();
            }}
            className="flex-row items-center gap-3 py-3"
          >
            <PlusIcon size={22} color="#11181C" />
            <Text className="text-lg font-semibold text-[#11181C]">
              Add Option
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
