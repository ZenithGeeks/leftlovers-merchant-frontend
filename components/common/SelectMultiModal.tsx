import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { CheckIcon } from "react-native-heroicons/outline";
export type MultiOption<T = string> = { label: string; value: T };
type Props<T = string> = {
  visible: boolean;
  options: MultiOption<T>[];
  selected: T[];
  onClose: () => void;
  onApply: (values: T[]) => void;
  a11yPrefix?: string;
};

export default function SelectMultiModal<T = string>({
  visible,
  options,
  selected,
  onClose,
  onApply,
  a11yPrefix = "multi",
}: Props<T>) {
  const [local, setLocal] = React.useState<T[]>(selected);

  React.useEffect(() => setLocal(selected), [selected, visible]);

  const toggle = (val: T) => {
    setLocal((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5">
        <Text className="text-xl font-bold text-[#11181C] mb-3">
          Select groups
        </Text>
        <ScrollView style={{ maxHeight: 360 }}>
          {options.map((opt,key) => {
            const active = local.includes(opt.value);
            return (
              <Pressable
                key={key}
                onPress={() => toggle(opt.value)}
                className={`flex-row items-center justify-between px-3 py-3 rounded-xl mb-2 ${
                  active ? "bg-green-50" : "bg-gray-50"
                }`}
              >
                <Text className="text-[16px] text-[#11181C]">{opt.label}</Text>

                <View
                  className={`w-5 h-5 rounded items-center justify-center ${
                    active ? "bg-[#26BD68]" : "bg-gray-300"
                  }`}
                >
                  {active && <CheckIcon size={14} color="white" />}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="flex-row justify-end gap-3 mt-4">
          <Pressable
            onPress={onClose}
            className="px-4 py-3 rounded-xl bg-gray-200"
          >
            <Text className="text-[#11181C] font-semibold">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={() => onApply(local)}
            className="px-4 py-3 rounded-xl bg-[#26BD68]"
          >
            <Text className="text-white font-semibold">Apply</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
