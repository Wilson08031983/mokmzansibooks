
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
import { Calendar, ChevronLeft, Upload, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitLeaveRequestAction } from "@/utils/actionUtils";

const NewLeaveRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [employee, setEmployee] = useState("current");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create FormData object to handle file upload
    const formData = new FormData();
    formData.append("leaveType", leaveType);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("reason", reason);
    formData.append("employee", employee);
    
    // Only append file if one is selected
    if (file) {
      formData.append("documentation", file);
    }
    
    // Submit the leave request
    const success = await submitLeaveRequestAction(formData, {
      onSuccess: () => {
        toast({
          title: "Leave Request Submitted",
          description: "Your leave request has been submitted successfully",
          variant: "success",
        });
        
        // Navigate back to the leaves page
        navigate("/hr/leaves");
      },
      onError: () => {
        toast({
          title: "Submission Failed",
          description: "There was an error submitting your leave request. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      }
    });
    
    if (!success) {
      setIsSubmitting(false);
    }
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
              <Select value={employee} onValueChange={setEmployee}>
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
              <Select value={leaveType} onValueChange={setLeaveType} required>
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
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
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
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate} // Prevent end date before start date
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
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documentation">Supporting Documentation</Label>
              <div className="border border-input rounded-md">
                <label 
                  htmlFor="documentation" 
                  className="flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-muted/50 text-center transition-colors"
                >
                  {file ? (
                    <>
                      <Check className="h-8 w-8 text-green-500 mb-2" />
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(file.size / 1024).toFixed(1)} KB • Click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="font-medium text-sm">Upload supporting document</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Medical certificate, doctor's note, or other relevant documentation
                      </p>
                    </>
                  )}
                </label>
                <Input 
                  id="documentation" 
                  type="file" 
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {leaveType === "sick" ? 
                  "Required: Please upload a doctor's note or medical certificate for sick leave" : 
                  "Optional: Upload any supporting documentation if applicable"}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/hr/leaves")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Submit Leave Request
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default NewLeaveRequest;
