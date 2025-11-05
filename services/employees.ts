// services/employees.ts
import type {
  CreateEmployeeInput,
  Employee,
  EmployeesResponse,
} from '@/types/employee';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'http://localhost:3000/api';

/**
 * Load employees + owner for a merchant
 */
export async function fetchEmployees(merchantId: string): Promise<EmployeesResponse> {
  const res = await fetch(`${BASE}/merchant/${merchantId}/employees`);
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`Fetch employees failed (${res.status}): ${msg}`);
  }
  return res.json();
}

/**
 * Create a new employee
 */
export async function createEmployee(
  merchantId: string,
  payload: CreateEmployeeInput
): Promise<Employee> {
  const res = await fetch(`${BASE}/merchant/${merchantId}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`Create employee failed (${res.status}): ${msg}`);
  }
  return res.json();
}

/**
 * Disable access (used by your "Disable" action)
 */
export async function disableEmployee(merchantId: string, employeeId: string): Promise<Employee> {
  const res = await fetch(
    `${BASE}/merchant/${merchantId}/employees/${employeeId}/disable`,
    { method: 'POST' }
  );
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`Disable employee failed (${res.status}): ${msg}`);
  }
  return res.json();
}

/**
 * Enable access (not used by your current UI, but handy)
 */
export async function enableEmployee(merchantId: string, employeeId: string): Promise<Employee> {
  const res = await fetch(
    `${BASE}/merchant/${merchantId}/employees/${employeeId}/enable`,
    { method: 'POST' }
  );
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`Enable employee failed (${res.status}): ${msg}`);
  }
  return res.json();
}

/**
 * Hard delete (not used by current UI)
 */
export async function deleteEmployee(merchantId: string, employeeId: string): Promise<void> {
  const res = await fetch(`${BASE}/merchant/${merchantId}/employees/${employeeId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`Delete employee failed (${res.status}): ${msg}`);
  }
}
