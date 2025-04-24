
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap,
  FileText,
  UserCog,
  Edit,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  status: string;
  email: string;
  phone: string;
  address?: string;
  hireDate: string;
  image?: string;
  manager?: string;
  skills?: string[];
  education?: {
    degree: string;
    institution: string;
    year: string;
  }[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

// Mock data - would be replaced with an API call in a real application
const employees: Record<string, Employee> = {
  "1": {
    id: "1",
    name: "John Doe",
    position: "Software Developer",
    department: "Engineering",
    status: "Active",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Anytown, CA 12345",
    hireDate: "2021-05-12",
    manager: "Emily Davis",
    skills: ["JavaScript", "React", "TypeScript", "Node.js"],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        institution: "University of Technology",
        year: "2020"
      }
    ],
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "(555) 987-6543"
    }
  },
  "2": {
    id: "2",
    name: "Jane Smith",
    position: "Marketing Manager",
    department: "Marketing",
    status: "Active",
    email: "jane.smith@example.com",
    phone: "(555) 987-6543",
    address: "456 Oak Ave, Somewhere, CA 67890",
    hireDate: "2020-03-18",
    manager: "Robert Johnson",
    skills: ["Marketing Strategy", "Social Media", "Content Creation", "Analytics"],
    education: [
      {
        degree: "MBA in Marketing",
        institution: "Business School",
        year: "2018"
      },
      {
        degree: "Bachelor of Arts in Communication",
        institution: "State University",
        year: "2015"
      }
    ],
    emergencyContact: {
      name: "Tom Smith",
      relationship: "Brother",
      phone: "(555) 456-7890"
    }
  },
  "3": {
    id: "3",
    name: "Robert Johnson",
    position: "Financial Analyst",
    department: "Finance",
    status: "On Leave",
    email: "robert.johnson@example.com",
    phone: "(555) 456-7890",
    address: "789 Pine St, Elsewhere, CA 54321",
    hireDate: "2019-11-04",
    manager: "Michael Brown",
    skills: ["Financial Modeling", "Data Analysis", "Budgeting", "Forecasting"],
    education: [
      {
        degree: "Master of Finance",
        institution: "Financial Institute",
        year: "2019"
      }
    ],
    emergencyContact: {
      name: "Mary Johnson",
      relationship: "Spouse",
      phone: "(555) 321-0987"
    }
  },
  "4": {
    id: "4",
    name: "Emily Davis",
    position: "HR Specialist",
    department: "Human Resources",
    status: "Active",
    email: "emily.davis@example.com",
    phone: "(555) 321-9876",
    address: "101 Elm St, Nowhere, CA 13579",
    hireDate: "2022-01-15",
    manager: "Jane Smith",
    skills: ["Recruitment", "Employee Relations", "Training & Development"],
    education: [
      {
        degree: "Bachelor of Science in Human Resources",
        institution: "HR University",
        year: "2021"
      }
    ],
    emergencyContact: {
      name: "David Davis",
      relationship: "Father",
      phone: "(555) 654-3210"
    }
  },
  "5": {
    id: "5",
    name: "Michael Brown",
    position: "Sales Representative",
    department: "Sales",
    status: "Remote",
    email: "michael.brown@example.com",
    phone: "(555) 789-4561",
    address: "202 Cedar Rd, Anyplace, CA 02468",
    hireDate: "2021-09-30",
    manager: "Robert Johnson",
    skills: ["Negotiation", "Customer Relations", "Product Knowledge"],
    education: [
      {
        degree: "Bachelor of Business Administration",
        institution: "Sales Academy",
        year: "2020"
      }
    ],
    emergencyContact: {
      name: "Sarah Brown",
      relationship: "Spouse",
      phone: "(555) 123-0987"
    }
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "On Leave":
      return "bg-amber-100 text-amber-800";
    case "Remote":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const EmployeeDetail = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // In a real app, you would fetch this data from an API
    if (employeeId && employees[employeeId]) {
      setEmployee(employees[employeeId]);
    }
  }, [employeeId]);

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Employee Not Found</h2>
        <p className="text-gray-500 mb-8">The employee you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/hr/employees")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate("/hr/employees")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employees
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/hr/employees/${employee.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-1/3">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                {employee.image ? (
                  <AvatarImage src={employee.image} alt={employee.name} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                )}
              </Avatar>
              <h2 className="text-2xl font-bold">{employee.name}</h2>
              <p className="text-muted-foreground">{employee.position}</p>
              <Badge className={`mt-2 ${getStatusColor(employee.status)}`}>
                {employee.status}
              </Badge>

              <Separator className="my-4" />
              
              <div className="w-full space-y-3">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-left">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-left">{employee.phone}</p>
                  </div>
                </div>
                {employee.address && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-left">{employee.address}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-left">
                      Hire date: {employee.hireDate}
                    </p>
                  </div>
                </div>
                {employee.manager && (
                  <div className="flex items-start">
                    <UserCog className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-left">
                        Manager: {employee.manager}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:w-2/3">
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="skills">Skills & Education</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Information</CardTitle>
                  <CardDescription>Personal and work details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-2">Department</h3>
                      <p>{employee.department}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-2">Position</h3>
                      <p>{employee.position}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-2">Status</h3>
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-2">Hire Date</h3>
                      <p>{employee.hireDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="skills">
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Education</CardTitle>
                  <CardDescription>Professional skills and educational background</CardDescription>
                </CardHeader>
                <CardContent>
                  {employee.skills && employee.skills.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-medium mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {employee.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {employee.education && employee.education.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">Education</h3>
                      <div className="space-y-4">
                        {employee.education.map((edu, index) => (
                          <div key={index} className="flex items-start">
                            <GraduationCap className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium">{edu.degree}</p>
                              <p className="text-sm text-muted-foreground">
                                {edu.institution}, {edu.year}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Employee documents and files</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
                    <div className="text-center">
                      <FileText className="h-10 w-10 text-gray-400 mx-auto" />
                      <p className="mt-2 text-sm text-gray-500">No documents uploaded yet</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="emergency">
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                  <CardDescription>Contact information for emergencies</CardDescription>
                </CardHeader>
                <CardContent>
                  {employee.emergencyContact ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Name</h3>
                        <p>{employee.emergencyContact.name}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Relationship</h3>
                        <p>{employee.emergencyContact.relationship}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Phone</h3>
                        <p>{employee.emergencyContact.phone}</p>
                      </div>
                    </div>
                  ) : (
                    <p>No emergency contact information provided.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
