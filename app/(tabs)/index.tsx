import PopularMenuItem from "@/components/Home/Dashboard/PopularMenuItem";
import PopularMenuSection from "@/components/Home/Dashboard/PopularMenuSection";
import FeedbackWrapper from "@/components/Home/Feedback/FeedbackWrapper";
import InformationCard from "@/components/Home/InformationCard";
import ShopStatusDropdown from "@/components/Home/Status-Dropdown";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";

import { getMenuItems } from "@/services/menu"; // adjust if different
import { fetchMerchant } from "@/services/merchant";

import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import { MapPinIcon } from "react-native-heroicons/outline";
import { ChartBarIcon, HandRaisedIcon } from "react-native-heroicons/solid";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { MenuItemAPI, MerchantAPI, ShopStatus } from "@/types/types";

// ========================================================
//   ENV
// ========================================================
const MERCHANT_ID = process.env.EXPO_PUBLIC_MERCHANT_ID;

// ========================================================
//   Home Screen
// ========================================================
export default function HomeScreen() {
  const [status, setStatus] = useState<ShopStatus>("open");
  const [merchant, setMerchant] = useState<MerchantAPI | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemAPI[]>([]);
  const [loading, setLoading] = useState(true);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;

  const horizontalPadding = useMemo(
    () => Math.max(14, Math.min(screenWidth * 0.05, 24)),
    [screenWidth]
  );

  // ======================================================
  //                 LOAD DATA ON MOUNT
  // ======================================================
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        if (!MERCHANT_ID) {
          console.error("❌ Missing EXPO_PUBLIC_MERCHANT_ID");
          return;
        }

        const [merchantRes, menuRes] = await Promise.all([
          fetchMerchant(MERCHANT_ID),
          getMenuItems(MERCHANT_ID)
        ]);
        
        if (!mounted) return;
        setMerchant(merchantRes);
        setMenuItems(menuRes);
      } catch (err) {
        console.error("Error loading home dashboard:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !merchant) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={{ fontFamily: Fonts.medium, marginTop: 8 }}>Loading dashboard...</Text>
      </ThemedView>
    );
  }

  // ======================================================
  //     UI MAPPED MENU ITEMS (Top 3 Popular)
  // ======================================================
  const uiMenu = menuItems.slice(0, 3).map((item) => ({
    id: item.id,
    imageUrl: item.photoUrl ?? undefined,
    title: item.name,
    price: item.basePrice,
    orders: Math.floor(Math.random() * 200) + 20, // Temporary metric
    leftoverQty: item.leftoverQty
  }));

  return (

      <ThemedView
        className="flex-1"
        style={{ paddingTop: insets.top + 16, paddingHorizontal: horizontalPadding }}
      >
        {/* ---------------------------------------------------
            HEADER
        --------------------------------------------------- */}
            <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
        <View className="mb-6">
          <View className="flex-row items-center gap-2 pb-2">
            <MapPinIcon size={22} color={Colors.light.icon} />
            <Text className="text-base text-[#11181C]" style={{ fontFamily: Fonts.medium }}>
              {merchant.displayName}
            </Text>
          </View>

          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-lg text-[#11181C]" style={{ fontFamily: Fonts.bold }}>
              Hello! {merchant.owner.name}
            </Text>
          </View>

          <View className="flex-row items-center justify-between py-2">
            <ShopStatusDropdown
              value={status}
              onChange={(v) => setStatus(v as ShopStatus)}
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

        {/* ---------------------------------------------------
            DASHBOARD INFO
        --------------------------------------------------- */}
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

        {/* ---------------------------------------------------
            POPULAR DISHES
        --------------------------------------------------- */}
        <View className="mb-10">
          <PopularMenuSection title="Popular Dishes">
            {uiMenu.map((item) => (
              <PopularMenuItem
                key={item.id}
                imageUrl={item.imageUrl!}
                title={item.title}
                price={item.price}
                orders={item.orders}
                leftoverQty={item.leftoverQty}
              />
            ))}
          </PopularMenuSection>
        </View>

        {/* ---------------------------------------------------
            FEEDBACK
        --------------------------------------------------- */}
        <View className="mb-10">
          <FeedbackWrapper />
        </View>
            </ScrollView>
      </ThemedView>

  );
}
