import { Colors, Fonts } from "@/constants/theme";
import React, { useMemo, useRef, useState } from "react";
import {
    findNodeHandle,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    UIManager,
    View,
} from "react-native";
import { ChevronDownIcon, ChevronUpIcon } from "react-native-heroicons/mini";

type Option = { label: string; value: string };
type Props = {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md";
};

export default function ShopStatusDropdown({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
  size = "md",
}: Props) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const buttonRef = useRef<View>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  const onToggle = () => {
    if (disabled) return;
    // measure anchor so menu can appear below the button
    const node = findNodeHandle(buttonRef.current);
    if (node) {
      UIManager.measureInWindow(node, (x, y, w, h) => {
        setAnchor({ x, y, w, h });
        setOpen((prev) => !prev);
      });
    } else {
      setOpen((prev) => !prev);
    }
  };

  const onSelect = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const S = styles(size);

  return (
    <>
      {/* Button */}
      <Pressable
        ref={buttonRef}
        onPress={onToggle}
        disabled={disabled}
        style={({ pressed }) => [
          S.button,
          pressed && S.buttonPressed,
          disabled && S.buttonDisabled,
        ]}
      >
        <Text style={S.buttonText}>{selected?.label ?? placeholder}</Text>
        {open ? (
          <ChevronUpIcon size={18} color={Colors.light.icon} />
        ) : (
          <ChevronDownIcon size={18} color={Colors.light.icon} />
        )}
      </Pressable>

      {/* Menu */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        {/* Backdrop */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setOpen(false)}
        />
        {/* Popover */}
        <View
          style={[
            S.menu,
            anchor
              ? {
                  top: anchor.y + anchor.h + 8,
                  left: Math.max(12, anchor.x),
                  width: Math.max(180, anchor.w),
                }
              : { alignSelf: "center", marginTop: 120, width: 220 },
          ]}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => onSelect(opt.value)}
                style={({ pressed }) => [
                  S.item,
                  active && S.itemActive,
                  pressed && S.itemPressed,
                ]}
              >
                <Text style={[S.itemText, active && S.itemTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </>
  );
}

function styles(size: "sm" | "md") {
  const px = size === "sm" ? 12 : 16;
  const py = size === "sm" ? 8 : 12;
  const radius = 16;
  return StyleSheet.create({
    button: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: px,
      paddingVertical: py,
      borderRadius: radius * 1.5,
      borderWidth: 1.5,
      borderColor: "#E6E6E6",
      backgroundColor: "#F8F9FA",
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    buttonPressed: { opacity: 0.9 },
    buttonDisabled: { opacity: 0.5 },
    buttonText: {
      flex: 1,
      fontFamily: Fonts.medium,
      fontSize: size === "sm" ? 14 : 16,
      lineHeight: size === "sm" ? 18 : 20,
      color: "#11181C",
      textAlign: "left",
    },
    menu: {
      position: "absolute",
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: "#E8E8E8",
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    item: {
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 12,
    },
    itemActive: {
      backgroundColor: "#F2F8F5", // faint green background
    },
    itemPressed: { opacity: 0.85 },
    itemText: {
      fontFamily: Fonts.medium,
      fontSize: 16,
      color: "#11181C",
    },
    itemTextActive: {
      color: Colors.light.accent, // your #009E45
      fontFamily: Fonts.semibold,
    },
  });
}
