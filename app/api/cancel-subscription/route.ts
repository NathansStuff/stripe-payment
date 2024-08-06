// app/api/cancel-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const { subscriptionId } = await request.json();

  try {
    // Cancel the subscription immediately
    const deletedSubscription = await stripe.subscriptions.cancel(
      subscriptionId
    );

    return NextResponse.json(deletedSubscription);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
