// app/api/get-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  const { customerId } = await request.json();

  try {
    // Retrieve customer from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Retrieve customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    // Get the first subscription (if exists)
    const subscription =
      subscriptions.data.length > 0 ? subscriptions.data[0] : null;

    // Return subscription details
    return NextResponse.json({
      currentPlan: subscription
        ? {
            name: subscription.items.data[0].plan.nickname,
            amount: subscription.items.data[0].plan.amount / 100,
            currency: subscription.items.data[0].plan.currency,
            interval: subscription.items.data[0].plan.interval,
          }
        : null,
      subscriptionId: subscription ? subscription.id : null,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
