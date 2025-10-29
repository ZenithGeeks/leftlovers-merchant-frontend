import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import storeData from "@/mockupData/storeData.json";

import {
  ChevronRightIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "react-native-heroicons/outline";
import { CurrencyDollarIcon } from "react-native-heroicons/solid";
import { Colors, Fonts } from "@/constants/theme";

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

  const hoursPreview = storeData.businessHours
    .slice(0, 3)
    .map((h) => `${h.day}: ${h.hours}`)
    .join("   ");

  const addressLine = `${storeData.address.line1}, ${storeData.address.subDistrict}, ${storeData.address.district}, ${storeData.address.province} ${storeData.address.postalCode}`;

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

        <View className="flex-row gap-4 mb-4">

          <View className="w-40">
            <View className="w-40 h-40 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden items-center justify-center">
              {storeData.storeImage ? (
                <Image
                  source={{ uri: storeData.storeImage }}
                  resizeMode="cover"
                  className="w-full h-full"
                />
              ) : (
                <CurrencyDollarIcon size={28} color="#22C55E" />
              )}
            </View>
            <Text className="text-[16px] font-semibold text-[#11181C] mt-2">
              Store image
            </Text>
            <Text className="text-[13px] text-gray-500 mt-0.5">
              This is the image for the top of your store menu.
            </Text>
          </View>

          <View className="flex-1">
            <View className="w-full h-40 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden items-center justify-center">
              {storeData.listImage ? (
                <Image
                  source={{ uri: storeData.listImage }}
                  resizeMode="cover"
                  className="w-full h-full"
                />
              ) : (
                <CurrencyDollarIcon size={28} color="#22C55E" />
              )}
            </View>
            <Text className="text-[16px] font-semibold text-[#11181C] mt-2">
              List image
            </Text>
            <Text className="text-[13px] text-gray-500 mt-0.5">
              Appears alongside other businesses in the restaurant list.
            </Text>
          </View>
        </View>

        <Divider />

        <Row
          icon={<Text className="text-emerald-600 text-xl">🍽️</Text>}
          title="Cuisine and certification"
          subtitle={`${storeData.cuisine.type}${storeData.cuisine.certification ? " • " + storeData.cuisine.certification : ""}`}
          onPress={() => router.push("/edit-cuisine-certification")}
        />

        <Divider />

        <View className="w-full">
          <Row
            icon={<Text className="text-emerald-600 text-xl">🕒</Text>}
            title="Business hours"
            onPress={() => router.push("/edit-business-hours")}
          />
          <View className="mt-2 pl-12">
            {storeData.businessHours.map((h) => (
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
          title={"Owner’s contact"}
          subtitle={`${storeData.owner.phone}\n${storeData.owner.email}`}
          onPress={() => router.push("/edit-owner-contact")}
        />

        <Divider />

        <Row
          icon={<PhoneIcon size={18} color="#22C55E" />}
          title={"Store contact number"}
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
          icon={<Text className="text-emerald-600 text-xl">🏬</Text>}
          title="Store ID"
          subtitle={storeData.storeId}
        />
      </View>
    </ScrollView>
  );
}
