import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/contexts/I18nContext';
import { Loader2 } from 'lucide-react';

// Define the Paystack public key
const PAYSTACK_PUBLIC_KEY = 'pk_live_04cecd786eaed713e065a61d330535507b4cc05a';

// Define the PaystackOptions interface
interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  label?: string;
  plan?: string;
  channels?: string[];
  save_card?: boolean;
  metadata?: {
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string | number | boolean;
    }>;
  };
}

// Define the PaystackButtonProps interface
interface PaystackButtonProps {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  reference?: string;
  plan?: string;
  saveCard?: boolean;
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
  className?: string;
  buttonText?: string;
  metadata?: Record<string, any>;
}

// Define the PaystackButton component
const PaystackButton = ({
  amount,
  email,
  name,
  phone,
  reference,
  plan,
  saveCard = true, // Enable card saving by default
  onSuccess,
  onClose,
  className = '',
  buttonText = 'Pay Now',
  metadata = {}
}: PaystackButtonProps) => {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load the Paystack script
  useEffect(() => {
    // Check if the script is already loaded
    if (document.getElementById('paystack-script')) {
      setScriptLoaded(true);
      return;
    }

    // Create the script element
    const script = document.createElement('script');
    script.id = 'paystack-script';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;

    // Set the onload handler
    script.onload = () => {
      setScriptLoaded(true);
    };

    // Set the onerror handler
    script.onerror = () => {
      console.error('Failed to load Paystack script');
      toast({
        title: 'Error',
        description: 'Failed to load payment gateway. Please try again later.',
        variant: 'destructive',
      });
    };

    // Add the script to the document
    document.body.appendChild(script);

    // Clean up function
    return () => {
      // Only remove the script if we added it
      const paystackScript = document.getElementById('paystack-script');
      if (paystackScript && paystackScript.parentNode) {
        paystackScript.parentNode.removeChild(paystackScript);
      }
    };
  }, [toast]);

  // Handle the payment
  const handlePayment = () => {
    if (!scriptLoaded) {
      toast({
        title: 'Error',
        description: 'Payment gateway is still loading. Please try again in a moment.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Generate a reference if not provided
      const paymentReference = reference || `ref-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

      // Split the name into first name and last name
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Convert amount to kobo (smallest currency unit in Nigeria)
      const amountInKobo = Math.round(amount * 100);

      // Create the Paystack options
      const options: PaystackOptions = {
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: amountInKobo,
        currency: 'ZAR',
        ref: paymentReference,
        firstname: firstName,
        lastname: lastName,
        phone,
        label: 'MokMzansi Books',
        ...(plan ? { plan } : {}), // Add plan if provided
        channels: ['card'], // Only allow card payments
        save_card: saveCard, // Enable card saving
        metadata: {
          custom_fields: [
            {
              display_name: 'Customer Name',
              variable_name: 'customer_name',
              value: name
            },
            // Convert metadata object to custom fields array
            ...Object.entries(metadata).map(([key, value]) => ({
              display_name: key,
              variable_name: key.toLowerCase().replace(/\s+/g, '_'),
              value: value as string | number | boolean
            }))
          ]
        }
      };

      // Initialize Paystack
      // @ts-ignore - PaystackPop is loaded from the script
      const handler = window.PaystackPop.setup({
        ...options,
        callback: (response: { reference: string }) => {
          setIsProcessing(false);
          toast({
            title: 'Payment Successful',
            description: `Your payment was successful with reference: ${response.reference}`,
          });
          if (onSuccess) {
            onSuccess(response.reference);
          }
        },
        onClose: () => {
          setIsProcessing(false);
          toast({
            title: 'Payment Cancelled',
            description: 'You cancelled the payment.',
            variant: 'destructive',
          });
          if (onClose) {
            onClose();
          }
        }
      });

      // Open the payment modal
      handler.openIframe();
    } catch (error) {
      console.error('Paystack error:', error);
      setIsProcessing(false);
      toast({
        title: 'Payment Error',
        description: 'An error occurred while processing your payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={handlePayment}
      className={className}
      disabled={isProcessing || !scriptLoaded}
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

export default PaystackButton;
