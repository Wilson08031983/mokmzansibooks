
import React, { useState, useEffect } from 'react';
import { Client, CompanyClient, IndividualClient, VendorClient } from '@/types/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClientFormProps {
  isOpen: boolean;
  isEditing: boolean;
  client: Client | null;
  onClose: () => void;
  onClientAdd: (client: any) => void;
  onClientUpdate: (id: string, client: any) => void;
}

const ClientForm: React.FC<ClientFormProps> = ({
  isOpen,
  isEditing,
  client,
  onClose,
  onClientAdd,
  onClientUpdate
}) => {
  const [activeTab, setActiveTab] = useState<string>('company');
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    credit: 0,
    outstanding: 0,
    overdue: 0,
    type: 'company'
  });

  // Additional fields for company clients
  const [companyFields, setCompanyFields] = useState({
    contactPerson: '',
    vatNumber: '',
    registrationNumber: ''
  });

  // Additional fields for individual clients
  const [individualFields, setIndividualFields] = useState({
    firstName: '',
    lastName: ''
  });

  // Additional fields for vendor clients
  const [vendorFields, setVendorFields] = useState({
    contactPerson: '',
    vendorCategory: '',
    vendorCode: ''
  });

  useEffect(() => {
    if (client) {
      // Set base client fields
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        addressLine2: client.addressLine2 || '',
        city: client.city,
        province: client.province,
        postalCode: client.postalCode,
        credit: client.credit,
        outstanding: client.outstanding,
        overdue: client.overdue,
        type: client.type
      });

      setActiveTab(client.type);

      // Set type-specific fields
      if (client.type === 'company') {
        const companyClient = client as CompanyClient;
        setCompanyFields({
          contactPerson: companyClient.contactPerson || '',
          vatNumber: companyClient.vatNumber || '',
          registrationNumber: companyClient.registrationNumber || ''
        });
      } else if (client.type === 'individual') {
        const individualClient = client as IndividualClient;
        setIndividualFields({
          firstName: individualClient.firstName || '',
          lastName: individualClient.lastName || ''
        });
      } else if (client.type === 'vendor') {
        const vendorClient = client as VendorClient;
        setVendorFields({
          contactPerson: vendorClient.contactPerson || '',
          vendorCategory: vendorClient.vendorCategory || '',
          vendorCode: vendorClient.vendorCode || ''
        });
      }
    }
  }, [client]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFormData({ ...formData, type: value as 'company' | 'individual' | 'vendor' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('company.')) {
      const field = name.split('.')[1];
      setCompanyFields({ ...companyFields, [field]: value });
    } else if (name.includes('individual.')) {
      const field = name.split('.')[1];
      setIndividualFields({ ...individualFields, [field]: value });
    } else if (name.includes('vendor.')) {
      const field = name.split('.')[1];
      setVendorFields({ ...vendorFields, [field]: value });
    } else if (name === 'credit' || name === 'outstanding' || name === 'overdue') {
      // Handle numeric fields
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const clientData = { ...formData };
    
    // Add type-specific fields
    if (formData.type === 'company') {
      Object.assign(clientData, companyFields);
    } else if (formData.type === 'individual') {
      Object.assign(clientData, individualFields);
    } else if (formData.type === 'vendor') {
      Object.assign(clientData, vendorFields);
    }
    
    if (isEditing && client) {
      onClientUpdate(client.id, clientData);
    } else {
      onClientAdd(clientData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the client information below.' 
              : 'Fill in the details to add a new client.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="individual">Individual</TabsTrigger>
              <TabsTrigger value="vendor">Vendor</TabsTrigger>
            </TabsList>
            
            {/* Common fields for all client types */}
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                <Input
                  id="addressLine2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="province">Province</Label>
                  <Select 
                    value={formData.province} 
                    onValueChange={(value) => handleSelectChange(value, 'province')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                      <SelectItem value="Free State">Free State</SelectItem>
                      <SelectItem value="Gauteng">Gauteng</SelectItem>
                      <SelectItem value="KwaZulu-Natal">KwaZulu-Natal</SelectItem>
                      <SelectItem value="Limpopo">Limpopo</SelectItem>
                      <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                      <SelectItem value="North West">North West</SelectItem>
                      <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                      <SelectItem value="Western Cape">Western Cape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="credit">Credit</Label>
                  <Input
                    id="credit"
                    name="credit"
                    type="number"
                    step="0.01"
                    value={formData.credit}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="outstanding">Outstanding</Label>
                  <Input
                    id="outstanding"
                    name="outstanding"
                    type="number"
                    step="0.01"
                    value={formData.outstanding}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="overdue">Overdue</Label>
                  <Input
                    id="overdue"
                    name="overdue"
                    type="number"
                    step="0.01"
                    value={formData.overdue}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Type-specific fields */}
            <TabsContent value="company" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="company.contactPerson">Contact Person</Label>
                <Input
                  id="company.contactPerson"
                  name="company.contactPerson"
                  value={companyFields.contactPerson}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company.vatNumber">VAT Number</Label>
                  <Input
                    id="company.vatNumber"
                    name="company.vatNumber"
                    value={companyFields.vatNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="company.registrationNumber">Registration Number</Label>
                  <Input
                    id="company.registrationNumber"
                    name="company.registrationNumber"
                    value={companyFields.registrationNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="individual" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="individual.firstName">First Name</Label>
                  <Input
                    id="individual.firstName"
                    name="individual.firstName"
                    value={individualFields.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="individual.lastName">Last Name</Label>
                  <Input
                    id="individual.lastName"
                    name="individual.lastName"
                    value={individualFields.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="vendor" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="vendor.contactPerson">Contact Person</Label>
                <Input
                  id="vendor.contactPerson"
                  name="vendor.contactPerson"
                  value={vendorFields.contactPerson}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor.vendorCategory">Vendor Category</Label>
                  <Select 
                    value={vendorFields.vendorCategory} 
                    onValueChange={(value) => setVendorFields({...vendorFields, vendorCategory: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Supplier">Supplier</SelectItem>
                      <SelectItem value="Contractor">Contractor</SelectItem>
                      <SelectItem value="Service Provider">Service Provider</SelectItem>
                      <SelectItem value="Consultant">Consultant</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vendor.vendorCode">Vendor Code</Label>
                  <Input
                    id="vendor.vendorCode"
                    name="vendor.vendorCode"
                    value={vendorFields.vendorCode || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Client' : 'Add Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientForm;
