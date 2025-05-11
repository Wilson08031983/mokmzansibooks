import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { QuoteData } from '@/types/quote';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

// Inline LoadingSpinner component
const LoadingSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`animate-spin h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Email template function
const generateEmailTemplate = (quote: QuoteData) => {
  const companyName = quote.company?.name || 'Our Company';
  const clientName = quote.client?.name || 'Valued Client';
  
  return `Dear ${clientName},

We're pleased to share Quote #${quote.quoteNumber} with you as requested.

The total amount for this quote is ${new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(Number(quote.total) || 0)}.

This quote is valid until ${quote.expiryDate}.

Please let us know if you have any questions or would like to proceed.

Kind regards,
${companyName}
`;
};

interface EmailQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: QuoteData | null;
}

const EmailQuoteDialog: React.FC<EmailQuoteDialogProps> = ({
  open,
  onOpenChange,
  quote
}) => {
  const [emailData, setEmailData] = useState({
    to: '',
    cc: '',
    subject: '',
    message: '',
    attachPdf: true
  });
  const [isSending, setIsSending] = useState(false);
  
  // Initialize form when quote changes
  useEffect(() => {
    if (quote) {
      setEmailData({
        to: quote.client?.email || '',
        cc: '',
        subject: `Quote #${quote.quoteNumber} from ${quote.company?.name || 'Our Company'}`,
        message: generateEmailTemplate(quote),
        attachPdf: true
      });
    }
  }, [quote]);
  
  const handleInputChange = (field: string, value: string | boolean) => {
    setEmailData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSendEmail = async () => {
    if (!quote) return;
    
    if (!emailData.to) {
      toast.error('Recipient email is required');
      return;
    }
    
    try {
      setIsSending(true);
      
      // If attachPdf is true, generate the PDF first
      let pdfBlob = null;
      if (emailData.attachPdf) {
        try {
          const { generateQuotePDF } = await import('@/utils/pdfGenerator');
          // Generate PDF but don't download it
          // Note: we still can't directly attach the PDF to mailto: links,
          // but we'll download it so the user can attach it manually
          const pdf = await generateQuotePDF(quote, false);
          if (pdf) {
            const pdfFilename = `Quote_${quote.quoteNumber}.pdf`;
            pdf.save(pdfFilename);
            toast.info(`PDF saved as "${pdfFilename}". Please attach it manually to the email.`);
          }
        } catch (pdfError) {
          console.error('Error generating PDF for email:', pdfError);
          toast.error('Could not generate PDF attachment. Email will be sent without it.');
        }
      }
      
      // Prepare mailto link with all email data
      let mailtoLink = `mailto:${encodeURIComponent(emailData.to)}`;
      
      // Add CC if provided
      if (emailData.cc) {
        mailtoLink += `?cc=${encodeURIComponent(emailData.cc)}`;
      }
      
      // Add subject
      const hasParams = mailtoLink.includes('?');
      mailtoLink += `${hasParams ? '&' : '?'}subject=${encodeURIComponent(emailData.subject)}`;
      
      // Add body
      mailtoLink += `&body=${encodeURIComponent(emailData.message)}`;
      
      // Open the default email client
      window.location.href = mailtoLink;
      
      // Log the action
      console.log('Opening email client with:', {
        to: emailData.to,
        cc: emailData.cc,
        subject: emailData.subject,
        messageLength: emailData.message.length,
        quoteNumber: quote.quoteNumber
      });
      
      // Success message
      toast.success(`Opening email client to send Quote #${quote.quoteNumber} to ${emailData.to}`);
      
      // Close the dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setIsSending(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  if (!quote) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Email Quote #{quote.quoteNumber}</DialogTitle>
          <DialogDescription>
            Send this quote directly to your client via email.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email-to">To <span className="text-red-500">*</span></Label>
            <Input 
              id="email-to"
              value={emailData.to} 
              onChange={(e) => handleInputChange('to', e.target.value)}
              placeholder="client@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email-cc">CC</Label>
            <Input 
              id="email-cc"
              value={emailData.cc} 
              onChange={(e) => handleInputChange('cc', e.target.value)}
              placeholder="colleague@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email-subject">Subject</Label>
            <Input 
              id="email-subject"
              value={emailData.subject} 
              onChange={(e) => handleInputChange('subject', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email-message">Message</Label>
            <Textarea 
              id="email-message"
              value={emailData.message} 
              onChange={(e) => handleInputChange('message', e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="attach-pdf" 
              checked={emailData.attachPdf}
              onCheckedChange={(checked) => handleInputChange('attachPdf', Boolean(checked))}
            />
            <Label htmlFor="attach-pdf" className="cursor-pointer">
              Attach PDF quote
            </Label>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-600">
            <p>Note: This will open your default email application with the quote information pre-filled. If you select "Attach PDF quote", the PDF will be saved separately for you to attach manually to the email.</p>
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendEmail} 
            disabled={isSending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSending ? (
              <>
                <LoadingSpinner className="mr-2" />
                Sending...
              </>
            ) : 'Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailQuoteDialog;
