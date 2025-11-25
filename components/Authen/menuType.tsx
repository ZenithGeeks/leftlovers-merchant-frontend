import { Picker } from '@react-native-picker/picker'
import React from 'react'
import { Modal, Pressable, Text, View } from 'react-native'


/** ------------------------------
 *  Food Type Options & Types
 *  ------------------------------ */
export const FOOD_TYPES = [
  { id: "thai", label: "Thai cuisine" },
  { id: "japanese", label: "Japanese" },
  { id: "chinese", label: "Chinese" },
  { id: "korean", label: "Korean" },
  { id: "vietnamese", label: "Vietnamese" },
  { id: "cafe", label: "Cafe" },
  { id: "bakery", label: "Bakery" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "halal", label: "Halal" },
  { id: "seafood", label: "Seafood" },
] as const

export type FoodType = typeof FOOD_TYPES[number]

/** ------------------------------
 *  Component Props
 *  ------------------------------ */
type FoodTypePickerProps = {
  /** Current selected value */
  value: FoodType | null;
  /** Callback when changed */
  onChange: (val: FoodType) => void;
  /** UI */
  label?: React.ReactNode;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  /** Optional error message shown beneath */
  errorText?: string;
}

const BRAND = { green: '#26BD68' }

/** ------------------------------
 *  Main Component
 *  ------------------------------ */
export default function FoodTypePicker({
  value,
  onChange,
  label = (
    <Text className="font-poppins text-[15px]">
      Food Type <Text className="text-black">*</Text>
    </Text>
  ),
  placeholder = 'Select a food type',
  required = false,
  disabled = false,
  errorText,
}: FoodTypePickerProps) {
  const [visible, setVisible] = React.useState(false)

  return (
    <View className="mb-[14px]" style={{ marginTop: 15 }}>
      {/* Label */}
      <View className="mb-1">
        {typeof label === 'string' ? (
          <Text className="font-poppins text-[15px]">
            {label} {required ? <Text className="text-black">*</Text> : null}
          </Text>
        ) : (
          label
        )}
      </View>

      {/* Trigger */}
      <Pressable
        disabled={disabled}
        onPress={() => setVisible(true)}
        className="rounded-lg px-3 py-3 border bg-[rgba(38,189,104,0.2)] border-[rgba(38,189,104,0.05)] flex-row items-center justify-between"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0.5 },
          shadowOpacity: 0.05,
          shadowRadius: 0.1,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text className={`font-poppins ${value ? 'text-slate-900' : 'text-gray-400'}`}>
            {value ? value.label : placeholder}
        </Text>
        <Text className="text-gray-500">▾</Text>
      </Pressable>

      {!!errorText && (
        <Text className="mt-1 font-poppins text-[12px] text-red-600">{errorText}</Text>
      )}

      {/* Modal Picker */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View className="flex-1 bg-[rgba(0,0,0,0.35)] justify-end">
          <View className="bg-white rounded-t-2xl pb-20 overflow-hidden">
            <View className="px-4 pt-3 pb-2 flex-row items-center justify-between">
              <Text className="font-poppins font-bold text-[15px]">Select food type</Text>
              <Pressable onPress={() => setVisible(false)}>
                <Text style={{ color: BRAND.green }} className="font-poppins font-bold">
                  Done
                </Text>
              </Pressable>
            </View>

            <Picker
              selectedValue={value?.id ?? ""}
              onValueChange={(id) => {
                const selected = FOOD_TYPES.find((f) => f.id === id);
                if (selected) onChange(selected);
              }}
            >
              {FOOD_TYPES.map((opt) => (
                <Picker.Item key={opt.id} label={opt.label} value={opt.id} />
              ))}
            </Picker>
          </View>
        </View>
      </Modal>
    </View>
  )
}