
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { calculatePayslip, WorkDay } from "@/utils/payrollCalculations";
import Payslip from "@/components/hr/Payslip";
import { format } from "date-fns";

const GeneratePayslip = () => {
  const { toast } = useToast();
  const [employeeName, setEmployeeName] = useState("");
  const [monthlyBaseSalary, setMonthlyBaseSalary] = useState("");
  const [workDays, setWorkDays] = useState<WorkDay[]>([
    {
      date: new Date(),
      hoursWorked: 8,
      isPublicHoliday: false
    }
  ]);
  const [calculation, setCalculation] = useState<any>(null);

  const handleGeneratePayslip = () => {
    if (!employeeName || !monthlyBaseSalary) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const payslipData = calculatePayslip(workDays, Number(monthlyBaseSalary));
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

  const updateWorkDay = (index: number, field: keyof WorkDay, value: any) => {
    const newWorkDays = [...workDays];
    newWorkDays[index] = { ...newWorkDays[index], [field]: value };
    setWorkDays(newWorkDays);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Payslip</h1>
        <p className="text-muted-foreground">Create and calculate employee payslips</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employee Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Employee Name</Label>
              <Input
                id="name"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Enter employee name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary">Monthly Base Salary</Label>
              <Input
                id="salary"
                type="number"
                value={monthlyBaseSalary}
                onChange={(e) => setMonthlyBaseSalary(e.target.value)}
                placeholder="Enter monthly salary"
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
                <div key={index} className="grid gap-2">
                  <Input
                    type="date"
                    value={format(day.date, "yyyy-MM-dd")}
                    onChange={(e) => updateWorkDay(index, "date", new Date(e.target.value))}
                  />
                  <Input
                    type="number"
                    placeholder="Hours worked"
                    value={day.hoursWorked}
                    onChange={(e) => updateWorkDay(index, "hoursWorked", Number(e.target.value))}
                  />
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
            employeeName={employeeName}
            period={format(new Date(), "MMMM yyyy")}
          />
        )}
      </div>
    </div>
  );
};

export default GeneratePayslip;
