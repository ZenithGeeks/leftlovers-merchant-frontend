// app/edit-store.tsx  (full file for convenience)
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import storeData from "@/mockupData/storeData.json";
import { Fonts } from "@/constants/theme";

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

  const addressLine = [
    storeData.address.line1,
    storeData.address.line2,
    storeData.address.city,
    storeData.address.province,
    storeData.address.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

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
          Settings
        </Text>

        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[22px] font-extrabold text-[#0B1220]">
            {storeData.name}
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
              {storeData.storeImage ? (
                <Image source={{ uri: storeData.storeImage}} resizeMode="cover" className="w-full h-full" />
              ) : (
                <PhotoIcon size={28} color="#22C55E" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-[16px] font-semibold text-[#11181C]">Store image</Text>
              <Text className="text-[13px] text-gray-500 mt-1">
                This is the image for the top of your store menu.
              </Text>
            </View>
          </View>

          {/* List image row */}
          <View className="flex-row items-start gap-4">
            <View className="w-32 h-32 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden items-center justify-center">
              {storeData.listImage ? (
                <Image source={{ uri: storeData.listImage }} resizeMode="cover" className="w-full h-full" />
              ) : (
                <PhotoIcon size={28} color="#22C55E" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-[16px] font-semibold text-[#11181C]">List image</Text>
              <Text className="text-[13px] text-gray-500 mt-1">
                This image will appear alongside other businesses when customers browse the restaurant list.
              </Text>
            </View>
          </View>
        </View>

        <Divider />

        <Row
          icon={<AdjustmentsHorizontalIcon size={18} color="#22C55E" />}
          title="Cuisine and certification"
          subtitle={
            storeData.cuisine.certification
              ? `${storeData.cuisine.type} • ${storeData.cuisine.certification}`
              : storeData.cuisine.type
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
            {storeData.businessHours.map((h: { day: string; hours: string }) => (
              <View key={h.day} className="flex-row items-center justify-between pr-2 py-1">
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
          subtitle={`${storeData.owner.phone}\n${storeData.owner.email}`}
          onPress={() => router.push("/edit-owner-contact")}
        />

        <Divider />

        <Row
          icon={<PhoneIcon size={18} color="#22C55E" />}
          title="Store contact number"
          subtitle={storeData.contact.storePhone}
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
          subtitle={storeData.storeId}
        />
      </View>
    </ScrollView>
  );
}
