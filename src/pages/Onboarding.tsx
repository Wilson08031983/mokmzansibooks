
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Steps for the onboarding process
const steps = [
  {
    id: "business",
    name: "Business Information",
    fields: ["companyName", "businessType", "registrationNumber", "vatNumber"],
  },
  {
    id: "contact",
    name: "Contact Details",
    fields: ["address", "city", "postalCode", "province", "phone", "website"],
  },
  {
    id: "preferences",
    name: "Preferences",
    fields: ["industry", "employeeCount", "annualRevenue"],
  },
];

// Form schema definition
const formSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  businessType: z.string().min(1, "Business type is required"),
  registrationNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  address: z.string().min(2, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(2, "Postal code is required"),
  province: z.string().min(2, "Province is required"),
  phone: z.string().min(2, "Phone number is required"),
  website: z.string().optional(),
  industry: z.string().min(1, "Industry is required"),
  employeeCount: z.string().min(1, "Employee count is required"),
  annualRevenue: z.string().min(1, "Annual revenue is required"),
});

type OnboardingFormValues = z.infer<typeof formSchema>;

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Initialize form with default values
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      businessType: "",
      registrationNumber: "",
      vatNumber: "",
      address: "",
      city: "",
      postalCode: "",
      province: "",
      phone: "",
      website: "",
      industry: "",
      employeeCount: "",
      annualRevenue: "",
    },
  });

  // Move to next step
  const nextStep = async () => {
    const fields = steps[currentStep].fields as Array<keyof OnboardingFormValues>;
    const output = await form.trigger(fields);
    
    if (!output) return;
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0); // Scroll to top when changing steps
    } else {
      onSubmit(form.getValues());
    }
  };

  // Move to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0); // Scroll to top when changing steps
    }
  };

  // Submit form
  const onSubmit = (values: OnboardingFormValues) => {
    setIsSubmitting(true);
    
    // Save the business profile to localStorage
    try {
      const businessProfile = {
        ...values,
        userId: currentUser?.id || '',
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem("mokmzansiBusinessProfile", JSON.stringify(businessProfile));
      
      // Simulate form submission
      setTimeout(() => {
        setIsSubmitting(false);
        
        toast({
          title: "Onboarding complete!",
          description: "Your business profile has been set up.",
        });
        
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error saving business profile:", error);
      setIsSubmitting(false);
      toast({
        title: "Something went wrong",
        description: "Could not save your business profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-white to-purple-50">
      <div className="w-full max-w-3xl">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Welcome to MOKMzansiBooks</CardTitle>
            <CardDescription>
              Let's set up your business profile to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Steps progress indicator */}
            <div className="mb-8">
              <div className="flex justify-between">
                {steps.map((step, i) => (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center ${
                      i !== 0 ? "flex-1" : ""
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          currentStep >= i
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300 bg-white text-gray-500"
                        }`}
                      >
                        {currentStep > i ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      {i !== steps.length - 1 && (
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 left-8 w-full h-0.5 ${
                            currentStep > i ? "bg-primary" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 ${
                        currentStep >= i
                          ? "text-primary font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <Form {...form}>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {/* Step 1: Business Information */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Your company name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Type *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select business type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="soleProprietorship">Sole Proprietorship</SelectItem>
                              <SelectItem value="pty">Proprietary Limited (Pty) Ltd</SelectItem>
                              <SelectItem value="cc">Close Corporation (CC)</SelectItem>
                              <SelectItem value="partnership">Partnership</SelectItem>
                              <SelectItem value="nonprofit">Non-profit Organization</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="registrationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registration Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. 2018/421571/07" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="vatNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VAT Number (if applicable)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. 4220195865" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Contact Details */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Street address" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. Pretoria" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. 0001" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Province *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select province" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                              <SelectItem value="free-state">Free State</SelectItem>
                              <SelectItem value="gauteng">Gauteng</SelectItem>
                              <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                              <SelectItem value="limpopo">Limpopo</SelectItem>
                              <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                              <SelectItem value="northern-cape">Northern Cape</SelectItem>
                              <SelectItem value="north-west">North West</SelectItem>
                              <SelectItem value="western-cape">Western Cape</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. +27 64 550 4029" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website (if applicable)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. www.example.co.za" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Preferences */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="agriculture">Agriculture</SelectItem>
                              <SelectItem value="construction">Construction</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="financial">Financial Services</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="hospitality">Hospitality & Tourism</SelectItem>
                              <SelectItem value="it">Information Technology</SelectItem>
                              <SelectItem value="manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="mining">Mining</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="transportation">Transportation</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employeeCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Employees *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select employee range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Just me</SelectItem>
                              <SelectItem value="2-5">2-5 employees</SelectItem>
                              <SelectItem value="6-20">6-20 employees</SelectItem>
                              <SelectItem value="21-50">21-50 employees</SelectItem>
                              <SelectItem value="51-100">51-100 employees</SelectItem>
                              <SelectItem value="100+">More than 100</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="annualRevenue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Approximate Annual Revenue *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select revenue range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="less-1m">Less than R1 million</SelectItem>
                              <SelectItem value="1m-5m">R1 - R5 million</SelectItem>
                              <SelectItem value="5m-10m">R5 - R10 million</SelectItem>
                              <SelectItem value="10m-50m">R10 - R50 million</SelectItem>
                              <SelectItem value="50m+">More than R50 million</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button onClick={nextStep} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : currentStep === steps.length - 1 ? (
                "Complete"
              ) : (
                "Next"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
