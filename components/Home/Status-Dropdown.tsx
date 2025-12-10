import { Colors, Fonts } from "@/constants/theme";
import type { OpenStatus } from "@/types/types";
import React, { useMemo, useRef, useState } from "react";
import {
  findNodeHandle,
  Modal,
  Pressable,
  Text,
  UIManager,
  View,
} from "react-native";
import { ChevronDownIcon, ChevronUpIcon } from "react-native-heroicons/mini";

const STATUS_OPTIONS: { label: string; value: OpenStatus }[] = [
  { label: "Closed", value: "CLOSED" },
  { label: "Pause", value: "PAUSE" },
  { label: "Busy", value: "BUSY" },
  { label: "Open", value: "OPEN" },
];

type Props = {
  value: OpenStatus;
  onChange: (v: OpenStatus) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md";
};

export default function ShopStatusDropdown({
  value,
  onChange,
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
    () => STATUS_OPTIONS.find((o) => o.value === value),
    [value]
  );
  const onToggle = () => {
    if (disabled) return;
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

  const onSelect = (v: OpenStatus) => {
    onChange(v);
    setOpen(false);
  };
  const isSmall = size === "sm";

  return (
    <>
      {/* Button */}
      <Pressable
        ref={buttonRef}
        onPress={onToggle}
        disabled={disabled}
        className={`flex-row items-center rounded-2xl border border-gray-200 bg-gray-50 shadow-sm ${
          disabled ? "opacity-50" : "active:opacity-90"
        }`}
        style={{
          paddingHorizontal: isSmall ? 12 : 16,
          paddingVertical: isSmall ? 8 : 12,
          minWidth: 120,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
      >
        <Text
          className="flex-1 text-slate-900"
          style={{
            fontFamily: Fonts.medium,
            fontSize: isSmall ? 14 : 16,
            lineHeight: isSmall ? 18 : 20,
          }}
        >
          {selected?.label ?? placeholder}
        </Text>
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
        <Pressable className="absolute inset-0" onPress={() => setOpen(false)} />

        {/* Dropdown */}
        <View
          className="absolute bg-white border border-gray-200 rounded-2xl py-1 shadow-lg"
          style={{
            top: anchor ? anchor.y + anchor.h + 8 : 120,
            left: anchor ? Math.max(12, anchor.x) : undefined,
            alignSelf: anchor ? "flex-start" : "center",
            width: anchor ? Math.max(180, anchor.w) : 220,
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        >
          {STATUS_OPTIONS.map((opt) => {
            const active = opt.value === value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => onSelect(opt.value)}
                className={`px-5 py-3 rounded-xl ${
                  active ? "bg-emerald-50" : "bg-transparent"
                } active:opacity-80`}
              >
                <Text
                  className={`text-[16px] ${
                    active ? "text-emerald-600" : "text-slate-900"
                  }`}
                  style={{
                    fontFamily: active ? Fonts.semibold : Fonts.medium,
                  }}
                >
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
