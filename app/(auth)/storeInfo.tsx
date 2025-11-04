// app/(auth)/store-info.tsx
import * as DocumentPicker from 'expo-document-picker'
import { useRouter } from 'expo-router'
import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Local components
import { ClickButton } from '@/components/Authen/ClickButton'
import { InputBox } from '@/components/Authen/InputBox'
import LocationPicker from '@/components/Authen/LocationPicker'
import FoodTypePicker, { FOOD_TYPES, FoodType } from '@/components/Authen/menuType'
import UploadFile from '@/components/Authen/UploadFile'
import UploadImagesGrid from '@/components/Authen/UploadImages'

type Doc = DocumentPicker.DocumentPickerAsset

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
  const [foodType, setFoodType]       = React.useState<FoodType>(FOOD_TYPES[0])

  // Files
  const [commercialReg, setCommercialReg] = React.useState<Doc | null>(null) // PDF
  const [ownerIdDoc, setOwnerIdDoc]       = React.useState<Doc | null>(null) // PDF/Image
  const [storeImages, setStoreImages]     = React.useState<Doc[]>([])        // up to 5 images

  // Location (only lat/lng; LocationPicker handles modal & search)
  const [lat, setLat] = React.useState<string>(DEV ? '13.736717' : '')
  const [lng, setLng] = React.useState<string>(DEV ? '100.523186' : '')

  // ----- Validation
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

  // ----- Remove actions
  const clearCommercialReg = () => setCommercialReg(null)
  const clearOwnerIdDoc   = () => setOwnerIdDoc(null)
  const removeStoreImage  = (idx: number) => setStoreImages(prev => prev.filter((_, i) => i !== idx))

  // ----- Submit
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
    router.replace('/(auth)/notifyPage')
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', textAlign: 'center' }}>Tell us about your store</Text>
        <Text style={{ color: '#6B7280', marginTop: 4, marginBottom: 16, textAlign: 'center' }}>
          Fill your store details to display to customers
        </Text>

        {/* Brand name */}
        <InputBox
          label="Brand name *"
          value={brandName}
          onChangeText={setBrandName}
          placeholder="e.g. WakeUp"
          errorText={!isBrandNameValid ? 'Brand name must be 2–250 characters.' : undefined}
        />

        {/* Location */}
        <View style={{ marginTop: 15, marginBottom: -15 }}>
          <LocationPicker
            lat={lat}
            lng={lng}
            onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng) }}
          />
        </View>

        {/* Address */}
        <InputBox label="Address *" value={address} onChangeText={setAddress} placeholder="e.g. 123 Soi Sukhumvit 10" />
        <InputBox label="City *" value={city} onChangeText={setCity} placeholder="e.g. Bangkok" />
        <InputBox label="District *" value={district} onChangeText={setDistrict} placeholder="e.g. Khlong Toei" />
        <InputBox label="Subdistrict *" value={subdistrict} onChangeText={setSubdistrict} placeholder="e.g. Khlong Toei" />
        <InputBox
          label="Postal Code *"
          value={postalCode}
          onChangeText={t => setPostalCode(t.replace(/\D/g, '').slice(0, 5))}
          keyboardType="number-pad"
          placeholder="e.g. 10110"
          errorText={!isValidPostal ? 'Postal code must be exactly 5 digits.' : undefined}
        />

        {/* Food Type */}
        <FoodTypePicker
          value={foodType}
          onChange={setFoodType}
          required
          errorText={!foodType ? 'Please select a food type.' : undefined}
        />

        {/* Uploads (single with preview) */}
        <UploadFile
          label={<><Text>Commercial Registration </Text><Text style={{ color:'black' }}>*</Text></>}
          file={
            commercialReg
              ? { name: commercialReg.name, uri: commercialReg.uri, mimeType: commercialReg.mimeType, size: commercialReg.size }
              : undefined
          }
          onPick={async () => {
            const f = await pickOne(['application/pdf'])
            if (f) setCommercialReg(f)
          }}
          onClear={commercialReg ? clearCommercialReg : undefined}
          emptyText="Upload PDF"
        />

        <UploadFile
          label={<><Text>Owner National ID Card </Text><Text style={{ color:'black' }}>*</Text></>}
          file={
            ownerIdDoc
              ? { name: ownerIdDoc.name, uri: ownerIdDoc.uri, mimeType: ownerIdDoc.mimeType, size: ownerIdDoc.size }
              : undefined
          }
          onPick={async () => {
            const f = await pickOne(['application/pdf', 'image/*'])
            if (f) setOwnerIdDoc(f)
          }}
          onClear={ownerIdDoc ? clearOwnerIdDoc : undefined}
          emptyText="Upload PDF / Image"
        />

        {/* Uploads (multi thumbnails 1–5) */}
        <UploadImagesGrid
          files={storeImages.map(f => ({ name: f.name, uri: f.uri }))}
          max={5}
          onAdd={pickManyImages}
          onRemove={(idx) => removeStoreImage(idx)}
        />

        {/* Save */}
        <View style={{ marginTop: 20 }}>
          <ClickButton
            label="Save information"
            onPress={onSave}
            disabled={!canSave}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}