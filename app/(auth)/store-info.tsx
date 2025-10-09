// app/(auth)/store-info.tsx
import { Picker } from '@react-native-picker/picker'
import * as DocumentPicker from 'expo-document-picker'
import * as Location from 'expo-location'
import { useRouter } from 'expo-router'
import React from 'react'
import { Alert, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'

type Doc = DocumentPicker.DocumentPickerAsset

const FOOD_TYPES = [
  'Thai cuisine',
  'Japanese',
  'Chinese',
  'Korean',
  'Vietnamese',
  'Cafe',
  'Bakery',
  'Vegetarian',
  'Vegan',
  'Halal',
  'Seafood',
] as const
type FoodType = typeof FOOD_TYPES[number]

const DEV = __DEV__

export default function StoreInfo() {
  const router = useRouter()

  // ----- Form state
  const [brandName, setBrandName]     = React.useState(DEV ? 'WakeUp' : '')
  const [address, setAddress]         = React.useState(DEV ? '123 Soi Sukhumvit 10' : '')
  const [city, setCity]               = React.useState(DEV ? 'Bangkok' : '')
  const [district, setDistrict]       = React.useState(DEV ? 'Khlong Toei' : '')
  const [subdistrict, setSubdistrict] = React.useState(DEV ? 'Khlong Toei' : '')
  const [postalCode, setPostalCode]   = React.useState(DEV ? '10110' : '')
  const [foodType, setFoodType]       = React.useState<FoodType>('Thai cuisine')

  // Files
  const [commercialReg, setCommercialReg] = React.useState<Doc | null>(null)
  const [ownerIdDoc, setOwnerIdDoc]       = React.useState<Doc | null>(null)
  const [storeImages, setStoreImages]     = React.useState<Doc[]>([])

  // Food type modal
  const [foodPickerVisible, setFoodPickerVisible] = React.useState(false)

  // Location
  const [lat, setLat] = React.useState<string>(DEV ? '13.736717' : '')
  const [lng, setLng] = React.useState<string>(DEV ? '100.523186' : '')
  const mapRef = React.useRef<MapView>(null)

  const [mapVisible, setMapVisible] = React.useState(false)
  const [initialRegion, setInitialRegion] = React.useState({
    latitude: 13.736717,
    longitude: 100.523186,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  })

  React.useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({})
          setInitialRegion(r => ({
            ...r,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }))
        }
      } catch {}
    })()
  }, [])

  // ----- Free search (Nominatim)
  const [q, setQ] = React.useState('')
  const [suggestions, setSuggestions] = React.useState<{ display_name: string; lat: string; lon: string }[]>([])
  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchNominatim = async (term: string) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(term)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'LeftloversMerchant/1.0 (contact@leftlovers.example)',
      },
    })
    return (await res.json()) as any[]
  }

  const onChangeQ = (t: string) => {
    setQ(t)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (t.trim().length < 2) { setSuggestions([]); return }
    searchTimer.current = setTimeout(async () => {
      try {
        const data = await fetchNominatim(t.trim())
        setSuggestions(
          (data || []).map((d: any) => ({ display_name: d.display_name, lat: d.lat, lon: d.lon }))
        )
      } catch (e) {
        console.warn('Nominatim error', e)
      }
    }, 300)
  }

  // ----- Pickers
  const pickOne = async (types: DocumentPicker.DocumentPickerOptions['type']) => {
    const res = await DocumentPicker.getDocumentAsync({ type: types, multiple: false, copyToCacheDirectory: true })
    if (res.canceled) return null
    return res.assets[0]
  }
  const pickManyImages = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: ['image/*'], multiple: true, copyToCacheDirectory: true })
    if (res.canceled) return
    setStoreImages(prev => [...prev, ...res.assets].slice(0, 5))
  }

  // Remove actions
  const clearCommercialReg = () => setCommercialReg(null)
  const clearOwnerIdDoc   = () => setOwnerIdDoc(null)
  const removeStoreImage  = (idx: number) => setStoreImages(prev => prev.filter((_, i) => i !== idx))

  // Validation
  const isBrandNameValid = brandName.trim().length >= 2 && brandName.trim().length <= 250
  const isValidPostal    = /^\d{5}$/.test(postalCode)
  const isValidLat       = lat !== '' && !isNaN(Number(lat)) && Math.abs(Number(lat)) <= 90
  const isValidLng       = lng !== '' && !isNaN(Number(lng)) && Math.abs(Number(lng)) <= 180
  const hasUploads       = !!commercialReg && !!ownerIdDoc && storeImages.length > 0

  const canSave =
    isBrandNameValid &&
    address.trim().length > 3 &&
    !!city.trim() && !!district.trim() && !!subdistrict.trim() &&
    isValidPostal && isValidLat && isValidLng && hasUploads

  const setLatLng = (latitude: number, longitude: number) => {
    setLat(latitude.toFixed(6))
    setLng(longitude.toFixed(6))
  }

  const onSave = async () => {
    if (!canSave) return
    const payload = {
      brandName: brandName.trim(),
      foodType,
      address: {
        line1: address.trim(),
        city: city.trim(),
        district: district.trim(),
        subdistrict: subdistrict.trim(),
        postalCode,
        location: { lat: Number(lat), lng: Number(lng) },
      },
      files: {
        commercialRegistration: commercialReg && { name: commercialReg.name, uri: commercialReg.uri, mimeType: commercialReg.mimeType },
        ownerId: ownerIdDoc && { name: ownerIdDoc.name, uri: ownerIdDoc.uri, mimeType: ownerIdDoc.mimeType },
        storeImages: storeImages.map(f => ({ name: f.name, uri: f.uri, mimeType: f.mimeType })),
      },
    }
    console.log('STORE INFO ->', payload)
    Alert.alert('Saved', 'Your store info has been saved.')
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', textAlign: 'center' }}>Tell us about your store</Text>
        <Text style={{ color: '#6B7280', marginTop: 4, marginBottom: 16, textAlign: 'center' }}>
          Fill your store details to display to customers
        </Text>

        {/* Brand name */}
        <Field label={<><Text>Brand name </Text><Text style={{ color: 'red' }}>*</Text></>}>
          <Input value={brandName} onChangeText={setBrandName} placeholder="e.g. WakeUp" style={{ letterSpacing: 0 }} />
          {!isBrandNameValid && (
            <Text style={{ marginTop: 6, color: '#B91C1C', fontSize: 12}}>
              Brand name must be 2–250 characters.
            </Text>
          )}
        </Field>

        {/* Location */}
        <Field label={<><Text>Location </Text><Text style={{ color: 'red' }}>*</Text></>}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Input
              value={lat && lng ? `${lat}, ${lng}` : ''}
              editable={false}
              placeholder="Tap map icon to set location"
              style={{ flex: 1 }}
            />
            <TouchableOpacity
              onPress={() => setMapVisible(true)}
              style={{
                borderWidth: 0.5, borderRadius: 8, padding: 12,
                backgroundColor: 'rgba(38, 189, 104, 0.2)', borderColor: 'rgba(38, 189, 104, 0.05)',
                shadowColor: '#000', shadowOffset: { width: 0, height: 0.5 }, shadowOpacity: 0.05, shadowRadius: 0.1,
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 18 }}>📍</Text>
            </TouchableOpacity>
          </View>
          {(!isValidLat || !isValidLng) && (
            <Text style={{ marginTop: 6, color: '#B91C1C', fontSize: 12 }}>Please pick a valid location.</Text>
          )}
        </Field>

        {/* Address */}
        <Field label={<><Text>Address </Text><Text style={{ color: 'red' }}>*</Text></>}>
          <Input value={address} onChangeText={setAddress} placeholder="e.g. 123 Soi Sukhumvit 10" style={{ letterSpacing: 0 }} />
        </Field>

        <Field label={<><Text>City </Text><Text style={{ color: 'red' }}>*</Text></>}>
          <Input value={city} onChangeText={setCity} placeholder="e.g. Bangkok" style={{ letterSpacing: 0 }}/>
        </Field>

        <Field label={<><Text>District </Text><Text style={{ color: 'red' }}>*</Text></>}>
          <Input value={district} onChangeText={setDistrict} placeholder="e.g. Khlong Toei" style={{ letterSpacing: 0 }} />
        </Field>

        <Field label={<><Text>Subdistrict </Text><Text style={{ color: 'red' }}>*</Text></>}>
          <Input value={subdistrict} onChangeText={setSubdistrict} placeholder="e.g. Khlong Toei" style={{ letterSpacing: 0 }} />
        </Field>

        <Field label={<><Text>Postal Code </Text><Text style={{ color: 'red' }}>*</Text></>}>
          <Input
            value={postalCode}
            onChangeText={t => setPostalCode(t.replace(/\D/g, '').slice(0, 5))}
            keyboardType="number-pad"
            placeholder="e.g. 10110"
          />
          {!isValidPostal && (
            <Text style={{ marginTop: 6, color: '#B91C1C', fontSize: 12 }}>
              Postal code must be exactly 5 digits.
            </Text>
          )}
        </Field>

        {/* Food Type (dropdown) */}
        <Field label={<><Text>Food Type </Text><Text style={{ color: 'red' }}>*</Text></>}>
          <Pressable
            onPress={() => setFoodPickerVisible(true)}
            style={{
              borderWidth: 0.5, borderRadius: 8, padding: 12,
              backgroundColor: 'rgba(38, 189, 104, 0.2)', borderColor: 'rgba(38, 189, 104, 0.05)',
              shadowColor: '#000', shadowOffset: { width: 0, height: 0.5 }, shadowOpacity: 0.05, shadowRadius: 0.1,
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <Text style={{ color: foodType ? '#111827' : '#9CA3AF' }}>
              {foodType || 'Select a food type'}
            </Text>
            <Text style={{ color: '#6B7280' }}>▾</Text>
          </Pressable>

          <Modal visible={foodPickerVisible} transparent animationType="slide" onRequestClose={() => setFoodPickerVisible(false)}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
              <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 12, overflow: 'hidden' }}>
                <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '700' }}>Select food type</Text>
                  <Pressable onPress={() => setFoodPickerVisible(false)}>
                    <Text style={{ color: '#26BD68', fontWeight: '700' }}>Done</Text>
                  </Pressable>
                </View>
                <Picker selectedValue={foodType} onValueChange={(val) => setFoodType(val as FoodType)}>
                  {FOOD_TYPES.map(ft => <Picker.Item key={ft} label={ft} value={ft} />)}
                </Picker>
              </View>
            </View>
          </Modal>
        </Field>

        {/* Uploads (single) */}
        <UploadRow
          label={<><Text>Commercial Registration </Text><Text style={{ color:'red' }}>*</Text></>}
          value={commercialReg?.name}
          onPick={async () => { const f = await pickOne(['application/pdf']); if (f) setCommercialReg(f) }}
          onClear={commercialReg ? clearCommercialReg : undefined}
        />
        <UploadRow
          label={<><Text>Owner National ID Card </Text><Text style={{ color:'red' }}>*</Text></>}
          value={ownerIdDoc?.name}
          onPick={async () => { const f = await pickOne(['application/pdf', 'image/*']); if (f) setOwnerIdDoc(f) }}
          onClear={ownerIdDoc ? clearOwnerIdDoc : undefined}
        />

        {/* Uploads (multi) */}
        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6 }}>
            Store Images <Text style={{ color: 'red' }}>*</Text> ({storeImages.length}/5)
          </Text>

          {storeImages.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {storeImages.map((f, idx) => (
                <View key={f.uri} style={{
                  flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10,
                  borderRadius: 999, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB'
                }}>
                  <Text numberOfLines={1} style={{ maxWidth: 160 }}>{f.name}</Text>
                  <TouchableOpacity onPress={() => removeStoreImage(idx)} style={{ marginLeft: 8 }}>
                    <Text style={{ fontWeight: '700', color: '#EF4444' }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={pickManyImages}
            style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: '#9CA3AF', padding: 16, borderRadius: 12, backgroundColor: '#FFFFFF' }}
          >
            <Text style={{ color: storeImages.length ? '#111827' : '#9CA3AF' }}>
              {storeImages.length ? 'Add more images' : 'Upload PDF / Image'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Save */}
        <TouchableOpacity
          disabled={!canSave}
          onPress={onSave}
          style={{ marginTop: 20, paddingVertical: 16, borderRadius: 12, backgroundColor: '#26BD68', opacity: canSave ? 1 : 0.5 }}
        >
          <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '700' }}>Save information</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Map Picker Modal */}
      <Modal visible={mapVisible} animationType="slide" onRequestClose={() => setMapVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'left', 'right']}>
          {/* Header + search */}
          <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 }}>
            <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 18 }}>Pin your store location</Text>

            {Platform.OS !== 'web' && (
              <View style={{ marginTop: 10 }}>
                <View style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#fff', paddingHorizontal: 12 }}>
                  <TextInput
                    placeholder="Search a place or address…"
                    value={q}
                    onChangeText={onChangeQ}
                    returnKeyType="search"
                    style={{ height: 46 }}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>

                {suggestions.length > 0 && (
                  <View style={{ marginTop: 8, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' }}>
                    {suggestions.map((s, idx) => (
                      <TouchableOpacity
                        key={`${s.lat},${s.lon}-${idx}`}
                        onPress={() => {
                          const latitude = parseFloat(s.lat)
                          const longitude = parseFloat(s.lon)
                          setLatLng(latitude, longitude)
                          const next = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
                          setInitialRegion(next)
                          mapRef.current?.animateToRegion(next, 350)
                          setSuggestions([])
                        }}
                        style={{ padding: 12 }}
                      >
                        <Text numberOfLines={2}>{s.display_name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Map */}
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={
              lat && lng
                ? { latitude: parseFloat(lat), longitude: parseFloat(lng), latitudeDelta: 0.01, longitudeDelta: 0.01 }
                : initialRegion
            }
            onPress={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate
              setLatLng(latitude, longitude)
            }}
          >
            {(lat && lng)
              ? <Marker coordinate={{ latitude: parseFloat(lat), longitude: parseFloat(lng) }} />
              : <Marker coordinate={{ latitude: initialRegion.latitude, longitude: initialRegion.longitude }} />}
          </MapView>

          {/* Actions */}
          <View style={{ padding: 16, gap: 8 }}>
            <TouchableOpacity
              onPress={async () => {
                try {
                  const pos = await Location.getCurrentPositionAsync({})
                  const { latitude, longitude } = pos.coords
                  setLatLng(latitude, longitude)
                  const next = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
                  setInitialRegion(next)
                  mapRef.current?.animateToRegion(next, 350)
                } catch {
                  Alert.alert('Location', 'Unable to fetch your current location.')
                }
              }}
              style={{ padding: 12, borderRadius: 12, backgroundColor: '#F1F5F9' }}
            >
              <Text style={{ textAlign: 'center' }}>Use my current location</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMapVisible(false)} style={{ padding: 14, borderRadius: 12, backgroundColor: '#26BD68' }}>
              <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '700' }}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

/** Small primitives */
function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6 }}>{label}</Text>
      {children}
    </View>
  )
}

function Input(props: any) {
  return (
    <TextInput
      placeholderTextColor="#9CA3AF"
      {...props}
      style={[
        {
          borderWidth: 0.5,
          borderRadius: 8,
          padding: 12,
          backgroundColor: 'rgba(38, 189, 104, 0.2)',
          borderColor: 'rgba(38, 189, 104, 0.05)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0.5 },
          shadowOpacity: 0.05,
          shadowRadius: 0.1,
        },
        props.style,
      ]}
    />
  )
}

function UploadRow({
  label,
  value,
  onPick,
  onClear,
}: {
  label: React.ReactNode
  value?: string
  onPick: () => void
  onClear?: () => void
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6 }}>{label}</Text>

      {value ? (
        <View style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#F9FAFB' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, justifyContent: 'space-between' }}>
            <Text numberOfLines={1} style={{ flex: 1, marginRight: 12 }}>{value}</Text>
            {onClear && (
              <TouchableOpacity onPress={onClear} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#FEE2E2' }}>
                <Text style={{ color: '#B91C1C', fontWeight: '700' }}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={onPick} style={{ padding: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
            <Text style={{ color: '#26BD68', fontWeight: '600' }}>Replace file</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={onPick}
          style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: '#9CA3AF', padding: 16, borderRadius: 12, backgroundColor: '#FFFFFF' }}
        >
          <Text style={{ color: '#9CA3AF' }}>Upload PDF / Image</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
