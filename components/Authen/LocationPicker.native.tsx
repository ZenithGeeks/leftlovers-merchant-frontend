// components/LocationPicker.tsx
import * as Location from 'expo-location'
import * as React from 'react'
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
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
  errorText?: string
}

const BRAND = { green: '#26BD68' }
const isValidLat = (v: string) => v !== '' && !isNaN(Number(v)) && Math.abs(Number(v)) <= 90
const isValidLng = (v: string) => v !== '' && !isNaN(Number(v)) && Math.abs(Number(v)) <= 180

export default function LocationPicker({
  lat,
  lng,
  onChange,
  label = <Text style={styles.label}>Location <Text style={styles.required}>*</Text></Text>,
  placeholder = 'Tap map icon to set location',
  disabled = false,
  defaultRegion = {
    latitude: 13.736717,
    longitude: 100.523186,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  },
  errorText
}: LocationPickerProps) {
  const insets = useSafeAreaInsets()
  const [mapVisible, setMapVisible] = React.useState(false)
  const mapRef = React.useRef<MapView>(null)

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
            longitude: pos.coords.longitude
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
      headers: { 'User-Agent': 'LeftloversMerchant/1.0 (contact@leftlovers.example)' }
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
            lon: d.lon
          }))
        )
      } catch (e) {
        console.warn('Nominatim error', e)
      }
    }, 300)
  }

  const showInvalid = !isValidLat(lat) || !isValidLng(lng)

  return (
    <View style={styles.container}>
      {/* Label */}
      <View style={styles.labelContainer}>
        {typeof label === 'string'
          ? <Text style={styles.label}>{label}</Text>
          : label}
      </View>

      {/* Input + pin button */}
      <View style={styles.row}>
        <TextInput
          value={lat && lng ? `${lat}, ${lng}` : ''}
          editable={false}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType="numbers-and-punctuation"
          style={[styles.input, disabled && { opacity: 0.5 }]}
        />

        <TouchableOpacity
          disabled={disabled}
          onPress={() => setMapVisible(true)}
          style={[styles.mapButton, disabled && { opacity: 0.5 }]}
        >
          <Text style={styles.pinIcon}>📍</Text>
        </TouchableOpacity>
      </View>

      {/* Error text */}
      {(showInvalid || !!errorText) && (
        <Text style={styles.errorText}>
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
        <SafeAreaView style={[styles.modalContainer, { paddingTop: insets.top }]}>
          {/* Header + search */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Pin your store location</Text>

            {Platform.OS !== 'web' && (
              <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                  <TextInput
                    placeholder="Search a place or address…"
                    value={q}
                    onChangeText={onChangeQ}
                    returnKeyType="search"
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={styles.searchInput}
                  />
                </View>

                {suggestions.length > 0 && (
                  <View style={styles.suggestionList}>
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
                              longitudeDelta: 0.01
                            }
                            setInitialRegion(next)
                            mapRef.current?.animateToRegion(next, 350)
                            setSuggestions([])
                          }}
                          style={styles.suggestionItem}
                        >
                          <Text numberOfLines={2}>{s.display_name}</Text>
                        </TouchableOpacity>
                      )
                    })}
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
                ? {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lng),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                  }
                : initialRegion
            }
            onPress={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate
              setLatLng(latitude, longitude)
            }}
          >
            <Marker
              coordinate={{
                latitude: lat ? parseFloat(lat) : initialRegion.latitude,
                longitude: lng ? parseFloat(lng) : initialRegion.longitude
              }}
              draggable
              onDragEnd={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate
                setLatLng(latitude, longitude)
              }}
            />
          </MapView>

          {/* Actions */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              onPress={async () => {
                try {
                  const pos = await Location.getCurrentPositionAsync({})
                  const { latitude, longitude } = pos.coords
                  setLatLng(latitude, longitude)
                  const next = {
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                  }
                  setInitialRegion(next)
                  mapRef.current?.animateToRegion(next, 350)
                } catch {
                  Alert.alert('Location', 'Unable to fetch your current location.')
                }
              }}
              style={styles.currentLocationBtn}
            >
              <Text style={styles.currentLocationText}>Use my current location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMapVisible(false)}
              style={[styles.confirmBtn, { backgroundColor: BRAND.green }]}
            >
              <Text style={styles.confirmBtnText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  labelContainer: { marginBottom: 4 },
  label: { fontSize: 15, fontWeight: '400' },
  required: { color: 'black' },
  row: { flexDirection: 'row', alignItems: 'center' },

  input: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(38,189,104,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(38,189,104,0.05)',
    height: 44.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 0.1
  },

  mapButton: {
    marginLeft: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: 'rgba(38,189,104,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(38,189,104,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 0.1
  },

  pinIcon: { fontSize: 18 },

  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 4
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'white'
  },

  header: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 },
  headerTitle: { textAlign: 'center', fontWeight: '700', fontSize: 18 },

  searchContainer: { marginTop: 8 },
  searchBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: 'white',
    paddingHorizontal: 12
  },
  searchInput: { height: 46 },

  suggestionList: {
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden'
  },
  suggestionItem: { padding: 12, borderBottomColor: '#eee', borderBottomWidth: 1 },

  actionContainer: { padding: 16, gap: 12 },

  currentLocationBtn: {
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12
  },
  currentLocationText: { textAlign: 'center' },

  confirmBtn: {
    paddingVertical: 14,
    borderRadius: 12
  },
  confirmBtnText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '700'
  }
})
