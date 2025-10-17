import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

export type Option = { label: string; value: string };

export default function SelectModal({
  visible,
  options,
  onClose,
  onSelect,
  a11yPrefix,
}: {
  visible: boolean;
  options: Option[];
  onClose: () => void;
  onSelect: (opt: Option) => void;
  a11yPrefix: string;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable
        accessibilityLabel={`${a11yPrefix}-backdrop`}
        testID={`${a11yPrefix}-backdrop`}
        className="flex-1 bg-black/40"
        onPress={onClose}
      />

      {/* Bottom sheet */}
      <View className="w-full absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5">
        <Text className="text-center text-[16px] font-semibold text-[#11181C] mb-3">
          Select
        </Text>

        {options.map((o) => (
          <Pressable
            key={o.value}
            accessibilityLabel={`${a11yPrefix}-option-${o.value}`}
            testID={`${a11yPrefix}-option-${o.value}`}
            onPress={() => onSelect(o)}
            className="px-4 py-3 rounded-xl active:bg-gray-100"
          >
            <Text className="text-[16px] text-[#11181C]">{o.label}</Text>
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}
