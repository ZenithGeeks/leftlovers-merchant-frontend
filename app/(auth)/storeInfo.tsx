// app/(auth)/storeInfo.tsx
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
import createMerchantInfo from "@/app/api/merchant";
import { uploadFile } from "@/services/upload";

type Doc = DocumentPicker.DocumentPickerAsset;
const DEV = __DEV__;

export default function StoreInfo() {
  const router = useRouter();
  const params = useLocalSearchParams() as { userId?: string };

  // This is the Prisma user.id from /api/merchant/user
  const ownerUserId = params.userId ?? null;

  // ---------------- HOOKS: STATE ----------------
  const [brandName, setBrandName] = React.useState(DEV ? "WakeUp Cafe" : "");
  const [address, setAddress] = React.useState(DEV ? "123 Sukhumvit 10" : "");
  const [city, setCity] = React.useState(DEV ? "Bangkok" : "");
  const [district, setDistrict] = React.useState(DEV ? "Khlong Toei" : "");
  const [subdistrict, setSubdistrict] = React.useState(DEV ? "Khlong Toei" : "");
  const [postalCode, setPostalCode] = React.useState(DEV ? "10110" : "");

  const [lat, setLat] = React.useState(DEV ? "13.736717" : "");
  const [lng, setLng] = React.useState(DEV ? "100.523186" : "");

  const [foodType, setFoodType] = React.useState<FoodType | null>(null);
  const [categories, setCategories] = React.useState<FoodType[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState(true);

  const [commercialReg, setCommercialReg] = React.useState<Doc | null>(null);
  const [ownerIdDoc, setOwnerIdDoc] = React.useState<Doc | null>(null);
  const [storeImages, setStoreImages] = React.useState<Doc[]>([]);

  const [saving, setSaving] = React.useState(false);
  const submittingRef = React.useRef(false);

  // ---------------- HOOKS: EFFECTS ----------------
  // Fetch categories once
  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await getCategories();
        const mapped: FoodType[] = data.map((c: any) => ({
          id: String(c.id),
          label: c.name,
        }));
        setCategories(mapped);
        if (!foodType && mapped.length > 0) {
          setFoodType(mapped[0]);
        }
      } catch (err) {
        console.error("Category fetch failed:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    load();
  }, [foodType]);

  // ---------------- EARLY RETURN (SAFE: AFTER HOOKS) ----------------
  if (!ownerUserId) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, textAlign: "center", paddingHorizontal: 24 }}>
          No userId provided. Please go through the sign-up flow again.
        </Text>
      </SafeAreaView>
    );
  }

  // ---------------- HELPERS: PICKERS ----------------
  const pickOne = async (types: DocumentPicker.DocumentPickerOptions["type"]) => {
    const res = await DocumentPicker.getDocumentAsync({ type: types });
    if (res.canceled) return null;
    return res.assets[0];
  };

  const pickManyImages = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ["image/*"],
      multiple: true,
    });
    if (!res.canceled) {
      setStoreImages((prev) => [...prev, ...res.assets].slice(0, 5));
    }
  };

  const clearCommercialReg = () => setCommercialReg(null);
  const clearOwnerIdDoc = () => setOwnerIdDoc(null);
  const removeStoreImage = (idx: number) =>
    setStoreImages((prev) => prev.filter((_, i) => i !== idx));

  // ---------------- VALIDATION ----------------
  const isBrandNameValid =
    brandName.trim().length >= 2 && brandName.trim().length <= 250;
  const isValidPostal = /^\d{5}$/.test(postalCode);
  const isValidLat =
    lat !== "" && !Number.isNaN(Number(lat)) && Math.abs(Number(lat)) <= 90;
  const isValidLng =
    lng !== "" && !Number.isNaN(Number(lng)) && Math.abs(Number(lng)) <= 180;
  const hasUploads =
    !!commercialReg && !!ownerIdDoc && storeImages.length > 0 && !!foodType;

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

  // ---------------- SAVE HANDLER ----------------
  const onSave = async () => {
    if (!canSave || saving || submittingRef.current) return;

    submittingRef.current = true;
    setSaving(true);

    try {
      if (!commercialReg || !ownerIdDoc) {
        throw new Error("Missing required documents.");
      }

      // 1) Upload files
      const commercial = await uploadFile(commercialReg, "merchant-docs");
      const idDoc = await uploadFile(ownerIdDoc, "merchant-docs");
      const imgs = await Promise.all(
        storeImages.map((img) => uploadFile(img, "store-images"))
      );

      // 2) Build payload matching CreateMerchantBody & backend schema
      const payload = {
        id: "", // backend assigns merchant id
        ownerUserId, // Prisma user.id
        displayName: brandName.trim(),
        branchName: "",
        description: "",
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
        openHours: "",
        listImageUrl: imgs[0]?.url ?? null,
        storeImageUrl: imgs[0]?.url ?? null,
        files: [
          {
            kind: "COMMERCIAL_REG",
            url: commercial.url,
            label: commercialReg.name,
          },
          {
            kind: "OWNER_ID",
            url: idDoc.url,
            label: ownerIdDoc.name,
          },
          ...imgs.map((u, i) => ({
            kind: "STORE_IMAGE",
            url: u.url,
            label: storeImages[i]?.name ?? "Store image",
          })),
        ],
      };

      const res = await createMerchantInfo(payload);

      if (!res || !("merchant" in res) || !res.merchant) {
        throw new Error("Failed to save merchant info.");
      }

      Alert.alert("Success", "Store information saved.", [
        {
          text: "OK",
          onPress: () => {
            // go to next onboarding step (adjust route if needed)
            router.replace("/(auth)/notifyPage");
          },
        },
      ]);
    } catch (err: any) {
      console.error("Save error:", err);
      Alert.alert("Save failed", err?.message ?? "Something went wrong.");
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  // ---------------- UI ----------------
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
          style={{
            color: "#6B7280",
            marginTop: 4,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Fill your store details to display to customers
        </Text>

        <InputBox
          label="Brand name *"
          value={brandName}
          onChangeText={setBrandName}
          placeholder="e.g. WakeUp"
          errorText={
            !isBrandNameValid
              ? "Brand name must be 2–250 characters."
              : undefined
          }
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
          errorText={
            !isValidPostal ? "Postal code must be exactly 5 digits." : undefined
          }
        />

        {loadingCategories ? (
          <Text style={{ color: "#6B7280", marginBottom: 10 }}>
            Loading food types…
          </Text>
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
          onRemove={removeStoreImage}
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
