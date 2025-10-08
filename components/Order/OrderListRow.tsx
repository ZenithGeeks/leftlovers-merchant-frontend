import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View
} from "react-native";
import ToggleButton from "@/components/Order/ToggleButton";
import { BORDER_RADIUS, PADDING } from "@/constants/theme";
import { OrderListItem } from "@/constants/order.type";

interface OrderListRowProps {
  item: OrderListItem;
}

export default function OrderListRow({ item }: OrderListRowProps) {
   const [expanded, setExpanded] = useState(false);

   return (
      <>
         <View style={[styles.orderRow, expanded ? styles.expanded : { borderRadius: BORDER_RADIUS }]}>
            <Text style={styles.orderInfo}>Order #{item.bookingId}</Text>
            <Text style={styles.orderInfo}>{item.pickupTime.toLocaleString()}</Text>
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

const styles = StyleSheet.create({
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: PADDING,
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
   padding: PADDING,
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
