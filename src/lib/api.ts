import axios from "axios";
import { createClient } from "./supabase";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});

export default api;

export const apiClient = {
  async getItems(params?: any) {
    const response = await api.get("/api/v1/items", { params });
    return response.data;
  },
  
  async createItem(data: any) {
    const response = await api.post("/api/v1/items", data);
    return response.data;
  },
  
  async updateItem(id: string, data: any) {
    const response = await api.patch(`/api/v1/items/${id}`, data);
    return response.data;
  },
  
  async deleteItem(id: string) {
    const response = await api.delete(`/api/v1/items/${id}`);
    return response.data;
  },
  
  async chatMessage(messages: any[], use_rag = true) {
    const response = await api.post("/api/v1/chat/message", {
      messages,
      use_rag,
      temperature: 0.7,
      max_tokens: 1000,
    });
    return response.data;
  },
  
  async getStats() {
    const response = await api.get("/api/v1/items/stats/overview");
    return response.data;
  },
};