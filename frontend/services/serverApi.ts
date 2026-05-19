import axios from 'axios';

const serverApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 20000,
});

export default serverApi;