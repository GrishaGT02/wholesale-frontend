import axios from 'axios';
import type { Order, OrderCreate, Token, User, UserCreate, UserUpdate, Supplier, Message, MessageCreate, ChatInfo } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: UserCreate): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  login: async (username: string, password: string): Promise<Token> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post<Token>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
  },

  updateNotificationSettings: async (emailNotifications: boolean): Promise<User> => {
    const response = await api.put<User>('/users/me/notifications', {
      email_notifications: emailNotifications,
    });
    return response.data;
  },

  updateProfile: async (data: UserUpdate): Promise<User> => {
    const response = await api.put<User>('/users/me', data);
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (status?: string): Promise<Order[]> => {
    const params = status ? { status } : {};
    const response = await api.get<Order[]>('/orders', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  create: async (data: OrderCreate): Promise<Order> => {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  update: async (id: number, data: Partial<OrderCreate>): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  updateStatus: async (id: number, status: string): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${id}/status`, null, {
      params: { new_status: status },
    });
    return response.data;
  },

  respond: async (id: number): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${id}/respond`);
    return response.data;
  },
};

// Suppliers API
export const suppliersAPI = {
  getAll: async (): Promise<Supplier[]> => {
    const response = await api.get<Supplier[]>('/suppliers');
    return response.data;
  },

  getById: async (id: number): Promise<Supplier> => {
    const response = await api.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  },
};

// Messages API
export const messagesAPI = {
  getOrderMessages: async (orderId: number): Promise<Message[]> => {
    const response = await api.get<Message[]>(`/orders/${orderId}/messages`);
    return response.data;
  },

  send: async (data: MessageCreate): Promise<Message> => {
    const response = await api.post<Message>('/messages', data);
    return response.data;
  },

  markAsRead: async (messageId: number): Promise<Message> => {
    const response = await api.put<Message>(`/messages/${messageId}/read`);
    return response.data;
  },

  getChats: async (): Promise<ChatInfo[]> => {
    const response = await api.get<ChatInfo[]>('/messages/chats');
    return response.data;
  },

  markAllAsReadInOrder: async (orderId: number): Promise<{ marked_count: number }> => {
    const response = await api.post<{ marked_count: number }>(`/orders/${orderId}/messages/mark-all-read`);
    return response.data;
  },
};

export default api;

