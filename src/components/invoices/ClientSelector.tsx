
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Client {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
}

interface ClientSelectorProps {
  clients: Client[];
  onClientSelect: (clientId: string) => void;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ clients, onClientSelect }) => {
  return (
    <div className="space-y-4">
      <Label>Client Information</Label>
      <Select onValueChange={onClientSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map(client => (
            <SelectItem key={client.id} value={client.id}>
              {client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ClientSelector;
