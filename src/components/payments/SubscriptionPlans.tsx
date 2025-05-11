import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import PaystackCheckout from './PaystackCheckout';
import { useI18n } from '@/contexts/I18nContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: PlanFeature[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Essential features for small businesses',
    price: 199,
    interval: 'monthly',
    features: [
      { name: 'Up to 50 clients', included: true },
      { name: 'Basic reporting', included: true },
      { name: 'Invoice generation', included: true },
      { name: 'Email support', included: true },
      { name: 'HR benefits management', included: false },
      { name: 'Advanced analytics', included: false },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing businesses',
    price: 499,
    interval: 'monthly',
    features: [
      { name: 'Unlimited clients', included: true },
      { name: 'Advanced reporting', included: true },
      { name: 'Invoice generation', included: true },
      { name: 'Priority email support', included: true },
      { name: 'HR benefits management', included: true },
      { name: 'Advanced analytics', included: false },
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Complete solution for established businesses',
    price: 999,
    interval: 'monthly',
    features: [
      { name: 'Unlimited clients', included: true },
      { name: 'Advanced reporting', included: true },
      { name: 'Invoice generation', included: true },
      { name: '24/7 phone support', included: true },
      { name: 'HR benefits management', included: true },
      { name: 'Advanced analytics', included: true },
    ],
  },
];

const SubscriptionPlans = () => {
  const { t } = useI18n();
  const { currentUser } = useSupabaseAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handlePaymentSuccess = (reference: string) => {
    console.log('Payment successful with reference:', reference);
    // Here you would typically update the user's subscription status in your backend
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center p-1 bg-muted rounded-lg">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-4 py-2 text-sm rounded-md ${
              billingInterval === 'monthly' ? 'bg-white shadow-sm' : ''
            }`}
          >
            {t('monthly')}
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            className={`px-4 py-2 text-sm rounded-md ${
              billingInterval === 'yearly' ? 'bg-white shadow-sm' : ''
            }`}
          >
            {t('yearly')} ({t('save20Percent')})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          // Calculate price based on billing interval
          const price = billingInterval === 'yearly' ? plan.price * 12 * 0.8 : plan.price;
          
          return (
            <Card 
              key={plan.id} 
              className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg' : ''}`}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.popular && <Badge>{t('mostPopular')}</Badge>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">R{price}</span>
                  <span className="text-muted-foreground ml-1">/{billingInterval === 'monthly' ? t('month') : t('year')}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      {feature.included ? (
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <span className="h-4 w-4 mr-2 flex items-center justify-center text-muted-foreground">-</span>
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {currentUser && (
                  <PaystackCheckout
                    amount={price}
                    email={currentUser.email || ''}
                    name={currentUser?.displayName || currentUser?.user_metadata?.display_name || ''}
                    buttonText={t('subscribe')}
                    className="w-full"
                    onSuccess={handlePaymentSuccess}
                  />
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
