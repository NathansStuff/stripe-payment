'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '@/components/PaymentForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const ManagementDashboard = () => {
  const [userId, setUserId] = useState('');
  const [currentPlan, setCurrentPlan] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchSubscriptionData();
    }
  }, [userId]);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/get-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userId }),
      });
      const data = await res.json();
      setCurrentPlan(data.currentPlan);
      setSubscriptionId(data.subscriptionId);
      setSubscriptionLoaded(true);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      setLoading(false);
      setSubscriptionLoaded(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      const res = await fetch('/api/create-setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userId }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPaymentForm(true);
      } else {
        console.error('No client secret returned');
      }
    } catch (error) {
      console.error('Error creating setup intent:', error);
    }
  };

  const handleChangeSubscriptionTier = async () => {
    try {
      await fetch('/api/change-subscription-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId,
          newPriceId: 'price_456', // Replace with new price ID
        }),
      });
      alert('Subscription tier updated successfully');
    } catch (error) {
      console.error('Error changing subscription tier:', error);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });
      alert('Subscription canceled successfully');
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  };

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4'>
      <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-lg'>
        <h1 className='text-2xl font-bold mb-6 text-center text-gray-800'>
          Manage Your Subscription
        </h1>
        <div className='mb-4'>
          <label
            htmlFor='userId'
            className='block text-gray-700 font-semibold mb-2'
          >
            Enter User ID:
          </label>
          <input
            type='text'
            id='userId'
            placeholder='Enter your user ID'
            className='w-full px-3 py-2 border border-gray-300 rounded-md'
            value={userId}
            onChange={e => setUserId(e.target.value)}
          />
        </div>
        <button
          className={`w-full py-3 px-4 mb-4 rounded-md text-white font-semibold ${
            loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
          onClick={fetchSubscriptionData}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Fetch Subscription Data'}
        </button>
        {subscriptionLoaded && (
          <div className='border-t border-gray-300 pt-4'>
            <h2 className='text-lg font-semibold mb-4 text-gray-700'>
              Current Plan:{' '}
              {currentPlan
                ? `$${currentPlan.amount}/${currentPlan.interval}`
                : 'No plan found'}
            </h2>
            <button
              className='w-full py-3 px-4 mb-4 rounded-md bg-green-500 text-white font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50'
              onClick={handleUpdatePaymentMethod}
            >
              Update Payment Method
            </button>
            <button
              className='w-full py-3 px-4 mb-4 rounded-md bg-yellow-500 text-white font-semibold hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50'
              onClick={handleChangeSubscriptionTier}
            >
              Change Subscription Tier
            </button>
            <button
              className='w-full py-3 px-4 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50'
              onClick={handleCancelSubscription}
            >
              Cancel Subscription
            </button>
            {showPaymentForm && clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret }}
              >
                <PaymentForm />
              </Elements>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagementDashboard;
