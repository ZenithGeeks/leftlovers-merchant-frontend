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
import { Colors, Fonts } from "@/constants/theme";
import { useMerchant } from "@/context/MerchantContext";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { auth } from "@/lib/firebase";
import { fetchMerchant, updateOpenStatus } from "@/services/store";

import type { Merchant, OpenStatus, Order } from "@/types/types";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { type User as FirebaseUser } from "firebase/auth";
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
  const { setMerchantId } = useMerchant();

  const { width } = useWindowDimensions();
  const { isLoaded: authLoaded, isSignedIn } = useFirebaseAuth();

  const user = auth.currentUser as FirebaseUser | null;
  const ownerUserId = user?.uid ?? null;

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [status, setStatus] = useState<OpenStatus>("CLOSED");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const horizontalPadding = useMemo(() => {
    const pct = width * 0.05;
    return Math.max(14, Math.min(pct, 24));
  }, [width]);

  const loadMerchant = useCallback(async () => {
    if (!ownerUserId) {
      setMerchant(null);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const m = await fetchMerchant(ownerUserId);
      setMerchant(m ?? null);
      setStatus(m?.openStatus ?? "CLOSED");
    } catch (err: any) {
      setMerchant(null);
      setErrorMsg(err?.message ?? "Failed to load merchant.");
    } finally {
      setLoading(false);
    }
  }, [ownerUserId]);

  useFocusEffect(
    useCallback(() => {
      loadMerchant();
    }, [loadMerchant])
  );

  useEffect(() => {
    if (authLoaded && !isSignedIn) {
      router.replace("/(landing)");
    }
  }, [authLoaded, isSignedIn, router]);

  useEffect(() => {
    if (merchant?.id) {
      setMerchantId(merchant.id);
    }
  }, [merchant?.id, setMerchantId]);

  const orders = useMemo<Order[]>(
    () => merchant?.orders ?? [],
    [merchant?.orders]
  );

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
      setMerchant((prev) => (prev ? { ...prev, openStatus: next } : prev));

      try {
        const updated = await updateOpenStatus(merchant.id, next);

        setStatus(updated.openStatus);
        setMerchant((prev) =>
          prev ? { ...prev, openStatus: updated.openStatus } : prev
        );
      } catch {
        loadMerchant();
      }
    },
    [loadMerchant, merchant]
  );

  if (!authLoaded || !isSignedIn) {
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
        <Text className="mt-2 text-xs text-gray-500">Loading store...</Text>
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

  return (
    <ThemedView
      className="flex-1"
      style={{
        paddingTop: insets.top + 16,
        paddingHorizontal: horizontalPadding,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <View className="mb-6">
          <View className="flex-row items-center gap-2 pb-2">
            <MapPinIcon size={22} color={Colors.light.icon} />
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
              Hello, {merchant.owner?.name ?? "Owner"}
            </Text>

            {!!merchant.owner?.role && (
              <View
                className="rounded-full px-2 py-1"
                style={{ backgroundColor: Colors.light.tint }}
              >
                <Text
                  className="text-xs"
                  style={{
                    fontFamily: Fonts.bold,
                    color: Colors.light.background,
                  }}
                  numberOfLines={1}
                >
                  {merchant.owner.role}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center justify-between py-2 gap-2">
            <View className="flex-1">
              <ShopStatusDropdown
                value={status}
                onChange={(v) => handleUpdateStatus(v as OpenStatus)}
              />
            </View>

            <Pressable
              onPress={() => router.push("/edit-store")}
              className="min-h-[40px] border border-gray-300 bg-white rounded-2xl px-4 py-2 justify-center items-center"
            >
              <Text
                className="text-[16px] text-gray-800"
                style={{ fontFamily: Fonts.medium }}
              >
                Edit Store
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="flex-row gap-3 bg-white rounded-2xl border border-gray-200 p-3 mb-6">
          <InformationCard
            icon={HandRaisedIcon}
            count={preparingCount}
            label="Preparing"
            backgroundColor="#fff"
          />

          <InformationCard
            icon={ChartBarIcon}
            count={revenueTotal}
            textColor="#fff"
            label="Total THB"
            backgroundColor={Colors.light.tint}
            IconBackground="#FECD4C"
          />
        </View>

        <View className="mb-10">
          <PopularMenuSection title="Popular Dishes">
            {popularMenu.map((item) => (
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
          <FeedbackWrapper reviews={reviewsFromOrders as any} warnings={[]} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}
