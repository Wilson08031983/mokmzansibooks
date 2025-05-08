import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, UserPlus, Building, MapPin, Calendar, Upload, DollarSign, Image } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  employmentType: string;
  startDate: string;
  salary: string;
  site: string;
  address: string;
  dateOfBirth: string;
  bonusDate: string;
  noBonusApplicable: boolean;
  profileImage: File | null;
  notes: string;
}

const NewEmployee = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Check if we're in edit mode by looking for a query parameter
  const queryParams = new URLSearchParams(location.search);
  const isEditMode = queryParams.get('mode') === 'edit';
  const employeeIdToEdit = queryParams.get('id');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEmployee, setIsFetchingEmployee] = useState(isEditMode);
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    employmentType: "full-time",
    startDate: "",
    salary: "",
    site: "",
    address: "",
    dateOfBirth: "",
    bonusDate: "",
    noBonusApplicable: false,
    profileImage: null as File | null,
    notes: ""
  });
  
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!isEditMode || !employeeIdToEdit) return;
      
      setIsFetchingEmployee(true);
      
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('id', employeeIdToEdit)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setFormData({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            email: data.email || "",
            phone: data.phone || "",
            department: data.department || "",
            position: data.position || "",
            employmentType: data.employment_type || "full-time",
            startDate: data.start_date || "",
            salary: data.monthly_salary?.toString() || "",
            site: data.site || "",
            address: data.address || "",
            dateOfBirth: data.date_of_birth || "",
            bonusDate: data.bonus_date || "",
            noBonusApplicable: data.no_bonus_applicable || false,
            profileImage: null, // We can't load the file object from the database
            notes: data.notes || ""
          });
        } else {
          toast({
            title: "Employee Not Found",
            description: "The employee you're trying to edit could not be found.",
            variant: "destructive"
          });
          navigate("/dashboard/hr/employees");
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
        toast({
          title: "Error",
          description: "Failed to load employee data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsFetchingEmployee(false);
      }
    };
    
    fetchEmployeeData();
  }, [isEditMode, employeeIdToEdit, navigate, toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      noBonusApplicable: checked,
      bonusDate: checked ? "" : prev.bonusDate
    }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));
    }
  };
  
  // Define a type for the employee data structure in the database
  type EmployeeDBRecord = {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    department?: string;
    position?: string;
    employment_type?: string;
    start_date?: string;
    monthly_salary?: number;
    site?: string;
    address?: string;
    date_of_birth?: string;
    bonus_date?: string | null;
    no_bonus_applicable?: boolean;
    notes?: string;
    image?: string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create the employee data object with the correct type
      const employeeData: EmployeeDBRecord = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        position: formData.position,
        employment_type: formData.employmentType,
        start_date: formData.startDate,
        monthly_salary: Number(formData.salary) || 0,
        site: formData.site,
        address: formData.address,
        date_of_birth: formData.dateOfBirth,
        bonus_date: formData.noBonusApplicable ? null : formData.bonusDate,
        no_bonus_applicable: formData.noBonusApplicable,
        notes: formData.notes
      };
      
      let error;
      
      if (isEditMode && employeeIdToEdit) {
        // Update existing employee
        const { error: updateError } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', employeeIdToEdit);
          
        error = updateError;
      } else {
        // Insert new employee
        const { error: insertError } = await supabase
          .from('employees')
          .insert([employeeData]);
          
        error = insertError;
      }
      
      if (error) throw error;
      
      // Handle profile image upload if provided
      if (formData.profileImage) {
        const fileExt = formData.profileImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('employee-images')
          .upload(fileName, formData.profileImage);
          
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          // We don't throw here as we've already saved the employee data
          toast({
            title: "Image Upload Failed",
            description: "Employee saved, but profile image could not be uploaded.",
            variant: "warning",
          });
        } else {
          // Update the employee record with the image filename
          // Use a properly typed update object
          const imageUpdate: Pick<EmployeeDBRecord, 'image'> = { 
            image: fileName 
          };
          
          const updateTarget = isEditMode && employeeIdToEdit
            ? supabase.from('employees').update(imageUpdate).eq('id', employeeIdToEdit)
            : supabase.from('employees').update(imageUpdate).eq('email', formData.email);
          
          const { error: updateError } = await updateTarget;
          
          if (updateError) {
            console.error("Error updating employee with image:", updateError);
            toast({
              title: "Image Reference Update Failed",
              description: "Image uploaded but couldn't update employee record with reference.",
              variant: "warning",
            });
          }
        }
      }
      
      toast({
        title: isEditMode ? "Employee Updated" : "Employee Added",
        description: isEditMode
          ? `${formData.firstName} ${formData.lastName}'s information has been updated.`
          : `${formData.firstName} ${formData.lastName} has been added to the system.`,
        variant: "success",
      });
      
      // Navigate back to employees list
      navigate("/dashboard/hr/employees");
    } catch (error: any) {
      console.error("Error saving employee:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard/hr")} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Employee
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
          <CardDescription>
            {isEditMode 
              ? "Update the employee's information. All fields marked with * are required."
              : "Enter the details of the new employee. All fields marked with * are required."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} id="employee-form" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input 
                  id="firstName"
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input 
                  id="lastName"
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email"
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone"
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => handleSelectChange("department", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Position/Title *</Label>
                <Input 
                  id="position"
                  name="position" 
                  value={formData.position} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select 
                  value={formData.employmentType} 
                  onValueChange={(value) => handleSelectChange("employmentType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input 
                  id="startDate"
                  name="startDate" 
                  type="date" 
                  value={formData.startDate} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site">Site Location *</Label>
                <Select 
                  value={formData.site} 
                  onValueChange={(value) => handleSelectChange("site", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select site location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="headquarters">Headquarters</SelectItem>
                    <SelectItem value="branch-1">Branch Office 1</SelectItem>
                    <SelectItem value="branch-2">Branch Office 2</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea 
                  id="address"
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  required 
                  placeholder="Enter complete address"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="dateOfBirth"
                    name="dateOfBirth" 
                    type="date" 
                    value={formData.dateOfBirth} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profile Image</Label>
                <div className="flex items-start space-x-4">
                  <Avatar className="h-20 w-20">
                    {formData.profileImage ? (
                      <AvatarImage src={URL.createObjectURL(formData.profileImage)} />
                    ) : (
                      <AvatarFallback>
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="space-y-2">
                    <Input
                      id="profileImage"
                      name="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Upload a profile picture (optional)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>13th Cheque Bonus</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="noBonusApplicable"
                      checked={formData.noBonusApplicable}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <label
                      htmlFor="noBonusApplicable"
                      className="text-sm text-muted-foreground"
                    >
                      Not Applicable
                    </label>
                  </div>
                  {!formData.noBonusApplicable && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="bonusDate"
                        name="bonusDate"
                        type="date"
                        value={formData.bonusDate}
                        onChange={handleChange}
                        disabled={formData.noBonusApplicable}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salary">Salary/Wage (Annual) *</Label>
                <Input 
                  id="salary"
                  name="salary" 
                  type="number" 
                  value={formData.salary} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. 480000"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea 
                id="notes"
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                placeholder="Any additional information about the employee" 
                className="h-32"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/dashboard/hr")}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="employee-form" 
            disabled={isLoading || isFetchingEmployee}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? "Update Employee" : "Save Employee"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewEmployee;
