import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BanknotesIcon as BankOutline,
  DocumentIcon as DocumentOutline,
  HandRaisedIcon as HandOutline,
  HomeIcon as HomeOutline,
  UserGroupIcon as UserOutline,
} from "react-native-heroicons/outline";

import {
  BanknotesIcon as BankSolid,
  DocumentIcon as DocumentSolid,
  HandRaisedIcon as HandSolid,
  HomeIcon as HomeSolid,
  UserGroupIcon as UserSolid,
} from "react-native-heroicons/solid";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tabIconSelected,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
          borderTopColor: Colors[colorScheme ?? "light"].border,
          height: 75,
          paddingTop: 3,
          paddingBottom: Math.max(3, insets.bottom),
          paddingHorizontal: 6,
          paddingVertical: 4,
        },

        tabBarIconStyle: { marginBottom: -2 },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Poppins_500Medium",
          fontWeight: "800",
        },
        tabBarItemStyle: {
          paddingVertical: 0,
          paddingHorizontal: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <HomeSolid
                size={25}
                color={Colors[colorScheme ?? "light"].accent}
              />
            ) : (
              <HomeOutline size={25} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          title: "Order",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <HandSolid
                size={25}
                color={Colors[colorScheme ?? "light"].accent}
              />
            ) : (
              <HandOutline size={25} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <DocumentSolid
                size={25}
                color={Colors[colorScheme ?? "light"].accent}
              />
            ) : (
              <DocumentOutline size={25} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: "Finance",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <BankSolid
                size={25}
                color={Colors[colorScheme ?? "light"].accent}
              />
            ) : (
              <BankOutline size={25} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="employees"
        options={{
          title: "Employees",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <UserSolid
                size={25}
                color={Colors[colorScheme ?? "light"].accent}
              />
            ) : (
              <UserOutline size={25} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}
