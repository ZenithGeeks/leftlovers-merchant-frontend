export type Role = 'Owner' | 'Manager' | 'Cashier' | 'Stock';

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: Role;
  isOwner?: boolean;
};
