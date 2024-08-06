'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { subscriptionPlans } from '../data/subscriptionPlans';
import CheckoutForm from '@/components/CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (selectedPlan && selectedPlan.name !== 'Free Plan') {
      const fetchClientSecret = async () => {
        try {
          const res = await fetch('/api/create-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, priceId: selectedPlan.priceId }),
          });
          const data = await res.json();
          if (data.clientSecret) {
            console.log('Client secret:', data.clientSecret);
            setClientSecret(data.clientSecret);
          } else {
            console.error('No client secret returned');
          }
        } catch (error) {
          console.error('Error creating subscription:', error);
        }
      };
      fetchClientSecret();
    }
  }, [selectedPlan]);

  const handlePlanSelect = plan => {
    setSelectedPlan(plan);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4'>
      <div className='w-full max-w-lg bg-white rounded-lg shadow-md p-8'>
        <h1 className='text-2xl font-bold mb-4 text-center text-gray-800'>
          Choose Your Plan
        </h1>
        <div className='mb-4'>
          <label
            className='block text-gray-700 text-sm font-bold mb-2'
            htmlFor='email'
          >
            Email
          </label>
          <input
            type='email'
            id='email'
            placeholder='Enter your email'
            className='w-full px-3 py-2 border rounded-md'
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className='space-y-4'>
          {subscriptionPlans.map((plan, index) => (
            <button
              key={index}
              className={`w-full py-3 px-4 rounded-md text-white font-semibold ${
                selectedPlan?.priceId === plan.priceId
                  ? 'bg-blue-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
              onClick={() => handlePlanSelect(plan)}
            >
              {plan.name} - {plan.amount} ({plan.annual ? 'Annual' : 'Monthly'})
            </button>
          ))}
        </div>
        {selectedPlan && selectedPlan.name !== 'Free Plan' && clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: 'stripe' },
            }}
          >
            <CheckoutForm clientSecret={clientSecret} />
          </Elements>
        )}
        {selectedPlan && selectedPlan.name === 'Free Plan' && (
          <button
            className='w-full mt-6 py-3 px-4 rounded-md bg-black text-white font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-opacity-50'
            onClick={() => alert('You have signed up for the free plan!')}
          >
            Sign Up for Free Plan
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;
