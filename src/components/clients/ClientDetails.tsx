
import React from 'react';
import { Client, CompanyClient, IndividualClient, VendorClient } from '@/types/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MapPin, Calendar, DollarSign, AlertCircle } from 'lucide-react';

interface ClientDetailsProps {
  client: Client;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client }) => {
  const getClientSpecificDetails = () => {
    if (client.type === 'company') {
      const companyClient = client as CompanyClient;
      return (
        <>
          <div className="flex items-start space-x-2 mt-4">
            <div className="w-32 flex-shrink-0 text-gray-500">Contact Person:</div>
            <div>{companyClient.contactPerson}</div>
          </div>
          <div className="flex items-start space-x-2 mt-2">
            <div className="w-32 flex-shrink-0 text-gray-500">VAT Number:</div>
            <div>{companyClient.vatNumber || 'Not provided'}</div>
          </div>
          <div className="flex items-start space-x-2 mt-2">
            <div className="w-32 flex-shrink-0 text-gray-500">Registration:</div>
            <div>{companyClient.registrationNumber || 'Not provided'}</div>
          </div>
        </>
      );
    } else if (client.type === 'individual') {
      const individualClient = client as IndividualClient;
      return (
        <>
          <div className="flex items-start space-x-2 mt-4">
            <div className="w-32 flex-shrink-0 text-gray-500">First Name:</div>
            <div>{individualClient.firstName}</div>
          </div>
          <div className="flex items-start space-x-2 mt-2">
            <div className="w-32 flex-shrink-0 text-gray-500">Last Name:</div>
            <div>{individualClient.lastName}</div>
          </div>
        </>
      );
    } else if (client.type === 'vendor') {
      const vendorClient = client as VendorClient;
      return (
        <>
          <div className="flex items-start space-x-2 mt-4">
            <div className="w-32 flex-shrink-0 text-gray-500">Contact Person:</div>
            <div>{vendorClient.contactPerson}</div>
          </div>
          <div className="flex items-start space-x-2 mt-2">
            <div className="w-32 flex-shrink-0 text-gray-500">Category:</div>
            <div>{vendorClient.vendorCategory || 'Not categorized'}</div>
          </div>
          <div className="flex items-start space-x-2 mt-2">
            <div className="w-32 flex-shrink-0 text-gray-500">Vendor Code:</div>
            <div>{vendorClient.vendorCode || 'No code assigned'}</div>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{client.name}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            client.type === 'company' ? 'bg-blue-100 text-blue-800' :
            client.type === 'individual' ? 'bg-green-100 text-green-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {client.type}
          </span>
        </CardTitle>
        <CardDescription>Client ID: {client.id.substring(0, 8)}...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{client.phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{client.email || 'No email provided'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <div>{client.address}</div>
                  {client.addressLine2 && <div>{client.addressLine2}</div>}
                  <div>{client.city}, {client.province} {client.postalCode}</div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Client Specific Details</h3>
            {getClientSpecificDetails()}
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Financial Information</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span>Credit:</span>
                </div>
                <span className="font-medium">{client.credit.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-amber-500" />
                  <span>Outstanding:</span>
                </div>
                <span className="font-medium">{client.outstanding.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>Overdue:</span>
                </div>
                <span className="font-medium">{client.overdue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Timestamps</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Created: {new Date(client.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Last Updated: {new Date(client.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Last Interaction: {client.lastInteraction ? new Date(client.lastInteraction).toLocaleDateString() : 'Never'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientDetails;
