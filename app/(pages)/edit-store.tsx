// app/(pages)/edit-store.tsx
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";

import { Fonts } from "@/constants/theme";
import { fetchStoreSettings, type StoreSettings } from "@/services/store";
import { ThemedView } from "@/components/themed-view";

import {
  ChevronRightIcon,
  ChevronLeftIcon,
  MapPinIcon,
  UserIcon,
  AdjustmentsHorizontalIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentIcon,
} from "react-native-heroicons/outline";

import Divider from "@/components/store/Divider";
import Row from "@/components/store/Row";
import StoreImagesSection from "@/components/store/StoreImagesSection";
import BusinessHoursPreview from "@/components/store/BusinessHoursPreview";
import LogoutConfirmModal from "@/components/store/LogoutConfirmModal";
import { logoutFirebase } from "@/services/auth";

type EditStoreParams = { merchantId?: string };

export default function EditStoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<EditStoreParams>();

  // 🔹 EXACT same pattern as AddItemScreen
  const merchantId = params.merchantId ?? "";

  const [store, setStore] = React.useState<StoreSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  const [logoutVisible, setLogoutVisible] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  // 🔁 Refetch whenever screen gains focus or merchantId changes
  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;

      async function load() {
        setLoading(true);
        setErr(null);

        try {
          if (!merchantId) {
            throw new Error("Missing merchant id");
          }
          const data = await fetchStoreSettings(merchantId);
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
    }, [merchantId])
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

  const weekly = (store as any)?.businessHours?.weekly;

  const handleCopyStoreId = async () => {
    if (!store?.storeId) return;
    try {
      await Clipboard.setStringAsync(store.storeId);
      Alert.alert("Copied", "Store ID copied to clipboard.");
    } catch (e) {
      console.error("Copy store ID failed:", e);
    }
  };

  const handleConfirmLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      await logoutFirebase();
      setLogoutVisible(false);
      router.replace("/(landing)");
    } catch (e: any) {
      console.error("Logout failed:", e);
      Alert.alert("Logout failed", e?.message ?? "Please try again.");
    } finally {
      setLoggingOut(false);
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

  // 🔴 Same “Missing merchant id” guard as before
  if (!merchantId) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center px-6"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-red-600 mb-2 font-semibold">
          Missing merchant id
        </Text>
        <Text className="text-gray-500 text-center">
          This screen must be opened with a merchantId param.
        </Text>
        <Text className="mt-2 text-xs text-gray-400 text-center">
          Example: /edit-store?merchantId=MERCHANT_ID_HERE
        </Text>
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
    <ThemedView className="flex-1 bg-white">
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
              onPress={() =>
                router.push({
                  pathname: "/edit-store-detail",
                  params: { merchantId },
                })
              }
              className="w-8 h-8 rounded-full items-center justify-center active:bg-gray-100"
              accessibilityLabel="edit-store-detail"
            >
              <ChevronRightIcon size={18} color="#11181C" />
            </Pressable>
          </View>

          {/* === Images section === */}
          <StoreImagesSection
            storeImage={store.storeImage}
            listImage={store.listImage}
          />

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
            onPress={() =>
              router.push({
                pathname: "/edit-cuisine-certification",
                params: { merchantId },
              })
            }
          />

          <Divider />

          {/* Business hours preview */}
          <BusinessHoursPreview
            weekly={weekly}
            onPressEdit={() =>
              router.push({
                pathname: "/edit-business-hours",
                params: { merchantId },
              })
            }
          />

          <Divider />

          {/* Owner contact */}
          <Row
            icon={<UserIcon size={18} color="#22C55E" />}
            title="Owner contact"
            subtitle={`${store.owner?.phone ?? "-"}\n${
              store.owner?.email ?? "-"
            }`}
            onPress={() =>
              router.push({
                pathname: "/edit-owner-contact",
                params: { merchantId },
              })
            }
          />

          <Divider />

          {/* Address */}
          <Row
            icon={<MapPinIcon size={18} color="#22C55E" />}
            title="Address"
            subtitle={addressLine || "-"}
            onPress={() =>
              router.push({
                pathname: "/edit-address",
                params: { merchantId },
              })
            }
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

          {/* 🔴 Logout button */}
          <View className="mt-8">
            <Pressable
              onPress={() => setLogoutVisible(true)}
              accessibilityLabel="logout-button"
              className="w-full rounded-2xl py-3.5 items-center justify-center bg-red-50 border border-red-200"
            >
              <Text className="text-[15px] font-semibold text-red-600">
                Log out
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Logout confirmation modal */}
      <LogoutConfirmModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={handleConfirmLogout}
        loading={loggingOut}
      />
    </ThemedView>
  );
}
