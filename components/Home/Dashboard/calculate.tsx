import { MerchantOrderLite, Order, OrderItem, OrderMenuItem, PopularMenuRow } from "@/types/types";

export function getPreparingCount(orders: Order[]): number {
  return orders.filter((o) => o.status === "PENDING").length;
}

export function getRevenueTotal(orders: Order[]): number {
  return orders.reduce((sum, o) => {
    if (o.paymentStatus !== "PAID") return sum;
    return sum + Number(o.totalAmount ?? 0);
  }, 0);
}

export function buildPopularMenuFromOrders(
  orders: Order[],
  limit = 3
): PopularMenuRow[] {
  const map = new Map<string, { menu: OrderMenuItem; totalQty: number }>();

  for (const order of orders) {
    const items = order.items ?? [];
    for (const item of items as OrderItem[]) {
      const menu = item.menu;
      if (!menu) continue;

      const prev = map.get(menu.id);
      const qty = Number(item.quantity ?? 0);

      if (prev) {
        prev.totalQty += qty;
      } else {
        map.set(menu.id, { menu, totalQty: qty });
      }
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, limit)
    .map(({ menu, totalQty }) => ({
      id: menu.id,
      imageUrl: menu.photoUrl ?? "",
      title: menu.name ?? "Menu",
      price: Number(menu.basePrice ?? 0),
      orders: totalQty,
      leftOverQty: menu.leftoverQty ?? 0,
    }));
}

export function extractReviewsFromOrders(orders: MerchantOrderLite[]) {
  return orders.map((o) => o.review).filter(Boolean);
}