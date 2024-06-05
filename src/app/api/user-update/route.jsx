export const UPDATE_USER_MUTATION = `
  mutation UpdateUser($id: ID!, $firstName: String, $lastName: String, $email: String, $password: String) {
    updateCustomer(
      input: {id: $id, firstName: $firstName, lastName: $lastName, password: $password, email: $email}
    ) {
      customer {
        id
        firstName
        lastName
        email
      }
      authToken
    }
  }
`;

export async function POST(request) {
  const requestBody = await request.text();
  const bodyJSON = JSON.parse(requestBody);
  const { jwt, id, email, firstName, lastName, password } = bodyJSON;

  const token = jwt;

  const query = {
    query: UPDATE_USER_MUTATION,
    variables: {
      id,
      email,
      firstName,
      lastName,
      ...(password && { password }),
    },
  };

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/graphql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(query),
      }
    );

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(result.errors[0].message);
    }

    console.log("GraphQL response:", JSON.stringify(result, null, 2));

    return new Response(
      JSON.stringify({
        message: "Success: User details updated",
        user: result.data.updateCustomer.customer,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("An error occurred:", error.message);
    return new Response(
      JSON.stringify({
        message: "Failed to update user details",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
