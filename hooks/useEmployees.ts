import type { Employee } from '@/types/employee';
import { useMemo, useState } from 'react';
import mockEmployees from '../mockupData/employees.json';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees as unknown as Employee[]);
  
  const addEmployee = (newEmp: Employee) => {
    setEmployees(prev => [...prev, newEmp]);
  };

  const removeEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

   const owner = useMemo(
    () => employees.find(e => e.role === 'Owner') || null,
    [employees]
  );

  return {
    employees,
    owner,
    addEmployee,
    removeEmployee,
    setEmployees, // optional escape hatch
  };
}