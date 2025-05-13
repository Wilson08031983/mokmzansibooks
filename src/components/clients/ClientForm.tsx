import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Client, CompanyClient, IndividualClient, VendorClient } from '@/types/client';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Partial<Client>) => void;
  isEditing: boolean;
  client?: Client | null;
}

const ClientForm: React.FC<ClientFormProps> = ({
  isOpen,
  onClose,
  onSave,
  isEditing,
  client = null,
}) => {
  const [clientType, setClientType] = useState<'company' | 'individual' | 'vendor'>(
    client?.type || 'company'
  );
  
  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  // Company specific fields
  const [contactPerson, setContactPerson] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  
  // Individual specific fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Vendor specific fields
  const [vendorCategory, setVendorCategory] = useState('');
  const [vendorCode, setVendorCode] = useState('');

  // Initialize form with client data when editing
  useEffect(() => {
    if (client) {
      setClientType(client.type);
      setName(client.name || '');
      setEmail(client.email || '');
      setPhone(client.phone || '');
      setAddress(client.address || '');
      setAddressLine2(client.addressLine2 || '');
      setCity(client.city || '');
      setProvince(client.province || '');
      setPostalCode(client.postalCode || '');
      
      if (client.type === 'company') {
        const companyClient = client as CompanyClient;
        setContactPerson(companyClient.contactPerson || '');
        setVatNumber(companyClient.vatNumber || '');
        setRegistrationNumber(companyClient.registrationNumber || '');
      } else if (client.type === 'individual') {
        const individualClient = client as IndividualClient;
        setFirstName(individualClient.firstName || '');
        setLastName(individualClient.lastName || '');
      } else if (client.type === 'vendor') {
        const vendorClient = client as VendorClient;
        setContactPerson(vendorClient.contactPerson || '');
        setVendorCategory(vendorClient.vendorCategory || '');
        setVendorCode(vendorClient.vendorCode || '');
      }
    } else {
      // Reset form when adding new client
      resetForm();
    }
  }, [client, isOpen]);

  // Reset form fields
  const resetForm = () => {
    setClientType('company');
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setAddressLine2('');
    setCity('');
    setProvince('');
    setPostalCode('');
    setContactPerson('');
    setVatNumber('');
    setRegistrationNumber('');
    setFirstName('');
    setLastName('');
    setVendorCategory('');
    setVendorCode('');
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create base client object
    const baseClient: Partial<Client> = {
      type: clientType,
      name,
      email,
      phone,
      address,
      addressLine2: addressLine2 || undefined,
      city,
      province,
      postalCode,
    };

    // Add type-specific fields
    let clientData: Partial<Client>;
    
    if (clientType === 'company') {
      clientData = {
        ...baseClient,
        contactPerson,
        vatNumber,
        registrationNumber,
      };
    } else if (clientType === 'individual') {
      clientData = {
        ...baseClient,
        firstName,
        lastName,
      };
    } else {
      clientData = {
        ...baseClient,
        contactPerson,
        vendorCategory,
        vendorCode: vendorCode || null,
      };
    }

    // If editing, keep the ID
    if (isEditing && client) {
      clientData.id = client.id;
    }

    onSave(clientData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the client details below.'
                : 'Fill in the details below to add a new client.'}
            </DialogDescription>
          </DialogHeader>

          {/* Client Type Tabs - Only show when adding new client */}
          {!isEditing && (
            <Tabs
              defaultValue="company"
              value={clientType}
              onValueChange={(value) => setClientType(value as any)}
              className="mt-4"
            >
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="individual">Individual</TabsTrigger>
                <TabsTrigger value="vendor">Vendor</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          
          <div className="space-y-6 py-4">
            {/* Common Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {/* Type-specific fields */}
              {clientType === 'company' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vatNumber">VAT Number</Label>
                      <Input
                        id="vatNumber"
                        value={vatNumber}
                        onChange={(e) => setVatNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="registrationNumber">Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {clientType === 'individual' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
              
              {clientType === 'vendor' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vendorCategory">Vendor Category</Label>
                      <Select
                        value={vendorCategory}
                        onValueChange={setVendorCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="supplier">Supplier</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                          <SelectItem value="service">Service Provider</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="vendorCode">Vendor Code</Label>
                      <Input
                        id="vendorCode"
                        value={vendorCode}
                        onChange={(e) => setVendorCode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Address Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="province">Province</Label>
                    <Input
                      id="province"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Save Changes' : 'Add Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientForm;
