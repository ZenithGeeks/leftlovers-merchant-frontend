// components/store/StoreImagesSection.tsx
import React from "react";
import { Image, Text, View } from "react-native";
import { PhotoIcon } from "react-native-heroicons/outline";

type Props = {
  storeImage: string | null;
  listImage: string | null;
};

export default function StoreImagesSection({ storeImage, listImage }: Props) {
  return (
    <View className="gap-6 mb-4">
      {/* Store image */}
      <View className="flex-row items-start gap-4">
        <View className="w-32 h-32 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden items-center justify-center">
          {storeImage ? (
            <Image
              source={{ uri: storeImage }}
              resizeMode="cover"
              className="w-full h-full"
            />
          ) : (
            <PhotoIcon size={28} color="#22C55E" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-semibold text-[#11181C]">
            Store image
          </Text>
          <Text className="text-[13px] text-gray-500 mt-1">
            This is the image for the top of your store menu.
          </Text>
        </View>
      </View>

      {/* List image */}
      <View className="flex-row items-start gap-4">
        <View className="w-32 h-32 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden items-center justify-center">
          {listImage ? (
            <Image
              source={{ uri: listImage }}
              resizeMode="cover"
              className="w-full h-full"
            />
          ) : (
            <PhotoIcon size={28} color="#22C55E" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-semibold text-[#11181C]">
            List image
          </Text>
          <Text className="text-[13px] text-gray-500 mt-1">
            This image will appear alongside other businesses when customers
            browse the restaurant list.
          </Text>
        </View>
      </View>
    </View>
  );
}
