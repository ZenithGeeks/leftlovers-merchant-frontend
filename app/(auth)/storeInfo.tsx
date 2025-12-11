// app/(auth)/storeInfo.tsx

import { ClickButton } from "@/components/Authen/ClickButton";
import { InputBox } from "@/components/Authen/InputBox";
import LocationPicker from "@/components/Authen/LocationPicker.native";
import FoodTypePicker, { FoodType } from "@/components/Authen/menuType";
import UploadFile from "@/components/Authen/UploadFile";
import UploadImagesGrid from "@/components/Authen/UploadImages";
import * as DocumentPicker from "expo-document-picker";
import {
  type User as FirebaseUser,
} from "firebase/auth";
import React from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getCategories } from "@/app/api/getCategories";
import { createMerchantInfo } from "@/app/api/merchant";
import { ProcessingScreen } from "@/components/common/processingScreen";
import { auth } from "@/lib/firebase";
import { uploadFile } from "@/services/upload";
import { CreateMerchantBody } from "@/types/types";
import { useRouter } from "expo-router";
// ------------------------------
// Strict Types
// ------------------------------

type DocFile = {
  uri: string;
  name: string;
  mimeType: string | null;
  size: number | null;
};


const DEV = __DEV__;

export default function StoreInfo() {
  const router = useRouter();
  const user = auth.currentUser as FirebaseUser | null;
  let ownerUserId = ""
  if(user){
    if(user.uid){
      ownerUserId = user.uid
    }
    else{
      router.replace('/(auth)/signup')
    }
  }
  // ------------------------------
  // State
  // ------------------------------

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

  const [commercialReg, setCommercialReg] = React.useState<DocFile | null>(null);
  const [ownerIdDoc, setOwnerIdDoc] = React.useState<DocFile | null>(null);
  const [storeImages, setStoreImages] = React.useState<DocFile[]>([]);

  const [saving, setSaving] = React.useState(false);
  const submittingRef = React.useRef(false);

  // ------------------------------
  // Load categories
  // ------------------------------

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await getCategories();
        const mapped = data.map(
          (c: any): FoodType => ({
            id: String(c.id),
            label: c.name,
          })
        );
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

  // ------------------------------
  // File pickers
  // ------------------------------

  const pickOne = async (
    type: DocumentPicker.DocumentPickerOptions["type"]
  ): Promise<DocFile | null> => {
    const res = await DocumentPicker.getDocumentAsync({ type });
    if (res.canceled) return null;

    const file = res.assets[0];

    return {
      uri: file.uri,
      name: file.name ?? "file",
      mimeType: file.mimeType ?? null,
      size: file.size ?? null,
    };
  };

  const pickManyImages = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ["image/*"],
      multiple: true,
    });

    if (!res.canceled) {
      const imgs = res.assets.map(
        (a): DocFile => ({
          uri: a.uri,
          name: a.name ?? "image.jpg",
          mimeType: a.mimeType ?? "image/jpeg",
          size: a.size ?? null,
        })
      );
      setStoreImages((prev) => [...prev, ...imgs].slice(0, 5));
    }
  };

  // ------------------------------
  // Validation
  // ------------------------------

  const isBrandNameValid =
    brandName.trim().length >= 2 && brandName.trim().length <= 250;

  const isValidPostal = /^\d{5}$/.test(postalCode);
  const isValidLat = lat !== "" && !isNaN(Number(lat));
  const isValidLng = lng !== "" && !isNaN(Number(lng));

  const hasUploads =
    !!commercialReg &&
    !!ownerIdDoc &&
    storeImages.length > 0 &&
    !!foodType;

  const canSave =
    isBrandNameValid &&
    address.trim().length > 3 &&
    city.trim() &&
    district.trim() &&
    subdistrict.trim() &&
    isValidPostal &&
    isValidLat &&
    isValidLng &&
    hasUploads;

  // ------------------------------
  // Save Handler
  // ------------------------------

  const onSave = async () => {
    if (!canSave || saving || submittingRef.current) return;

    submittingRef.current = true;
    setSaving(true);

    try {
      if (!commercialReg || !ownerIdDoc) {
        throw new Error("Missing required documents.");
      }

      // Upload main documents
      const commercial = await uploadFile(
        {
          uri: commercialReg.uri,
          name: commercialReg.name,
          type: commercialReg.mimeType ?? "application/pdf",
        },
        "merchant-docs"
      );

      const idDoc = await uploadFile(
        {
          uri: ownerIdDoc.uri,
          name: ownerIdDoc.name,
          type: ownerIdDoc.mimeType ?? "application/pdf",
        },
        "merchant-docs"
      );

      // Upload store images
      const imgs = await Promise.all(
        storeImages.map((img) =>
          uploadFile(
            {
              uri: img.uri,
              name: img.name,
              type: img.mimeType ?? "image/jpeg",
            },
            "store-images"
          )
        )
      );

      // ------------------------------
      // Build final payload (type-safe)
      // ------------------------------

      const payload: CreateMerchantBody = {
        ownerUserId,
        displayName: brandName.trim(),
        branchName: "",
        description: "",
        categoryId: foodType!.id,
        address: {
          label: "",
          line1: address,
          line2: district,
          city: subdistrict,
          province: city,
          postalCode,
          lat: Number(lat),
          lng: Number(lng),
        },
        openHours: null,
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
            kind: "STORE_IMAGE" as const,
            url: u.url,
            label: storeImages[i]?.name ?? "Store image",
          })),
        ],
      };
      const res = await createMerchantInfo(payload);

      if (!res || !("merchant" in res)) {
        throw new Error("Failed to save merchant info.");
      }

      Alert.alert("Success", "Store information saved.", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/notifyPage"),
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

  // ------------------------------
  // UI
  // ------------------------------

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 28, paddingBottom: 40 }}
      >
        {/* Title */}
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

        {/* Form Fields */}
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

        <InputBox label="Address *" value={address} onChangeText={setAddress} />
        <InputBox label="City *" value={city} onChangeText={setCity} />
        <InputBox label="District *" value={district} onChangeText={setDistrict} />
        <InputBox label="Subdistrict *" value={subdistrict} onChangeText={setSubdistrict} />
        <InputBox
          label="Postal Code *"
          value={postalCode}
          onChangeText={(t) => setPostalCode(t.replace(/\D/g, "").slice(0, 5))}
          keyboardType="number-pad"
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

        {/* Uploads */}
        <UploadFile
          label="Commercial Registration *"
          file={
            commercialReg
              ? {
                  name: commercialReg.name,
                  uri: commercialReg.uri,
                  mimeType: commercialReg.mimeType,
                  size: commercialReg.size ?? undefined,
                }
              : undefined
          }
          onPick={async () => {
            const f = await pickOne(["application/pdf"]);
            if (f) setCommercialReg(f);
          }}
          onClear={commercialReg ? () => setCommercialReg(null) : undefined}
          emptyText="Upload PDF"
        />

        <UploadFile
          label="Owner National ID Card *"
          file={
            ownerIdDoc
              ? {
                  name: ownerIdDoc.name,
                  uri: ownerIdDoc.uri,
                  mimeType: ownerIdDoc.mimeType,
                  size: ownerIdDoc.size ?? undefined,
                }
              : undefined
          }
          onPick={async () => {
            const f = await pickOne(["application/pdf", "image/*"]);
            if (f) setOwnerIdDoc(f);
          }}
          onClear={ownerIdDoc ? () => setOwnerIdDoc(null) : undefined}
          emptyText="Upload PDF / Image"
        />

        <UploadImagesGrid
          files={storeImages.map((f) => ({ name: f.name, uri: f.uri }))}
          max={5}
          onAdd={pickManyImages}
          onRemove={(i) =>
            setStoreImages((prev) => prev.filter((_, idx) => idx !== i))
          }
        />

        {/* Save Button */}
        <View style={{ marginTop: 20 }}>
          <ClickButton
            label={saving ? "Saving…" : "Save information"}
            onPress={onSave}
            disabled={!canSave || saving}
          />
        </View>
          <ProcessingScreen
            visible={saving}
            title="Setting up your store"
            description="We’re uploading your documents and saving your merchant profile."
            helperText="This may take a few moments, especially with large images. Please keep this screen open."
            cancellable={false}
          />
      </ScrollView>
    </SafeAreaView>
  );
}
