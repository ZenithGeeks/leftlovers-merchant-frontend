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

/** ------------------------------
 *  Food Type Options & Types (fallback)
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
  /** API endpoint (default '/api/merchant/categories') */
  fetchUrl?: string;
  /** Optional mapping function if API shape differs */
  mapResponse?: (raw: any) => { id: string; label: string }[];
  /** Optional auth token for fetch (Bearer) */
  authToken?: string | null;
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
  fetchUrl = '/api/merchant/categories',
  mapResponse,
  authToken = null,
}: FoodTypePickerProps) {
  const [visible, setVisible] = React.useState(false)
  const [items, setItems] = React.useState<{ id: string; label: string }[]>([])
  const [loading, setLoading] = React.useState(false)
  const [loadError, setLoadError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    async function load() {
      try {
        setLoading(true)
        setLoadError(null)

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

        if (mounted && mapped.length > 0) {
          setItems(mapped)
        } else if (mounted) {
          // fallback to built-in FOOD_TYPES if API returned nothing
          setItems(FOOD_TYPES.map((f) => ({ id: f.id, label: f.label })))
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Failed to load categories', err)
          if (mounted) setLoadError(err.message ?? 'Failed to load')
          // fallback to built-in list on error
          if (mounted) setItems(FOOD_TYPES.map((f) => ({ id: f.id, label: f.label })))
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
      controller.abort()
    }
  }, [fetchUrl, mapResponse, authToken])

  const handleValueChange = (id: string | number) => {
    const sid = String(id)
    const selected = items.find((i) => i.id === sid)
    if (selected) {
      // keep shape as FoodType (id + label)
      onChange({ id: selected.id, label: selected.label } as FoodType)
      setVisible(false) // close after selection (if you prefer Done-only, remove this)
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
        className="rounded-lg px-3 py-3 border bg-[rgba(38,189,104,0.2)] border-[rgba(38,189,104,0.05)] flex-row items-center justify-between"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0.5 },
          shadowOpacity: 0.05,
          shadowRadius: 0.1,
          opacity: disabled ? 0.5 : 1,
          elevation: Platform.OS === 'android' ? 1 : 0,
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

            {loading ? (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <ActivityIndicator />
                <Text className="mt-2">Loading...</Text>
              </View>
            ) : (
              <Picker
                selectedValue={value?.id ?? ""}
                onValueChange={handleValueChange}
              >
                <Picker.Item label={placeholder} value="" key="__placeholder__" />
                {items.map((opt) => (
                  <Picker.Item key={opt.id} label={opt.label} value={opt.id} />
                ))}
              </Picker>
            )}

            {!!loadError && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
                <Text className="font-poppins text-[12px] text-red-600">Error: {loadError}</Text>
                <Pressable
                  onPress={() => {
                    // simple retry: re-run effect by updating items to trigger fetch again
                    setItems([])
                    setLoadError(null)
                  }}
                >
                  <Text style={{ color: BRAND.green }} className="mt-2">Retry</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}