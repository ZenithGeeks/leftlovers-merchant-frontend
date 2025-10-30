// app/index.tsx
import { useAuth } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { Link, Stack } from "expo-router";
import React from "react";
import { Platform, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { isLoaded } = useAuth();

  if (!isLoaded) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={Platform.OS === "ios" ? "dark-content" : "dark-content"} />

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text
          accessibilityRole="header"
          style={{
            fontSize: 40,
            color: "#2EA44F",
            textShadowColor: "rgba(0,0,0,0.15)",
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 6,
            letterSpacing: 0.5,
            marginBottom: 6,
            fontFamily: "Poppins_700Bold",
          }}
        >
          leftlovers
        </Text>

        <Image
          source={require("../../assets/images/logo.jpg")}
          style={{
            width: 450,
            height: 450,
            marginVertical: -35,
            zIndex: -1,
          }}
          contentFit="contain"
          accessible
          accessibilityLabel="Leftlovers logo"
        />

        <Text
          accessibilityRole="header"
          style={{
            fontSize: 40,
            color: "#2EA44F",
            textShadowColor: "rgba(0,0,0,0.15)",
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 6,
            letterSpacing: 0.5,
            marginBottom: 6,
            fontFamily: "Poppins_700Bold",
          }}
        >
          Merchants
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 12, justifyContent: "center", padding: 10 }}>
        <Link href="../(auth)/signin" asChild>
          <TouchableOpacity
            style={{
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#2EA44F",
            }}
          >
            <Text style={{ color: "#2EA44F", fontWeight: "700" }}>Start Your Journey</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}