import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  FileText, 
  Download,
  Loader2,
  User,
  Calendar,
  DollarSign,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface EmployeeBenefit {
  id: string;
  name: string;
  enrolledPlans: string[];
  enrollmentDates: Record<string, string>;
  contributions: Record<string, string>;
  dependents: number;
  nextReviewDate: string;
}

const EmployeeBenefitsView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [employeeBenefits, setEmployeeBenefits] = useState<EmployeeBenefit | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    const loadEmployeeBenefits = async () => {
      setLoading(true);
      try {
        // Try to get from sessionStorage first
        const storedBenefits = sessionStorage.getItem('currentEmployeeBenefits');
        
        if (storedBenefits) {
          const parsedBenefits = JSON.parse(storedBenefits);
          setEmployeeBenefits(parsedBenefits);
        } else {
          // In a real app, this would fetch from an API
          // Simulate API call with timeout
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // For demo purposes, create mock employee benefits
          const mockBenefits: EmployeeBenefit = {
            id: id || "1",
            name: "John Doe",
            enrolledPlans: ["Healthcare", "401(k)"],
            enrollmentDates: {
              "Healthcare": "2024-01-15",
              "401(k)": "2024-02-01"
            },
            contributions: {
              "Healthcare": "R1,200/month",
              "401(k)": "6% of salary"
            },
            dependents: 2,
            nextReviewDate: "2025-01-15"
          };
          
          setEmployeeBenefits(mockBenefits);
        }
      } catch (error) {
        console.error("Error loading employee benefits:", error);
        toast({
          title: "Error",
          description: "Failed to load employee benefits. Please try again.",
          variant: "destructive",
        });
        navigate("/dashboard/hr/benefits");
      } finally {
        setLoading(false);
      }
    };
    
    loadEmployeeBenefits();
    
    // Clean up sessionStorage when component unmounts
    return () => {
      sessionStorage.removeItem('currentEmployeeBenefits');
    };
  }, [id, navigate, toast]);

  const handleGoBack = () => {
    navigate("/dashboard/hr/benefits");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading employee benefits...</p>
        </div>
      </div>
    );
  }

  if (!employeeBenefits) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Employee Benefits Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The employee benefits you're looking for could not be found.
          </p>
        </div>
        <Button onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Benefits
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {employeeBenefits.name}'s Benefits
          </h1>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Enrolled Plans</TabsTrigger>
          <TabsTrigger value="history">Enrollment History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Benefit Summary</CardTitle>
              <CardDescription>
                Overview of {employeeBenefits.name}'s benefit enrollment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Employee</p>
                      <p className="font-medium">{employeeBenefits.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Enrolled Plans</p>
                      <p className="font-medium">{employeeBenefits.enrolledPlans.length} Active Plans</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dependents</p>
                      <p className="font-medium">{employeeBenefits.dependents}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Review Date</p>
                      <p className="font-medium">{new Date(employeeBenefits.nextReviewDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Monthly Contributions</p>
                      <p className="font-medium">
                        {Object.values(employeeBenefits.contributions)
                          .filter(c => c.includes('R'))
                          .map(c => parseFloat(c.replace('R', '').replace(',', '').replace('/month', '')))
                          .reduce((sum, val) => sum + val, 0)
                          .toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
                        /month
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Benefit Summary
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Benefit Plans</CardTitle>
              <CardDescription>
                Plans that {employeeBenefits.name} is currently enrolled in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeBenefits.enrolledPlans.map((plan, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{plan}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            Enrolled: {new Date(employeeBenefits.enrollmentDates[plan]).toLocaleDateString()}
                          </p>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{employeeBenefits.contributions[plan]}</p>
                        <p className="text-sm text-muted-foreground">Contribution</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment History</CardTitle>
              <CardDescription>
                History of benefit plan enrollments and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-muted-foreground/20"></div>
                
                {employeeBenefits.enrolledPlans.map((plan, index) => (
                  <div key={index} className="relative pl-8 pb-6">
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{plan} Enrollment</p>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(employeeBenefits.enrollmentDates[plan]).toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-1">
                        Enrolled in {plan} plan with a contribution of {employeeBenefits.contributions[plan]}.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeBenefitsView;
