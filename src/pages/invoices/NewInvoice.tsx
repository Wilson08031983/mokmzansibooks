
import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash } from "lucide-react";
import SignatureCanvas from 'react-signature-canvas';
import { v4 as uuidv4 } from 'uuid';
import { formatCurrency } from "@/utils/formatters";
import { InvoiceData, InvoiceItem } from "@/types/invoice";

type SignatureCanvasRef = SignatureCanvas | null;

const NewInvoice = () => {
  const navigate = useNavigate();
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyStamp, setCompanyStamp] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [vatRate, setVatRate] = useState("15");
  const signatureRef = useRef<SignatureCanvasRef>(null);

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

  const [lineItems, setLineItems] = useState([
    {
      itemNo: "1",
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      amount: 0
    }
  ]);

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

  const handleSignatureSave = () => {
    if (signatureRef.current) {
      setSignature(signatureRef.current.getTrimmedCanvas().toDataURL('image/png'));
    }
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignature(null);
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
    setLineItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  const updateLineItem = useCallback((index: number, field: string, value: any) => {
    setLineItems(prevItems => {
      const updatedItems = [...prevItems];
      updatedItems[index][field] = value;

      // Recalculate amount when quantity, unitPrice, or discount changes
      if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
        const quantity = updatedItems[index].quantity || 0;
        const unitPrice = updatedItems[index].unitPrice || 0;
        const discount = updatedItems[index].discount || 0;
        updatedItems[index].amount = quantity * unitPrice * (1 - discount / 100);
      }

      return updatedItems;
    });
  }, []);

  const calculateSubtotal = () => {
    return lineItems.reduce((acc, item) => acc + item.amount, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (parseFloat(vatRate) / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSaveInvoice = () => {
    // Create the invoice data from the form state
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
      items: lineItems.map(item => ({
        itemNo: item.itemNo,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        amount: item.amount
      })),
      subtotal: calculateSubtotal(),
      vatRate: parseFloat(vatRate),
      tax: calculateTax(),
      total: calculateTotal(),
      notes: formState.notes,
      terms: formState.terms,
      bankingDetails: formState.bankingDetails,
      signature: signature
    };

    // Save the invoice data
    setInvoiceData(invoiceData);
    navigate("/dashboard/invoices/select-template");
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
      <h2 className="text-xl font-semibold mb-2">Client Details</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
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
          <Label htmlFor="clientAddress">Client Address</Label>
          <Input
            type="text"
            id="clientAddress"
            name="clientAddress"
            value={formState.clientAddress}
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

      {/* Company Details */}
      <h2 className="text-xl font-semibold mb-2">Company Details</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
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
          <Label htmlFor="companyAddress">Company Address</Label>
          <Input
            type="text"
            id="companyAddress"
            name="companyAddress"
            value={formState.companyAddress}
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

      {/* Line Items */}
      <h2 className="text-xl font-semibold mb-2">Line Items</h2>
      <div className="mb-6">
        {lineItems.map((item, index) => (
          <div key={index} className="grid grid-cols-6 gap-4 mb-2">
            <div>
              <Label htmlFor={`itemNo-${index}`}>Item No</Label>
              <Input
                type="text"
                id={`itemNo-${index}`}
                value={item.itemNo}
                onChange={(e) => updateLineItem(index, 'itemNo', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`description-${index}`}>Description</Label>
              <Input
                type="text"
                id={`description-${index}`}
                value={item.description}
                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`quantity-${index}`}>Quantity</Label>
              <Input
                type="number"
                id={`quantity-${index}`}
                value={item.quantity}
                onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
              <Input
                type="number"
                id={`unitPrice-${index}`}
                value={item.unitPrice}
                onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor={`discount-${index}`}>Discount (%)</Label>
              <Input
                type="number"
                id={`discount-${index}`}
                value={item.discount}
                onChange={(e) => updateLineItem(index, 'discount', parseFloat(e.target.value))}
              />
            </div>
            <div className="flex items-end">
              <Button type="button" variant="destructive" size="sm" onClick={() => removeLineItem(index)}>
                <Trash className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" size="sm" onClick={addLineItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add Line Item
        </Button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="vatRate">VAT Rate (%)</Label>
          <Input
            type="number"
            id="vatRate"
            name="vatRate"
            value={vatRate}
            onChange={(e) => setVatRate(e.target.value)}
          />
        </div>
        <div>
          <Label>Subtotal</Label>
          <div className="font-bold">{formatCurrency(calculateSubtotal())}</div>
        </div>
        <div>
          <Label>Tax</Label>
          <div className="font-bold">{formatCurrency(calculateTax())}</div>
        </div>
        <div>
          <Label>Total</Label>
          <div className="font-bold">{formatCurrency(calculateTotal())}</div>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="mb-6">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formState.notes}
          onChange={handleInputChange}
        />
      </div>
      <div className="mb-6">
        <Label htmlFor="terms">Terms and Conditions</Label>
        <Textarea
          id="terms"
          name="terms"
          value={formState.terms}
          onChange={handleInputChange}
        />
      </div>

      {/* Banking Details */}
      <div className="mb-6">
        <Label htmlFor="bankingDetails">Banking Details</Label>
        <Textarea
          id="bankingDetails"
          name="bankingDetails"
          value={formState.bankingDetails}
          onChange={handleInputChange}
        />
      </div>

      {/* Signature */}
      <div className="mb-6">
        <Label>Signature</Label>
        <div className="border rounded-md p-2">
          <SignatureCanvas
            ref={signatureRef}
            penColor='black'
            backgroundColor='white'
            canvasProps={{ width: 500, height: 200, className: 'border' }}
          />
          <div className="flex justify-between mt-2">
            <Button type="button" variant="secondary" size="sm" onClick={handleClearSignature}>
              Clear
            </Button>
            <Button type="button" size="sm" onClick={handleSignatureSave}>
              Save Signature
            </Button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button onClick={handleSaveInvoice}>
        Save Invoice
      </Button>
    </div>
  );
};

export default NewInvoice;
