
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Check,
  CreditCard,
  User,
  Building,
  Mail,
  Lock,
  Bell,
  FileText,
  Settings2,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [saveLoading, setSaveLoading] = useState(false);

  const handleSaveProfile = () => {
    setSaveLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSaveLoading(false);
      toast({
        title: "Settings saved",
        description: "Your profile has been updated successfully.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="company">
            <Building className="mr-2 h-4 w-4" /> Company
          </TabsTrigger>
          <TabsTrigger value="subscription">
            <CreditCard className="mr-2 h-4 w-4" /> Subscription
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    type="text" 
                    placeholder="Your full name" 
                    defaultValue={currentUser?.name || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    defaultValue={currentUser?.email || ""}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+27 00 000 0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position/Role</Label>
                  <Input id="position" placeholder="e.g. Manager, Owner, etc." />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="marketing-emails">Receive marketing emails</Label>
                  <Switch id="marketing-emails" defaultChecked={false} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notification-emails">Receive notification emails</Label>
                  <Switch id="notification-emails" defaultChecked={true} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSaveProfile} disabled={saveLoading}>
                {saveLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company details and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    defaultValue="Morwa Moabelo (Pty) Ltd"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input 
                    id="registrationNumber"
                    defaultValue="2018/421571/07"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">VAT Number (if applicable)</Label>
                  <Input id="vatNumber" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Input id="address" placeholder="Street address" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input id="province" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" defaultValue="South Africa" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Subscription</CardTitle>
                  <CardDescription>
                    Manage your subscription plan and billing
                  </CardDescription>
                </div>
                {currentUser?.subscriptionStatus === "trial" ? (
                  <Badge variant="outline" className="border-amber-500 text-amber-500">
                    Free Trial
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    Premium
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentUser?.subscriptionStatus === "trial" ? (
                <>
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                      <div>
                        <h3 className="text-sm font-medium text-amber-800">
                          You're on the free trial plan
                        </h3>
                        <div className="mt-1 text-sm text-amber-700">
                          {currentUser?.trialEndsAt && (
                            <p>
                              Your trial expires on{" "}
                              {new Date(currentUser.trialEndsAt).toLocaleDateString()}.
                            </p>
                          )}
                          <p className="mt-1">
                            Upgrade to Premium to unlock all features including:
                          </p>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Unlimited clients and invoices</li>
                            <li>Full QuickFill functionality</li>
                            <li>Advanced accounting and tax features</li>
                            <li>Comprehensive reports and analytics</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium mb-1">Free Trial</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Limited features for evaluation
                      </p>
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Up to 10 clients</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Basic invoicing & quotes</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Limited QuickFill</span>
                        </li>
                      </ul>
                      <p className="text-sm text-gray-500">Current plan</p>
                    </div>
                    <div className="flex-1 border-t pt-4 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0">
                      <h3 className="text-lg font-medium mb-1">Premium</h3>
                      <p className="text-gray-500 text-sm mb-4">R44.90 per month</p>
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Unlimited clients</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Full QuickFill functionality</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>Advanced accounting & tax</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>All premium features</span>
                        </li>
                      </ul>
                      <Button onClick={() => navigate("/payment")}>
                        <CreditCard className="mr-2 h-4 w-4" /> Upgrade Now
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-md border border-green-200 bg-green-50 p-4">
                    <div className="flex">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <div>
                        <h3 className="text-sm font-medium text-green-800">
                          You're on the Premium plan
                        </h3>
                        <div className="mt-1 text-sm text-green-700">
                          <p>
                            Your subscription renews on the 1st of each month.
                          </p>
                          <p className="mt-1">
                            You have access to all premium features including unlimited clients, full QuickFill functionality, and advanced reports.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Subscription Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Plan</p>
                        <p>Premium</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Price</p>
                        <p>R44.90 per month</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Billing Cycle</p>
                        <p>Monthly</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Next Billing Date</p>
                        <p>April 1, 2024</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Payment Method</p>
                        <p>Credit Card (Visa ending in 1234)</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" className="sm:flex-1">
                      Update Payment Method
                    </Button>
                    <Button variant="outline" className="sm:flex-1">
                      View Billing History
                    </Button>
                    <Button variant="destructive" className="sm:flex-1">
                      Cancel Subscription
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      toast({
                        title: "Feature available in Premium plan",
                        description:
                          "Password management is available in the Premium plan.",
                      });
                    }}
                  >
                    <div className="flex items-center">
                      <Lock className="h-5 w-5 mr-3 text-gray-500" />
                      <div>
                        <h3 className="font-medium">Change Password</h3>
                        <p className="text-sm text-gray-500">
                          Update your account password
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <div
                    className="flex items-center justify-between p-4 border-t cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      toast({
                        title: "Feature available in Premium plan",
                        description:
                          "Two-factor authentication is available in the Premium plan.",
                      });
                    }}
                  >
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 mr-3 text-gray-500" />
                      <div>
                        <h3 className="font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500">
                          Add an extra layer of security
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <div
                    className="flex items-center justify-between p-4 border-t cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      toast({
                        title: "Feature available in Premium plan",
                        description:
                          "Login history is available in the Premium plan.",
                      });
                    }}
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-gray-500" />
                      <div>
                        <h3 className="font-medium">Login History</h3>
                        <p className="text-sm text-gray-500">
                          View your recent login activity
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications" className="flex items-center cursor-pointer">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        Email Login Alerts
                      </Label>
                      <Switch id="email-notifications" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="browser-notifications" className="flex items-center cursor-pointer">
                        <Bell className="h-4 w-4 mr-2 text-gray-500" />
                        Browser Notifications
                      </Label>
                      <Switch id="browser-notifications" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-gray-500">
                All security actions are logged and audited for your safety.
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
