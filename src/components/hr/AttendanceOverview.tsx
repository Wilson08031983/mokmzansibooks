
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Sample data for 7 days
const days = [
  { date: "Mon, Apr 1", attendance: 92, onTime: 88, late: 4, absent: 8 },
  { date: "Tue, Apr 2", attendance: 96, onTime: 90, late: 6, absent: 4 },
  { date: "Wed, Apr 3", attendance: 88, onTime: 85, late: 3, absent: 12 },
  { date: "Thu, Apr 4", attendance: 94, onTime: 91, late: 3, absent: 6 },
  { date: "Fri, Apr 5", attendance: 90, onTime: 87, late: 3, absent: 10 },
  { date: "Sat, Apr 6", attendance: 80, onTime: 75, late: 5, absent: 20 },
  { date: "Today", attendance: 96, onTime: 92, late: 4, absent: 4 },
];

const AttendanceOverview = () => {
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
        <div className="text-sm text-muted-foreground">Last 7 days</div>
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
        <p className="text-xs text-muted-foreground mt-2">
          Target: 95% • Above quarterly average by 2.5%
        </p>
      </div>
    </div>
  );
};

export default AttendanceOverview;
