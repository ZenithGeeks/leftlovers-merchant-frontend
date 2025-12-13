// AddSheet.tsx (UNCHANGED LOGIC)
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        testID="backdrop"
        className="flex-1 bg-black/40"
        onPress={onClose}
      />

      <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-5">
        <Pressable
          testID="add-item"
          onPress={() => {
            onClose();
            onAddItem?.();
          }}
        >
          <Text>Add Item</Text>
        </Pressable>

        <Pressable
          testID="add-option"
          onPress={() => {
            onClose();
            onAddOption?.();
          }}
        >
          <Text>Add Option</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
