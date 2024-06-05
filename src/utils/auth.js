import axios from 'axios';

const key = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;

export const fetchAuthToken = async (email, password) => {
  const LOGIN_USER = `
    mutation LoginUser($email: String!, $password: String!, $key: String!) {
      login(input: {
        clientMutationId: $key,
        username: $email,
        password: $password
      }) {
        authToken
        refreshToken
        user {
          id
          name
          email
          firstName
          lastName
          username 
        }
        customer {
          billing {
            address1
            address2
            city
            company
            country
            email
            firstName
            lastName
            phone
            postcode
            state
          }
        }
      }
    }`;

  const response = await axios.post('https://alfa.testapp.fun/graphql', {
    query: LOGIN_USER,
    variables: { email, password, key },
  });
  console.log(response.data.data.login);
  return response.data.data.login;
};

export const getAuthToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const REFRESH_AUTH_TOKEN = `
    mutation RefreshAuthToken($refreshToken: String!) {
      refreshJwtAuthToken(input: { jwtRefreshToken: $refreshToken }) {
        authToken
      }
    }`;

  const response = await axios.post('https://alfa.testapp.fun/graphql', {
    query: REFRESH_AUTH_TOKEN,
    variables: { refreshToken },
  });

  const newAuthToken = response.data.data.refreshJwtAuthToken.authToken;
  localStorage.setItem('authToken', newAuthToken);

  return newAuthToken;
};
