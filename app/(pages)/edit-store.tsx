// app/edit-store.tsx
import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Fonts } from "@/constants/theme";
import { fetchStoreSettings, type StoreSettings } from "@/services/store";
import { DEV_MERCHANT_ID } from "@/utils/env";

import {
  ChevronRightIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  BuildingStorefrontIcon,
  PhotoIcon,
} from "react-native-heroicons/outline";

const MERCHANT_ID = DEV_MERCHANT_ID || "REPLACE_ME_MERCHANT_ID";

function Divider() {
  return <View className="h-[1px] w-full bg-gray-200 my-5" />;
}

function Row({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
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
        <Text className="text-[16px] font-semibold text-[#11181C]">{title}</Text>
        {!!subtitle && (
          <Text className="text-[13px] text-gray-500 mt-0.5">{subtitle}</Text>
        )}
      </View>
      {onPress ? <ChevronRightIcon size={20} color="#11181C" /> : null}
    </Pressable>
  );
}

export default function EditStoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [store, setStore] = React.useState<StoreSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const data = await fetchStoreSettings(MERCHANT_ID);
        if (!cancelled) {
          setStore(data);
        }
      } catch (e: any) {
        if (!cancelled) {
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
  }, []);

  const addressLine = [
    store?.address.line1,
    store?.address.line2,
    store?.address.city,
    store?.address.province,
    store?.address.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

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
        style={{ paddingTop: insets.top + 16, paddingHorizontal: 20 }}
      >
        <Text
          className="text-[28px] font-extrabold text-[#0B1220] mb-6"
          style={{ fontFamily: Fonts.bold }}
        >
          Edit store
        </Text>

        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[22px] font-extrabold text-[#0B1220]">
            {store.name}
          </Text>
          <Pressable
            onPress={() => router.push("/edit-store-detail")}
            className="w-8 h-8 rounded-full items-center justify-center active:bg-gray-100"
            accessibilityLabel="edit-store-detail"
          >
            <ChevronRightIcon size={18} color="#11181C" />
          </Pressable>
        </View>

        {/* === Images section: each row has image (left) + text (right) === */}
        <View className="gap-6 mb-4">
          {/* Store image row */}
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

          {/* List image row */}
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

        <Row
          icon={<AdjustmentsHorizontalIcon size={18} color="#22C55E" />}
          title="Cuisine and certification"
          subtitle={
            store.cuisine.certification
              ? `${store.cuisine.type ?? "Unknown"} • ${
                  store.cuisine.certification
                }`
              : store.cuisine.type ?? "Unknown"
          }
          onPress={() => router.push("/edit-cuisine-certification")}
        />

        <Divider />

        <View className="w-full">
          <Row
            icon={<ClockIcon size={18} color="#22C55E" />}
            title="Business hours"
            onPress={() => router.push("/edit-business-hours")}
          />
          <View className="mt-2 pl-12">
            {Array.isArray(store.businessHours) &&
              store.businessHours.map((h) => (
                <View
                  key={h.day}
                  className="flex-row items-center justify-between pr-2 py-1"
                >
                  <Text className="text-[15px] text-[#11181C]">{h.day}</Text>
                  <Text className="text-[15px] text-[#11181C]">{h.hours}</Text>
                </View>
              ))}
          </View>
        </View>

        <Divider />

        <Row
          icon={<UserIcon size={18} color="#22C55E" />}
          title="Owner’s contact"
          subtitle={`${store.owner.phone ?? "-"}\n${store.owner.email ?? "-"}`}
          onPress={() => router.push("/edit-owner-contact")}
        />

        <Divider />

        <Row
          icon={<PhoneIcon size={18} color="#22C55E" />}
          title="Store contact number"
          subtitle={store.contact.storePhone ?? "-"}
          onPress={() => router.push("/edit-store-contact")}
        />

        <Divider />

        <Row
          icon={<MapPinIcon size={18} color="#22C55E" />}
          title="Address"
          subtitle={addressLine}
          onPress={() => router.push("/edit-address")}
        />

        <Divider />

        <Row
          icon={<BuildingStorefrontIcon size={18} color="#22C55E" />}
          title="Store ID"
          subtitle={store.storeId}
        />
      </View>
    </ScrollView>
  );
}
