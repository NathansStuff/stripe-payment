// app/api/create-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  const { email, priceId } = await request.json();

  try {
    // Create a customer in Stripe
    const customer = await stripe.customers.create({ email });

    // Create a subscription with the payment behavior set to "default_incomplete"
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Return the client secret for payment confirmation
    return NextResponse.json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
