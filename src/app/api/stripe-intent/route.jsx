// Import NextResponse from 'next/server'
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    // Parse the JSON body from the request
    const { amount, name, email } = await req.json();

    // List customers with the provided email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1, // Assuming you manage to keep emails unique, otherwise adjust your logic
    });

    let customer;

    if (customers.data.length > 0) {
      // Customer with the provided email already exists, use the existing customer
      customer = customers.data[0];
    } else {
      // No customer exists with the provided email, create a new one
      customer = await stripe.customers.create({
        email: email,
        name: name,
      });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customer.id,
    });

    // Construct a response with the clientSecret
    return new NextResponse(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Handle any errors that occur during the PaymentIntent creation
    return new NextResponse(JSON.stringify({ statusCode: 500, message: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
