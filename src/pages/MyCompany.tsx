import React, { useState, useEffect } from 'react';
import { CompanyErrorBoundary } from '@/components/CompanyErrorBoundary';
import { useCompany } from '@/contexts/CompanyContext';
// Import UI components
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import AddressAutoFill from '@/components/AddressAutoFill';
import { FormattedAddress } from '@/services/addressService';
import PasscodeDialog from '@/components/PasscodeDialog';
import { 
  Tabs, TabsList, TabsTrigger, TabsContent 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  Table, TableBody, TableCaption, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
// Import icons
import { 
  Globe, Shield, ClipboardCheck, Edit, KeyRound, Key,
  Plus, LayoutDashboard, Receipt, LineChart, BarChart,
  Upload, Ban, CheckCircle, Trash2, X, Users, FileText,
  Building2, Settings, Briefcase, FileSpreadsheet, 
  Download, Save, Pencil, Mail, Phone, Copy 
} from 'lucide-react';

// Import types from CompanyContext
import type { 
  CompanyDetails, 
  User, 
  UserPermissions
} from '@/contexts/CompanyContext';

type UploadField = 'logo' | 'stamp' | 'signature';

const MyCompany: React.FC = () => {
  const { toast } = useToast();
  
  // Use the CompanyContext
  const { 
    companyDetails, 
    setCompanyDetails, 
    saveCompanyDetails,
    users, 
    addUser,
    updateUser,
    removeUser,
    toggleUserStatus,
    auditLog,
    addAuditLogEntry,
    hasError,
    errorMessage,
    clearError,
    verifyPasscode,
    isFirstTimeSetup,
    setAdminPasscode
  } = useCompany();

  // Checkbox States
  const [isVatNotApplicable, setIsVatNotApplicable] = useState(false);
  const [isWebsiteNotApplicable, setIsWebsiteNotApplicable] = useState(false);
  
  // State for selected user for permissions
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null);
  
  // State for Add User Dialog
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  
  // State for new user
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>(() => ({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 'Viewer',
    status: 'active',
    permissions: {
      dashboard: { view: true, edit: false },
      clients: { view: true, edit: false },
      invoicesQuotes: { view: true, edit: false },
      myCompany: { view: false, edit: false },
      accounting: { view: false, edit: false },
      reports: { view: true, edit: false },
      hr: { view: false, edit: false },
      settings: { view: false, edit: false }
    }
  }));
  
  // State for dialogs
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = useState(false);
  const [selectedUserForPasswordReset, setSelectedUserForPasswordReset] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  // State for passcode dialog
  const [isPasscodeDialogOpen, setIsPasscodeDialogOpen] = useState(false);
  const [passcodeSetupDialogOpen, setPasscodeSetupDialogOpen] = useState(false);
  
  // State for action after passcode verification
  const [currentAction, setCurrentAction] = useState<(passcode: string) => Promise<boolean>>(() => async () => true);
  
  // State for saving indicator
  const [isSaving, setIsSaving] = useState(false);

  // Function to handle adding a new user
  const handleAddUser = () => {
    if (!newUser.fullName || !newUser.email || !newUser.phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Create a new user with a unique ID
    const user: Omit<User, "id"> = {
      fullName: newUser.fullName,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      role: newUser.role,
      status: newUser.status,
      permissions: newUser.permissions
    };

    // Add the user using the context function
    addUser(user);

    // Show success notification
    toast({
      title: "User Added",
      description: `${user.fullName} has been added successfully`
    });

    // Close the dialog
    setIsAddUserDialogOpen(false);
  };

  // Function to handle user status toggle
  const handleToggleStatus = (userId: string) => {
    // Create the action to perform after passcode verification
    const toggleStatusAction = async (passcode: string) => {
      const isValid = await verifyPasscode(passcode);
      if (!isValid) return false;
      
      toggleUserStatus(userId);
      
      // Find the user to get their name and new status for the toast
      const user = users.find(u => u.id === userId);
      if (user) {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        
        // Add audit log entry
        addAuditLogEntry(
          'permissions_updated', 
          `User ${user.fullName} status changed to ${newStatus}`
        );
        
        toast({
          title: "User Status Updated",
          description: `${user.fullName} is now ${newStatus}`
        });
      }
      
      return true;
    };
    
    // Set the action and open the passcode dialog
    setActionAndOpenDialog(toggleStatusAction);
  };

  // Function to handle user removal
  const handleRemoveUser = (userId: string) => {
    // Create the action to perform after passcode verification
    const removeUserAction = async (passcode: string) => {
      const isValid = await verifyPasscode(passcode);
      if (!isValid) return false;
      
      // Find the user to get their name for the toast
      const user = users.find(u => u.id === userId);
      
      const success = removeUser(userId);
      
      if (success && user) {
        // Add audit log entry
        addAuditLogEntry(
          'user_removed', 
          `User ${user.fullName} was removed from the system`
        );
        
        toast({
          title: "User Removed",
          description: `${user.fullName} has been removed`
        });
      } else {
        toast({
          title: "Error",
          description: "Could not remove user. Please try again.",
          variant: "destructive"
        });
      }
      
      return success;
    };
    
    // Set the action and open the passcode dialog
    setActionAndOpenDialog(removeUserAction);
  };
  
  // Function to handle password reset
  const handlePasswordReset = () => {
    if (!selectedUserForPasswordReset) return;
    
    // Create the action to perform after passcode verification
    const resetPasswordAction = async (passcode: string) => {
      const isValid = await verifyPasscode(passcode);
      if (!isValid) return false;
      
      // Generate a random password
      const newPassword = Math.random().toString(36).slice(-8);
      
      // Update the user with the new password
      updateUser(selectedUserForPasswordReset.id, { password: newPassword });
      
      // Add audit log entry
      addAuditLogEntry(
        'password_reset', 
        `Password reset for user ${selectedUserForPasswordReset.fullName}`
      );
      
      // Show the new password to the admin
      setNewPassword(newPassword);
      setIsPasswordResetDialogOpen(true);
      setSelectedUserForPasswordReset(null);
      
      return true;
    };
    
    // Set the action and open the passcode dialog
    setActionAndOpenDialog(resetPasswordAction);
  };

  // Function to handle permission updates
  const handleUpdatePermission = (
    userId: string, 
    module: keyof UserPermissions, 
    permission: 'view' | 'edit', 
    value: boolean
  ) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const updatedPermissions = { ...user.permissions };
    updatedPermissions[module][permission] = value;
    
    updateUser(userId, { permissions: updatedPermissions });
    
    toast({
      title: "Permissions Updated",
      description: `Updated ${permission} permission for ${module} module`
    });
  };

  // Function to apply permission presets
  const applyPermissionPreset = (
    userId: string,
    preset: 'fullAccess' | 'viewOnly' | 'accounting' | 'hr'
  ) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    let updatedPermissions: UserPermissions = { ...user.permissions };
    
    // Create base permissions template
    const modules: Array<keyof UserPermissions> = [
      'dashboard', 'clients', 'invoicesQuotes', 'myCompany', 
      'accounting', 'reports', 'hr', 'settings'
    ];
    
    switch (preset) {
      case 'fullAccess':
        // Grant full access to all modules
        modules.forEach(module => {
          updatedPermissions[module] = { view: true, edit: true };
        });
        break;
        
      case 'viewOnly':
        // Grant view-only access to all modules
        modules.forEach(module => {
          updatedPermissions[module] = { view: true, edit: false };
        });
        break;
        
      case 'accounting':
        // Reset all permissions first
        modules.forEach(module => {
          updatedPermissions[module] = { view: false, edit: false };
        });
        // Grant access to accounting-related modules
        updatedPermissions.dashboard = { view: true, edit: false };
        updatedPermissions.accounting = { view: true, edit: true };
        updatedPermissions.reports = { view: true, edit: true };
        updatedPermissions.invoicesQuotes = { view: true, edit: true };
        updatedPermissions.clients = { view: true, edit: false };
        break;
        
      case 'hr':
        // Reset all permissions first
        modules.forEach(module => {
          updatedPermissions[module] = { view: false, edit: false };
        });
        // Grant access to HR-related modules
        updatedPermissions.dashboard = { view: true, edit: false };
        updatedPermissions.hr = { view: true, edit: true };
        updatedPermissions.clients = { view: true, edit: false };
        break;
    }
    
    // Update the user with the new permissions
    updateUser(userId, { permissions: updatedPermissions });
    
    toast({
      title: "Permissions Updated",
      description: `Applied ${preset.replace(/([A-Z])/g, ' $1').toLowerCase()} preset`
    });
  };
  
  // Function to handle company details update
  const handleUpdateCompanyDetails = async () => {
    // If it's first time setup, show passcode setup dialog
    if (isFirstTimeSetup) {
      setPasscodeSetupDialogOpen(true);
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Verify passcode
      const isValid = await verifyPasscode(passcode);
      
      if (!isValid) {
        toast({
          title: "Invalid Passcode",
          description: "The passcode you entered is incorrect. Please try again.",
          variant: "destructive"
        });
        return false;
      }
      
      // First save the company details
      await saveCompanyDetails();
      
      // Then synchronize with the Users tab
      if (users.length > 0) {
        // Find the admin user or use the first user if no admin exists
        const adminUser = users.find(user => user.role === 'Admin') || users[0];
        
        // Create full name from director's information
        let fullName = adminUser.fullName;
        if (companyDetails.directorFirstName && companyDetails.directorLastName) {
          fullName = `${companyDetails.directorFirstName} ${companyDetails.directorLastName}`;
        }
        
        // Update the admin user with basic information
        updateUser(adminUser.id, {
          fullName: fullName,
          email: companyDetails.contactEmail || adminUser.email,
          phoneNumber: companyDetails.contactPhone || adminUser.phoneNumber,
          role: 'Admin', // Always ensure this user is an Admin
          status: 'active',
          permissions: {
            dashboard: { view: true, edit: true },
            clients: { view: true, edit: true },
            invoicesQuotes: { view: true, edit: true },
            myCompany: { view: true, edit: true },
            accounting: { view: true, edit: true },
            reports: { view: true, edit: true },
            hr: { view: true, edit: true },
            settings: { view: true, edit: true }
          }
        });
        
        // Add audit log entry for the user update
        addAuditLogEntry(
          'permissions_updated',
          `Admin user ${fullName} was synchronized with company information`
        );
      } else {
        // If no users exist, create one with complete company information
        let fullName = 'Admin';
        if (companyDetails.directorFirstName && companyDetails.directorLastName) {
          fullName = `${companyDetails.directorFirstName} ${companyDetails.directorLastName}`;
        }
        
        // Create a new admin user with company information
        addUser({
          fullName: fullName,
          email: companyDetails.contactEmail || 'admin@example.com',
          phoneNumber: companyDetails.contactPhone || '',
          role: 'Admin',
          status: 'active',
          permissions: {
            dashboard: { view: true, edit: true },
            clients: { view: true, edit: true },
            invoicesQuotes: { view: true, edit: true },
            myCompany: { view: true, edit: true },
            accounting: { view: true, edit: true },
            reports: { view: true, edit: true },
            hr: { view: true, edit: true },
            settings: { view: true, edit: true }
          }
        });
        
        // Add audit log entry for the new user
        addAuditLogEntry(
          'user_added',
          `New Admin user ${fullName} was created from company information`
        );
      }
      
      // Save company details
      await saveCompanyDetails();
      
      toast({
        title: "Company Updated",
        description: "Your company details have been updated and synchronized with user information."
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update company details",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  
  // Function to set up admin passcode for first time
  const setupAdminPasscode = async (passcode: string) => {
    setIsSaving(true);
    
    try {
      // Set admin passcode
      await setAdminPasscode(passcode);
      
      // Ensure we have at least one user with company information
      if (users.length === 0) {
        // Create a default admin user with company information
        // Use director name and surname if available
        let fullName = 'Admin';
        if (companyDetails.directorFirstName && companyDetails.directorLastName) {
          fullName = `${companyDetails.directorFirstName} ${companyDetails.directorLastName}`;
        } else if (companyDetails.name) {
          fullName = companyDetails.name;
        }
        
        // Create a new admin user with full company information
        addUser({
          fullName: fullName,
          email: companyDetails.contactEmail || 'admin@example.com',
          phoneNumber: companyDetails.contactPhone || '',
          role: 'Admin',
          status: 'active',
          permissions: {
            dashboard: { view: true, edit: true },
            clients: { view: true, edit: true },
            invoicesQuotes: { view: true, edit: true },
            myCompany: { view: true, edit: true },
            accounting: { view: true, edit: true },
            reports: { view: true, edit: true },
            hr: { view: true, edit: true },
            settings: { view: true, edit: true }
          }
        });
        
        // Add audit log entry for the new user
        addAuditLogEntry(
          'user_added',
          `New Admin user ${fullName} was created during initial setup`
        );
      } else {
        // Update the first user with company information
        const firstUser = users[0];
        
        // Create full name from director name and surname if available
        let fullName = firstUser.fullName;
        if (companyDetails.directorFirstName && companyDetails.directorLastName) {
          fullName = `${companyDetails.directorFirstName} ${companyDetails.directorLastName}`;
        } else if (companyDetails.name) {
          fullName = companyDetails.name;
        }
        
        // Update user with complete company information and ensure Admin role
        updateUser(firstUser.id, {
          fullName: fullName,
          email: companyDetails.contactEmail || firstUser.email,
          phoneNumber: companyDetails.contactPhone || firstUser.phoneNumber,
          role: 'Admin',
          status: 'active',
          permissions: {
            dashboard: { view: true, edit: true },
            clients: { view: true, edit: true },
            invoicesQuotes: { view: true, edit: true },
            myCompany: { view: true, edit: true },
            accounting: { view: true, edit: true },
            reports: { view: true, edit: true },
            hr: { view: true, edit: true },
            settings: { view: true, edit: true }
          }
        });
        
        // Add audit log entry for the user update
        addAuditLogEntry(
          'permissions_updated',
          `User ${fullName} was updated with company information and Admin role during setup`
        );
      }
      
      // Save company details
      await saveCompanyDetails();
      
      toast({
        title: "Setup Complete",
        description: "Your admin passcode has been set and company details have been saved to your user profile."
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete setup",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Render the Users tab content
  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">User Management</h3>
        <Button onClick={() => setIsAddUserDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Information</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs bg-slate-100 inline-block px-2 py-0.5 rounded mt-1 font-medium">{user.role}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-100'}>
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUserForPermissions(user);
                          setIsPermissionsDialogOpen(true);
                        }}
                        className="h-8 w-8 p-0"
                        title="Edit Permissions"
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUserForPasswordReset(user);
                          handlePasswordReset();
                        }}
                        className="h-8 w-8 p-0"
                        title="Reset Password"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant={user.status === 'active' ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleToggleStatus(user.id)}
                        className="h-8 w-8 p-0"
                        title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                      >
                        {user.status === 'active' ? 
                          <Ban className="h-4 w-4" /> : 
                          <CheckCircle className="h-4 w-4" />
                        }
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveUser(user.id)}
                        className="h-8 w-8 p-0"
                        title="Remove User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Add a new user to your company. They will receive an email with login instructions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={newUser.fullName}
                onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">
                Phone
              </Label>
              <Input
                id="phoneNumber"
                value={newUser.phoneNumber}
                onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({
                  ...newUser, 
                  role: value as 'Admin' | 'Manager' | 'Viewer' | 'Custom'
                })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={newUser.status}
                onValueChange={(value) => setNewUser({
                  ...newUser, 
                  status: value as 'active' | 'inactive'
                })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Render the Company Details tab content
  const renderCompanyDetailsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Company Details</h3>
        <Button onClick={handleUpdateCompanyDetails} disabled={isSaving}>
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </>
          )}
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyDetails.name || ''}
                  onChange={(e) => setCompanyDetails({
                    ...companyDetails,
                    name: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Director's Information</Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="directorFirstName" className="text-sm">First Name</Label>
                    <Input
                      id="directorFirstName"
                      value={companyDetails.directorFirstName || ''}
                      onChange={(e) => setCompanyDetails({
                        ...companyDetails,
                        directorFirstName: e.target.value
                      })}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="directorLastName" className="text-sm">Last Name</Label>
                    <Input
                      id="directorLastName"
                      value={companyDetails.directorLastName || ''}
                      onChange={(e) => setCompanyDetails({
                        ...companyDetails,
                        directorLastName: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={companyDetails.contactEmail || ''}
                  onChange={(e) => setCompanyDetails({
                    ...companyDetails,
                    contactEmail: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  value={companyDetails.contactPhone || ''}
                  onChange={(e) => setCompanyDetails({
                    ...companyDetails,
                    contactPhone: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={companyDetails.registrationNumber || ''}
                  onChange={(e) => setCompanyDetails({
                    ...companyDetails,
                    registrationNumber: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vatNotApplicable"
                      checked={isVatNotApplicable}
                      onCheckedChange={(checked) => {
                        setIsVatNotApplicable(!!checked);
                        if (checked) {
                          setCompanyDetails({
                            ...companyDetails,
                            vatNumber: 'N/A'
                          });
                        } else {
                          setCompanyDetails({
                            ...companyDetails,
                            vatNumber: ''
                          });
                        }
                      }}
                    />
                    <Label htmlFor="vatNotApplicable" className="text-sm">
                      Not Applicable
                    </Label>
                  </div>
                </div>
                <Input
                  id="vatNumber"
                  value={companyDetails.vatNumber || ''}
                  onChange={(e) => setCompanyDetails({
                    ...companyDetails,
                    vatNumber: e.target.value
                  })}
                  disabled={isVatNotApplicable}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxNumber">Tax Registration Number</Label>
                <Input
                  id="taxNumber"
                  value={companyDetails.taxRegistrationNumber || ''}
                  onChange={(e) => setCompanyDetails({
                    ...companyDetails,
                    taxRegistrationNumber: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="csdNumber">CSD Registration Number</Label>
                <Input
                  id="csdNumber"
                  value={companyDetails.csdRegistrationNumber || ''}
                  onChange={(e) => setCompanyDetails({
                    ...companyDetails,
                    csdRegistrationNumber: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              
              <div className="space-y-4">
                <AddressAutoFill 
                  onAddressSelected={(address: FormattedAddress) => {
                    setCompanyDetails({
                      ...companyDetails,
                      address: address.streetAddress,
                      city: address.city,
                      province: address.province,
                      postalCode: address.postalCode
                    });
                    toast({
                      title: "Address Updated",
                      description: "Address fields have been auto-filled."
                    });
                  }}
                  className="mb-2"
                />

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Textarea
                    id="address"
                    value={companyDetails.address || ''}
                    onChange={(e) => setCompanyDetails({
                      ...companyDetails,
                      address: e.target.value
                    })}
                    rows={2}
                    placeholder="Enter street address"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={companyDetails.city || ''}
                      onChange={(e) => setCompanyDetails({
                        ...companyDetails,
                        city: e.target.value
                      })}
                      placeholder="City"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input
                      id="province"
                      value={companyDetails.province || ''}
                      onChange={(e) => setCompanyDetails({
                        ...companyDetails,
                        province: e.target.value
                      })}
                      placeholder="Province"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={companyDetails.postalCode || ''}
                    onChange={(e) => setCompanyDetails({
                      ...companyDetails,
                      postalCode: e.target.value
                    })}
                    placeholder="Postal code"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="websiteNotApplicable"
                      checked={isWebsiteNotApplicable}
                      onCheckedChange={(checked) => {
                        setIsWebsiteNotApplicable(!!checked);
                        if (checked) {
                          setCompanyDetails({
                            ...companyDetails,
                            websiteUrl: 'N/A'
                          });
                        } else {
                          setCompanyDetails({
                            ...companyDetails,
                            websiteUrl: ''
                          });
                        }
                      }}
                    />
                    <Label htmlFor="websiteNotApplicable" className="text-sm">
                      Not Applicable
                    </Label>
                  </div>
                </div>
                <Input
                  id="websiteUrl"
                  value={companyDetails.websiteUrl || ''}
                  onChange={(e) => setCompanyDetails({
                    ...companyDetails,
                    websiteUrl: e.target.value
                  })}
                  disabled={isWebsiteNotApplicable}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render the Audit Log tab content
  const renderAuditLogTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Audit Log</h3>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLog.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {new Date(entry.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {entry.action.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.performedBy}</TableCell>
                  <TableCell>{entry.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // Check for first-time setup on component mount
  useEffect(() => {
    if (isFirstTimeSetup && users.length > 0) {
      // Ensure the first user is an admin
      const firstUser = users[0];
      if (firstUser.role !== 'Admin') {
        updateUser(firstUser.id, {
          role: 'Admin',
          permissions: {
            dashboard: { view: true, edit: true },
            clients: { view: true, edit: true },
            invoicesQuotes: { view: true, edit: true },
            myCompany: { view: true, edit: true },
            accounting: { view: true, edit: true },
            reports: { view: true, edit: true },
            hr: { view: true, edit: true },
            settings: { view: true, edit: true }
          }
        });
        
        addAuditLogEntry('permissions_updated', `User ${firstUser.fullName} was automatically made an Admin`);
      }
    }
  }, [isFirstTimeSetup, users, updateUser, addAuditLogEntry]);
  
  // We'll use a ref to store the action to perform after passcode verification
  // This avoids the need for state updates that can cause infinite loops
  const actionRef = React.useRef<(passcode: string) => Promise<boolean>>(async () => true);
  
  // Function to set the current action without causing re-renders
  const setActionAndOpenDialog = (action: (passcode: string) => Promise<boolean>) => {
    actionRef.current = action;
    setIsPasscodeDialogOpen(true);
  };
  
  // Function to handle passcode confirmation
  const handlePasscodeConfirm = async (passcode: string) => {
    return await actionRef.current(passcode);
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">My Company</h2>
      </div>
      
      {hasError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <X className="h-5 w-5 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium">Error</h3>
              <p>{errorMessage}</p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-red-800 underline"
                onClick={clearError}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Passcode Verification Dialog */}
      <PasscodeDialog
        isOpen={isPasscodeDialogOpen}
        onClose={() => setIsPasscodeDialogOpen(false)}
        onConfirm={handlePasscodeConfirm}
        title="Enter Admin Passcode"
        description="Please enter your admin passcode to continue with this action."
      />
      
      {/* First-time Setup Dialog */}
      <PasscodeDialog
        isOpen={passcodeSetupDialogOpen}
        onClose={() => setPasscodeSetupDialogOpen(false)}
        onConfirm={setupAdminPasscode}
        title="Set Admin Passcode"
        description="This is your first time saving company details. Please set an admin passcode that will be required for future changes."
      />
      
      {/* Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Permissions</DialogTitle>
            <DialogDescription>
              Edit permissions for {selectedUserForPermissions?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {selectedUserForPermissions && (
              <>
                <div className="bg-muted p-4 rounded-md">
                  <div className="font-medium">{selectedUserForPermissions.fullName}</div>
                  <div className="text-sm text-muted-foreground">{selectedUserForPermissions.email}</div>
                  <div className="text-xs bg-slate-100 inline-block px-2 py-0.5 rounded mt-1 font-medium">{selectedUserForPermissions.role}</div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Module Access</h4>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div>View</div>
                      <div>Edit</div>
                    </div>
                  </div>
                  
                  {Object.entries(selectedUserForPermissions.permissions).map(([module, perms]) => (
                    <div key={module} className="flex justify-between items-center border-b pb-2">
                      <div className="capitalize">{module.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="flex items-center space-x-8">
                        <Checkbox 
                          id={`${module}-view`}
                          checked={perms.view}
                          onCheckedChange={(checked) => {
                            handleUpdatePermission(
                              selectedUserForPermissions.id,
                              module as keyof UserPermissions,
                              'view',
                              !!checked
                            );
                          }}
                        />
                        <Checkbox 
                          id={`${module}-edit`}
                          checked={perms.edit}
                          onCheckedChange={(checked) => {
                            handleUpdatePermission(
                              selectedUserForPermissions.id,
                              module as keyof UserPermissions,
                              'edit',
                              !!checked
                            );
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Presets</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => applyPermissionPreset(selectedUserForPermissions.id, 'fullAccess')}
                    >
                      Full Access
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => applyPermissionPreset(selectedUserForPermissions.id, 'viewOnly')}
                    >
                      View Only
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => applyPermissionPreset(selectedUserForPermissions.id, 'accounting')}
                    >
                      Accounting Focus
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => applyPermissionPreset(selectedUserForPermissions.id, 'hr')}
                    >
                      HR Focus
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={isPasswordResetDialogOpen} onOpenChange={setIsPasswordResetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Password Reset</DialogTitle>
            <DialogDescription>
              The password has been reset for {selectedUserForPasswordReset?.fullName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="new-password" 
                  value={newPassword} 
                  readOnly 
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(newPassword);
                    toast({
                      title: "Copied",
                      description: "Password copied to clipboard"
                    });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Please share this password with the user securely.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPasswordResetDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Tabs defaultValue="company-details">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company-details">
            <Building2 className="mr-2 h-4 w-4" />
            Company Details
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="audit-log">
            <FileText className="mr-2 h-4 w-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="company-details" className="mt-6">
          {renderCompanyDetailsTab()}
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          {renderUsersTab()}
        </TabsContent>
        
        <TabsContent value="audit-log" className="mt-6">
          {renderAuditLogTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Wrap the component with the error boundary for production safety
const MyCompanyWithErrorBoundary: React.FC = () => (
  <CompanyErrorBoundary>
    <MyCompany />
  </CompanyErrorBoundary>
);

export default MyCompanyWithErrorBoundary;
