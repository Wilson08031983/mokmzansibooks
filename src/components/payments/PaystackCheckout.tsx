import { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { Button } from '@/components/ui/button';
import { paystackConfig } from '@/config/paystack';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/contexts/I18nContext';

interface PaystackCheckoutProps {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  reference?: string;
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
  className?: string;
  buttonText?: string;
}

const PaystackCheckout = ({
  amount,
  email,
  name,
  phone,
  reference,
  onSuccess,
  onClose,
  className = '',
  buttonText = 'Pay Now'
}: PaystackCheckoutProps) => {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Convert amount to kobo/cents (Paystack requires amount in the smallest currency unit)
  const amountInKobo = Math.round(amount * 100);

  const config = {
    ...paystackConfig,
    email,
    amount: amountInKobo,
    firstname: name.split(' ')[0],
    lastname: name.split(' ').slice(1).join(' '),
    phone,
    reference: reference || '',
  };

  const initializePayment = usePaystackPayment(config);

  const handlePaymentSuccess = (reference: string) => {
    setIsProcessing(false);
    toast({
      title: t('paymentSuccessful'),
      description: t('paymentSuccessfulDescription'),
    });
    if (onSuccess) onSuccess(reference);
  };

  const handlePaymentClose = () => {
    setIsProcessing(false);
    toast({
      title: t('paymentCancelled'),
      description: t('paymentCancelledDescription'),
      variant: 'destructive',
    });
    if (onClose) onClose();
  };

  const handlePayment = () => {
    setIsProcessing(true);
    // @ts-ignore - The types from react-paystack are not complete
    initializePayment({
      onSuccess: handlePaymentSuccess,
      onClose: handlePaymentClose,
    });
  };

  return (
    <Button 
      onClick={handlePayment} 
      className={className}
      disabled={isProcessing}
    >
      {isProcessing ? t('processing') : buttonText}
    </Button>
  );
};

export default PaystackCheckout;
