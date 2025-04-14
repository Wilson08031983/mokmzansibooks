
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PayslipCalculation } from "@/utils/payrollCalculations";

interface PayslipProps {
  calculation: PayslipCalculation;
  employeeName: string;
  period: string;
}

const Payslip = ({ calculation, employeeName, period }: PayslipProps) => {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Payslip</CardTitle>
        <div className="text-sm text-muted-foreground">
          <p>Employee: {employeeName}</p>
          <p>Period: {period}</p>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="space-y-4">
            <section>
              <h3 className="font-medium mb-2">Attendance</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total Days Worked</div>
                <div className="text-right">{calculation.totalDays} days</div>
                <div>Regular Hours</div>
                <div className="text-right">{calculation.regularHours} hours</div>
              </div>
            </section>

            <section>
              <h3 className="font-medium mb-2">Overtime Hours</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Saturday (x1.5)</div>
                <div className="text-right">{calculation.overtimeHours.saturday} hours</div>
                <div>Sunday (x2.0)</div>
                <div className="text-right">{calculation.overtimeHours.sunday} hours</div>
                <div>Public Holidays (x2.0)</div>
                <div className="text-right">{calculation.overtimeHours.publicHoliday} hours</div>
              </div>
            </section>

            <section>
              <h3 className="font-medium mb-2">Earnings</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Basic Salary</div>
                <div className="text-right">{formatCurrency(calculation.basicSalary)}</div>
                <div>Saturday Overtime</div>
                <div className="text-right">{formatCurrency(calculation.overtimePay.saturday)}</div>
                <div>Sunday Overtime</div>
                <div className="text-right">{formatCurrency(calculation.overtimePay.sunday)}</div>
                <div>Public Holiday</div>
                <div className="text-right">{formatCurrency(calculation.overtimePay.publicHoliday)}</div>
              </div>
            </section>

            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-2 gap-2 font-medium">
                <div>Total Pay</div>
                <div className="text-right">{formatCurrency(calculation.totalPay)}</div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Payslip;
