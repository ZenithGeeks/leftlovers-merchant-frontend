import { Stack } from "expo-router";
import React, { ReactNode } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthScreenWrapperProps = {
  children: ReactNode;
  keyboard?: boolean;
};

export const AuthScreenWrapper = ({
  children,
  keyboard = false,
}: AuthScreenWrapperProps) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {keyboard ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 24,
              paddingTop: 32,
              paddingBottom: 24,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 32,
            paddingBottom: 24,
          }}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
};
