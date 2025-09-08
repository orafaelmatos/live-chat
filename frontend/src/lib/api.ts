import axios from "axios";

// Configure your backend URL here
const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (email: string, password: string) => {
    const response = await api.post("/auth/register", { email, password });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
};

// Rooms API
export const roomsAPI = {
  createRoom: async (name: string) => {
    const response = await api.post("/rooms/", { name });
    return response.data;
  },

  getRooms: async () => {
    const response = await api.get("/rooms/");
    return response.data;
  },
  addMember: (roomId: string, user_email: string) =>
    api.post(`/rooms/${roomId}/add_member`, { user_email }).then((res) => res.data),
};

// Messages API
export const messagesAPI = {
  sendMessage: async (room_id: string, content: string) => {
    const response = await api.post("/messages", { room_id, content });
    return response.data;
  },

  getMessages: async (room_id: string) => {
    const response = await api.get(`/messages/${room_id}`);
    return response.data;
  },
};

// WebSocket URL
export const getWebSocketURL = (roomId: string) => `ws://localhost:8000/ws/rooms/${roomId}`;

export default api;
