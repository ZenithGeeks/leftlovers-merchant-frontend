import { Fonts } from "@/constants/theme";
import React, { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SvgProps } from "react-native-svg";

interface InformationCardProps {
  icon: FC<SvgProps>;
  count: number;
  label: string;
  textColor?: string;
  IconBackground?: string;
  backgroundColor?: string;
}

export default function InformationCard({
  icon: Icon,
  count,
  label,
  textColor,
  IconBackground,
  backgroundColor = "#fff",
}: InformationCardProps) {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <Icon width={75} height={75} stroke={"#000"} color={IconBackground ?? "#fff"} strokeWidth={0.5} />
      <Text style={[styles.number, { color: textColor || "#000" }]}>{count}</Text>
      <Text style={[styles.label, { color: textColor || "#000" }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    borderColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  number: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    marginTop: 8,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    marginTop: 2,
  },
});
