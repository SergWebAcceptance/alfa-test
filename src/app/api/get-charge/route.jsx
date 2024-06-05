import stripe from "@/src/utils/stripe";

export async function POST(request) {
  const { paymentIntentId } = await request.json();

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const chargeId = paymentIntent.charges.data[0].id; // Assuming there's at least one charge

    return new Response(JSON.stringify({ chargeId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.log(error.message);
    return new Response(JSON.stringify({ message: "Failed to retrieve charge details", error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
