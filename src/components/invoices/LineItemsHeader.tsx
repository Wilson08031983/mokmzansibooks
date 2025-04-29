
import React from "react";
import { Label } from "@/components/ui/label";

const LineItemsHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-6 gap-4 mb-2">
      <Label>Item No</Label>
      <Label>Description</Label>
      <Label>Quantity</Label>
      <Label>Unit Price</Label>
      <Label>Discount (%)</Label>
      <Label>Amount</Label>
    </div>
  );
};

export default LineItemsHeader;
