
import { addHours, isWeekend, isWithinInterval } from 'date-fns';

export interface WorkDay {
  date: Date;
  hoursWorked: number;
  isPublicHoliday?: boolean;
}

export interface PayslipCalculation {
  regularHours: number;
  overtimeHours: {
    saturday: number;
    sunday: number;
    publicHoliday: number;
  };
  totalDays: number;
  basicSalary: number;
  overtimePay: {
    saturday: number;
    sunday: number;
    publicHoliday: number;
  };
  totalPay: number;
}

const HOURS_PER_DAY = 8;
const HOURLY_RATE = (monthlyRate: number) => monthlyRate / (HOURS_PER_DAY * 21); // Assuming 21 working days per month

// South African public holidays 2025 (example dates)
const PUBLIC_HOLIDAYS_2025 = [
  new Date(2025, 0, 1),  // New Year's Day
  new Date(2025, 2, 21), // Human Rights Day
  new Date(2025, 3, 18), // Good Friday
  new Date(2025, 3, 21), // Family Day
  new Date(2025, 3, 27), // Freedom Day
  new Date(2025, 4, 1),  // Workers' Day
  new Date(2025, 5, 16), // Youth Day
  new Date(2025, 7, 9),  // National Women's Day
  new Date(2025, 8, 24), // Heritage Day
  new Date(2025, 11, 16), // Day of Reconciliation
  new Date(2025, 11, 25), // Christmas Day
  new Date(2025, 11, 26), // Day of Goodwill
];

export const isPublicHoliday = (date: Date): boolean => {
  return PUBLIC_HOLIDAYS_2025.some(holiday =>
    holiday.getDate() === date.getDate() &&
    holiday.getMonth() === date.getMonth() &&
    holiday.getFullYear() === date.getFullYear()
  );
};

export const calculatePayslip = (
  workDays: WorkDay[],
  monthlyBaseSalary: number
): PayslipCalculation => {
  const hourlyRate = HOURLY_RATE(monthlyBaseSalary);
  
  let regularHours = 0;
  let saturdayOT = 0;
  let sundayOT = 0;
  let publicHolidayOT = 0;

  workDays.forEach(day => {
    const date = new Date(day.date);
    const isHoliday = day.isPublicHoliday || isPublicHoliday(date);
    
    if (isHoliday) {
      publicHolidayOT += day.hoursWorked;
    } else if (date.getDay() === 6) { // Saturday
      saturdayOT += day.hoursWorked;
    } else if (date.getDay() === 0) { // Sunday
      sundayOT += day.hoursWorked;
    } else {
      if (day.hoursWorked <= HOURS_PER_DAY) {
        regularHours += day.hoursWorked;
      } else {
        regularHours += HOURS_PER_DAY;
        saturdayOT += day.hoursWorked - HOURS_PER_DAY; // Overtime on weekdays counts as Saturday rate
      }
    }
  });

  const totalDays = workDays.length;
  const basicSalary = regularHours * hourlyRate;
  
  const overtimePay = {
    saturday: saturdayOT * hourlyRate * 1.5,
    sunday: sundayOT * hourlyRate * 2.0,
    publicHoliday: publicHolidayOT * hourlyRate * 2.0
  };

  const totalPay = basicSalary + overtimePay.saturday + overtimePay.sunday + overtimePay.publicHoliday;

  return {
    regularHours,
    overtimeHours: {
      saturday: saturdayOT,
      sunday: sundayOT,
      publicHoliday: publicHolidayOT
    },
    totalDays,
    basicSalary,
    overtimePay,
    totalPay
  };
};
