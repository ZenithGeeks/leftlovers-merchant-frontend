import PopularMenuItem from "@/components/Home/Dashboard/PopularMenuItem";
import PopularMenuSection from "@/components/Home/Dashboard/PopularMenuSection";
import FeedbackWrapper from "@/components/Home/Feedback/FeedbackWrapper";
import InformationCard from "@/components/Home/InformationCard";
import ShopStatusDropdown from "@/components/Home/Status-Dropdown";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import data from "@/mockupData/menuData.json";
import merchantData from "@/mockupData/merchant.json";
import UserData from "@/mockupData/user.json";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import { MapPinIcon } from "react-native-heroicons/outline";
import { ChartBarIcon, HandRaisedIcon } from "react-native-heroicons/solid";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ShopStatus = "closed" | "pause" | "busy" | "open";

const STATUS_OPTIONS = [
  { label: "Closed", value: "closed" },
  { label: "Pause", value: "pause" },
  { label: "Busy", value: "busy" },
  { label: "Open", value: "open" },
];

const merchant = {
  id: merchantData.id,
  name: merchantData.displayName ?? "",
  status: (merchantData.status as ShopStatus) ?? "closed",
  address: merchantData.address ?? "",
};

const user = {
  id: UserData.id,
  name: UserData.name ?? "",
  role: UserData.role ?? "",
};

const mockMenu = data.menuItems.slice(0, 3).map((item) => ({
  id: item.id,
  imageUrl: item.photoUrl,
  title: item.name,
  price: item.basePrice,
  orders: Math.floor(Math.random() * 100) + 1,
  leftOverQty: item.leftoverQty,
}));

export default function HomeScreen() {
  const [status, setStatus] = useState<ShopStatus>("open");
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = useMemo(() => Math.max(14, Math.min(screenWidth * 0.05, 24)), [screenWidth]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <ThemedView
        className="flex-1"
        style={{ paddingTop: insets.top + 16, paddingHorizontal: horizontalPadding }}
      >
        <View className="mb-6">
          <View className="flex-row items-center gap-2 pb-2">
            <MapPinIcon size={22} color={Colors.light.icon} />
            <Text className="text-base text-[#11181C]" style={{ fontFamily: Fonts.medium }}>
              {merchant.name}
            </Text>
          </View>

          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-lg text-[#11181C]" style={{ fontFamily: Fonts.bold }}>
              Hello, {user.name.split(" ")[0]}
            </Text>
            <View className="rounded-full px-2 py-1" style={{ backgroundColor: Colors.light.tint }}>
              <Text className="text-xs" style={{ fontFamily: Fonts.bold, color: Colors.light.background }}>
                {user.role.replace("_", " ")}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between py-2">
            <ShopStatusDropdown
              value={status}
              onChange={(v) => setStatus(v as ShopStatus)}
              options={STATUS_OPTIONS}
              size="md"
            />
            <Pressable
              onPress={() => router.push("/edit-store")}
              className="min-h-[40px] border border-gray-300 bg-white rounded-2xl px-4 py-2 justify-center items-center"
            >
              <Text className="text-[16px] text-gray-800" style={{ fontFamily: Fonts.medium }}>
                Edit Store
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="flex-row gap-3 bg-white rounded-2xl border border-gray-200 p-3 mb-6">
          <InformationCard icon={HandRaisedIcon} count={0} label="Preparing" backgroundColor="#fff" />
          <InformationCard
            icon={ChartBarIcon}
            count={0}
            textColor="#fff"
            label="THB"
            backgroundColor={Colors.light.tint}
            IconBackground="#FECD4C"
          />
        </View>

        <View className="mb-10">
          <PopularMenuSection title="Popular Dishes">
            {mockMenu.map((item) => (
              <PopularMenuItem
                key={item.id}
                imageUrl={item.imageUrl}
                title={item.title}
                price={item.price}
                orders={item.orders}
                leftoverQty={item.leftOverQty}
              />
            ))}
          </PopularMenuSection>
        </View>

        <View className="mb-10">
          <FeedbackWrapper />
        </View>
      </ThemedView>
    </ScrollView>
  );
}
