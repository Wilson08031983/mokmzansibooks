
import React from "react";

interface ClientDisplayProps {
  client: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
}

const ClientDisplay: React.FC<ClientDisplayProps> = ({ client }) => {
  if (!client.name) return null;
  
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Name</p>
          <p>{client.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p>{client.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Address</p>
          <p className="whitespace-pre-line">{client.address}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Phone</p>
          <p>{client.phone}</p>
        </div>
      </div>
    </div>
  );
};

export default ClientDisplay;
