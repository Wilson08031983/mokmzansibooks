import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { calculatePayslip, WorkDay } from "@/utils/payrollCalculations";
import Payslip from "@/components/hr/Payslip";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  monthly_salary: number;
  bonus_date: string | null;
  no_bonus_applicable: boolean;
}

interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  hours_worked: number;
  is_public_holiday: boolean;
}

const RunPayroll = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [monthlyBaseSalary, setMonthlyBaseSalary] = useState("");
  const [workDays, setWorkDays] = useState<WorkDay[]>([]);
  const [calculation, setCalculation] = useState<any>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendance();
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name, monthly_salary, bonus_date, no_bonus_applicable');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive"
      });
      return;
    }

    if (data) {
      setEmployees(data);
    }
  };

  const fetchAttendance = async () => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', selectedEmployee)
      .gte('date', `${currentMonth}-01`)
      .lte('date', `${currentMonth}-31`);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch attendance records",
        variant: "destructive"
      });
      return;
    }

    if (data && data.length > 0) {
      const attendanceWorkDays: WorkDay[] = data.map(record => ({
        date: new Date(record.date),
        hoursWorked: record.hours_worked,
        isPublicHoliday: record.is_public_holiday
      }));
      setWorkDays(attendanceWorkDays);
    } else {
      toast({
        title: "No Attendance",
        description: "No attendance records found for this employee this month",
        variant: "warning"
      });
    }
  };

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setMonthlyBaseSalary(employee.monthly_salary.toString());
    }
  };

  const handleGeneratePayslip = () => {
    if (!selectedEmployee || !monthlyBaseSalary) {
      toast({
        title: "Missing Information",
        description: "Please select an employee",
        variant: "destructive"
      });
      return;
    }

    const employee = employees.find(emp => emp.id === selectedEmployee);
    if (!employee) return;

    const payslipData = calculatePayslip(
      workDays,
      Number(monthlyBaseSalary),
      employee.bonus_date,
      employee.no_bonus_applicable
    );
    setCalculation(payslipData);

    toast({
      title: "Payslip Generated",
      description: "Payslip has been generated successfully"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Run Payroll</h1>
        <p className="text-muted-foreground">Generate payslips for your employees</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employee Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Select Employee</Label>
              <Select value={selectedEmployee} onValueChange={handleEmployeeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Work Days (from Attendance)</Label>
              {workDays.map((day, index) => (
                <div key={index} className="grid grid-cols-3 gap-2">
                  <Input 
                    type="date" 
                    value={format(day.date, "yyyy-MM-dd")} 
                    readOnly 
                  />
                  <Input 
                    type="number" 
                    value={day.hoursWorked} 
                    readOnly 
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={day.isPublicHoliday}
                      disabled
                    />
                    <Label>Public Holiday</Label>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full" onClick={handleGeneratePayslip}>
              Generate Payslip
            </Button>
          </CardContent>
        </Card>

        {calculation && (
          <Payslip
            calculation={calculation}
            employeeName={employees.find(emp => emp.id === selectedEmployee)?.first_name + ' ' + employees.find(emp => emp.id === selectedEmployee)?.last_name || ""}
            period={format(new Date(), "MMMM yyyy")}
          />
        )}
      </div>
    </div>
  );
};

export default RunPayroll;
