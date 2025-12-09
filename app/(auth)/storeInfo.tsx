// app/(auth)/storeInfo.tsx
import { useUser } from "@clerk/clerk-expo";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ClickButton } from "@/components/Authen/ClickButton";
import { InputBox } from "@/components/Authen/InputBox";
import LocationPicker from "@/components/Authen/LocationPicker.native";
import FoodTypePicker, { FoodType } from "@/components/Authen/menuType";
import UploadFile from "@/components/Authen/UploadFile";
import UploadImagesGrid from "@/components/Authen/UploadImages";

import { getCategories } from "@/app/api/getCategories";
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
  const [foodType, setFoodType] = React.useState<FoodType | null>(null);
  const [lat, setLat] = React.useState<string>(DEV ? "13.736717" : "");
  const [lng, setLng] = React.useState<string>(DEV ? "100.523186" : "");
  const [commercialReg, setCommercialReg] = React.useState<Doc | null>(null);
  const [ownerIdDoc, setOwnerIdDoc] = React.useState<Doc | null>(null);
  const [storeImages, setStoreImages] = React.useState<Doc[]>([]);
  // ===== CATEGORY FETCHING =====
const [categories, setCategories] = React.useState<FoodType[]>([]);
const [loadingCategories, setLoadingCategories] = React.useState(true);

React.useEffect(() => {
  const load = async () => {
    try {
      const data = await getCategories();
      console.log("Received categories:", data);

      const mapped: FoodType[] = data.map((c) => ({
        id: String(c.id),
        label: c.name,
      }));

      setCategories(mapped);

      if (!foodType && mapped.length > 0) {
        setFoodType(mapped[0]);
      }
    } catch (e) {
      console.log("Failed to load categories:", e);
    } finally {
      setLoadingCategories(false);
    }
  };

  load();
}, [foodType]);

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
    if (!canSave || !isLoaded || !ownerUserId) return;
    if (submittingRef.current) return;

    submittingRef.current = true;
    setSaving(true);

    try {
      if (!commercialReg || !ownerIdDoc) throw new Error("Missing required documents");

      // Upload files
      const commercialUpload = await uploadFile(commercialReg, "merchant-docs");
      const ownerIdUpload = await uploadFile(ownerIdDoc, "merchant-docs");
      const storeUploads = await Promise.all(
        storeImages.map((img) => uploadFile(img, "store-images"))
      );

      const payload = {
        id: "", // will be set by backend
        ownerUserId,
        displayName: brandName.trim(),
        categoryId: foodType?.id ?? "",
        address: {
          label: null,
          line1: address,
          line2: district,
          city: subdistrict,
          province: city,
          postalCode,
          lat: Number(lat),
          lng: Number(lng),
        },
        branchName: "",
        description: "",
        openHours: "",
        listImageUrl: storeUploads[0]?.url ?? "",
        storeImageUrl: storeUploads[0]?.url ?? "",
        files: [
          { kind: "COMMERCIAL_REG", url: commercialUpload.url, label: commercialReg.name },
          { kind: "OWNER_ID", url: ownerIdUpload.url, label: ownerIdDoc.name },
          ...storeUploads.map((u, i) => ({
            kind: "STORE_IMAGE",
            url: u.url,
            label: storeImages[i]?.name ?? "Store image",
          })),
        ],
      };

      const res = await createMerchantInfo(payload);

      if (!res || !res.merchant) throw new Error("Failed to save merchant info");

      // Update Clerk metadata & onboarding
      await user?.update({ unsafeMetadata: { ...(user.unsafeMetadata ?? {}), storeInfoSubmitted: true } });
      await setStep(user!, "notifyPage");
      await user?.reload();

      router.replace("./(auth)/notifyPage");
    } catch (err: any) {
      console.log("ERROR:", err);
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

        {loadingCategories ? (
        <Text style={{ color: "#6B7280", marginBottom: 10 }}>Loading food types…</Text>
        ) : (
        <FoodTypePicker
          value={foodType}
          onChange={setFoodType}
          options={categories}
          required
          errorText={!foodType ? "Please select a food type." : undefined}
          />
        )}


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