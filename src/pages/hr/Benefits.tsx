import { useState } from "react";

// Employee status types
type EmployeeStatus = "active" | "terminated" | "deceased" | "on_leave";

// Interface for employee data
interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  status: EmployeeStatus;
  hireDate: string;
  terminationDate?: string;
  terminationReason?: string;
}

// Interface for supplier information
interface Supplier {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  category: string;
  notes?: string;
}

// Interface for benefit enrollment
interface BenefitEnrollment {
  employeeId: string;
  planId: string;
  enrollmentDate: string;
  terminationDate?: string;
  contributions: string;
  dependents: number;
  status: "active" | "terminated" | "pending";
}

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Briefcase, 
  Users, 
  Settings, 
  FileText,
  Download,
  Plus,
  Loader2,
  Car,
  Home,
  UserPlus,
  ArrowLeft,
  Calendar,
  Check,
  X
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { addBenefitPlanAction } from "@/utils/actionUtils";

// Mock employee data
const employees: Employee[] = [
  {
    id: "101",
    name: "John Doe",
    position: "Software Developer",
    department: "Engineering",
    status: "active",
    hireDate: "2023-01-15"
  },
  {
    id: "102",
    name: "Jane Smith",
    position: "HR Manager",
    department: "Human Resources",
    status: "active",
    hireDate: "2022-05-10"
  },
  {
    id: "103",
    name: "Robert Johnson",
    position: "Project Manager",
    department: "Product",
    status: "active",
    hireDate: "2023-03-22"
  },
  {
    id: "104",
    name: "Mary Williams",
    position: "Marketing Director",
    department: "Marketing",
    status: "active",
    hireDate: "2021-11-05"
  },
  {
    id: "105",
    name: "David Brown",
    position: "Financial Analyst",
    department: "Finance",
    status: "terminated",
    hireDate: "2022-02-15",
    terminationDate: "2024-03-01",
    terminationReason: "new_opportunity"
  },
  {
    id: "106",
    name: "Sarah Miller",
    position: "Customer Support Specialist",
    department: "Support",
    status: "on_leave",
    hireDate: "2023-06-20"
  }
];

// Mock suppliers data
const suppliers: Supplier[] = [
  {
    id: "sup1",
    name: "BlueCross Health Insurance",
    address: "123 Insurance Way",
    city: "Johannesburg",
    state: "Gauteng",
    postalCode: "2000",
    country: "South Africa",
    phone: "+27 11 555 1234",
    email: "info@bluecross.co.za",
    website: "https://www.bluecross.co.za",
    category: "Healthcare"
  },
  {
    id: "sup2",
    name: "Secure Future Retirement",
    address: "456 Pension Plaza",
    city: "Cape Town",
    state: "Western Cape",
    postalCode: "8001",
    country: "South Africa",
    phone: "+27 21 555 6789",
    email: "contact@securefuture.co.za",
    website: "https://www.securefuture.co.za",
    category: "Retirement"
  },
  {
    id: "sup3",
    name: "Clear Sight Dental & Vision",
    address: "789 Optical Avenue",
    city: "Durban",
    state: "KwaZulu-Natal",
    postalCode: "4001",
    country: "South Africa",
    phone: "+27 31 555 4321",
    email: "support@clearsight.co.za",
    website: "https://www.clearsight.co.za",
    category: "Dental & Vision"
  },
  {
    id: "sup4",
    name: "Secure Life Insurance",
    address: "101 Protection Road",
    city: "Pretoria",
    state: "Gauteng",
    postalCode: "0002",
    country: "South Africa",
    phone: "+27 12 555 8765",
    email: "claims@securelife.co.za",
    website: "https://www.securelife.co.za",
    category: "Life Insurance"
  },
  {
    id: "sup5",
    name: "Home Sweet Home Properties",
    address: "202 Housing Boulevard",
    city: "Bloemfontein",
    state: "Free State",
    postalCode: "9301",
    country: "South Africa",
    phone: "+27 51 555 2468",
    email: "housing@homesweethome.co.za",
    website: "https://www.homesweethome.co.za",
    category: "Housing"
  }
];

// Mock benefit enrollments
const benefitEnrollments: BenefitEnrollment[] = [
  { employeeId: "101", planId: "1", enrollmentDate: "2023-02-15", contributions: "R300 per month", dependents: 2, status: "active" },
  { employeeId: "101", planId: "2", enrollmentDate: "2023-02-15", contributions: "5% of salary", dependents: 0, status: "active" },
  { employeeId: "102", planId: "1", enrollmentDate: "2022-08-10", contributions: "R300 per month", dependents: 1, status: "active" },
  { employeeId: "102", planId: "3", enrollmentDate: "2022-08-10", contributions: "R100 per month", dependents: 1, status: "active" },
  { employeeId: "103", planId: "1", enrollmentDate: "2023-06-22", contributions: "R300 per month", dependents: 3, status: "active" },
  { employeeId: "103", planId: "3", enrollmentDate: "2023-06-22", contributions: "R100 per month", dependents: 3, status: "active" },
  { employeeId: "104", planId: "2", enrollmentDate: "2022-02-05", contributions: "8% of salary", dependents: 0, status: "active" },
  { employeeId: "104", planId: "4", enrollmentDate: "2022-02-05", contributions: "R75 per month", dependents: 0, status: "active" },
  { employeeId: "105", planId: "2", enrollmentDate: "2022-05-15", contributions: "10% of salary", dependents: 0, status: "terminated", terminationDate: "2024-03-01" },
  { employeeId: "106", planId: "1", enrollmentDate: "2023-09-20", contributions: "R300 per month", dependents: 0, status: "active" }
];

const benefitPlans = [
  {
    id: 1,
    name: "Healthcare",
    provider: "BlueCross",
    plan: "Standard",
    coverage: "Comprehensive",
    eligibility: "Full-time employees",
    enrollmentDate: "January 1, 2025",
    details: "Medical, prescription, and preventive care coverage."
  },
  {
    id: 2,
    name: "Motor Vehicle Allowance",
    provider: "Company Transport Policy",
    plan: "Standard",
    coverage: "Monthly Allowance",
    eligibility: "Full-time employees",
    enrollmentDate: "January 1, 2025",
    details: "Monthly allowance for vehicle-related expenses."
  },
  {
    id: 3,
    name: "House Allowance",
    provider: "Company Housing Policy",
    plan: "Standard",
    coverage: "Monthly Allowance",
    eligibility: "Full-time employees",
    enrollmentDate: "January 1, 2025",
    details: "Monthly allowance for housing-related expenses."
  },
  {
    id: 4,
    name: "401(k)",
    provider: "Fidelity",
    plan: "Standard",
    coverage: "Retirement",
    eligibility: "Full-time employees after 90 days",
    enrollmentDate: "January 1, 2025",
    details: "Retirement savings plan with employer matching up to 5%."
  }
];

const Benefits = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("plans");
  const [isExporting, setIsExporting] = useState(false);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [managingPlan, setManagingPlan] = useState<string | null>(null);
  const [isMassEnrolling, setIsMassEnrolling] = useState(false);
  const [isOpenEnrollment, setIsOpenEnrollment] = useState(false);
  const [showMassEnrollmentDialog, setShowMassEnrollmentDialog] = useState(false);
  const [showOpenEnrollmentDialog, setShowOpenEnrollmentDialog] = useState(false);
  const [showConfigureDialog, setShowConfigureDialog] = useState(false);
  const [configuringSettingType, setConfiguringSettingType] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  
  const handleManagePlan = (name: string) => {
    // Set the managing plan state to show loading indicator
    setManagingPlan(name);
    
    // Find the plan details to pass to the management page
    const planDetails = benefitPlans.find(plan => plan.name === name);
    
    // Show toast notification
    toast({
      title: `Managing ${name} Plan`,
      description: `Opening ${name.toLowerCase()} plan configuration`,
      variant: "success",
    });
    
    // Simulate API call to fetch detailed plan information
    setTimeout(() => {
      // Store plan details in sessionStorage for the management page to access
      if (planDetails) {
        sessionStorage.setItem('currentPlan', JSON.stringify(planDetails));
      }
      
      // Navigate to the appropriate route based on plan name
      if (name === "Employee") {
        // Navigate to the employees page instead of a non-existent route
        navigate("/dashboard/hr/employees");
      } else {
        // Pass plan ID as a query parameter for easier retrieval
        navigate(`/dashboard/hr/benefits/${name.toLowerCase()}?id=${planDetails?.id || ''}`);
      }
      
      // Reset the managing state after navigation
      setManagingPlan(null);
    }, 800); // Slightly longer delay for better UX
  };
  
  // Function to handle mass enrollment of employees
  const handleMassEnrollment = () => {
    setIsMassEnrolling(true);
    setShowMassEnrollmentDialog(true);
    
    // Show toast notification
    toast({
      title: "Mass Enrollment",
      description: "Opening mass enrollment configuration",
      variant: "default",
    });
  };
  
  // Function to handle open enrollment period
  const handleOpenEnrollment = () => {
    setIsOpenEnrollment(true);
    setShowOpenEnrollmentDialog(true);
    
    // Show toast notification
    toast({
      title: "Open Enrollment",
      description: "Opening enrollment period configuration",
      variant: "default",
    });
  };
  
  // Function to handle configuring benefit settings
  const handleConfigureSetting = (settingType: string) => {
    setIsConfiguring(true);
    setConfiguringSettingType(settingType);
    setShowConfigureDialog(true);
    
    // Show toast notification
    toast({
      title: `Configure ${settingType}`,
      description: `Opening ${settingType.toLowerCase()} configuration`,
      variant: "default",
    });
  };
  
  // State for employee benefit details viewing
  const [viewingEmployeeId, setViewingEmployeeId] = useState<string | null>(null);
  
  // State for employee turnover management
  const [showEmployeeStatusDialog, setShowEmployeeStatusDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newEmployeeStatus, setNewEmployeeStatus] = useState<EmployeeStatus>("active");
  const [terminationReason, setTerminationReason] = useState("");
  const [terminationDate, setTerminationDate] = useState("");
  const [isProcessingStatusChange, setIsProcessingStatusChange] = useState(false);
  
  // State for supplier management
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierFormData, setSupplierFormData] = useState<Partial<Supplier>>({
    name: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "South Africa",
    phone: "",
    email: "",
    website: "",
    category: "",
    notes: ""
  });
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  
  // Function to handle viewing an employee's benefit details
  const handleViewEmployeeBenefits = (employeeId: string, employeeName: string) => {
    setViewingEmployeeId(employeeId);
    
    // Show toast notification
    toast({
      title: "Loading Benefits",
      description: `Retrieving benefit details for ${employeeName}`,
      variant: "default",
    });
    
    // Simulate API call to fetch employee benefit details
    setTimeout(() => {
      // In a real app, you would fetch the employee's benefit details from an API
      // and store them in state or sessionStorage
      
      // For demo purposes, create mock employee benefit details
      const employeeBenefits = {
        id: employeeId,
        name: employeeName,
        enrolledPlans: employeeName === "John Doe" ? ["Healthcare", "401(k)"] : ["Healthcare", "401(k)", "Life Insurance", "Dental"],
        enrollmentDates: {
          "Healthcare": "2024-01-15",
          "401(k)": "2024-02-01",
          "Life Insurance": "2024-03-10",
          "Dental": "2024-02-15"
        },
        contributions: {
          "Healthcare": "R1,200/month",
          "401(k)": "6% of salary",
          "Life Insurance": "R300/month",
          "Dental": "R250/month"
        },
        dependents: 2,
        nextReviewDate: "2025-01-15"
      };
      
      // Store the employee benefit details in sessionStorage
      sessionStorage.setItem('currentEmployeeBenefits', JSON.stringify(employeeBenefits));
      
      // Navigate to the employee benefits details page
      navigate(`/dashboard/hr/employee-benefits-view/${employeeId}`);
      
      // Reset the viewing state
      setViewingEmployeeId(null);
    }, 1000);
  };
  
  const handleAddNewPlan = async () => {
    if (isAddingPlan) return;
    
    setIsAddingPlan(true);
    
    try {
      // Show toast notification
      toast({
        title: "Creating New Plan",
        description: "Setting up new benefit plan configuration",
        variant: "default",
      });
      
      // Simulate API call to create a new plan
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add the action to the activity log
      addBenefitPlanAction("Created new benefit plan", "success");
      
      // Navigate to the new plan page
      navigate("/dashboard/hr/benefits/new");
    } catch (error) {
      console.error("Error creating new plan:", error);
      toast({
        title: "Error",
        description: "Failed to create new plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingPlan(false);
    }
  };
  
  // Function to handle employee status changes (termination, deceased, etc.)
  const handleEmployeeStatusChange = (employee: Employee) => {
    setSelectedEmployee(employee);
    setNewEmployeeStatus(employee.status);
    setTerminationDate(employee.terminationDate || "");
    setTerminationReason(employee.terminationReason || "");
    setShowEmployeeStatusDialog(true);
  };
  
  // Function to process employee status change
  const processEmployeeStatusChange = async () => {
    if (!selectedEmployee) return;
    
    setIsProcessingStatusChange(true);
    
    try {
      // Show toast notification
      toast({
        title: "Processing Status Change",
        description: `Updating status for ${selectedEmployee.name}`,
        variant: "default",
      });
      
      // Simulate API call to update employee status
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would update the employee status in your database
      // and handle any necessary benefit enrollment changes
      
      // Add the action to the activity log with appropriate message based on status
      let actionDescription = "";
      
      if (newEmployeeStatus === "terminated") {
        actionDescription = `${selectedEmployee.name} has left the company: ${terminationReason}`;
      } else if (newEmployeeStatus === "deceased") {
        actionDescription = `${selectedEmployee.name} has passed away`;
      } else if (newEmployeeStatus === "on_leave") {
        actionDescription = `${selectedEmployee.name} is now on leave`;
      } else {
        actionDescription = `${selectedEmployee.name} status changed to ${newEmployeeStatus}`;
      }
      
      // Use an object for the second parameter to fix the TypeScript error
      addBenefitPlanAction(actionDescription, { type: "info" });
      
      // Show success toast with appropriate message based on status
      let successMessage = "";
      
      if (newEmployeeStatus === "terminated") {
        successMessage = `${selectedEmployee.name} has been marked as having left the company. Their benefits will be terminated as of ${terminationDate}.`;
      } else if (newEmployeeStatus === "deceased") {
        successMessage = `${selectedEmployee.name} has been marked as deceased. Their benefits will be processed according to company policy.`;
      } else {
        successMessage = `${selectedEmployee.name}'s status has been updated to ${newEmployeeStatus}.`;
      }
      
      toast({
        title: "Status Updated",
        description: successMessage,
        variant: "success",
      });
      
      // Close the dialog
      setShowEmployeeStatusDialog(false);
    } catch (error) {
      console.error("Error updating employee status:", error);
      toast({
        title: "Error",
        description: "Failed to update employee status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingStatusChange(false);
    }
  };

  // Function to handle adding a new supplier
  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setSupplierFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "South Africa",
      phone: "",
      email: "",
      website: "",
      category: "",
      notes: ""
    });
    setShowSupplierDialog(true);
  };
  
  // Function to handle editing an existing supplier
  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setSupplierFormData(supplier);
    setShowSupplierDialog(true);
  };
  
  // Function to handle address input changes with autofill
  const handleAddressChange = (value: string) => {
    setSupplierFormData(prev => ({ ...prev, address: value }));
    
    // Only show suggestions if the address is at least 3 characters long
    if (value.length >= 3) {
      // Simulate address autofill API call
      // In a real app, you would call an address autofill API like Google Places API
      const mockAddressSuggestions = [
        value + ", Main Street, Johannesburg",
        value + ", Business District, Pretoria",
        value + ", Commercial Avenue, Cape Town",
        value + ", Corporate Park, Durban"
      ];
      
      setAddressSuggestions(mockAddressSuggestions);
      setShowAddressSuggestions(true);
    } else {
      setShowAddressSuggestions(false);
    }
  };
  
  // Function to handle selecting an address suggestion
  const handleSelectAddress = (address: string) => {
    // Parse the address components
    // In a real app, you would get these details from the address API
    const parts = address.split(", ");
    const streetAddress = parts[0];
    const city = parts.length > 2 ? parts[2] : "";
    
    setSupplierFormData(prev => ({
      ...prev,
      address: streetAddress,
      city: city,
      state: city === "Johannesburg" || city === "Pretoria" ? "Gauteng" :
             city === "Cape Town" ? "Western Cape" :
             city === "Durban" ? "KwaZulu-Natal" : prev.state || ""
    }));
    
    setShowAddressSuggestions(false);
  };
  
  // Function to handle form input changes
  const handleSupplierFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSupplierFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Function to save supplier information
  const handleSaveSupplier = async () => {
    setIsAddingSupplier(true);
    
    try {
      // Show toast notification
      toast({
        title: selectedSupplier ? "Updating Supplier" : "Adding Supplier",
        description: `${selectedSupplier ? 'Updating' : 'Adding'} supplier information for ${supplierFormData.name}`,
        variant: "default",
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would save the supplier to your database
      
      // Add the action to the activity log
      // Use an object for the second parameter to fix the TypeScript error
      addBenefitPlanAction(
        `${selectedSupplier ? 'Updated' : 'Added'} supplier: ${supplierFormData.name}`, 
        { type: "success" }
      );
      
      toast({
        title: "Success",
        description: `Supplier ${selectedSupplier ? 'updated' : 'added'} successfully.`,
        variant: "success",
      });
      
      // Close the dialog
      setShowSupplierDialog(false);
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast({
        title: "Error",
        description: `Failed to ${selectedSupplier ? 'update' : 'add'} supplier. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsAddingSupplier(false);
    }
  };

  const handleExportBenefitReport = async () => {
    try {
      // Show toast notification
      toast({
        title: "Generating Report",
        description: "Preparing benefit plans report",
        variant: "default",
      });
      
      // Simulate API call to generate report
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get the element to export
      const element = document.getElementById('benefit-plans-container');
      
      if (element) {
        // Use html2canvas to create a canvas from the element
        const canvas = await html2canvas(element);
        
        // Create a new jsPDF instance
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Get the width and height of the canvas
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add the canvas as an image to the PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Save the PDF
        pdf.save('benefit-plans-report.pdf');
        
        // Show success toast
        toast({
          title: "Report Generated",
          description: "Benefit plans report has been downloaded",
          variant: "success",
        });
      } else {
        throw new Error("Element not found");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Export Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Benefits</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportBenefitReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="plans" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Benefit Plans</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="benefit-plans-container">
            {benefitPlans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{plan.provider}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan:</span>
                      <span>{plan.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coverage:</span>
                      <span>{plan.coverage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Eligibility:</span>
                      <span>{plan.eligibility}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Enrollment Date:</span>
                      <span>{plan.enrollmentDate}</span>
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 pt-0 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleManagePlan(plan.name)}
                    disabled={managingPlan === plan.name}
                  >
                    {managingPlan === plan.name ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Plan
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
            
            <Card 
              className="flex flex-col justify-center items-center p-6 h-full border-dashed cursor-pointer hover:bg-accent/50 transition-colors" 
              onClick={handleAddNewPlan}
            >
              {isAddingPlan ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Creating new plan...</p>
                </div>
              ) : (
                <>
                  <div className="rounded-full bg-primary/10 p-3 mb-3">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium">Add New Plan</p>
                  <p className="text-sm text-muted-foreground mt-1">Create a new benefit plan</p>
                </>
              )}
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Benefits</CardTitle>
              <CardDescription>
                View and manage employee benefit enrollment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="font-medium">John Doe</div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Enrolled
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <div className="text-sm text-muted-foreground">Healthcare, 401(k)</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="font-medium">Jane Smith</div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Enrolled
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <div className="text-sm text-muted-foreground">All Benefits</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="font-medium">Robert Johnson</div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <div className="text-sm text-muted-foreground">Healthcare</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="font-medium">Emily Davis</div>
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      Not Enrolled
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <div className="text-sm text-muted-foreground">None</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleMassEnrollment}
                  disabled={isMassEnrolling}
                >
                  {isMassEnrolling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Mass Enrollment
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleOpenEnrollment}
                  disabled={isOpenEnrollment}
                >
                  {isOpenEnrollment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Briefcase className="mr-2 h-4 w-4" />
                      Open Enrollment
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Benefit Suppliers</CardTitle>
                <CardDescription>
                  Manage benefit providers and suppliers
                </CardDescription>
              </div>
              <Button onClick={handleAddSupplier}>
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="flex flex-col space-y-2 border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{supplier.name}</h3>
                        <p className="text-sm text-muted-foreground">{supplier.category}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleEditSupplier(supplier)}>
                        Edit
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Address:</p>
                        <p>{supplier.address}</p>
                        <p>{supplier.city}, {supplier.state} {supplier.postalCode}</p>
                        <p>{supplier.country}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Contact:</p>
                        <p>{supplier.phone}</p>
                        <p>{supplier.email}</p>
                        <p>
                          <a 
                            href={supplier.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {supplier.website}
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benefit Settings</CardTitle>
              <CardDescription>
                Configure global benefit settings and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Open Enrollment Period</h3>
                    <p className="text-sm text-muted-foreground">November 1 - December 15, 2025</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleConfigureSetting("Open Enrollment Period")}
                    disabled={isConfiguring && configuringSettingType === "Open Enrollment Period"}
                  >
                    {isConfiguring && configuringSettingType === "Open Enrollment Period" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Configure"
                    )}
                  </Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Default Eligibility Rules</h3>
                    <p className="text-sm text-muted-foreground">Full-time employees after 90 days</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleConfigureSetting("Open Enrollment Period")}
                    disabled={isConfiguring && configuringSettingType === "Open Enrollment Period"}
                  >
                    {isConfiguring && configuringSettingType === "Open Enrollment Period" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Configure"
                    )}
                  </Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Benefit Providers</h3>
                    <p className="text-sm text-muted-foreground">Manage external benefit providers</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleConfigureSetting("Open Enrollment Period")}
                    disabled={isConfiguring && configuringSettingType === "Open Enrollment Period"}
                  >
                    {isConfiguring && configuringSettingType === "Open Enrollment Period" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Configure"
                    )}
                  </Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Notification Settings</h3>
                    <p className="text-sm text-muted-foreground">Configure benefit-related notifications</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleConfigureSetting("Open Enrollment Period")}
                    disabled={isConfiguring && configuringSettingType === "Open Enrollment Period"}
                  >
                    {isConfiguring && configuringSettingType === "Open Enrollment Period" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Configure"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mass Enrollment Dialog */}
      <Dialog open={showMassEnrollmentDialog} onOpenChange={setShowMassEnrollmentDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Mass Enrollment</DialogTitle>
            <DialogDescription>
              Enroll multiple employees in benefit plans at once.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="benefit-plan">Select Benefit Plan</Label>
              <Select>
                <SelectTrigger id="benefit-plan">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {benefitPlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.name}>{plan.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Eligible Employees</Label>
              <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2">
                {[
                  { id: "1", name: "John Doe", department: "Finance" },
                  { id: "2", name: "Jane Smith", department: "Marketing" },
                  { id: "3", name: "Robert Johnson", department: "Finance" },
                  { id: "4", name: "Emily Davis", department: "HR" },
                  { id: "5", name: "Michael Brown", department: "Sales" },
                ].map(employee => (
                  <div key={employee.id} className="flex items-center space-x-2">
                    <Checkbox id={`employee-${employee.id}`} />
                    <Label htmlFor={`employee-${employee.id}`} className="flex-1 cursor-pointer">
                      <span className="font-medium">{employee.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">{employee.department}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="effective-date">Effective Date</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input id="effective-date" type="date" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="notify-employees" />
              <Label htmlFor="notify-employees">Notify employees via email</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowMassEnrollmentDialog(false);
              setIsMassEnrolling(false);
            }}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Enrollment Successful",
                description: "Selected employees have been enrolled in the benefit plan",
                variant: "success",
              });
              setShowMassEnrollmentDialog(false);
              setIsMassEnrolling(false);
            }}>
              Enroll Employees
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Open Enrollment Dialog */}
      <Dialog open={showOpenEnrollmentDialog} onOpenChange={setShowOpenEnrollmentDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Open Enrollment Period</DialogTitle>
            <DialogDescription>
              Configure the open enrollment period for employee benefits.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-date">Start Date</Label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input id="start-date" type="date" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-date">End Date</Label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input id="end-date" type="date" />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="eligible-plans">Eligible Benefit Plans</Label>
              <div className="border rounded-md p-3 max-h-[150px] overflow-y-auto space-y-2">
                {benefitPlans.map(plan => (
                  <div key={plan.id} className="flex items-center space-x-2">
                    <Checkbox id={`plan-${plan.id}`} defaultChecked />
                    <Label htmlFor={`plan-${plan.id}`} className="cursor-pointer">{plan.name}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="enrollment-message">Enrollment Message</Label>
              <Input id="enrollment-message" placeholder="Message to display to employees during enrollment" />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="send-reminder" defaultChecked />
              <Label htmlFor="send-reminder">Send reminder emails</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowOpenEnrollmentDialog(false);
              setIsOpenEnrollment(false);
            }}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Open Enrollment Configured",
                description: "Open enrollment period has been successfully configured",
                variant: "success",
              });
              setShowOpenEnrollmentDialog(false);
              setIsOpenEnrollment(false);
            }}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Settings Dialog */}
      <Dialog open={showConfigureDialog} onOpenChange={setShowConfigureDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {configuringSettingType ? `Configure ${configuringSettingType}` : 'Configure Settings'}
            </DialogTitle>
            <DialogDescription>
              Adjust settings and preferences for this benefit configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {configuringSettingType === "Open Enrollment Period" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="config-start-date">Start Date</Label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input id="config-start-date" type="date" defaultValue="2025-11-01" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="config-end-date">End Date</Label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input id="config-end-date" type="date" defaultValue="2025-12-15" />
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="enrollment-type">Enrollment Type</Label>
                  <Select defaultValue="open">
                    <SelectTrigger id="enrollment-type">
                      <SelectValue placeholder="Select enrollment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open Enrollment</SelectItem>
                      <SelectItem value="special">Special Enrollment</SelectItem>
                      <SelectItem value="new-hire">New Hire Enrollment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {configuringSettingType === "Default Eligibility Rules" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="waiting-period">Waiting Period</Label>
                  <Select defaultValue="90">
                    <SelectTrigger id="waiting-period">
                      <SelectValue placeholder="Select waiting period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No waiting period</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="employee-type">Eligible Employee Types</Label>
                  <div className="border rounded-md p-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="full-time" defaultChecked />
                      <Label htmlFor="full-time">Full-time employees</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="part-time" />
                      <Label htmlFor="part-time">Part-time employees</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="contract" />
                      <Label htmlFor="contract">Contract employees</Label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {configuringSettingType === "Benefit Providers" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="provider-list">Current Providers</Label>
                  <div className="border rounded-md p-3 space-y-2">
                    {[
                      { id: 1, name: "BlueCross", type: "Healthcare" },
                      { id: 2, name: "Fidelity", type: "Retirement" },
                      { id: 3, name: "MetLife", type: "Dental & Vision" },
                    ].map(provider => (
                      <div key={provider.id} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{provider.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">{provider.type}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Provider
                </Button>
              </>
            )}

            {configuringSettingType === "Notification Settings" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="notification-events">Notification Events</Label>
                  <div className="border rounded-md p-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="enrollment-start" defaultChecked />
                      <Label htmlFor="enrollment-start">Enrollment period start</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="enrollment-reminder" defaultChecked />
                      <Label htmlFor="enrollment-reminder">Enrollment period reminders</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="enrollment-end" defaultChecked />
                      <Label htmlFor="enrollment-end">Enrollment period end</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="benefit-changes" defaultChecked />
                      <Label htmlFor="benefit-changes">Benefit plan changes</Label>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notification-channels">Notification Channels</Label>
                  <div className="border rounded-md p-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="email" defaultChecked />
                      <Label htmlFor="email">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="sms" />
                      <Label htmlFor="sms">SMS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="in-app" defaultChecked />
                      <Label htmlFor="in-app">In-app notifications</Label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowConfigureDialog(false);
              setIsConfiguring(false);
              setConfiguringSettingType(null);
            }}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Settings Saved",
                description: configuringSettingType 
                  ? `${configuringSettingType} settings have been updated` 
                  : "Settings have been updated",
                variant: "success",
              });
              setShowConfigureDialog(false);
              setIsConfiguring(false);
              setConfiguringSettingType(null);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplier Dialog */}
      <Dialog open={showSupplierDialog} onOpenChange={setShowSupplierDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedSupplier ? `Edit Supplier: ${selectedSupplier.name}` : 'Add New Supplier'}
            </DialogTitle>
            <DialogDescription>
              {selectedSupplier ? 'Update supplier information' : 'Add a new benefit supplier or provider'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Existing Suppliers Dropdown */}
            {!selectedSupplier && (
              <div className="grid gap-2">
                <Label htmlFor="existing-supplier">Select Existing Supplier (Optional)</Label>
                <Select 
                  onValueChange={(value) => {
                    const supplier = suppliers.find(s => s.id === value);
                    if (supplier) {
                      setSupplierFormData(supplier);
                    }
                  }}
                >
                  <SelectTrigger id="existing-supplier">
                    <SelectValue placeholder="Select a supplier or create new" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name} ({supplier.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Select an existing supplier to pre-fill the form, or fill in the details below to create a new one.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="supplier-name">Supplier Name</Label>
                <Input 
                  id="supplier-name" 
                  name="name" 
                  value={supplierFormData.name || ''}
                  onChange={handleSupplierFormChange}
                  placeholder="e.g. BlueCross Health Insurance"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier-category">Category</Label>
                <Select 
                  value={supplierFormData.category || ''}
                  onValueChange={(value) => setSupplierFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="supplier-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Retirement">Retirement</SelectItem>
                    <SelectItem value="Dental & Vision">Dental & Vision</SelectItem>
                    <SelectItem value="Life Insurance">Life Insurance</SelectItem>
                    <SelectItem value="Housing">Housing</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address with Autofill */}
            <div className="grid gap-2">
              <Label htmlFor="supplier-address">Address</Label>
              <div className="relative">
                <Input 
                  id="supplier-address" 
                  name="address" 
                  value={supplierFormData.address || ''}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  placeholder="Start typing to see suggestions..."
                  required
                />
                {showAddressSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {addressSuggestions.map((address, index) => (
                      <div 
                        key={index} 
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSelectAddress(address)}
                      >
                        {address}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Start typing to see address suggestions</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="supplier-city">City</Label>
                <Input 
                  id="supplier-city" 
                  name="city" 
                  value={supplierFormData.city || ''}
                  onChange={handleSupplierFormChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier-state">Province/State</Label>
                <Input 
                  id="supplier-state" 
                  name="state" 
                  value={supplierFormData.state || ''}
                  onChange={handleSupplierFormChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="supplier-postal-code">Postal Code</Label>
                <Input 
                  id="supplier-postal-code" 
                  name="postalCode" 
                  value={supplierFormData.postalCode || ''}
                  onChange={handleSupplierFormChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier-country">Country</Label>
                <Input 
                  id="supplier-country" 
                  name="country" 
                  value={supplierFormData.country || 'South Africa'}
                  onChange={handleSupplierFormChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="supplier-phone">Phone</Label>
                <Input 
                  id="supplier-phone" 
                  name="phone" 
                  value={supplierFormData.phone || ''}
                  onChange={handleSupplierFormChange}
                  placeholder="e.g. +27 11 555 1234"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier-email">Email</Label>
                <Input 
                  id="supplier-email" 
                  name="email" 
                  type="email"
                  value={supplierFormData.email || ''}
                  onChange={handleSupplierFormChange}
                  placeholder="e.g. contact@supplier.co.za"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="supplier-website">Website</Label>
              <Input 
                id="supplier-website" 
                name="website" 
                type="url"
                value={supplierFormData.website || ''}
                onChange={handleSupplierFormChange}
                placeholder="e.g. https://www.supplier.co.za"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="supplier-notes">Notes (Optional)</Label>
              <textarea
                id="supplier-notes"
                name="notes"
                className="min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={supplierFormData.notes || ''}
                onChange={handleSupplierFormChange}
                placeholder="Additional information about this supplier..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupplierDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSupplier}
              disabled={isAddingSupplier || !supplierFormData.name || !supplierFormData.address}
            >
              {isAddingSupplier ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {selectedSupplier ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                selectedSupplier ? 'Update Supplier' : 'Add Supplier'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Benefits;
