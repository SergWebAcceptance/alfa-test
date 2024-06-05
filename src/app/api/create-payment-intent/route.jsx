import stripe from "@/src/utils/stripe";

export async function POST(request) {
  const requestBody = await request.text();
  const { amount, currency, billingDetails } = JSON.parse(requestBody);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // amount in cents
      currency,
      payment_method_types: ['card'],
      metadata: { integration_check: 'accept_a_payment' },
    });

    return new Response(
      JSON.stringify({ client_secret: paymentIntent.client_secret }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.log(error.message);
    return new Response(
      JSON.stringify({ message: "Failed to create payment intent", error: error.message }), 
      { status: 500 }
    );
  }
}
