
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { currentUser } = useSupabaseAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Check if the payment was successful
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const reference = urlParams.get('reference');
    const trxref = urlParams.get('trxref');
    
    // If we have a reference, verify the payment
    if (reference && trxref) {
      setIsProcessing(true);
      verifyPayment(reference);
    }
  }, [location]);

  const verifyPayment = async (reference: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('paystack-verify', {
        body: { reference },
      });

      if (error) throw error;

      if (data?.status === 'success') {
        setPaymentSuccess(true);
        
        // Send confirmation email
        try {
          await supabase.functions.invoke('send-payment-confirmation', {
            body: { 
              email: data.data.email,
              amount: data.data.amount
            },
          });
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't throw the error as payment was still successful
        }

        toast({
          title: "Subscription Successful",
          description: "Your premium subscription has been activated.",
          variant: "success",
        });

        // Refresh the user session to get the updated subscription status
        if (currentUser) {
          await supabase.auth.refreshSession();
        }
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Error",
        description: "Could not verify your payment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaystackPayment = async () => {
    if (!currentUser?.email) {
      toast({
        title: "Error",
        description: "Please log in to continue with payment",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('paystack', {
        body: {
          amount: 44.90,
          email: currentUser.email,
          plan: 'PLN_333mlci5462cxih' // Updated with the actual Paystack plan code
        },
      });

      if (error) throw error;

      if (data?.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment Error",
        description: "Could not initialize subscription. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-purple-50">
      <div className="w-full max-w-md">
        {!paymentSuccess ? (
          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Subscribe to Premium
              </CardTitle>
              <CardDescription className="text-center">
                R44.90 per month - Cancel anytime
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  className="w-full" 
                  disabled={isProcessing}
                  onClick={handlePaystackPayment}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Subscribe with Paystack"
                  )}
                </Button>
                <p className="text-xs text-center text-gray-500">
                  Your payment is secured by Paystack
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-gray-500">
                By subscribing, you agree to our{" "}
                <a href="#" className="text-primary underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary underline">
                  Privacy Policy
                </a>
                .
              </div>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                Payment Successful!
              </CardTitle>
              <CardDescription className="text-center">
                Your subscription has been activated
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">Thank you for subscribing to Premium.</p>
              <p className="text-sm text-gray-500 mb-6">
                You now have access to all premium features.
              </p>
              <Button asChild className="w-full">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Payment;
