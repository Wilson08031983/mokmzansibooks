
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Client, isCompanyClient, isIndividualClient, isVendorClient } from '@/types/client';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/formatters';
import { CalendarDays, Phone, Mail, MapPin, Building, User, Truck } from 'lucide-react';
import { format } from 'date-fns';

interface ClientDetailsProps {
  client: Client;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client }) => {
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PP');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Client type specific details
  const renderClientTypeDetails = () => {
    if (isCompanyClient(client)) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Company Details</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <div className="text-gray-500">Contact Person:</div>
            <div>{client.contactPerson || 'N/A'}</div>
            <div className="text-gray-500">VAT Number:</div>
            <div>{client.vatNumber || 'N/A'}</div>
            <div className="text-gray-500">Registration:</div>
            <div>{client.registrationNumber || 'N/A'}</div>
          </div>
        </div>
      );
    } else if (isIndividualClient(client)) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Individual Details</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <div className="text-gray-500">First Name:</div>
            <div>{client.firstName || 'N/A'}</div>
            <div className="text-gray-500">Last Name:</div>
            <div>{client.lastName || 'N/A'}</div>
          </div>
        </div>
      );
    } else if (isVendorClient(client)) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Vendor Details</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <div className="text-gray-500">Contact Person:</div>
            <div>{client.contactPerson || 'N/A'}</div>
            <div className="text-gray-500">Category:</div>
            <div>{client.vendorCategory || 'N/A'}</div>
            <div className="text-gray-500">Vendor Code:</div>
            <div>{client.vendorCode || 'N/A'}</div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{client.name}</CardTitle>
        <div className="text-sm text-gray-500">
          Client ID: {client.id.substring(0, 8)}...
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{client.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{client.phone}</span>
          </div>
        </div>
        
        {/* Address */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Address</span>
          </div>
          <div className="text-sm">
            <div>{client.address}</div>
            {client.addressLine2 && <div>{client.addressLine2}</div>}
            <div>{client.city}, {client.province}</div>
            <div>{client.postalCode}</div>
          </div>
        </div>
        
        <Separator />
        
        {/* Type-specific details */}
        {renderClientTypeDetails()}
        
        <Separator />
        
        {/* Financial Information */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Financial Summary</h3>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <div className="text-gray-500">Credit:</div>
            <div className="text-green-600">{formatCurrency(client.credit)}</div>
            <div className="text-gray-500">Outstanding:</div>
            <div className="text-yellow-600">{formatCurrency(client.outstanding)}</div>
            <div className="text-gray-500">Overdue:</div>
            <div className="text-red-600">{formatCurrency(client.overdue)}</div>
            <div className="text-gray-500">Balance:</div>
            <div className={client.outstanding - client.credit > 0 ? 'text-red-600' : 'text-green-600'}>
              {formatCurrency(client.outstanding - client.credit)}
            </div>
          </div>
        </div>
        
        {/* Timestamps */}
        <div className="text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            <span>Created: {formatDate(client.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <CalendarDays className="h-3 w-3" />
            <span>Last Updated: {formatDate(client.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientDetails;
