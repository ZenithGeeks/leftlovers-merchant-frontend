/////////////JOY FIX ALL//////////////
// app/(auth)/storeInfo.tsx
import { useUser } from "@clerk/clerk-expo";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ClickButton } from "@/components/Authen/ClickButton";
import { InputBox } from "@/components/Authen/InputBox";
import LocationPicker from "@/components/Authen/LocationPicker";
import FoodTypePicker, { FOOD_TYPES, FoodType } from "@/components/Authen/menuType";
import UploadFile from "@/components/Authen/UploadFile";
import UploadImagesGrid from "@/components/Authen/UploadImages";

import { createMerchantInfo } from "@/app/api/merchant";
import { uploadFile } from "@/services/upload";
import { setStep } from "@/src/lib/onboarding";

type Doc = DocumentPicker.DocumentPickerAsset;
const DEV = __DEV__;

export default function StoreInfo() {
  const router = useRouter();
  const params = useLocalSearchParams() as { userId?: string };
  const { user, isLoaded } = useUser();
  const ownerUserId = params.userId ?? user?.id ?? null;

  // Form state
  const [brandName, setBrandName] = React.useState(DEV ? "WakeUp" : "");
  const [address, setAddress] = React.useState(DEV ? "123 Soi Sukhumvit 10" : "");
  const [city, setCity] = React.useState(DEV ? "Bangkok" : "");
  const [district, setDistrict] = React.useState(DEV ? "Khlong Toei" : "");
  const [subdistrict, setSubdistrict] = React.useState(DEV ? "Khlong Toei" : "");
  const [postalCode, setPostalCode] = React.useState(DEV ? "10110" : "");
  const [foodType, setFoodType] = React.useState<FoodType>(FOOD_TYPES[0]);
  const [lat, setLat] = React.useState<string>(DEV ? "13.736717" : "");
  const [lng, setLng] = React.useState<string>(DEV ? "100.523186" : "");

  const [commercialReg, setCommercialReg] = React.useState<Doc | null>(null);
  const [ownerIdDoc, setOwnerIdDoc] = React.useState<Doc | null>(null);
  const [storeImages, setStoreImages] = React.useState<Doc[]>([]);

  const pickOne = async (types: DocumentPicker.DocumentPickerOptions["type"]) => {
    const res = await DocumentPicker.getDocumentAsync({ type: types, multiple: false });
    if (res.canceled) return null;
    return res.assets[0];
  };

  const pickManyImages = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: ["image/*"], multiple: true });
    if (res.canceled) return;
    setStoreImages((prev) => [...prev, ...res.assets].slice(0, 5));
  };

  const clearCommercialReg = () => setCommercialReg(null);
  const clearOwnerIdDoc = () => setOwnerIdDoc(null);
  const removeStoreImage = (idx: number) =>
    setStoreImages((prev) => prev.filter((_, i) => i !== idx));

  const isBrandNameValid = brandName.trim().length >= 2 && brandName.trim().length <= 250;
  const isValidPostal = /^\d{5}$/.test(postalCode);
  const isValidLat = lat !== "" && !isNaN(Number(lat)) && Math.abs(Number(lat)) <= 90;
  const isValidLng = lng !== "" && !isNaN(Number(lng)) && Math.abs(Number(lng)) <= 180;
  const hasUploads = !!commercialReg && !!ownerIdDoc && storeImages.length > 0;

  const canSave =
    isBrandNameValid &&
    address.trim().length > 3 &&
    !!city.trim() &&
    !!district.trim() &&
    !!subdistrict.trim() &&
    isValidPostal &&
    isValidLat &&
    isValidLng &&
    hasUploads;

  const [saving, setSaving] = React.useState(false);
  const submittingRef = React.useRef(false);

  const onSave = async () => {
  console.log("===== onSave() START =====");

  console.log("canSave:", canSave);
  console.log("isLoaded:", isLoaded);
  console.log("ownerUserId:", ownerUserId);

  if (!canSave || !isLoaded || !ownerUserId) {
    console.log("❌ Validation failed: cannot save");
    return;
  }

  if (submittingRef.current) {
    console.log("⛔ Already submitting...");
    return;
  }

  submittingRef.current = true;
  setSaving(true);

  const latNum = Number(lat);
  const lngNum = Number(lng);

  console.log("lat:", lat, "=>", latNum);
  console.log("lng:", lng, "=>", lngNum);

  if (isNaN(latNum) || isNaN(lngNum)) {
    console.log("❌ Invalid lat/lng");
    Alert.alert("Invalid coordinates", "Latitude or Longitude is not valid.");
    setSaving(false);
    submittingRef.current = false;
    return;
  }

  try {
    console.log("===== FILE INPUTS BEFORE UPLOAD =====");
    console.log("commercialReg:", commercialReg);
    console.log("ownerIdDoc:", ownerIdDoc);
    console.log("storeImages:", storeImages);

    if (!commercialReg || !ownerIdDoc) {
      throw new Error("Missing required documents");
    }

    console.log("Uploading COMMERCIAL_REG...");
    const commercialUpload = await uploadFile(commercialReg, "merchant-docs");
    console.log("commercialUpload result:", commercialUpload);

    console.log("Uploading OWNER_ID...");
    const ownerIdUpload = await uploadFile(ownerIdDoc, "merchant-docs");
    console.log("ownerIdUpload result:", ownerIdUpload);

    console.log("Uploading STORE_IMAGES...");
    const storeUploads = await Promise.all(
      storeImages.map((img, idx) => {
        console.log(`Uploading store image #${idx}`, img);
        return uploadFile(img, "store-images");
      })
    );
    console.log("storeUploads result:", storeUploads);

    // Build payload
    const payload = {
      userId: ownerUserId,
      displayName: brandName.trim(),
      categoryId: foodType.id,
      address: {
        label: null,
        line1: address,
        line2: district,
        city: subdistrict,
        province: city,
        postalCode,
        lat: latNum,
        lng: lngNum,
      },
      branchName: null,
      description: null,
      openHours: null,
      listImageUrl: storeUploads[0]?.url ?? null,
      storeImageUrl: storeUploads[0]?.url ?? null,
      files: [
        {
          kind: "COMMERCIAL_REG",
          url: commercialUpload.url,
          label: commercialReg.name,
        },
        {
          kind: "OWNER_ID",
          url: ownerIdUpload.url,
          label: ownerIdDoc.name,
        },
        ...storeUploads.map((u, i) => ({
          kind: "STORE_IMAGE",
          url: u.url,
          label: storeImages[i]?.name ?? "Store image",
        })),
      ],
    };

    console.log("===== FINAL PAYLOAD SENT TO BACKEND =====");
    console.log(JSON.stringify(payload, null, 2));

    // API call
    console.log("Sending createMerchantInfo...");
    const res = await createMerchantInfo(payload);
    console.log("createMerchantInfo RESPONSE:", res);

    // Clerk update
    console.log("Updating Clerk metadata...");
    await user?.update({
      unsafeMetadata: {
        ...(user?.unsafeMetadata ?? {}),
        storeInfoSubmitted: true,
      },
    });

    console.log("Updating onboarding step...");
    await setStep(user!, "notifyPage");
    await user?.reload();

    console.log("Redirecting to notifyPage...");
    router.replace("./(auth)/notifyPage");

    console.log("===== onSave() DONE SUCCESSFULLY =====");
  } catch (err: any) {
    console.log("❌ ERROR IN onSave():", err);
    Alert.alert("Save failed", err?.message ?? "Something went wrong.");
  } finally {
    setSaving(false);
    submittingRef.current = false;
  }
};



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 28, paddingBottom: 40 }}
      >
        <Text style={{ fontSize: 24, fontWeight: "700", textAlign: "center" }}>
          Tell us about your store
        </Text>
        <Text
          style={{ color: "#6B7280", marginTop: 4, marginBottom: 16, textAlign: "center" }}
        >
          Fill your store details to display to customers
        </Text>

        <InputBox
          label="Brand name *"
          value={brandName}
          onChangeText={setBrandName}
          placeholder="e.g. WakeUp"
          errorText={!isBrandNameValid ? "Brand name must be 2–250 characters." : undefined}
        />

        <View style={{ marginTop: 15, marginBottom: -15 }}>
          <LocationPicker
            lat={lat}
            lng={lng}
            onChange={(newLat, newLng) => {
              setLat(newLat);
              setLng(newLng);
            }}
          />
        </View>

        <InputBox
          label="Address *"
          value={address}
          onChangeText={setAddress}
          placeholder="e.g. 123 Soi Sukhumvit 10"
        />
        <InputBox
          label="City *"
          value={city}
          onChangeText={setCity}
          placeholder="e.g. Bangkok"
        />
        <InputBox
          label="District *"
          value={district}
          onChangeText={setDistrict}
          placeholder="e.g. Khlong Toei"
        />
        <InputBox
          label="Subdistrict *"
          value={subdistrict}
          onChangeText={setSubdistrict}
          placeholder="e.g. Khlong Toei"
        />
        <InputBox
          label="Postal Code *"
          value={postalCode}
          onChangeText={(t) => setPostalCode(t.replace(/\D/g, "").slice(0, 5))}
          keyboardType="number-pad"
          placeholder="e.g. 10110"
          errorText={!isValidPostal ? "Postal code must be exactly 5 digits." : undefined}
        />

        <FoodTypePicker
          value={foodType}
          onChange={setFoodType}
          required
          errorText={!foodType ? "Please select a food type." : undefined}
        />

        <UploadFile
          label={
            <>
              <Text>Commercial Registration </Text>
              <Text style={{ color: "black" }}>*</Text>
            </>
          }
          file={
            commercialReg
              ? {
                  name: commercialReg.name,
                  uri: commercialReg.uri,
                  mimeType: commercialReg.mimeType,
                  size: commercialReg.size,
                }
              : undefined
          }
          onPick={async () => {
            const f = await pickOne(["application/pdf"]);
            if (f) setCommercialReg(f);
          }}
          onClear={commercialReg ? clearCommercialReg : undefined}
          emptyText="Upload PDF"
        />

        <UploadFile
          label={
            <>
              <Text>Owner National ID Card </Text>
              <Text style={{ color: "black" }}>*</Text>
            </>
          }
          file={
            ownerIdDoc
              ? {
                  name: ownerIdDoc.name,
                  uri: ownerIdDoc.uri,
                  mimeType: ownerIdDoc.mimeType,
                  size: ownerIdDoc.size,
                }
              : undefined
          }
          onPick={async () => {
            const f = await pickOne(["application/pdf", "image/*"]);
            if (f) setOwnerIdDoc(f);
          }}
          onClear={ownerIdDoc ? clearOwnerIdDoc : undefined}
          emptyText="Upload PDF / Image"
        />

        <UploadImagesGrid
          files={storeImages.map((f) => ({ name: f.name, uri: f.uri }))}
          max={5}
          onAdd={pickManyImages}
          onRemove={(idx) => removeStoreImage(idx)}
        />

        <View style={{ marginTop: 20 }}>
          <ClickButton
            label={saving ? "Saving…" : "Save information"}
            onPress={onSave}
            disabled={!canSave || saving}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
/////////////end JOY FIX ALL//////////////