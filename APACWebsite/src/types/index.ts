export interface Product {
  id: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  imageUrl?: string;
  category?: string;
  brand?: string;
  weight?: number;
  attributes?: Record<string, any>;
  stock?: {
    quantity: number;
    locationId: string;
    available: boolean;
  } | null;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}