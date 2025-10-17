export type Role = "Owner" | "Manager" | "Cashier" | "Stock";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  email?: string;
  phone?: string;
}
