import { NextRequest, NextResponse } from 'next/server';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();

    // Create a SetupIntent to allow for future payment method setup
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'], // You can specify the types of payment methods you're allowing
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error('Internal Error:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}
