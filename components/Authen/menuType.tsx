import { Picker } from '@react-native-picker/picker'
import React from 'react'
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'

// NEW: Dynamic FoodType type
export type FoodType = {
  id: string
  label: string
}

type FoodTypePickerProps = {
  value: FoodType | null;
  onChange: (val: FoodType) => void;
  options: FoodType[];
  label?: React.ReactNode;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errorText?: string;
}

const BRAND = { green: '#26BD68' }

export default function FoodTypePicker({
  value,
  onChange,
  options,
  label = (
    <Text style={styles.label}>
      Food Type <Text style={styles.required}>*</Text>
    </Text>
  ),
  placeholder = 'Select a food type',
  required = false,
  disabled = false,
  errorText,
}: FoodTypePickerProps) {
  const [visible, setVisible] = React.useState(false)
  const [tempValue, setTempValue] = React.useState<string | null>(value?.id ?? null)

  return (
    <View style={{ marginBottom: 14, marginTop: 15 }}>

      {/* Label */}
      <View style={{ marginBottom: 4 }}>
        {typeof label === 'string' ? (
          <Text style={styles.label}>
            {label} {required ? <Text style={styles.required}>*</Text> : null}
          </Text>
        ) : (
          label
        )}
      </View>

      {/* Trigger */}
      <Pressable
        disabled={disabled}
        onPress={() => {
          setTempValue(value?.id ?? null)
          setVisible(true)
        }}
        style={[
          styles.trigger,
          disabled && { opacity: 0.5 }
        ]}
      >
        <View style={{ flex: 1 }}>
          {value ? (
            <View style={styles.selectedContainer}>
              <Text style={styles.badgeText}>{value.label}</Text>
            </View>
          ) : (
            <Text style={styles.placeholder}>{placeholder}</Text>
          )}
        </View>

        <View style={styles.arrowContainer}>
          <Text style={{ color: '#6b7280' }}>▾</Text>
        </View>
      </Pressable>

      {/* Error */}
      {!!errorText && (
        <Text style={styles.errorText}>{errorText}</Text>
      )}

      {/* Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select food type</Text>

              {/* DONE — apply selection */}
              <Pressable
                onPress={() => {
                  if (tempValue) {
                    const selected = options.find((i) => i.id === tempValue)
                    if (selected) onChange(selected)
                  }
                  setVisible(false)
                }}
              >
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </View>

            {/* Picker */}
            <View style={{ paddingHorizontal: 8 }}>
              <Picker
                selectedValue={tempValue ?? ""}
                onValueChange={(val) => setTempValue(String(val))}
                itemStyle={{ fontSize: 16 }}
              >
                <Picker.Item label={placeholder} value="" />

                {options.map((opt) => (
                  <Picker.Item key={opt.id} label={opt.label} value={opt.id} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: 15,
    fontWeight: '400',
  },
  required: {
    color: '#000',
  },
  trigger: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(38,189,104,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(38,189,104,0.05)',
    height: 44.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholder: {
    color: '#9ca3af',
    fontSize: 14,
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '400',
  },
  arrowContainer: {
    marginLeft: 8,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#dc2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  doneText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BRAND.green,
  },
})