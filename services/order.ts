import { httpGet, httpPut } from "@/lib/api";
import type { Order, OrderStatus } from "@/types/types";
export async function fetchMerchantOrders(
  merchantId: string
): Promise<Order[]> {
  return httpGet<Order[]>(`/api/merchant/${merchantId}/order`);
}

export async function updateMerchantOrderStatus(
  merchantId: string,
  orderId: string,
  status: OrderStatus
): Promise<Order> {
    console.log(merchantId,orderId,status)
  return httpPut<Order>(`/api/merchant/${merchantId}/order/${orderId}`, { status });
}