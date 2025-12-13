import {
  buildPopularMenuFromOrders,
  extractReviewsFromOrders,
  getPreparingCount,
  getRevenueTotal,
} from "@/components/Home/Dashboard/calculate";
import PopularMenuItem from "@/components/Home/Dashboard/PopularMenuItem";
import PopularMenuSection from "@/components/Home/Dashboard/PopularMenuSection";
import FeedbackWrapper from "@/components/Home/Feedback/FeedbackWrapper";
import InformationCard from "@/components/Home/InformationCard";
import ShopStatusDropdown from "@/components/Home/Status-Dropdown";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { useMerchant } from "@/context/MerchantContext";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { auth } from "@/lib/firebase";
import { fetchMerchantById, updateOpenStatus } from "@/services/store";

import type { Merchant, OpenStatus, Order } from "@/types/types";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { MapPinIcon } from "react-native-heroicons/outline";
import { ChartBarIcon, HandRaisedIcon } from "react-native-heroicons/solid";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isLoaded, isSignedIn } = useFirebaseAuth();

  const { merchantId, merchantStatus, setMerchant } = useMerchant();

  const [merchant, setMerchantState] = useState<Merchant | null>(null);
  const [status, setStatus] = useState<OpenStatus>("CLOSED");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const horizontalPadding = useMemo(() => {
    const pct = width * 0.05;
    return Math.max(14, Math.min(pct, 24));
  }, [width]);

  const loadMerchant = useCallback(async () => {
    if (!merchantId) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const m = await fetchMerchantById(merchantId);
      setMerchantState(m ?? null);
      setStatus(m?.openStatus ?? "CLOSED");

      if (m) {
        setMerchant(m.id, m.status);
      }
    } catch (err: any) {
      setMerchantState(null);
      setErrorMsg(err?.message ?? "Failed to load merchant.");
    } finally {
      setLoading(false);
    }
  }, [merchantId, setMerchant]);

  useFocusEffect(
    useCallback(() => {
      loadMerchant();
    }, [loadMerchant])
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) router.replace("/(landing)");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!merchantId) {
      router.replace("/(auth)/storeInfo");
      return;
    }

    if (merchantStatus === "PENDING") {
      router.replace("/(auth)/notifyPage");
    }
  }, [isLoaded, merchantId, merchantStatus, router]);

  const orders = useMemo<Order[]>(() => merchant?.orders ?? [], [merchant]);
  const preparingCount = useMemo(() => getPreparingCount(orders), [orders]);
  const revenueTotal = useMemo(() => getRevenueTotal(orders), [orders]);
  const popularMenu = useMemo(
    () => buildPopularMenuFromOrders(orders, 3),
    [orders]
  );
  const reviewsFromOrders = useMemo(
    () => extractReviewsFromOrders(orders),
    [orders]
  );

  const handleUpdateStatus = useCallback(
    async (next: OpenStatus) => {
      if (!merchant) return;

      setStatus(next);
      setMerchantState((prev) => (prev ? { ...prev, openStatus: next } : prev));

      try {
        const updated = await updateOpenStatus(merchant.id, next);
        setStatus(updated.openStatus);
        setMerchantState((prev) =>
          prev ? { ...prev, openStatus: updated.openStatus } : prev
        );
      } catch {
        loadMerchant();
      }
    },
    [merchant, loadMerchant]
  );

  if (!isLoaded || !isSignedIn) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!merchantId) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (loading && !merchant) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
        <Text className="mt-2 text-xs text-gray-500">Loading store…</Text>
      </View>
    );
  }

  if (!merchant) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-sm font-semibold text-gray-900">
          Store not found
        </Text>
        <Text className="mt-1 text-xs text-gray-500 text-center">
          {errorMsg ?? "Please try again."}
        </Text>
        <Pressable
          onPress={loadMerchant}
          className="mt-4 px-4 py-2 rounded-xl border border-gray-300 bg-white"
        >
          <Text className="text-sm">Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (merchantStatus === "PENDING" || merchant.status === "PENDING") {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
        <Text className="mt-2 text-gray-500">
          Waiting for store approval…
        </Text>
      </View>
    );
  }

  const helloName =
    auth.currentUser?.displayName ??
    auth.currentUser?.email?.split("@")[0] ??
    merchant.owner?.name ??
    "there";

  return (
    <ThemedView
      className="flex-1"
      style={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 16,
        backgroundColor: "#26BD68",
      }}
    >
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingTop: 24,
          paddingHorizontal: horizontalPadding,
          minHeight: "100%",
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          <View className="mb-6">
            <View className="flex-row items-center gap-2 pb-2">
              <MapPinIcon size={22} color="#11181C" />
              <Text
                className="text-base text-[#11181C]"
                style={{ fontFamily: Fonts.medium }}
                numberOfLines={1}
              >
                {merchant.displayName}
              </Text>
            </View>

            <View className="flex-row items-center gap-2 mb-3 flex-wrap">
              <Text
                className="text-lg text-[#11181C]"
                style={{ fontFamily: Fonts.bold }}
              >
                Hello, {helloName}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-2 gap-3">
              <View className="flex-1">
                <ShopStatusDropdown
                  value={status}
                  onChange={(v) => handleUpdateStatus(v as OpenStatus)}
                />
              </View>

              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/edit-store",
                    params: { merchantId: merchant.id },
                  })
                }
                className="min-h-[40px] rounded-2xl px-4 py-2 justify-center items-center border border-gray-200 bg-white"
              >
                <Text
                  className="text-[16px] text-[#11181C]"
                  style={{ fontFamily: Fonts.medium }}
                >
                  Edit Store
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="flex-row gap-3">
            <InformationCard
              icon={HandRaisedIcon}
              count={preparingCount}
              label="Preparing"
              footer={
                preparingCount === 0
                  ? "No active orders right now"
                  : `${preparingCount} order${preparingCount > 1 ? "s" : ""} in progress`
              }
              iconBackground="#ECFDF5"
              iconColor="#26BD68"
              onPress={() => router.push("/order")}
            />

            <InformationCard
              icon={ChartBarIcon}
              count={`฿${revenueTotal}`}
              label="Today's revenue"
              footer={revenueTotal === 0 ? "No sales yet" : "Great work today"}
              iconBackground="#FECD4C"
              iconColor="#26BD68"
              onPress={() => router.push("/finance")}
            />
          </View>

          <View className="mb-12 mt-4">
            <PopularMenuSection title="Popular Dishes">
              {loading ? (
                <View className="gap-3 rounded-2xl p-3">
                  {[1, 2, 3].map((i) => (
                    <View key={i} className="h-16 rounded-xl bg-[#ECFDF5]" />
                  ))}
                </View>
              ) : popularMenu.length === 0 ? (
                <View className="items-center rounded-2xl p-6 bg-white">
                  <Text
                    className="text-sm text-[#11181C]"
                    style={{ fontFamily: Fonts.medium }}
                  >
                    No popular dishes yet
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1 text-center">
                    Popular dishes will appear after customers place orders.
                  </Text>
                  <Pressable
                    onPress={() => router.push("/menu")}
                    className="mt-4 rounded-full px-4 py-2 bg-[#FECD4C]"
                  >
                    <Text
                      className="text-sm text-[#11181C]"
                      style={{ fontFamily: Fonts.bold }}
                    >
                      Add menu items
                    </Text>
                  </Pressable>
                </View>
              ) : (
                popularMenu.map((item) => (
                  <PopularMenuItem
                    key={item.id}
                    imageUrl={item.imageUrl}
                    title={item.title}
                    price={item.price}
                    orders={item.orders}
                    leftoverQty={item.leftOverQty}
                  />
                ))
              )}
            </PopularMenuSection>
          </View>

          <View className="mb-10">
            {reviewsFromOrders.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-sm text-gray-600">
                  No customer feedback yet
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  Reviews will appear after your first order
                </Text>
              </View>
            ) : (
              <FeedbackWrapper reviews={reviewsFromOrders as any} warnings={[]} />
            )}
          </View>
        </ScrollView>
      </View>
    </ThemedView>
  );
}
