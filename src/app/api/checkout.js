import axiosClient from './GlobalApi';

const GET_PAYMENT_METHODS_QUERY = `
  query GetPaymentMethods {
    paymentGateways {
      nodes {
        id
        title
        description
      }
    }
  }
`;

const GET_BILLING_FIELDS_QUERY = `
  query GetBillingFields {
    billingFields {
      id
      label
      required
    }
  }
`;

export const getPaymentMethods = async () => {
    const response = await axiosClient.post('', {
      query: GET_PAYMENT_METHODS_QUERY,
    });
  
    return response.data.data.paymentGateways.nodes;
  };
  
  export const getBillingFields = async () => {
    const response = await axiosClient.post('', {
      query: GET_BILLING_FIELDS_QUERY,
    });
  
    return response.data.data.billingFields;
  };
