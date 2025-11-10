// Типы для API

export const OrderStatus = {
  IN_PROGRESS: 'в_работе',
  COMPLETED: 'завершен',
  CANCELLED: 'отменен',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const UserRole = {
  ADMIN: 'admin',
  BUYER: 'buyer',
  SUPPLIER: 'supplier',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface BuyerInfo {
  id: number;
  username: string;
  email?: string | null;
}

export interface SupplierInfo {
  id: number;
  name: string;
  user_id?: number | null;
}

export interface Order {
  id: number;
  title: string;
  product_name: string;
  delivery_volume?: string | null;
  purchase_budget?: number | null;
  product_description?: string | null;
  buyer_id: number;
  supplier_id?: number | null;
  buyer?: BuyerInfo;
  supplier?: SupplierInfo;
  ordered_at: string;
  deadline_at: string;
  cost: number;
  note?: string | null;
  status: OrderStatus;
  remaining_time?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderCreate {
  title: string;
  product_name: string;
  delivery_volume?: string | null;
  purchase_budget?: number | null;
  product_description?: string | null;
  supplier_id?: number | null;
  deadline_at: string;
  cost: number;
  note?: string | null;
}

export interface User {
  id: number;
  email?: string | null;
  username: string;
  role: UserRole;
  organization_name?: string | null;
  inn?: string | null;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email?: string;
  username: string;
  password: string;
  role?: UserRole;
  organization_name?: string;
  inn?: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  organization_name?: string;
  inn?: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_info?: string | null;
  country: string;
  rating: number;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Message {
  id: number;
  order_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  read_at?: string | null;
  sender?: {
    id: number;
    username: string;
  } | null;
  receiver?: {
    id: number;
    username: string;
  } | null;
}

export interface MessageCreate {
  order_id: number;
  receiver_id: number;
  content: string;
}

export interface ChatInfo {
  order_id: number;
  order_title: string;
  other_user_id: number;
  other_user_name: string;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
}

