
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SignatureField from "@/components/invoices/SignatureField";
import LineItems from "@/components/invoices/LineItems";
import InvoiceTotals from "@/components/invoices/InvoiceTotals";
import { InvoiceData, InvoiceItem } from "@/types/invoice";

const NewInvoice = () => {
  const navigate = useNavigate();
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyStamp, setCompanyStamp] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [vatRate, setVatRate] = useState("15");
  
  const [formState, setFormState] = useState({
    invoiceNumber: `INV-${new Date().getFullYear()}-${uuidv4().slice(0, 4).toUpperCase()}`,
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().slice(0, 10),
    shortDescription: "",
    clientName: "",
    clientAddress: "",
    clientEmail: "",
    clientPhone: "",
    companyName: "",
    companyAddress: "",
    companyEmail: "",
    companyPhone: "",
    notes: "",
    terms: "",
    bankingDetails: ""
  });

  const [lineItems, setLineItems] = useState<InvoiceItem[]>([{
    itemNo: "1",
    description: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    amount: 0
  }]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStampChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyStamp(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addLineItem = () => {
    setLineItems(prevItems => [
      ...prevItems,
      {
        itemNo: String(prevItems.length + 1),
        description: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        amount: 0
      }
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(prevItems => {
      const updatedItems = prevItems.filter((_, i) => i !== index);
      return updatedItems.map((item, idx) => ({
        ...item,
        itemNo: String(idx + 1)
      }));
    });
  };

  const updateLineItem = useCallback((index: number, field: keyof InvoiceItem, value: any) => {
    setLineItems(prevItems => {
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };

      if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
        const item = updatedItems[index];
        const baseAmount = item.quantity * item.unitPrice;
        const discountAmount = baseAmount * (item.discount / 100);
        updatedItems[index].amount = baseAmount - discountAmount;
      }

      return updatedItems;
    });
  }, []);

  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const newSubtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const newTax = newSubtotal * (parseFloat(vatRate) / 100);
    const newTotal = newSubtotal + newTax;

    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  }, [lineItems, vatRate]);

  const handleSaveInvoice = () => {
    const invoiceData: InvoiceData = {
      invoiceNumber: formState.invoiceNumber,
      issueDate: formState.issueDate,
      dueDate: formState.dueDate,
      shortDescription: formState.shortDescription,
      client: {
        name: formState.clientName,
        address: formState.clientAddress,
        email: formState.clientEmail,
        phone: formState.clientPhone
      },
      company: {
        name: formState.companyName,
        address: formState.companyAddress,
        email: formState.companyEmail,
        phone: formState.companyPhone,
        logo: companyLogo,
        stamp: companyStamp
      },
      items: lineItems,
      subtotal,
      vatRate: parseFloat(vatRate),
      tax,
      total,
      notes: formState.notes,
      terms: formState.terms,
      bankingDetails: formState.bankingDetails,
      signature
    };

    // Navigate to template selection with the invoice data
    navigate("/dashboard/invoices/select-template", { state: { invoiceData } });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Invoice</h1>
      
      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            type="text"
            id="invoiceNumber"
            name="invoiceNumber"
            value={formState.invoiceNumber}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="issueDate">Issue Date</Label>
          <Input
            type="date"
            id="issueDate"
            name="issueDate"
            value={formState.issueDate}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formState.dueDate}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="shortDescription">Short Description</Label>
          <Input
            type="text"
            id="shortDescription"
            name="shortDescription"
            value={formState.shortDescription}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Client Details */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Client Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              type="text"
              id="clientName"
              name="clientName"
              value={formState.clientName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="clientEmail">Client Email</Label>
            <Input
              type="email"
              id="clientEmail"
              name="clientEmail"
              value={formState.clientEmail}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="clientAddress">Client Address</Label>
            <Textarea
              id="clientAddress"
              name="clientAddress"
              value={formState.clientAddress}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="clientPhone">Client Phone</Label>
            <Input
              type="tel"
              id="clientPhone"
              name="clientPhone"
              value={formState.clientPhone}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {/* Company Details */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Company Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              type="text"
              id="companyName"
              name="companyName"
              value={formState.companyName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="companyEmail">Company Email</Label>
            <Input
              type="email"
              id="companyEmail"
              name="companyEmail"
              value={formState.companyEmail}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="companyAddress">Company Address</Label>
            <Textarea
              id="companyAddress"
              name="companyAddress"
              value={formState.companyAddress}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="companyPhone">Company Phone</Label>
            <Input
              type="tel"
              id="companyPhone"
              name="companyPhone"
              value={formState.companyPhone}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="companyLogo">Company Logo</Label>
            <Input type="file" id="companyLogo" accept="image/*" onChange={handleLogoChange} />
          </div>
          <div>
            <Label htmlFor="companyStamp">Company Stamp</Label>
            <Input type="file" id="companyStamp" accept="image/*" onChange={handleStampChange} />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <LineItems
        items={lineItems}
        onAddItem={addLineItem}
        onRemoveItem={removeLineItem}
        onUpdateItem={updateLineItem}
      />

      {/* Totals */}
      <InvoiceTotals
        subtotal={subtotal}
        tax={tax}
        total={total}
        vatRate={vatRate}
        onVatRateChange={setVatRate}
      />

      {/* Notes and Terms */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formState.notes}
            onChange={handleInputChange}
            rows={4}
          />
        </div>
        <div>
          <Label htmlFor="terms">Terms and Conditions</Label>
          <Textarea
            id="terms"
            name="terms"
            value={formState.terms}
            onChange={handleInputChange}
            rows={4}
          />
        </div>
      </div>

      {/* Banking Details */}
      <div className="mb-6">
        <Label htmlFor="bankingDetails">Banking Details</Label>
        <Textarea
          id="bankingDetails"
          name="bankingDetails"
          value={formState.bankingDetails}
          onChange={handleInputChange}
          rows={4}
        />
      </div>

      {/* Signature Field */}
      <SignatureField onSave={setSignature} />

      {/* Save Button */}
      <Button onClick={handleSaveInvoice} className="w-full md:w-auto">
        Save Invoice
      </Button>
    </div>
  );
};

export default NewInvoice;
