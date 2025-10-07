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
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MapPinIcon } from "react-native-heroicons/outline";
import { ChartBarIcon, HandRaisedIcon } from "react-native-heroicons/solid";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ShopStatus = "closed" | "pause" | "busy" | "open";

const SPACING = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

const STATUS_OPTIONS = [
  { label: "Closed", value: "closed" as ShopStatus },
  { label: "Pause", value: "pause" as ShopStatus },
  { label: "Busy", value: "busy" as ShopStatus },
  { label: "Open", value: "open" as ShopStatus },
];

const merchant = {
  id: merchantData.id,
  name: merchantData.displayName ?? "",
  status: (merchantData.status as ShopStatus) ?? "closed",
  address: merchantData.address ?? "",
};

const User = {
  id: UserData.id,
  name: UserData.name ?? "",
  email: UserData.email ?? "",
  phone: UserData.phone ?? "",
  role: UserData.role ?? "",
};

const mockupMenuItems = data.menuItems.slice(0, 3).map((item) => ({
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
  const horizontalPadding = useMemo(() => {
    const pct = screenWidth * 0.05;
    return Math.max(14, Math.min(pct, 24));
  }, [screenWidth]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ marginBottom: insets.bottom + SPACING.xl }}
    >
      <ThemedView
        style={[
          styles.screen,
          {
            paddingTop: insets.top + SPACING.lg,
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* location row */}
          <View style={styles.locationRow}>
            <MapPinIcon size={22} color={Colors.light.icon} />
            <Text style={styles.locationText}>{merchant.name}</Text>
          </View>

          {/* greeting + role */}
          <View style={styles.userRow}>
            <Text style={styles.greetingText}>Hello, {User.name.split(" ")[0]} </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{User.role.replace("_", " ")}</Text>
            </View>
          </View>

          {/* status + edit */}
          <View style={styles.controlsRow}>
            <ShopStatusDropdown
              value={status}
              onChange={(v) => setStatus(v as ShopStatus)}
              options={STATUS_OPTIONS}
              size="md"
            />
            <Pressable
              onPress={() => router.push("/edit-store")}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>Edit Store</Text>
            </Pressable>
          </View>
        </View>

        {/* Cards Row */}
        <View style={styles.cardsRow}>
          <InformationCard
            icon={HandRaisedIcon}
            count={0}
            label="Preparing"
            backgroundColor="#fff"
          />
          <InformationCard
            icon={ChartBarIcon}
            count={0}
            textColor="#fff"
            label="THB"
            backgroundColor={Colors.light.tint}
            IconBackground="#FECD4C"
          />
        </View>

        {/* Popular Menu */}
        <View style={styles.section}>
          <PopularMenuSection title="Popular Dishes">
            {mockupMenuItems.map((item) => (
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

        {/* Feedback */}
        <View style={styles.section}>
          <FeedbackWrapper />
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  // ---- Header ----
  header: {
    marginBottom: SPACING.xl,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  locationText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "#11181C",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  greetingText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: "#11181C",
  },
  roleBadge: {
    borderRadius: 25,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  roleText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: Colors.light.background,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
  },
  editBtn: {
    minHeight: 40,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    borderRadius: 25,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  editBtnText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.light.text,
  },

  // ---- Cards Row ----
  cardsRow: {
    flexDirection: "row",
    gap: SPACING.md,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.light.border,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },

  // ---- Sections ----
  section: {
    marginBottom: SPACING.xxl,
  },
});
