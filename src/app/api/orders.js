import api from "./woocommerce";
import axios from "axios";

const GET_ORDERS_BY_USER = `query GetOrders($email: String!) {
  orders(where: {billingEmail: $email}) {
    nodes {
      id
      orderNumber
      total(format: RAW)
      status
      date
      currency
      lineItems {
        nodes {
          id
          product {
            node {
              name
              ... on SimpleProduct {
                id
                name
              }
            }
          }
        }
      }
      downloadableItems {
        nodes {
          id
          url
          name
        }
      }
    }
  }
}`;

const axiosClientAuthorized = (token) =>
  axios.create({
    baseURL: "https://alfa.testapp.fun/graphql",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

export const createOrder = async (orderData) => {
  try {
    const response = await api.post("orders", orderData);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating order",
      error.response?.data || error.message
    );
    throw error;
  }
};

/*export const getOrdersByUser = async (email, token) => {
  try {
    const client = axiosClientAuthorized(token);
    const response = await client.post("", {
      query: GET_ORDERS_BY_USER,
      variables: { email },
    });

    console.log("Full response:", response.data); // Log the full response
    if (response.data.errors) {
      console.error("GraphQL errors:", response.data.errors);
      throw new Error("Failed to fetch orders");
    }
    return response.data.data.orders.nodes;
  } catch (error) {
    console.error(
      "Failed to fetch orders",
      error.response?.data || error.message
    );
    throw error;
  }
};*/

export const getOrdersByUser = async (email) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp-json/custom/v1/orders`, {
      params: { email },
    });

    console.log("Full response:", response.data); // Log the full response
    if (response.data.length === 0) {
      console.warn("No orders found for the given email.");
    }

    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch orders",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`orders/${orderId}`, {
      status: status,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error updating order status",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateOrderMetadata = async (orderId, metadata) => {
  try {
    const response = await api.put(`orders/${orderId}`, {
      meta_data: Object.entries(metadata).map(([key, value]) => ({
        key,
        value,
      })),
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error updating order metadata",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const addOrderNote = async (orderId, note) => {
  try {
    const response = await api.post(`orders/${orderId}/notes`, {
      note,
      customer_note: false, // Set to true if you want the customer to see the note
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error adding order note",
      error.response?.data || error.message
    );
    throw error;
  }
};
