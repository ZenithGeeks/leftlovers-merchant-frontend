// app/edit-store.tsx
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";

import { Fonts } from "@/constants/theme";
import { fetchStoreSettings, type StoreSettings } from "@/services/store";
import { DEV_MERCHANT_ID } from "@/utils/env";

import {
  ChevronRightIcon,
  ChevronLeftIcon,
  MapPinIcon,
  UserIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  BuildingStorefrontIcon,
  PhotoIcon,
  ClipboardDocumentIcon,
} from "react-native-heroicons/outline";

const MERCHANT_ID =
  DEV_MERCHANT_ID || process.env.EXPO_PUBLIC_MERCHANT_ID || "";

function Divider() {
  return <View className="h-[1px] w-full bg-gray-200 my-5" />;
}

function Row({
  icon,
  title,
  subtitle,
  onPress,
  rightSlot,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightSlot?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="w-full flex-row items-center py-4 active:bg-gray-50"
      accessibilityRole={onPress ? "button" : undefined}
    >
      <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center mr-3">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-[16px] font-semibold text-[#11181C]">
          {title}
        </Text>
        {!!subtitle && (
          <Text className="text-[13px] text-gray-500 mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
      <View className="ml-2">
        {rightSlot ??
          (onPress ? <ChevronRightIcon size={20} color="#11181C" /> : null)}
      </View>
    </Pressable>
  );
}

const DAY_LABELS: {
  key: keyof NonNullable<NonNullable<StoreSettings["businessHours"]>["weekly"]>;
  label: string;
}[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

export default function EditStoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [store, setStore] = React.useState<StoreSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  // 🔁 Refetch whenever screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;

      async function load() {
        setLoading(true);
        setErr(null);

        try {
          if (!MERCHANT_ID) {
            throw new Error("Missing merchant id");
          }
          const data = await fetchStoreSettings(MERCHANT_ID);
          if (!cancelled) {
            setStore(data);
          }
        } catch (e: any) {
          if (!cancelled) {
            console.error("Failed to load store settings:", e);
            setErr(e?.message ?? "Failed to load store settings");
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }

      load();

      return () => {
        cancelled = true;
      };
    }, [])
  );

  const addressLine = [
    store?.address?.line1,
    store?.address?.line2,
    store?.address?.city,
    store?.address?.province,
    store?.address?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  const weekly = store?.businessHours?.weekly;

  const handleCopyStoreId = async () => {
    if (!store?.storeId) return;
    try {
      await Clipboard.setStringAsync(store.storeId);
      Alert.alert("Copied", "Store ID copied to clipboard.");
    } catch (e) {
      console.error("Copy store ID failed:", e);
    }
  };

  if (loading) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator />
        <Text className="mt-2 text-gray-500">Loading store…</Text>
      </View>
    );
  }

  if (err || !store) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center px-6"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-red-600 mb-2 font-semibold">
          {err ?? "Failed to load store"}
        </Text>
        <Text className="text-gray-500 text-center">
          Please check your connection or try again later.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <View
        className="bg-white"
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 20 }}
      >
        {/* Header with back button */}
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
            accessibilityLabel="back"
          >
            <ChevronLeftIcon size={18} color="#11181C" />
          </Pressable>
          <Text
            className="text-[24px] font-extrabold text-[#0B1220]"
            style={{ fontFamily: Fonts.bold }}
          >
            Edit store
          </Text>
          {/* spacer to balance layout */}
          <View className="w-9 h-9" />
        </View>

        {/* Store name + edit detail button */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[22px] font-extrabold text-[#0B1220]">
            {store.name ?? "Unnamed store"}
          </Text>
          <Pressable
            onPress={() => router.push("/edit-store-detail")}
            className="w-8 h-8 rounded-full items-center justify-center active:bg-gray-100"
            accessibilityLabel="edit-store-detail"
          >
            <ChevronRightIcon size={18} color="#11181C" />
          </Pressable>
        </View>

        {/* === Images section === */}
        <View className="gap-6 mb-4">
          {/* Store image */}
          <View className="flex-row items-start gap-4">
            <View className="w-32 h-32 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden items-center justify-center">
              {store.storeImage ? (
                <Image
                  source={{ uri: store.storeImage }}
                  resizeMode="cover"
                  className="w-full h-full"
                />
              ) : (
                <PhotoIcon size={28} color="#22C55E" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-[16px] font-semibold text-[#11181C]">
                Store image
              </Text>
              <Text className="text-[13px] text-gray-500 mt-1">
                This is the image for the top of your store menu.
              </Text>
            </View>
          </View>

          {/* List image */}
          <View className="flex-row items-start gap-4">
            <View className="w-32 h-32 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden items-center justify-center">
              {store.listImage ? (
                <Image
                  source={{ uri: store.listImage }}
                  resizeMode="cover"
                  className="w-full h-full"
                />
              ) : (
                <PhotoIcon size={28} color="#22C55E" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-[16px] font-semibold text-[#11181C]">
                List image
              </Text>
              <Text className="text-[13px] text-gray-500 mt-1">
                This image will appear alongside other businesses when customers
                browse the restaurant list.
              </Text>
            </View>
          </View>
        </View>

        <Divider />

        {/* Cuisine */}
        <Row
          icon={<AdjustmentsHorizontalIcon size={18} color="#22C55E" />}
          title="Cuisine and certification"
          subtitle={
            store.cuisine?.certification
              ? `${store.cuisine?.type ?? "Unknown"} • ${
                  store.cuisine?.certification
                }`
              : store.cuisine?.type ?? "Unknown"
          }
          onPress={() => router.push("/edit-cuisine-certification")}
        />

        <Divider />

        {/* Business hours preview – compact like the screenshot */}
        <View className="w-full">
          <Row
            icon={<ClockIcon size={18} color="#22C55E" />}
            title="Business hours"
            onPress={() => router.push("/edit-business-hours")}
          />

          <View className="mt-1 pl-12">
            {weekly ? (
              DAY_LABELS.map(({ key, label }) => {
                const slots = (weekly?.[key] ?? []) as {
                  open: string;
                  close: string;
                }[];
                const isClosed = !slots || slots.length === 0;

                const text = isClosed
                  ? "Closed"
                  : slots
                      .map(
                        (s: { open: string; close: string }) =>
                          `${s.open}-${s.close}`
                      )
                      .join(", ");

                return (
                  <View key={String(key)} className="flex-row py-0.5">
                    <Text className="w-10 text-[13px] text-gray-500">
                      {label}
                    </Text>
                    <Text className="ml-4 text-[13px] text-gray-500">
                      {text}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text className="text-[14px] text-gray-500">
                Not configured yet.
              </Text>
            )}
          </View>
        </View>

        <Divider />

        {/* Owner contact */}
        <Row
          icon={<UserIcon size={18} color="#22C55E" />}
          title="Owner contact"
          subtitle={`${store.owner?.phone ?? "-"}\n${
            store.owner?.email ?? "-"
          }`}
          onPress={() => router.push("/edit-owner-contact")}
        />

        <Divider />

        {/* Address */}
        <Row
          icon={<MapPinIcon size={18} color="#22C55E" />}
          title="Address"
          subtitle={addressLine || "-"}
          onPress={() => router.push("/edit-address")}
        />

        <Divider />

        {/* Store ID with copy button */}
        <Row
          icon={<BuildingStorefrontIcon size={18} color="#22C55E" />}
          title="Store ID"
          subtitle={store.storeId}
          rightSlot={
            <Pressable
              onPress={handleCopyStoreId}
              accessibilityLabel="copy-store-id"
              className="flex-row items-center px-3 py-1 rounded-full bg-gray-100"
            >
              <ClipboardDocumentIcon size={16} color="#11181C" />
              <Text className="ml-1 text-xs text-[#11181C]">Copy</Text>
            </Pressable>
          }
        />
      </View>
    </ScrollView>
  );
}
