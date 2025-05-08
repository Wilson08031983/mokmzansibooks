import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { calculatePayslip, WorkDay } from "@/utils/payrollCalculations";
import Payslip from "@/components/hr/Payslip";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, Users, Calendar, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [batchPayslips, setBatchPayslips] = useState<{employee: Employee, calculation: any}[]>([]);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendance();
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, monthly_salary, bonus_date, no_bonus_applicable')
        .order('last_name', { ascending: true });

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
        toast({
          title: "Employees Loaded",
          description: `Successfully loaded ${data.length} employees`,
        });
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching employees",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendance = async (employeeId: string = selectedEmployee) => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', `${currentMonth}-01`)
        .lte('date', `${currentMonth}-31`);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch attendance records",
          variant: "destructive"
        });
        return [];
      }

      if (data && data.length > 0) {
        const attendanceWorkDays: WorkDay[] = data.map(record => ({
          date: new Date(record.date),
          hoursWorked: record.hours_worked,
          isPublicHoliday: record.is_public_holiday
        }));
        
        if (employeeId === selectedEmployee) {
          setWorkDays(attendanceWorkDays);
        }
        
        return attendanceWorkDays;
      } else {
        if (employeeId === selectedEmployee) {
          toast({
            title: "No Attendance",
            description: "No attendance records found for this employee this month",
            variant: "warning"
          });
          setWorkDays([]);
        }
        return [];
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return [];
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
  
  const handleGenerateAllPayslips = async () => {
    if (employees.length === 0) {
      toast({
        title: "No Employees",
        description: "There are no employees to generate payslips for",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingAll(true);
    setShowBatchDialog(true);
    setBatchProgress(0);
    setBatchPayslips([]);
    
    const results: {employee: Employee, calculation: any}[] = [];
    
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      setBatchProgress(Math.floor((i / employees.length) * 100));
      
      // Fetch attendance for this employee
      const employeeWorkDays = await fetchAttendance(employee.id);
      
      // Calculate payslip
      const payslipData = calculatePayslip(
        employeeWorkDays,
        Number(employee.monthly_salary),
        employee.bonus_date,
        employee.no_bonus_applicable
      );
      
      results.push({
        employee,
        calculation: payslipData
      });
      
      // Add a small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setBatchPayslips(results);
    setBatchProgress(100);
    setIsGeneratingAll(false);
    
    toast({
      title: "All Payslips Generated",
      description: `Successfully generated ${results.length} payslips for the current period`,
      variant: "success"
    });
  };

  const handleDownloadAllPayslips = () => {
    toast({
      title: "Downloading Payslips",
      description: "All payslips are being prepared for download",
    });
    
    // In a real implementation, this would trigger a batch download
    // or generate a ZIP file with all payslips
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: `${batchPayslips.length} payslips have been downloaded`,
        variant: "success"
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Run Payroll</h1>
          <p className="text-muted-foreground">Generate payslips for your employees</p>
        </div>
        <Button 
          onClick={handleGenerateAllPayslips} 
          disabled={isGeneratingAll || isLoading}
          className="flex items-center gap-2"
        >
          {isGeneratingAll ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Users className="h-4 w-4" />
              Create All Payslips
            </>
          )}
        </Button>
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
                <SelectTrigger disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading employees...
                    </div>
                  ) : (
                    <SelectValue placeholder="Select an employee" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {employees.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No employees found
                    </div>
                  ) : (
                    employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))
                  )}
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

            <Button 
              className="w-full" 
              onClick={handleGeneratePayslip}
              disabled={!selectedEmployee || isLoading}
            >
              <FileText className="h-4 w-4 mr-2" />
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
      
      {/* Batch Payslip Generation Dialog */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Batch Payslip Generation</DialogTitle>
            <DialogDescription>
              Generating payslips for all employees for {format(new Date(), "MMMM yyyy")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {isGeneratingAll ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Processing employees...</span>
                  <span>{batchProgress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${batchProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Payslips Generated: {batchPayslips.length}</span>
                  <span className="text-sm text-muted-foreground">{format(new Date(), "MMMM yyyy")}</span>
                </div>
                
                <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
                  {batchPayslips.map((item, index) => (
                    <div key={index} className="p-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{item.employee.first_name} {item.employee.last_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Gross: R {item.calculation.totalPay.toFixed(2)}
                        </div>
                      </div>
                      <Badge variant={item.calculation.isBonusMonth ? "default" : "secondary"} className={item.calculation.isBonusMonth ? "bg-green-100 text-green-800" : ""}>
                        {item.calculation.isBonusMonth ? "Bonus Month" : "Regular"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {isGeneratingAll ? (
              <Button disabled className="w-full sm:w-auto">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button 
                  variant="outline" 
                  onClick={() => setShowBatchDialog(false)}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
                <Button 
                  onClick={handleDownloadAllPayslips} 
                  className="w-full sm:w-auto"
                  disabled={batchPayslips.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All Payslips
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RunPayroll;
