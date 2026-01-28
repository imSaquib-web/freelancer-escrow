import axios from "axios";

const Api = axios.create({
baseURL: `${import.meta.env.VITE_SERVER_API_URL}/api`,
});

Api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default Api;
