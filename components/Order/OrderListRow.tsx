import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View
} from "react-native";
import ToggleButton from "@/components/Order/ToggleButton";
import { OrderListItem } from "@/constants/order.type";

interface OrderListRowProps {
  item: OrderListItem;
}

export default function OrderListRow({ item }: OrderListRowProps) {
   const [expanded, setExpanded] = useState(false);

   return (
      <>
         <View style={[styles.orderRow, expanded ? styles.expanded : { borderRadius: BORDER_RADIUS }]}>
         <Text style={{ marginTop: 8 }}>Order #{item.bookingId}</Text>
            <View style={{ backgroundColor: "#FECD4C", borderRadius: 8, padding: 8 }}>
               <Text>{item.pickupTime.toLocaleString()}</Text>
            </View>
            <ToggleButton expanded={expanded} onToggle={() => setExpanded(!expanded)} />
         </View>
         {expanded && (
            <View style={styles.orderDetails}>
               <Text style={styles.detailTitle}>{item.userName}</Text>
               <Text style={styles.detailBody}>Pickup time at {item.pickupTime.toLocaleString()}</Text>
               <Text style={styles.detailBody}>Put the tel here</Text>
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
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
