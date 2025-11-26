import { Picker } from '@react-native-picker/picker'
import React from 'react'
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  Text,
  View
} from 'react-native'

export const FOOD_TYPES = [
  { id: "thai", label: "Thai Food" },
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
  { id: "fast_food", label: "Fast Food" },
  { id: "desserts", label: "Desserts" },
  { id: "street_food", label: "Street Food" },
  { id: "Italian", label: "Italian" },
] as const

export type FoodType = typeof FOOD_TYPES[number]

type FoodTypePickerProps = {
  value: FoodType | null;
  onChange: (val: FoodType) => void;
  label?: React.ReactNode;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errorText?: string;
  fetchUrl?: string;
  mapResponse?: (raw: any) => { id: string; label: string }[];
  authToken?: string | null;
}

const BRAND = { green: '#26BD68' }

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
  fetchUrl = '/api/merchant/categories',
  mapResponse,
  authToken = null,
}: FoodTypePickerProps) {
  const [visible, setVisible] = React.useState(false)
  const [items, setItems] = React.useState<{ id: string; label: string }[]>(FOOD_TYPES.map(f => ({ id: f.id, label: f.label })))
  const [loading, setLoading] = React.useState(false)
  const [loadError, setLoadError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setLoadError(null)

    const controller = new AbortController()
    try {
      const headers: Record<string, string> = { 'Accept': 'application/json' }
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`

      const res = await fetch(fetchUrl, { method: 'GET', headers, signal: controller.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const raw = await res.json()

      const mapped =
        mapResponse
          ? mapResponse(raw)
          : Array.isArray(raw)
          ? raw.map((r: any) => ({
              id: String(r.id ?? r._id ?? r.value ?? r.key ?? r.name),
              label: String(r.name ?? r.label ?? r.title ?? r.value ?? r.id),
            }))
          : []

      setItems(mapped.length > 0 ? mapped : FOOD_TYPES.map(f => ({ id: f.id, label: f.label })))
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Failed to load categories', err)
        setLoadError(err.message ?? 'Failed to load')
        setItems(FOOD_TYPES.map(f => ({ id: f.id, label: f.label })))
      }
    } finally {
      setLoading(false)
    }

    return () => controller.abort()
  }, [fetchUrl, mapResponse, authToken])

  React.useEffect(() => {
    load()
  }, [load])

  const handleValueChange = (id: string | number) => {
    const sid = String(id)
    const selected = items.find((i) => i.id === sid)
    if (selected) {
      onChange({ id: selected.id, label: selected.label } as FoodType)
      setVisible(false)
    }
  }

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
    accessibilityRole="button"
    accessibilityState={{ disabled }}
    className="rounded-xl px-3 py-3 border flex-row items-center justify-between"
    style={{
      backgroundColor: 'rgba(38,189,104,0.06)',
      borderColor: 'rgba(34,197,94,0.12)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      opacity: disabled ? 0.5 : 1,
      elevation: Platform.OS === 'android' ? 2 : 0,
    }}
  >
    <View style={{ flex: 1 }}>
      {value ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: 'rgba(34,197,94,0.12)',
          }}>
            <Text className="font-poppins text-[12px] text-slate-800">{value.label}</Text>
          </View>
          <Text className="text-gray-500 text-[12px]">Tap to change</Text>
        </View>
      ) : (
        <Text className="font-poppins text-[14px] text-gray-400">
          {placeholder}
        </Text>
      )}
    </View>

    <View style={{ marginLeft: 8, alignItems: 'center', justifyContent: 'center' }}>
      <Text className="text-gray-500">▾</Text>
    </View>
  </Pressable>

  {/* Error */}
  {!!errorText && (
    <Text className="mt-2 font-poppins text-[12px] text-red-600">{errorText}</Text>
  )}

  {/* Modal Picker */}
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={() => setVisible(false)}
  >
    <View className="flex-1 bg-[rgba(0,0,0,0.35)] justify-end">
      <View className="bg-white rounded-t-2xl pb-6 overflow-hidden" style={{ maxHeight: '70%' }}>
        {/* Header */}
        <View className="px-4 pt-3 pb-3 flex-row items-center justify-between border-b" style={{ borderColor: '#f1f5f9' }}>
          <Text className="font-poppins font-bold text-[16px]">Select food type</Text>
          <Pressable
            onPress={() => setVisible(false)}
            accessibilityRole="button"
            style={{ paddingHorizontal: 8, paddingVertical: 6 }}
          >
            <Text style={{ color: BRAND.green }} className="font-poppins font-bold text-[14px]">Done</Text>
          </Pressable>
        </View>

        {/* Loading or Picker */}
        {loading ? (
          <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
            <Text className="mt-2 font-poppins text-[13px] text-gray-600">Loading categories…</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 8 }}>
            <Picker
              selectedValue={value?.id ?? ""}
              onValueChange={handleValueChange}
              itemStyle={{ fontSize: 16 }}
            >
              <Picker.Item label={placeholder} value="" key="__placeholder__" />
              {items.map((opt) => (
                <Picker.Item key={opt.id} label={opt.label} value={opt.id} />
              ))}
            </Picker>
          </View>
        )}

        {/* Footer: error + retry + extra help text */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          {!!loadError && (
            <View style={{ paddingVertical: 12, alignItems: 'flex-start' }}>
              <Text className="font-poppins text-[12px] text-red-600">Error: {loadError}</Text>
              <Pressable onPress={load} style={{ marginTop: 8 }}>
                <Text style={{ color: BRAND.green }} className="font-poppins text-[14px]">Retry</Text>
              </Pressable>
            </View>
          )}

          {!loadError && (
            <Text className="font-poppins text-[12px] text-gray-500 pb-4">
              Tip: categories come from your server. If something’s missing, you can add it in the admin panel.
            </Text>
          )}
        </View>
      </View>
    </View>
  </Modal>
</View>

  )
}