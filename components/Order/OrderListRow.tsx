import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View
} from "react-native";
import ToggleButton from "@/components/Order/ToggleButton";
import { OrderListItem } from "@/constants/order.type";
import CardItem from "./CardItem";
import { Ionicons } from "@expo/vector-icons";

interface OrderListRowProps {
  item: OrderListItem;
}

export default function OrderListRow({ item }: OrderListRowProps) {
   const [expanded, setExpanded] = useState(false);

   function getTimeUntilPickup(pickupTime: Date): string {
      const now = new Date();
      const diffMs = pickupTime.getTime() - now.getTime();

      if (diffMs <= 0) {
         return "Pickup time passed";
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
         return `${hours}h ${minutes}m left`;
      } else {
         return `${minutes}m until left`;
      }
   }

   return (
      <>
         <View style={[styles.orderRow, expanded ? styles.expanded : { borderRadius: BORDER_RADIUS }]}>
         <Text style={{ marginTop: 8 }}>Order #{item.bookingId}</Text>
            <View style={styles.pickupTimeBox}>
               <Text>{getTimeUntilPickup(item.pickupTime)}</Text>
            </View>
            <ToggleButton expanded={expanded} onToggle={() => setExpanded(!expanded)} />
         </View>
         {expanded && (
            <View style={styles.orderDetails}>
               <Text style={styles.detailTitle}>{item.userName}</Text>
               <Text style={styles.detailBody}>Pickup time at {item.pickupTime.toLocaleString()}</Text>
               <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="call-outline" size={12} color="#6B7280" />
                  <Text style={styles.detailBody}>{item.telephone}</Text>
               </View>
               {/* Item Card */}
               {item.orderItems.map((card: any, index: number) => (
                  <CardItem
                     key={index}
                     orderItem={card}
                  />
               ))}
            </View>
         )}
      </>

   );
}

const BORDER_RADIUS = 16;

const PADDING_ORDER_ROW = 4;
const PADDING_ORDER_DETAILS = 16;

const styles = StyleSheet.create({
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: PADDING_ORDER_ROW,
    paddingLeft: 16,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pickupTimeBox: {
   backgroundColor: "#FECD4C",
   borderRadius: 8,
   padding: 8,
   width: 160,
   alignItems: "center",
  },
  expanded: {
   borderTopStartRadius: BORDER_RADIUS,
   borderTopEndRadius: BORDER_RADIUS,
  },
  orderInfo: {
   marginTop: 8,
  },
  orderDetails: {
   flexDirection: "column",
   justifyContent: "space-between",
   alignItems: "flex-start",
   borderWidth: 1,
   borderColor: "#E5E7EB",
   borderBottomStartRadius: BORDER_RADIUS,
   borderBottomEndRadius: BORDER_RADIUS,
   padding: PADDING_ORDER_DETAILS,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#11181C",
  },
  detailBody: {
   fontSize: 12,
  }
});
