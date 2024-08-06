'use client';

import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';

const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    try {
      // Call elements.submit() to validate the form inputs
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || errorMessage);
        setLoading(false);
        return;
      }

      // Confirm the payment after successful form submission
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: 'http://localhost:3000/payment-success',
        },
      });

      if (error) {
        setErrorMessage(error.message ?? 'Payment Failed');
      }
    } catch (error) {
      console.error('Error during payment confirmation:', error);
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='bg-white p-2 rounded-md'
    >
      <PaymentElement />
      {errorMessage && <div className='text-red-500'>{errorMessage}</div>}
      <button
        disabled={!stripe || loading}
        className='text-white w-full p-5 bg-black mt-2 rounded-md font-bold disabled:opacity-50 disabled:animate-pulse'
      >
        {!loading ? 'Subscribe' : 'Processing...'}
      </button>
    </form>
  );
};

export default CheckoutForm;
