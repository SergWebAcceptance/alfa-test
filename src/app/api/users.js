import api from "./woocommerce";
import { fetchAuthToken } from "@/src/utils/auth";

export const createUser = async (userData) => {
  try {
    const response = await api.post("customers", userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user", error.response?.data || error.message);
    throw error;
  }
};
