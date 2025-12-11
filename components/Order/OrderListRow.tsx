import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import CardItem from "@/components/Order/CardItem";
import ToggleButton from "@/components/Order/ToggleButton";
import { updateMerchantOrderStatus } from "@/services/order";
import type { Order, OrderPreference, OrderStatus, PaymentStatus } from "@/types/types";
import { parseOrderDates, parseOrderMoney } from "@/types/types";

type OrderListRowProps = {
  item: Order;
  onUpdated?: (next: Order) => void;
  merchantId: string;
};

const statusLabel = (s: OrderStatus) => {
  switch (s) {
    case "PENDING":
      return "Pending";
    case "CONFIRMED":
      return "Confirmed";
    case "READY":
      return "Ready";
    case "PICKED_UP":
      return "Picked up";
    case "CANCELLED":
      return "Cancelled";
    default:
      return s;
  }
};

const statusPillClass = (s: OrderStatus) => {
  switch (s) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "CONFIRMED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "READY":
      return "bg-green-50 text-green-700 border-green-200";
    case "PICKED_UP":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const paymentPillClass = (p: PaymentStatus) => {
  switch (p) {
    case "PAID":
      return "bg-green-50 text-green-700 border-green-200";
    case "REFUNDED":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "UNPAID":
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const preferenceLabel = (p: OrderPreference) => {
  switch (p) {
    case "CONTACT":
      return "CONTACT";
    case "REMOVE":
      return "No contact";
    case "CANCELLED":
      return "Cancelled by customer";
    default:
      return p;
  }
};


function getTimeLeft(deadline?: string | null) {
  if (!deadline) return null;
  const end = new Date(deadline).getTime();
  const now = Date.now();
  const diff = end - now;

  if (Number.isNaN(end)) return null;
  if (diff <= 0) return "Expired";

  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;

  if (hrs > 0) return `${hrs}h ${rem}m left`;
  return `${rem}m left`;
}

export default function OrderListRow({ item, onUpdated, merchantId }: OrderListRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);

  const shortId = useMemo(
    () => item.id?.slice(0, 6)?.toUpperCase() ?? "ORDER",
    [item.id]
  );
  const timeLeft = useMemo(
    () => getTimeLeft(item.pickupDeadline),
    [item.pickupDeadline]
  );

  const itemsCount = useMemo(
    () => (item.items ?? []).reduce((sum, it) => sum + (it.quantity ?? 0), 0),
    [item.items]
  );

  const money = useMemo(() => parseOrderMoney(item), [item]);
  const dates = useMemo(() => parseOrderDates(item), [item]);

  const primaryAction = useMemo(() => {
    if (item.status === "PENDING" || item.status === "CONFIRMED") {
      return { label: "Mark Ready", next: "READY" as OrderStatus };
    }
    if (item.status === "READY") {
      return { label: "Picked up", next: "PICKED_UP" as OrderStatus };
    }
    return null;
  }, [item.status]);

  const handleUpdateStatus = useCallback(async () => {
    if (!primaryAction) return;

    setBusy(true);
    try {
      const updated = await updateMerchantOrderStatus(
        merchantId,
        item.id,
        primaryAction.next
      );
      onUpdated?.(updated);
    } catch (e: any) {
      Alert.alert("Update failed", e?.message ?? "Unable to update order.");
    } finally {
      setBusy(false);
    }
  }, [primaryAction, merchantId, item.id, onUpdated]);

  return (
    <View className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* HEADER */}
      <View className="px-4 pt-4 pb-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-xl font-semibold text-gray-900">
              Order #{shortId}
            </Text>
            {!!item.pickupCode && (
              <Text className="ml-2 text-[10px] text-gray-500">
                Code: {item.pickupCode}
              </Text>
            )}
          </View>

          <ToggleButton
            expanded={expanded}
            onToggle={() => setExpanded((s) => !s)}
          />
        </View>

        {/* Pills row */}
        <View className="flex-row flex-wrap items-center mt-3">
          <View
            className={`border rounded-full px-2.5 py-1 mr-2 ${statusPillClass(
              item.status
            )}`}
          >
            <Text className="text-[10px] font-semibold">
              {statusLabel(item.status)}
            </Text>
          </View>

          <View
            className={`border rounded-full px-2.5 py-1 mr-2 ${paymentPillClass(
              item.paymentStatus
            )}`}
          >
            <Text className="text-[10px] font-semibold">
              {item.paymentStatus}
            </Text>
          </View>

          <View className="border border-gray-200 rounded-full px-2.5 py-1 mr-2 bg-gray-50">
            <Text className="text-[10px] font-medium text-gray-700">
              {preferenceLabel(item.preference)}
            </Text>
          </View>

          <View className="border border-gray-200 rounded-full px-2.5 py-1 bg-gray-50">
            <Text className="text-[10px] font-medium text-gray-700">
              {item.cutlery ? "Cutlery: Yes" : "Cutlery: No"}
            </Text>
          </View>
        </View>

        {/* Timer pill */}
        {!!timeLeft && (
          <View className="mt-3 self-start bg-amber-200/70 rounded-full px-4 py-2">
            <Text className="text-[11px] font-semibold text-gray-900">
              {timeLeft}
            </Text>
          </View>
        )}

        {/* Money summary */}
        <View className="mt-3">
          <Text className="text-[11px] text-gray-500">
            Items: {itemsCount || 0}
          </Text>
          <Text className="text-[11px] text-gray-500">
            Subtotal: ฿{money.subtotal.toFixed(0)}  •  Discount: ฿
            {money.discountTotal.toFixed(0)}
          </Text>
          <Text className="text-[11px] text-gray-700 font-semibold">
            Total: ฿{money.totalAmount.toFixed(0)}
          </Text>
        </View>
      </View>

      <View className="h-[1px] bg-gray-100" />

      {/* BODY */}
      <View className="px-4 py-4">
        <Text className="text-lg font-semibold text-gray-900">
          {item.customer?.name ?? "Customer"}
        </Text>

        <View className="mt-2">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text className="ml-2 text-xs text-gray-600">
              Pickup deadline:{" "}
              {dates.pickupDeadline
                ? dates.pickupDeadline.toLocaleString()
                : "-"}
            </Text>
          </View>

          <View className="flex-row items-center mt-1">
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text className="ml-2 text-xs text-gray-600">
              Created: {dates.createdAt.toLocaleString()}
            </Text>
          </View>

          <View className="flex-row items-center mt-1">
            <Ionicons name="call-outline" size={14} color="#6B7280" />
            <Text className="ml-2 text-xs text-gray-600">
              {item.customer?.phone ?? "-"}
            </Text>
          </View>
        </View>

        {/* Items preview (collapsed) */}
        {!expanded && (
          <View className="mt-4">
            {(item.items ?? []).slice(0, 2).map((it) => (
              <View key={it.id} className="flex-row items-center mb-2">
                <View className="w-6 h-6 rounded-full border border-green-500 items-center justify-center">
                  <Text className="text-[10px] font-semibold text-green-600">
                    {it.quantity ?? 0}
                  </Text>
                </View>
                <Text className="ml-3 text-sm text-gray-800">
                  {it.menu?.name ?? "Menu item"}
                </Text>
              </View>
            ))}

            {(item.items?.length ?? 0) > 2 && (
              <Text className="text-[11px] text-gray-500 ml-9">
                +{(item.items?.length ?? 0) - 2} more items
              </Text>
            )}
          </View>
        )}

        {/* Full items (expanded) */}
        {expanded && (
          <View className="mt-4">
            <Text className="text-xs font-semibold text-gray-900 mb-2">
              Order items
            </Text>

            {(item.items ?? []).map((it) => (
              <CardItem key={it.id} orderItem={it} />
            ))}

            {!!item.note && (
              <View className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3">
                <Text className="text-[11px] text-gray-500">Note</Text>
                <Text className="text-xs text-gray-800 mt-1">
                  {item.note}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* FOOTER ACTION */}
      {!!primaryAction && (
        <View className="px-4 pb-4">
          <Pressable
            onPress={handleUpdateStatus}
            disabled={busy}
            className={`self-end rounded-2xl px-6 py-3 ${
              busy ? "bg-green-300" : "bg-green-500"
            }`}
          >
            <Text className="text-white font-semibold">
              {busy ? "Updating..." : primaryAction.label}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
