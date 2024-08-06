'use client';

import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { useState } from 'react';

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    const result = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: 'http://localhost:3000/success', // Redirect URL after success
      },
    });

    if (result.error) {
      setErrorMessage(result.error.message || 'Error processing payment');
      setLoading(false);
    } else {
      setLoading(false);
      setErrorMessage('');
      alert('Payment method updated successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {errorMessage && <div className='text-red-500 mt-2'>{errorMessage}</div>}
      <button
        disabled={!stripe || loading}
        className='bg-blue-500 text-white py-2 px-4 rounded mt-4'
      >
        {loading ? 'Processing...' : 'Update Payment Method'}
      </button>
    </form>
  );
};

export default PaymentForm;
