// types/employee.ts
export type Role = 'Owner' | 'Manager' | 'Cashier' | 'Stock';

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  role: Role;
  status?: 'ACTIVE' | 'DISABLED';
  createdAt?: string;
  disabledAt?: string | null;
};

export type Owner = Omit<Employee, 'status' | 'createdAt' | 'disabledAt'>;

// Payload to create an employee
export type CreateEmployeeInput = {
  fullName: string;
  username?: string;
  email?: string;
  phone?: string;
  role: Exclude<Role, 'Owner'>; // cannot create Owner from UI
};

// Response from GET /employees
export type EmployeesResponse = {
  owner: Owner;
  employees: Employee[];
};
