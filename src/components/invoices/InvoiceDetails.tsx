
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InvoiceDetailsProps {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  shortDescription?: string;
  onIssueDateChange: (date: string) => void;
  onDueDateChange: (date: string) => void;
  onShortDescriptionChange: (description: string) => void;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  invoiceNumber,
  issueDate,
  dueDate,
  shortDescription = "",
  onIssueDateChange,
  onDueDateChange,
  onShortDescriptionChange,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            id="invoiceNumber"
            value={invoiceNumber}
            readOnly
            className="bg-gray-50"
          />
        </div>
        <div>
          <Label htmlFor="issueDate">Date</Label>
          <Input
            id="issueDate"
            type="date"
            value={issueDate}
            onChange={(e) => onIssueDateChange(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDescription">Short Description</Label>
        <Input
          id="shortDescription"
          placeholder="Brief description of the invoice"
          value={shortDescription}
          onChange={(e) => onShortDescriptionChange(e.target.value)}
        />
      </div>
    </>
  );
};

export default InvoiceDetails;
