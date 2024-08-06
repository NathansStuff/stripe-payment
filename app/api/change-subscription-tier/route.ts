// app/api/change-subscription-tier/route.ts
import { NextRequest, NextResponse } from 'next/server';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  const { subscriptionId, newPriceId } = await request.json();

  try {
    // Retrieve the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update the subscription item to the new price
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      }
    );

    return NextResponse.json(updatedSubscription);
  } catch (error) {
    console.error('Error changing subscription tier:', error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
