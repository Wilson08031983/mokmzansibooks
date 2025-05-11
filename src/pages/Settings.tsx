import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle,
  CreditCard,
  Download,
  Lock,
  Mail,
  Settings as SettingsIcon,
  User,
  X,
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useNavigate } from "react-router-dom";
import PaystackButton from "@/components/payments/PaystackButton";
import SavedCardsManager from "@/components/payments/SavedCardsManager";
import ShowHiddenElements from "@/components/ShowHiddenElements";
import SettingsPanel from "@/components/settings/SettingsPanel";

const Settings = () => {
  const { t } = useI18n();
  const { currentUser, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("preferences");
  
  // Calculate yearly price with 6% discount
  const calculateYearlyPrice = (monthlyPrice: number) => {
    const yearlyPrice = monthlyPrice * 12 * 0.94; // 6% discount
    return yearlyPrice.toFixed(2);
  };

  // State for form values - initialize with empty values to avoid render-time updates
  const [formValues, setFormValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    position: "",
    dateOfBirth: "",
    idNumber: "",
    streetAddress: "",
    city: "",
    province: "",
    postalCode: "",
    taxNumber: "",
    vatNumber: "",
    companyName: "",
    billingCycle: "monthly", // Added billing cycle state
    registrationNumber: "",
    industry: "",
    businessType: "",
    employeeStatus: "active", // For HR benefits tracking
    terminationDate: "",
    terminationReason: "",
  });
  
  // State for switches
  const [switches, setSwitches] = useState({
    marketingEmails: false,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    monthlyNewsletter: true,
    saveCard: true,
  });

  // Initialize form values from currentUser when it changes
  useEffect(() => {
    if (currentUser) {
      setFormValues(prevValues => ({
        ...prevValues,
        fullName: currentUser?.displayName || currentUser?.user_metadata?.display_name || "",
        email: currentUser.email || ""
      }));
    }
  }, [currentUser]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/login");
  };

  const handleSaveProfile = () => {
    // Save profile logic would go here
    toast({
      title: t("profileUpdated"),
      description: t("profileUpdatedDescription"),
    });
  };

  const handleSaveNotifications = () => {
    // Save notification preferences logic would go here
    toast({
      title: t("preferencesUpdated"),
      description: t("preferencesUpdatedDescription"),
    });
  };

  const handleSaveBilling = () => {
    // Save billing information logic would go here
    toast({
      title: t("billingUpdated"),
      description: t("billingUpdatedDescription"),
    });
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle select changes
  const handleSelectChange = (id, value) => {
    setFormValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle switch changes
  const handleSwitchChange = (id, checked) => {
    setSwitches(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t("settings")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("settingsDescription")}
        </p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger>
          <TabsTrigger value="billing">{t('billing')}</TabsTrigger>
          <TabsTrigger value="payment_methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>
                Customize your application settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsPanel />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t("personalInformation")}</CardTitle>
              <CardDescription>
                {t("personalInformationDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t("fullName")}</Label>
                    <Input 
                      id="fullName" 
                      value={formValues.fullName} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formValues.email} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("phone")}</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={formValues.phone} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">{t("position")}</Label>
                    <Input 
                      id="position" 
                      value={formValues.position} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input 
                      id="dateOfBirth" 
                      type="date" 
                      value={formValues.dateOfBirth} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input 
                      id="idNumber" 
                      type="text" 
                      placeholder="National ID Number" 
                      value={formValues.idNumber} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              
              {/* Address Information */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="streetAddress">Street Address</Label>
                    <Input 
                      id="streetAddress" 
                      type="text" 
                      placeholder="123 Main St" 
                      value={formValues.streetAddress} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      type="text" 
                      placeholder="Johannesburg" 
                      value={formValues.city} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Select
                      value={formValues.province}
                      onValueChange={(value) => handleSelectChange("province", value)}
                    >
                      <SelectTrigger id="province">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gauteng">Gauteng</SelectItem>
                        <SelectItem value="western-cape">Western Cape</SelectItem>
                        <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                        <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                        <SelectItem value="free-state">Free State</SelectItem>
                        <SelectItem value="north-west">North West</SelectItem>
                        <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                        <SelectItem value="limpopo">Limpopo</SelectItem>
                        <SelectItem value="northern-cape">Northern Cape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input 
                      id="postalCode" 
                      type="text" 
                      placeholder="2000" 
                      value={formValues.postalCode} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              
              {/* Tax Information */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Tax Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxNumber">Tax Number</Label>
                    <Input 
                      id="taxNumber" 
                      type="text" 
                      placeholder="Tax Registration Number" 
                      value={formValues.taxNumber} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">VAT Number (if applicable)</Label>
                    <Input 
                      id="vatNumber" 
                      type="text" 
                      placeholder="VAT Registration Number" 
                      value={formValues.vatNumber} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              
              {/* Business Information */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input 
                      id="companyName" 
                      type="text" 
                      placeholder="Your Business Name" 
                      value={formValues.companyName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number</Label>
                    <Input 
                      id="registrationNumber" 
                      type="text" 
                      placeholder="Business Registration Number" 
                      value={formValues.registrationNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select 
                      value={formValues.industry}
                      onValueChange={(value) => handleSelectChange("industry", value)}
                    >
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="services">Professional Services</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="construction">Construction</SelectItem>
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select
                      value={formValues.businessType}
                      onValueChange={(value) => handleSelectChange("businessType", value)}
                    >
                      <SelectTrigger id="businessType">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sole-proprietor">Sole Proprietor</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="pty-ltd">Pty Ltd</SelectItem>
                        <SelectItem value="close-corporation">Close Corporation</SelectItem>
                        <SelectItem value="non-profit">Non-Profit</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Employee Status for HR Benefits */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Employee Status</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This information is used for HR benefits tracking and management.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeStatus">Current Status</Label>
                    <Select
                      value={formValues.employeeStatus}
                      onValueChange={(value) => handleSelectChange("employeeStatus", value)}
                    >
                      <SelectTrigger id="employeeStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on-leave">On Leave</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="deceased">Deceased</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(formValues.employeeStatus === "terminated" || formValues.employeeStatus === "retired" || formValues.employeeStatus === "deceased") && (
                    <div className="space-y-2">
                      <Label htmlFor="terminationDate">End Date</Label>
                      <Input 
                        id="terminationDate" 
                        type="date" 
                        value={formValues.terminationDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                  
                  {formValues.employeeStatus === "terminated" && (
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="terminationReason">Reason for Termination</Label>
                      <Textarea 
                        id="terminationReason" 
                        placeholder="Please provide details about the termination" 
                        value={formValues.terminationReason}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="marketing-emails">{t("receiveMarketing")}</Label>
                  <Switch 
                    id="marketing-emails" 
                    checked={switches.marketingEmails}
                    onCheckedChange={(checked) => handleSwitchChange("marketingEmails", checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("receiveMarketingDescription")}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleSignOut}>
                {t("signOut")}
              </Button>
              <Button onClick={handleSaveProfile}>{t("saveChanges")}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t("notificationPreferences")}</CardTitle>
              <CardDescription>
                {t("notificationPreferencesDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Show Hidden Elements component */}
              <ShowHiddenElements />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("userInterface")}</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("emailNotifications")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("emailNotificationsDescription")}
                    </p>
                  </div>
                  <Switch 
                    checked={switches.emailNotifications}
                    onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("smsNotifications")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("smsNotificationsDescription")}
                    </p>
                  </div>
                  <Switch 
                    checked={switches.smsNotifications}
                    onCheckedChange={(checked) => handleSwitchChange("smsNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("pushNotifications")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("pushNotificationsDescription")}
                    </p>
                  </div>
                  <Switch 
                    checked={switches.pushNotifications}
                    onCheckedChange={(checked) => handleSwitchChange("pushNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("monthlyNewsletter")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("monthlyNewsletterDescription")}
                    </p>
                  </div>
                  <Switch 
                    checked={switches.monthlyNewsletter}
                    onCheckedChange={(checked) => handleSwitchChange("monthlyNewsletter", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications} className="ml-auto">
                {t("savePreferences")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>{t("billingInformation")}</CardTitle>
              <CardDescription>
                {t("billingInformationDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Plan Section */}
              <div className="space-y-2 border-b pb-4">
                <h3 className="text-lg font-medium">Current Plan</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Professional Plan</p>
                    <p className="text-sm text-muted-foreground">Your plan renews on May 15, 2025</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                </div>
              </div>
              
              {/* Payment Method Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Payment Method</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Securely manage your payment methods with Paystack
                </p>
                
                {/* Payment with Paystack */}
                <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-white p-2 rounded-md mr-3">
                      <img 
                        src="https://website-v3-assets.s3.amazonaws.com/assets/img/hero/Paystack-mark-white-twitter.png" 
                        alt="Paystack" 
                        className="h-8 w-8"
                      />
                    </div>
                    <div>
                      <p className="font-medium">Paystack</p>
                      <p className="text-sm text-muted-foreground">Secure payments by Paystack</p>
                    </div>
                  </div>
                  
                  {currentUser && (
                    <PaystackButton
                      amount={499} // Example amount
                      email={currentUser.email || ''}
                      name={currentUser?.displayName || currentUser?.user_metadata?.display_name || ''}
                      phone={formValues.phone}
                      buttonText="Add Payment Method"
                      metadata={{
                        "Employee Status": formValues.employeeStatus,
                        "Company": formValues.companyName || "MokMzansi Books",
                        "Plan": "Professional"
                      }}
                      onSuccess={(reference) => {
                        toast({
                          title: "Payment method added",
                          description: `Your payment method has been successfully added. Reference: ${reference}`,
                        });
                      }}
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="saveCard">{t("saveCard")}</Label>
                    <Switch 
                      id="saveCard" 
                      checked={switches.saveCard}
                      onCheckedChange={(checked) => handleSwitchChange("saveCard", checked)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("saveCardDescription")}
                  </p>
                </div>
              </div>
              
              {/* Subscription Plans */}
              <div className="space-y-4 mt-8">
                <h3 className="text-lg font-medium">Available Plans</h3>
                
                {/* Billing Cycle Toggle */}
                <div className="flex mb-8">
                  <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setFormValues({...formValues, billingCycle: "monthly"})}
                      className={`px-4 py-2 text-sm rounded-md transition-all ${formValues.billingCycle === "monthly" ? "bg-white shadow-sm" : ""}`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setFormValues({...formValues, billingCycle: "yearly"})}
                      className={`px-4 py-2 text-sm rounded-md transition-all ${formValues.billingCycle === "yearly" ? "bg-white shadow-sm" : ""}`}
                    >
                      Yearly <span className="text-green-600 font-medium">(Save 6%)</span>
                    </button>
                  </div>
                </div>
                
                {/* Pricing Plans - Matching Index.tsx */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Free Trial Plan */}
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1">Free Trial</h3>
                      <p className="text-gray-500 mb-4">Perfect for getting started</p>
                      <div className="mb-5">
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold">R0</span>
                          <span className="ml-1 text-gray-500">for 30 days</span>
                        </div>
                      </div>
                      <div className="space-y-4 mb-6">
                        <div className="flex">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">Client management (up to 10 clients)</span>
                        </div>
                        <div className="flex">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">Basic invoicing & quotations</span>
                        </div>
                        <div className="flex">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">Limited QuickFill functionality</span>
                        </div>
                        <div className="flex">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">Basic reports</span>
                        </div>
                        <div className="flex">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">Email support</span>
                        </div>
                        <div className="flex">
                          <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-gray-500">No bulk operations</span>
                        </div>
                        <div className="flex">
                          <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-gray-500">Limited templates</span>
                        </div>
                        <div className="flex">
                          <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-gray-500">No advanced analytics</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        Start Free Trial
                      </Button>
                    </div>
                  </div>
                  
                  {/* Premium Plan */}
                  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-purple-200">
                    <div className="bg-purple-600 text-white text-center py-1 text-sm font-medium">
                      Most Popular
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1">Premium</h3>
                      <p className="text-gray-500 mb-4">Everything you need to grow</p>
                      <div className="mb-5">
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold">
                            R{formValues.billingCycle === "monthly" ? "60.00" : calculateYearlyPrice(60)}
                          </span>
                          <span className="ml-1 text-gray-500">{formValues.billingCycle === "monthly" ? "per month" : "per year"}</span>
                        </div>
                        {formValues.billingCycle === "yearly" && (
                          <div className="text-sm text-green-600 mt-1">
                            Save R{((60 * 12) - Number(calculateYearlyPrice(60))).toFixed(2)} per year
                          </div>
                        )}
                      </div>
                      <div className="space-y-4 mb-6">
                        <div className="flex">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">Unlimited clients</span>
                        </div>
                        <div className="flex">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">Advanced invoicing & quotations</span>
                        </div>
                        <div className="flex">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">Full QuickFill functionality</span>
                        </div>
                        <div className="flex">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">Comprehensive reports & analytics</span>
                        </div>
                        <div className="flex">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">Priority email & phone support</span>
                        </div>
                        <div className="flex">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">Custom branding</span>
                        </div>
                        <div className="flex">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">Tender document auto-fill</span>
                        </div>
                        <div className="flex">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">Price comparison engine</span>
                        </div>
                        <div className="flex">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">Data backup & restoration</span>
                        </div>
                        <div className="flex">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">Multiple users (team access)</span>
                        </div>
                      </div>
                      {currentUser && (
                        <PaystackButton
                          amount={formValues.billingCycle === "monthly" ? 6000 : Number(calculateYearlyPrice(60)) * 100}
                          email={currentUser.email || ''}
                          name={currentUser?.displayName || currentUser?.user_metadata?.display_name || ''}
                          phone={formValues.phone}
                          buttonText="Subscribe Now"
                          className="w-full"
                          // Use appropriate plan code based on billing cycle
                          plan={formValues.billingCycle === "monthly" ? "PLN_333mlci5462cxih" : "PLN_tcwloonsoz9o84x"}
                          metadata={{
                            "Employee Status": formValues.employeeStatus,
                            "Company": formValues.companyName || "MokMzansi Books",
                            "Plan": "Premium",
                            "Billing Cycle": formValues.billingCycle,
                            "Benefits": "Full HR Benefits",
                            "Termination Date": formValues.employeeStatus !== "active" ? formValues.terminationDate : "",
                            "Termination Reason": formValues.employeeStatus === "terminated" ? formValues.terminationReason : "",
                            "Industry": formValues.industry,
                            "Business Type": formValues.businessType,
                            "Tax Number": formValues.taxNumber
                          }}
                          onSuccess={(reference) => {
                            toast({
                              title: "Subscription Successful",
                              description: `You have successfully subscribed to the Premium ${formValues.billingCycle === "monthly" ? "monthly" : "yearly"} plan. Reference: ${reference}`,
                            });
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment_methods">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your saved payment methods securely. You can save up to 4 cards for future use.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SavedCardsManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
