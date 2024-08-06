// app/api/get-or-create-customer/route.ts
import { NextRequest, NextResponse } from 'next/server';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Mock database
const mockDatabase = {
  customers: [], // In-memory storage for customers
};

// Mock function to find a customer by email
async function findCustomerByEmail(email) {
  return mockDatabase.customers.find(customer => customer.email === email);
}

// Mock function to save a customer in the database
async function saveCustomerInDb(stripeCustomerId, email) {
  const newCustomer = { stripeCustomerId, email };
  mockDatabase.customers.push(newCustomer);
  return newCustomer;
}

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  try {
    // Find or create the customer in the mock database
    let customer = await findCustomerByEmail(email);

    if (!customer) {
      // Create a new Stripe customer if not found
      const stripeCustomer = await stripe.customers.create({ email });
      customer = await saveCustomerInDb(stripeCustomer.id, email);
    }

    return NextResponse.json({ customerId: customer.stripeCustomerId });
  } catch (error) {
    console.error('Error getting or creating customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
