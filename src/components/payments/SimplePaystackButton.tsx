import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/contexts/I18nContext';
import { Loader2 } from 'lucide-react';

interface PaystackButtonProps {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  reference?: string;
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
  className?: string;
  buttonText?: string;
  metadata?: Record<string, any>;
}

const SimplePaystackButton = ({
  amount,
  email,
  name,
  phone,
  reference,
  onSuccess,
  onClose,
  className = '',
  buttonText = 'Pay Now',
  metadata = {}
}: PaystackButtonProps) => {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Simplified payment handler that just shows a toast
  const handlePayment = () => {
    setIsProcessing(true);
    
    // Generate a reference for demo purposes
    const mockReference = `ref_${new Date().getTime()}_${Math.floor(Math.random() * 1000000)}`;
    
    // Log the metadata for debugging
    console.log('Payment metadata:', {
      amount,
      email,
      name,
      phone,
      metadata
    });
    
    // Simulate a payment process with a timeout
    setTimeout(() => {
      setIsProcessing(false);
      
      // Show success toast
      toast({
        title: t('paymentSuccessful') || 'Payment Successful',
        description: `Payment of R${amount} processed successfully. Reference: ${mockReference}`,
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(mockReference);
      }
    }, 2000); // 2 second delay to simulate processing
  };

  return (
    <Button 
      onClick={handlePayment} 
      className={className}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('processing') || 'Processing...'}
        </>
      ) : buttonText}
    </Button>
  );
};

export default SimplePaystackButton;
