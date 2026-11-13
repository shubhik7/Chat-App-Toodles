import axios from "axios";
import { getErrorMessage } from "../utilities/errors";

const Api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/chatapp",
  withCredentials: true,
  timeout: 15000,
});

Api.interceptors.response.use(
  (response) => response,
  (error) => {
    error.status = error.response?.status;
    error.originalMessage = error.message;
    error.message = getErrorMessage(error);
    return Promise.reject(error);
  },
);

export default Api;
