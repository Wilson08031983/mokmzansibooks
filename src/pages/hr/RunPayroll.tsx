
import { useState } from "react";
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

// Mock employee data (in a real app, this would come from your backend)
const employees = [
  {
    id: "1",
    name: "John Doe",
    monthlySalary: "45000",
  },
  {
    id: "2",
    name: "Jane Smith",
    monthlySalary: "52000",
  },
  {
    id: "3",
    name: "Robert Johnson",
    monthlySalary: "48000",
  }
];

const RunPayroll = () => {
  const { toast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [monthlyBaseSalary, setMonthlyBaseSalary] = useState("");
  const [workDays, setWorkDays] = useState<WorkDay[]>([
    {
      date: new Date(),
      hoursWorked: 8,
      isPublicHoliday: false
    }
  ]);
  const [calculation, setCalculation] = useState<any>(null);

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setMonthlyBaseSalary(employee.monthlySalary);
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

    const mockEmployeeData = {
      bonusDate: "2025-12-01",
      noBonusApplicable: false
    };

    const payslipData = calculatePayslip(
      workDays, 
      Number(monthlyBaseSalary),
      mockEmployeeData.bonusDate,
      mockEmployeeData.noBonusApplicable
    );
    setCalculation(payslipData);

    toast({
      title: "Payslip Generated",
      description: "Payslip has been generated successfully"
    });
  };

  const addWorkDay = () => {
    setWorkDays([...workDays, {
      date: new Date(),
      hoursWorked: 8,
      isPublicHoliday: false
    }]);
  };

  const removeWorkDay = (index: number) => {
    if (workDays.length > 1) {
      const newWorkDays = [...workDays];
      newWorkDays.splice(index, 1);
      setWorkDays(newWorkDays);
    }
  };

  const updateWorkDay = (index: number, field: keyof WorkDay, value: any) => {
    const newWorkDays = [...workDays];
    newWorkDays[index] = { ...newWorkDays[index], [field]: value };
    setWorkDays(newWorkDays);
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
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary">Monthly Base Salary (ZAR)</Label>
              <Input
                id="salary"
                type="number"
                value={monthlyBaseSalary}
                onChange={(e) => setMonthlyBaseSalary(e.target.value)}
                placeholder="Enter monthly salary"
                readOnly
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Work Days</Label>
                <Button variant="outline" size="sm" onClick={addWorkDay}>
                  Add Day
                </Button>
              </div>
              
              {workDays.map((day, index) => (
                <div key={index} className="grid gap-3 p-3 border rounded-md">
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor={`date-${index}`}>Date</Label>
                    <Input
                      id={`date-${index}`}
                      type="date"
                      value={format(day.date, "yyyy-MM-dd")}
                      onChange={(e) => updateWorkDay(index, "date", new Date(e.target.value))}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor={`hours-${index}`}>Hours Worked</Label>
                    <Input
                      id={`hours-${index}`}
                      type="number"
                      placeholder="Hours worked"
                      value={day.hoursWorked}
                      onChange={(e) => updateWorkDay(index, "hoursWorked", Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox 
                      id={`holiday-${index}`}
                      checked={day.isPublicHoliday}
                      onCheckedChange={(checked) => 
                        updateWorkDay(index, "isPublicHoliday", checked === true)
                      }
                    />
                    <Label htmlFor={`holiday-${index}`}>Public Holiday</Label>
                  </div>
                  {workDays.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-2"
                      onClick={() => removeWorkDay(index)}
                    >
                      Remove Day
                    </Button>
                  )}
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
            employeeName={employees.find(emp => emp.id === selectedEmployee)?.name || ""}
            period={format(new Date(), "MMMM yyyy")}
          />
        )}
      </div>
    </div>
  );
};

export default RunPayroll;
