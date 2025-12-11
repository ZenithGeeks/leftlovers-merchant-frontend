import React from "react";
import {
    ActivityIndicator,
    Modal,
    Platform,
    Pressable,
    Text,
    View,
} from "react-native";

const BRAND = { green: "#26BD68", text: "#0B0F10" };

export type ProcessingScreenProps = {
  title: string;
  description?: string;
  helperText?: string;
  visible: boolean;
  cancellable?: boolean;
  onCancel?: () => void;
};

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  title,
  description,
  helperText,
  visible,
  cancellable = false,
  onCancel,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (cancellable && onCancel) onCancel();
      }}
    >
      <View
        className="flex-1 items-center justify-center"
        style={{
          backgroundColor: "rgba(15,23,42,0.45)", // slate-900/45
          paddingHorizontal: 24,
        }}
      >
        {/* Card */}
        <View
          className="w-full rounded-3xl p-5"
          style={{
            backgroundColor: "#FFFFFF",
            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowOffset: { width: 0, height: 10 },
            shadowRadius: 25,
            elevation: Platform.OS === "android" ? 10 : 0,
          }}
        >
          {/* Header */}
          <View className="items-center mb-4">
            <Text className="font-poppins text-[18px] font-semibold text-slate-900 text-center">
              {title}
            </Text>
            {description ? (
              <Text className="mt-2 font-poppins text-[12px] text-slate-500 text-center">
                {description}
              </Text>
            ) : null}
          </View>

          {/* Loader + small status pill */}
          <View className="items-center my-2">
            <ActivityIndicator size="large" color={BRAND.green} />
            <View className="mt-3 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
              <Text className="font-poppins text-[11px] text-emerald-700">
                Please keep this screen open
              </Text>
            </View>
          </View>

          {/* Helper text */}
          {helperText ? (
            <Text className="mt-3 font-poppins text-[12px] text-slate-400 text-center">
              {helperText}
            </Text>
          ) : null}

          {/* Optional cancel button */}
          {cancellable && (
            <View className="mt-4 items-center">
              <Pressable
                onPress={onCancel}
                className="px-4 py-2 rounded-full border border-slate-200"
                style={{
                  backgroundColor: Platform.select({
                    ios: "#F9FAFB",
                    android: "#F9FAFB",
                    default: "#F9FAFB",
                  }),
                }}
              >
                <Text className="font-poppins text-[12px] text-slate-500">
                  Cancel
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
