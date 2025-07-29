import axios from "axios";
import { BASE_URL } from "@/services/baseUrl";

const apiClient = axios.create({
  baseURL: BASE_URL || "http://localhost:5000/api",
});

apiClient.interceptors.request.use(
  (config) => ({
    ...config,
    headers: {
      "Cache-Control": "no-store",
    },
  }),
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => Promise.reject(error.response?.data)
);

const { get, post, put, delete: destroy } = apiClient;
export { get, post, put, destroy };
