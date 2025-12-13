// services/employees.ts
import { httpDelete, httpGet, postJSON } from "@/lib/api";
import type {
  CreateEmployeeInput,
  Employee,
  EmployeesResponse
} from "@/types/employee";

/**
 * Load employees + owner for a merchant
 * GET /api/merchant/:merchantId/employees
 */
export async function fetchEmployees(
  merchantId: string
): Promise<EmployeesResponse> {
  return httpGet<EmployeesResponse>(
    `/api/merchant/${encodeURIComponent(merchantId)}/employees`
  );
}

/**
 * Create a new employee
 * POST /api/merchant/:merchantId/employees
 */
export async function createEmployee(
  merchantId: string,
  payload: CreateEmployeeInput
): Promise<Employee> {
  return postJSON<Employee>(
    `/api/merchant/${encodeURIComponent(merchantId)}/employees`,
    payload
  );
}

/**
 * Disable access (used by your "Disable" action)
 * POST /api/merchant/:merchantId/employees/:employeeId/disable
 */
export async function disableEmployee(
  merchantId: string,
  employeeId: string
): Promise<Employee> {
  return postJSON<Employee>(
    `/api/merchant/${encodeURIComponent(
      merchantId
    )}/employees/${encodeURIComponent(employeeId)}/disable`,
    {} // no body fields required
  );
}

/**
 * Enable access (not used by your current UI, but handy)
 * POST /api/merchant/:merchantId/employees/:employeeId/enable
 */
export async function enableEmployee(
  merchantId: string,
  employeeId: string
): Promise<Employee> {
  return postJSON<Employee>(
    `/api/merchant/${encodeURIComponent(
      merchantId
    )}/employees/${encodeURIComponent(employeeId)}/enable`,
    {}
  );
}

/**
 * Hard delete (not used by current UI)
 * DELETE /api/merchant/:merchantId/employees/:employeeId
 */
export async function deleteEmployee(
  merchantId: string,
  employeeId: string
): Promise<void> {
  const path = `/api/merchant/${encodeURIComponent(
    merchantId
  )}/employees/${encodeURIComponent(employeeId)}`;
  await httpDelete(path);
}


export type MerchantAccessResponse = {
  merchantId: string;
  merchantStatus: "PENDING" | "APPROVED" | "SUSPENDED";
};

export async function getMerchantAccessByEmployeeEmail(
  email: string
): Promise<MerchantAccessResponse> {
  const norm = email.trim().toLowerCase();
  return httpGet<MerchantAccessResponse>(
    `/api/merchant/employees/merchant?email=${encodeURIComponent(norm)}`
  );
}
