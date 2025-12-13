// __tests__/calculate.test.ts
import {
  buildPopularMenuFromOrders,
  extractReviewsFromOrders,
  getPreparingCount,
  getRevenueTotal,
} from "@/components/Home/Dashboard/calculate";

describe("Dashboard calculate.ts", () => {
  describe("getPreparingCount", () => {
    it("counts only PENDING orders", () => {
      const orders: any[] = [
        { status: "PENDING" },
        { status: "CONFIRMED" },
        { status: "PENDING" },
        { status: "READY" },
      ];
      expect(getPreparingCount(orders)).toBe(2);
    });

    it("returns 0 for empty list", () => {
      expect(getPreparingCount([] as any)).toBe(0);
    });
  });

  describe("getRevenueTotal", () => {
    it("sums totalAmount only for PAID orders", () => {
      const orders: any[] = [
        { paymentStatus: "PAID", totalAmount: 100 },
        { paymentStatus: "UNPAID", totalAmount: 999 },
        { paymentStatus: "PAID", totalAmount: "55.5" },
        { paymentStatus: "REFUNDED", totalAmount: 1000 },
        { paymentStatus: "PAID", totalAmount: null },
        { paymentStatus: "PAID" }, // undefined totalAmount
      ];

      // 100 + 55.5 + 0 + 0 = 155.5
      expect(getRevenueTotal(orders)).toBe(155.5);
    });

    it("returns 0 when no PAID orders", () => {
      const orders: any[] = [
        { paymentStatus: "UNPAID", totalAmount: 10 },
        { paymentStatus: "REFUNDED", totalAmount: 20 },
      ];
      expect(getRevenueTotal(orders)).toBe(0);
    });
  });

  describe("buildPopularMenuFromOrders", () => {
    it("aggregates quantities by menu id and returns sorted by totalQty desc", () => {
      const orders: any[] = [
        {
          items: [
            { quantity: 2, menu: { id: "m1", name: "A", basePrice: 10, photoUrl: "u1", leftoverQty: 5 } },
            { quantity: 1, menu: { id: "m2", name: "B", basePrice: 20, photoUrl: "u2", leftoverQty: 0 } },
          ],
        },
        {
          items: [
            { quantity: 3, menu: { id: "m1", name: "A", basePrice: 10, photoUrl: "u1", leftoverQty: 5 } },
            { quantity: 4, menu: { id: "m3", name: "C", basePrice: 30, photoUrl: "u3", leftoverQty: 2 } },
          ],
        },
      ];

      const res = buildPopularMenuFromOrders(orders, 10);

      // totals: m1=5, m3=4, m2=1
      expect(res.map((r) => ({ id: r.id, orders: r.orders }))).toEqual([
        { id: "m1", orders: 5 },
        { id: "m3", orders: 4 },
        { id: "m2", orders: 1 },
      ]);

      // mapped fields
      expect(res[0]).toMatchObject({
        id: "m1",
        imageUrl: "u1",
        title: "A",
        price: 10,
        leftOverQty: 5,
      });
    });

    it("skips items with no menu", () => {
      const orders: any[] = [
        { items: [{ quantity: 5, menu: null }, { quantity: 2 }] },
      ];
      const res = buildPopularMenuFromOrders(orders, 5);
      expect(res).toEqual([]);
    });

    it("treats missing quantity as 0", () => {
      const orders: any[] = [
        { items: [{ menu: { id: "m1", name: "A", basePrice: 10 } }] },
      ];
      const res = buildPopularMenuFromOrders(orders, 5);
      expect(res).toHaveLength(1);
      expect(res[0].orders).toBe(0);
    });

    it("uses defaults when fields are missing", () => {
      const orders: any[] = [
        {
          items: [
            { quantity: 1, menu: { id: "m1" } }, // no name/photo/basePrice/leftoverQty
          ],
        },
      ];
      const res = buildPopularMenuFromOrders(orders, 5);

      expect(res[0]).toEqual({
        id: "m1",
        imageUrl: "",
        title: "Menu",
        price: 0,
        orders: 1,
        leftOverQty: 0,
      });
    });

    it("respects limit", () => {
      const orders: any[] = [
        {
          items: [
            { quantity: 5, menu: { id: "m1", name: "A" } },
            { quantity: 4, menu: { id: "m2", name: "B" } },
            { quantity: 3, menu: { id: "m3", name: "C" } },
          ],
        },
      ];
      const res = buildPopularMenuFromOrders(orders, 2);
      expect(res).toHaveLength(2);
      expect(res.map((r) => r.id)).toEqual(["m1", "m2"]);
    });

    it("handles undefined items array safely", () => {
      const orders: any[] = [{ items: undefined }, {}];
      expect(buildPopularMenuFromOrders(orders, 3)).toEqual([]);
    });
  });

  describe("extractReviewsFromOrders", () => {
    it("returns only truthy reviews (filters out null/undefined/empty string)", () => {
      const orders: any[] = [
        { review: "good" },
        { review: null },
        { review: undefined },
        { review: "" },
        { review: "ok" },
      ];
      expect(extractReviewsFromOrders(orders)).toEqual(["good", "ok"]);
    });

    it("returns empty array when no reviews", () => {
      const orders: any[] = [{ review: null }, { review: undefined }];
      expect(extractReviewsFromOrders(orders)).toEqual([]);
    });
  });
});
