// components/LocationPicker.tsx
import * as Location from 'expo-location'
import * as React from 'react'
import { Alert, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import MapView, { Marker, Region } from 'react-native-maps'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

type Suggestion = { display_name: string; lat: string; lon: string }

export type LocationPickerProps = {
  lat: string | ''
  lng: string | ''
  onChange: (lat: string, lng: string) => void
  label?: React.ReactNode
  placeholder?: string
  disabled?: boolean
  defaultRegion?: Region
  /** Error text to show under the field (optional) */
  errorText?: string
}

const BRAND = { green: '#26BD68' }
const isValidLat = (v: string) => v !== '' && !isNaN(Number(v)) && Math.abs(Number(v)) <= 90
const isValidLng = (v: string) => v !== '' && !isNaN(Number(v)) && Math.abs(Number(v)) <= 180

export default function LocationPicker({
  lat,
  lng,
  onChange,
  label = (
    <Text className="font-poppins text-[15px]">
      Location <Text className="text-black0">*</Text>
    </Text>
  ),
  placeholder = 'Tap map icon to set location',
  disabled = false,
  defaultRegion = {
    latitude: 13.736717,
    longitude: 100.523186,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  errorText,
}: LocationPickerProps) {
  const insets = useSafeAreaInsets()
  const [mapVisible, setMapVisible] = React.useState(false)
  const mapRef = React.useRef<MapView>(null)

  // search
  const [q, setQ] = React.useState('')
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([])
  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const [initialRegion, setInitialRegion] = React.useState<Region>(defaultRegion)

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

  const setLatLng = (latitude: number, longitude: number) => {
    onChange(latitude.toFixed(6), longitude.toFixed(6))
  }

  const fetchNominatim = async (term: string) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
      term.trim()
    )}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LeftloversMerchant/1.0 (contact@leftlovers.example)' },
    })
    return (await res.json()) as any[]
  }

  const onChangeQ = (text: string) => {
    setQ(text)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (text.trim().length < 2) return setSuggestions([])
    searchTimer.current = setTimeout(async () => {
      try {
        const data = await fetchNominatim(text)
        setSuggestions(
          (data || []).map((d: any) => ({
            display_name: d.display_name,
            lat: d.lat,
            lon: d.lon,
          }))
        )
      } catch (e) {
        console.warn('Nominatim error', e)
      }
    }, 300)
  }

  const showInvalid = !isValidLat(lat) || !isValidLng(lng)

  return (
    <View className="mb-[14px]">
      {/* Label */}
      <View className="mb-1">
        {typeof label === 'string' ? (
          <Text className="font-poppins text-[15px]">{label}</Text>
        ) : (
          label
        )}
      </View>

      {/* Readonly input + pin button */}
      <View className="flex-row items-center">
        <TextInput
          value={lat && lng ? `${lat}, ${lng}` : ''}
          editable={false}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType="numbers-and-punctuation"
          className="flex-1 rounded-lg px-3 py-3 bg-[rgba(38,189,104,0.2)] border border-[rgba(38,189,104,0.05)]"
          // NativeWind "shadow" is limited; small inline for subtle shadow:
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 0.5 },
            shadowOpacity: 0.05,
            shadowRadius: 0.1,
            height: 44.5
          }}
        />
        <TouchableOpacity
          disabled={disabled}
          onPress={() => setMapVisible(true)}
          className="ml-2 rounded-lg px-3 py-3 bg-[rgba(38,189,104,0.2)] border border-[rgba(38,189,104,0.05)]"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 0.5 },
            shadowOpacity: 0.05,
            shadowRadius: 0.1,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <Text className="text-[18px]">📍</Text>
        </TouchableOpacity>
      </View>

      {/* Validation / error */}
      {(showInvalid || !!errorText) && (
        <Text className="font-poppins text-[12px] text-red-600 mt-1">
          {errorText || 'Please pick a valid location.'}
        </Text>
      )}

      {/* Modal */}
      <Modal
        visible={mapVisible}
        animationType="slide"
        onRequestClose={() => setMapVisible(false)}
        presentationStyle="fullScreen"
      >
        <SafeAreaView
          className="flex-1 bg-white"
          style={{ paddingTop: insets.top }}
        >
          {/* Header + search */}
          <View className="px-3 pt-2 pb-2">
            <Text className="text-center font-poppins font-bold text-[18px]">
              Pin your store location
            </Text>

            {Platform.OS !== 'web' && (
              <View className="mt-2">
                <View className="border border-gray-200 rounded-xl bg-white px-3">
                  <TextInput
                    placeholder="Search a place or address…"
                    value={q}
                    onChangeText={onChangeQ}
                    returnKeyType="search"
                    className="h-[46px]"
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>

                {suggestions.length > 0 && (
                  <View className="mt-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {suggestions.map((s, idx) => {
                      const latitude = parseFloat(s.lat)
                      const longitude = parseFloat(s.lon)
                      return (
                        <TouchableOpacity
                          key={`${s.lat},${s.lon}-${idx}`}
                          onPress={() => {
                            setLatLng(latitude, longitude)
                            const next: Region = {
                              latitude,
                              longitude,
                              latitudeDelta: 0.01,
                              longitudeDelta: 0.01,
                            }
                            setInitialRegion(next)
                            mapRef.current?.animateToRegion(next, 350)
                            setSuggestions([])
                          }}
                          className="p-3"
                        >
                          <Text numberOfLines={2} className="font-poppins">
                            {s.display_name}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Map (MapView itself doesn't support className well) */}
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={
              lat && lng
                ? {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lng),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }
                : initialRegion
            }
            onPress={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate
              setLatLng(latitude, longitude)
            }}
          >
            {lat && lng ? (
              <Marker
                coordinate={{ latitude: parseFloat(lat), longitude: parseFloat(lng) }}
                draggable
                onDragEnd={(e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate
                  setLatLng(latitude, longitude)
                }}
              />
            ) : (
              <Marker
                coordinate={{ latitude: initialRegion.latitude, longitude: initialRegion.longitude }}
                draggable
                onDragEnd={(e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate
                  setLatLng(latitude, longitude)
                }}
              />
            )}
          </MapView>

          {/* Actions */}
          <View className="p-4 gap-2">
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
              className="p-3 rounded-xl bg-slate-100"
            >
              <Text className="text-center font-poppins">Use my current location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMapVisible(false)}
              className="p-[14px] rounded-xl"
              style={{ backgroundColor: BRAND.green }}
            >
              <Text className="text-center text-white font-poppins font-bold">
                Confirm Location
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  )
}