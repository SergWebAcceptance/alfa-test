import axios from 'axios';


const axiosClient = axios.create({
  baseURL: 'https://alfa.testapp.fun/graphql', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;

