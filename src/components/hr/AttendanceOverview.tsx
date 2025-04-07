
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample data for 7 days
const initialDays = [
  { date: "Mon, Apr 1", attendance: 92, onTime: 88, late: 4, absent: 8 },
  { date: "Tue, Apr 2", attendance: 96, onTime: 90, late: 6, absent: 4 },
  { date: "Wed, Apr 3", attendance: 88, onTime: 85, late: 3, absent: 12 },
  { date: "Thu, Apr 4", attendance: 94, onTime: 91, late: 3, absent: 6 },
  { date: "Fri, Apr 5", attendance: 90, onTime: 87, late: 3, absent: 10 },
  { date: "Sat, Apr 6", attendance: 80, onTime: 75, late: 5, absent: 20 },
  { date: "Today", attendance: 96, onTime: 92, late: 4, absent: 4 },
];

// Previous week data
const previousWeekDays = [
  { date: "Mon, Mar 25", attendance: 90, onTime: 85, late: 5, absent: 10 },
  { date: "Tue, Mar 26", attendance: 92, onTime: 88, late: 4, absent: 8 },
  { date: "Wed, Mar 27", attendance: 85, onTime: 80, late: 5, absent: 15 },
  { date: "Thu, Mar 28", attendance: 88, onTime: 84, late: 4, absent: 12 },
  { date: "Fri, Mar 29", attendance: 94, onTime: 90, late: 4, absent: 6 },
  { date: "Sat, Mar 30", attendance: 78, onTime: 72, late: 6, absent: 22 },
  { date: "Sun, Mar 31", attendance: 92, onTime: 88, late: 4, absent: 8 },
];

const AttendanceOverview = () => {
  const [days, setDays] = useState(initialDays);
  const [weekLabel, setWeekLabel] = useState("Last 7 days");
  const [viewingCurrent, setViewingCurrent] = useState(true);
  const { toast } = useToast();

  const toggleWeek = () => {
    if (viewingCurrent) {
      setDays(previousWeekDays);
      setWeekLabel("Mar 25 - Mar 31");
      setViewingCurrent(false);
    } else {
      setDays(initialDays);
      setWeekLabel("Last 7 days");
      setViewingCurrent(true);
    }

    toast({
      title: "Week Changed",
      description: viewingCurrent ? "Viewing previous week data" : "Viewing current week data",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data Exported",
      description: "Attendance data has been exported to CSV",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="space-x-2">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            On Time
          </Badge>
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            Late
          </Badge>
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Absent
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 w-7 p-0" 
            onClick={toggleWeek}
            disabled={!viewingCurrent}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground">{weekLabel}</div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 w-7 p-0" 
            onClick={toggleWeek}
            disabled={viewingCurrent}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {days.map((day, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between">
              <div className="text-sm font-medium">{day.date}</div>
              <div className="text-sm">
                {day.attendance}% attendance
              </div>
            </div>
            <div className="flex h-2 items-center">
              <div
                className="bg-green-500 h-2 rounded-l-full"
                style={{ width: `${day.onTime}%` }}
              />
              <div
                className="bg-amber-500 h-2"
                style={{ width: `${day.late}%` }}
              />
              <div
                className="bg-red-500 h-2 rounded-r-full"
                style={{ width: `${day.absent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <div>{day.onTime}% on time</div>
              <div>{day.late}% late</div>
              <div>{day.absent}% absent</div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <div className="flex justify-between mb-2">
          <div className="text-sm font-medium">Monthly attendance rate</div>
          <div className="text-sm font-medium">92%</div>
        </div>
        <Progress value={92} className="h-2" />
        <div className="flex justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            Target: 95% • Above quarterly average by 2.5%
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportData}
          >
            Export Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceOverview;
