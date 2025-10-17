import { useCallback, useMemo, useState } from 'react';
import rawEmployees from '@/mockupData/employees.json';
import type { Employee } from '@/components/employees/types';

// Strongly type the imported JSON
const mockEmployees: Employee[] = rawEmployees as Employee[];

export function useEmployees(initial: Employee[] = mockEmployees) {
  const [employees, setEmployees] = useState<Employee[]>(initial);

  const addEmployee = useCallback((newEmp: Employee) => {
    setEmployees(prev => [...prev, newEmp]);
  }, []);

  const removeEmployee = useCallback((id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  }, []);

  const updateEmployee = useCallback((id: string, patch: Partial<Employee>) => {
    setEmployees(prev =>
      prev.map(e => (e.id === id ? { ...e, ...patch } : e))
    );
  }, []);

  const owner = useMemo(
    () => employees.find(e => e.role === 'Owner') || null,
    [employees]
  );

  return {
    employees,
    owner,
    addEmployee,
    removeEmployee,
    updateEmployee,
    setEmployees, // optional escape hatch
  };
}
