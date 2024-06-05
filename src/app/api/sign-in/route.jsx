// src/pages/api/sign-in.js

import { fetchAuthToken } from "@/src/utils/auth";
import { encrypt } from '@/src/utils/encrypt-decrypt';

export async function POST(request) {
  const requestBody = await request.text();
  const { email, password } = JSON.parse(requestBody);

  try {
    const response = await fetchAuthToken(email, password);

    let user = response.user;
    let billing = response.customer.billing;
    user.billing = billing;

    return new Response(
      JSON.stringify({
        message: "Login successful",
        jwt: response.authToken,
        user: user,
        refreshToken: response.refreshToken,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.log(error.message);
    return new Response(
      JSON.stringify({ message: "Login failed", error: error.message }), 
      { status: 500 }
    );
  }
}
