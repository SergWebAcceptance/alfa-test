import { ApolloLink } from '@apollo/client';

const createSessionLink = () => {
  return new ApolloLink((operation, forward) => {
    const authToken = localStorage.getItem('authToken');
    const sessionToken = localStorage.getItem('woocommerce-session');

    if (authToken) {
      operation.setContext({
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    }

    if (sessionToken) {
      operation.setContext({
        headers: {
          'woocommerce-session': `Session ${sessionToken}`,
        },
      });
    }

    return forward(operation);
  });
};

export default createSessionLink;
