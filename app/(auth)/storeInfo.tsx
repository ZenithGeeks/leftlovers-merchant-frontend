// app/(auth)/storeInfo.tsx

import { getCategories } from "@/app/api/getCategories";
import { createMerchantInfo } from "@/app/api/merchant";
import { ClickButton } from "@/components/Authen/ClickButton";
import { InputBox } from "@/components/Authen/InputBox";
import LocationPicker from "@/components/Authen/LocationPicker.native";
import FoodTypePicker, { FoodType } from "@/components/Authen/menuType";
import UploadFile from "@/components/Authen/UploadFile";
import UploadImagesGrid from "@/components/Authen/UploadImages";
import { ProcessingScreen } from "@/components/common/processingScreen";
import { auth } from "@/lib/firebase";
import { uploadFile } from "@/services/upload";
import { CreateMerchantBody } from "@/types/types";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { type User as FirebaseUser } from "firebase/auth";
import React from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuthBusinessHoursForm, {
  DayHour,
} from "@/components/Authen/AuthBusinessHoursForm";
import TimePickerModal from "@/components/store/TimePickerModal";

// ------------------------------
// Helpers for time
// ------------------------------

function minutesOfDay(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}

function isValidDayHour(open: Date, close: Date) {
  return minutesOfDay(close) > minutesOfDay(open);
}

function mkTime(h: number, m: number) {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}
function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function fmtTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const DAY_META = [
  { ui: "Monday", key: "mon" },
  { ui: "Tuesday", key: "tue" },
  { ui: "Wednesday", key: "wed" },
  { ui: "Thursday", key: "thu" },
  { ui: "Friday", key: "fri" },
  { ui: "Saturday", key: "sat" },
  { ui: "Sunday", key: "sun" },
];

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

  let ownerUserId = "";
  if (user?.uid) {
    ownerUserId = user.uid;
  } else {
    router.replace("/(auth)/signup");
  }

  // ------------------------------
  // State
  // ------------------------------
  const [brandName, setBrandName] = React.useState(DEV ? "WakeUp Cafe" : "");
  const [address, setAddress] = React.useState(DEV ? "123 Sukhumvit 10" : "");
  const [city, setCity] = React.useState(DEV ? "Bangkok" : "");
  const [district, setDistrict] = React.useState(DEV ? "Khlong Toei" : "");
  const [subdistrict, setSubdistrict] = React.useState(
    DEV ? "Khlong Toei" : ""
  );
  const [postalCode, setPostalCode] = React.useState(DEV ? "10110" : "");

  const [lat, setLat] = React.useState(DEV ? "13.736717" : "");
  const [lng, setLng] = React.useState(DEV ? "100.523186" : "");

  const [foodType, setFoodType] = React.useState<FoodType | null>(null);
  const [categories, setCategories] = React.useState<FoodType[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState(true);

  const [commercialReg, setCommercialReg] = React.useState<DocFile | null>(
    null
  );
  const [ownerIdDoc, setOwnerIdDoc] = React.useState<DocFile | null>(null);
  const [storeImages, setStoreImages] = React.useState<DocFile[]>([]);

  const [saving, setSaving] = React.useState(false);
  const submittingRef = React.useRef(false);

  // ------------------------------
  // Business Hours State (+ Default)
  // ------------------------------
  const [hours, setHours] = React.useState<DayHour[]>([]);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [pickerTarget, setPickerTarget] = React.useState<{
    index: number;
    field: "open" | "close";
  } | null>(null);

  React.useEffect(() => {
    if (hours.length === 0) {
      setHours(
        DAY_META.map((d) => ({
          day: d.ui,
          open: mkTime(9, 0),
          close: mkTime(18, 0),
          closed: false,
        }))
      );
    }
  }, [hours.length]);

  const openPicker = (i: number, field: "open" | "close") => {
    setPickerTarget({ index: i, field });
    setPickerOpen(true);
  };

  const closePicker = () => setPickerOpen(false);

  const setTime = (d: Date) => {
    if (!pickerTarget) return;

    setHours((prev) => {
      const n = [...prev];
      const idx = pickerTarget.index;
      const field = pickerTarget.field;

      const updated = { ...n[idx], [field]: d };

      if (
        !updated.closed &&
        minutesOfDay(updated.close) <= minutesOfDay(updated.open)
      ) {
        updated.close = mkTime(
          updated.open.getHours() + 1,
          updated.open.getMinutes()
        );
      }

      n[idx] = updated;
      return n;
    });
  };

  const setClosedState = (i: number, closed: boolean) => {
    setHours((prev) => {
      const n = [...prev];
      n[i] = { ...n[i], closed };
      return n;
    });
  };

  const currentValue =
    pickerTarget && hours[pickerTarget.index]
      ? hours[pickerTarget.index][pickerTarget.field]
      : mkTime(9, 0);

  // ------------------------------
  // Load categories
  // ------------------------------
  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await getCategories();
        const mapped = data.map((c: any) => ({
          id: String(c.id),
          label: c.name,
        }));

        setCategories(mapped);
        if (!foodType) setFoodType(mapped[0]);
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
  ) => {
    const res = await DocumentPicker.getDocumentAsync({ type });
    if (res.canceled) return null;

    const f = res.assets[0];
    return {
      uri: f.uri,
      name: f.name ?? "file",
      mimeType: f.mimeType ?? null,
      size: f.size ?? null,
    };
  };

  const pickManyImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission to access gallery is required.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ FIX: compatible with your version
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
    });

    if (res.canceled) return;

    const imgs = res.assets.map((f) => ({
      uri: f.uri,
      name: f.fileName ?? "image.jpg",
      mimeType: f.mimeType ?? "image/jpeg",
      size: f.fileSize ?? null,
    }));

    setStoreImages((prev) => [...prev, ...imgs].slice(0, 5));
  };

  // ------------------------------
  // Validation
  // ------------------------------

  const isBrandNameValid =
    brandName.trim().length >= 2 && brandName.trim().length <= 250;
  const isValidPostal = /^\d{5}$/.test(postalCode);

  const isValidLat = lat !== "" && !isNaN(Number(lat));
  const isValidLng = lng !== "" && !isNaN(Number(lng));

  const hasUploads = commercialReg && ownerIdDoc && storeImages.length > 0;

  const canSave =
    isBrandNameValid &&
    address.trim().length > 3 &&
    city.trim() &&
    district.trim() &&
    subdistrict.trim() &&
    isValidPostal &&
    isValidLat &&
    isValidLng &&
    foodType &&
    hasUploads;

  // ------------------------------
  // Save Handler (UPDATED: includes openHours)
  // ------------------------------

  const onSave = async () => {
    if (!canSave || saving || submittingRef.current) return;
    submittingRef.current = true;
    setSaving(true);

    try {
      if (!commercialReg || !ownerIdDoc)
        throw new Error("Missing required documents.");
      for (let i = 0; i < hours.length; i++) {
        const h = hours[i];
        if (!h.closed && !isValidDayHour(h.open, h.close)) {
          Alert.alert(
            "Invalid business hours",
            `${DAY_META[i].ui}: Close time must be later than open time`
          );
          return;
        }
      }
      // Upload docs
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
      // Build OpenHours (UPDATED)
      // ------------------------------

      const weekly: Record<string, any[]> = {};
      hours.forEach((item, i) => {
        const key = DAY_META[i].key;
        weekly[key] = item.closed
          ? []
          : [{ open: fmtTime(item.open), close: fmtTime(item.close) }];
      });

      // ------------------------------
      // Payload
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

        openHours: {
          weekly,
          timezone: "Asia/Bangkok",
          exceptions: [],
        },

        listImageUrl: imgs[0]?.url ?? null,
        storeImageUrl: imgs[0]?.url ?? null,

        files: [
          {
            kind: "COMMERCIAL_REG",
            url: commercial.url,
            label: commercialReg.name,
          },
          { kind: "OWNER_ID", url: idDoc.url, label: ownerIdDoc.name },
          ...imgs.map((u, i) => ({
            kind: "STORE_IMAGE" as const,
            url: u.url,
            label: storeImages[i]?.name,
          })),
        ],
      };

      const res = await createMerchantInfo(payload);

      if (!res || !("merchant" in res))
        throw new Error("Failed to save merchant info.");

      Alert.alert("Success", "Store information saved.", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/notifyPage"),
        },
      ]);
    } catch (err: any) {
      console.error("Save error:", err);
      Alert.alert("Save failed", err.message ?? "Unknown error.");
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

        {/* LOCATION */}
        <View style={{ marginTop: 15, marginBottom: -15 }}>
          <LocationPicker
            lat={lat}
            lng={lng}
            onChange={(a, b) => {
              setLat(a);
              setLng(b);
            }}
          />
        </View>

        {/* ADDRESS */}
        <InputBox label="Address *" value={address} onChangeText={setAddress} />
        <InputBox label="City *" value={city} onChangeText={setCity} />
        <InputBox
          label="District *"
          value={district}
          onChangeText={setDistrict}
        />
        <InputBox
          label="Subdistrict *"
          value={subdistrict}
          onChangeText={setSubdistrict}
        />

        <InputBox
          label="Postal Code *"
          value={postalCode}
          onChangeText={(t) => setPostalCode(t.replace(/\D/g, "").slice(0, 5))}
          keyboardType="number-pad"
          errorText={
            !isValidPostal ? "Postal code must be exactly 5 digits." : undefined
          }
        />

        {/* CATEGORY PICKER */}
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
          />
        )}

        {/* BUSINESS HOURS */}
        <View style={{ marginTop: 5, marginBottom: -45 }}>
          <Text
            style={{
              marginBottom: -10,
              fontSize: 15,
              fontWeight: "500",
              color: "#11181C",
            }}
          >
            Business Hours *
          </Text>

          <AuthBusinessHoursForm
            hours={hours}
            error={null}
            openPicker={openPicker}
            setClosedState={setClosedState}
            bottomPadding={20}
            fmtTime={fmtTime}
          />
        </View>

        {/* UPLOADS */}
        <UploadFile
          label="Commercial Registration *"
          file={commercialReg ?? undefined}
          onPick={async () => {
            const f = await pickOne(["application/pdf"]);
            if (f) setCommercialReg(f);
          }}
          onClear={commercialReg ? () => setCommercialReg(null) : undefined}
          emptyText="Upload PDF"
        />

        <UploadFile
          label="Owner National ID Card *"
          file={ownerIdDoc ?? undefined}
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

      {/* TIME PICKER MODAL */}
      <TimePickerModal
        visible={pickerOpen}
        value={currentValue}
        onChange={setTime}
        onClose={closePicker}
        title={
          pickerTarget
            ? `${DAY_META[pickerTarget.index].ui} - ${
                pickerTarget.field === "open" ? "Open" : "Close"
              } time`
            : "Select time"
        }
      />
    </SafeAreaView>
  );
}
