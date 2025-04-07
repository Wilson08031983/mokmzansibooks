
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NewLeaveRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leaveType, setLeaveType] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Leave Request Submitted",
      description: "Your leave request has been submitted successfully",
    });
    
    // Navigate back to the leaves page
    navigate("/hr/leaves");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          className="mr-2" 
          onClick={() => navigate("/hr/leaves")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Leave Request</h1>
          <p className="text-muted-foreground">
            Submit a new leave request for approval
          </p>
        </div>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Leave Request Details</CardTitle>
            <CardDescription>
              Provide the necessary details for your leave request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select defaultValue="current">
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current User (You)</SelectItem>
                  <SelectItem value="other">Request on behalf of someone else</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="leaveType">Leave Type</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal Leave</SelectItem>
                  <SelectItem value="parental">Parental Leave</SelectItem>
                  <SelectItem value="bereavement">Bereavement Leave</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="flex">
                  <Input 
                    id="startDate" 
                    type="date" 
                    required 
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <div className="flex">
                  <Input 
                    id="endDate" 
                    type="date" 
                    required 
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Leave</Label>
              <Textarea 
                id="reason" 
                placeholder="Provide details about your leave request" 
                className="h-24" 
                required
              />
            </div>
            
            {leaveType === "sick" && (
              <div className="space-y-2">
                <Label htmlFor="documentation">Supporting Documentation</Label>
                <Input id="documentation" type="file" />
                <p className="text-xs text-muted-foreground">
                  Please upload a doctor's note or medical certificate if applicable
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/hr/leaves")}>
              Cancel
            </Button>
            <Button type="submit">
              <Calendar className="mr-2 h-4 w-4" />
              Submit Leave Request
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default NewLeaveRequest;
