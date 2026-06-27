export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  cover_image: string | null;
  category_id: string;
  author: string;
  view_count: number;
  status: string;
  is_top: boolean;
  created_at: string;
  updated_at: string | null;
  categories?: Category;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  content: string;
  status: string;
  reply: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface SiteConfigItem {
  id: string;
  config_key: string;
  config_value: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Admin {
  id: string;
  username: string;
  password_hash: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export type SiteConfigMap = Record<string, string>;

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  totalCategories: number;
  totalMessages: number;
  pendingMessages: number;
  totalViews: number;
  recentArticles: Article[];
  recentMessages: Message[];
}
