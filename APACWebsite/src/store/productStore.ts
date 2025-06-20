import { create } from 'zustand';
import { Product } from '../types';
import { getUserId } from '../utils/userId';

const API_URL = 'http://localhost:3001/api/v1';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  updateStock: (id: string, quantity: number) => void;
  syncStockWithServer: (id: string, quantity: number) => Promise<void>;
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  
  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      // Get userId for request header
      const userId = getUserId();
      
      const response = await fetch(`${API_URL}/products`, {
        headers: {
          'userId': userId
        }
      });
      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.statusText}`);
      }
      
      const data = await response.json();
      const formattedProducts: Product[] = data.map((item: any) => ({
        id: item.productId,
        productId: item.productId,
        name: item.name,
        description: item.description || '',
        price: item.price,
        image: item.imageUrl || 'https://images.unsplash.com/photo-1600095139416-40bbe937cc51?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        imageUrl: item.imageUrl,
        category: item.category,
        brand: item.brand,
        weight: item.weight,
        attributes: item.attributes,
        stock: item.stock
      }));
      
      set({ products: formattedProducts, isLoading: false });
    } catch (err) {
      console.error('Failed to fetch products:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch products', 
        isLoading: false 
      });
    }
  },
  
  fetchProductById: async (id: string) => {
    const { products } = get();
    // First check if we already have the product in our state
    const existingProduct = products.find(product => product.productId === id);
    if (existingProduct) return existingProduct;
    
    // If not, fetch it from the API
    try {
      set({ isLoading: true, error: null });
      
      // Get userId for request header
      const userId = getUserId();
      
      const response = await fetch(`${API_URL}/products/${id}`, {
        headers: {
          'userId': userId
        }
      });
      if (!response.ok) {
        throw new Error(`Error fetching product: ${response.statusText}`);
      }
      
      const productData = await response.json();
      const formattedProduct: Product = {
        id: productData.productId,
        productId: productData.productId,
        name: productData.name,
        description: productData.description || '',
        price: productData.price,
        image: productData.imageUrl || 'https://images.unsplash.com/photo-1600095139416-40bbe937cc51?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        imageUrl: productData.imageUrl,
        category: productData.category,
        brand: productData.brand,
        weight: productData.weight,
        attributes: productData.attributes,
        stock: productData.stock
      };
      
      set({ isLoading: false });
      return formattedProduct;
    } catch (err) {
      console.error('Failed to fetch product:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch product', 
        isLoading: false 
      });
      return null;
    }
  },
  
  updateStock: (id, quantityChange) => set((state) => ({
    products: state.products.map((product) => {
      if (product.id === id && product.stock) {
        return { 
          ...product, 
          stock: {
            ...product.stock,
            quantity: product.stock.quantity - quantityChange
          }
        };
      }
      return product;
    })
  })),
  
  syncStockWithServer: async (id, quantity) => {
    try {
      set({ isLoading: true, error: null });
      
      // We're sending a request to the RetailProductVietnam API
      // For add to cart: quantity should be negative (decreasing inventory)
      // For remove from cart: quantity should be positive (increasing inventory)
      
      // Get userId for request header
      const userId = getUserId();
      
      const response = await fetch(`${API_URL}/products/${id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'userId': userId
        },
        body: JSON.stringify({ quantity }),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating stock: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Stock updated on server:', data);
      
      // Update our local state with the returned stock data
      // This ensures our client is in sync with the server
      if (data && data.quantity !== undefined) {
        set((state) => ({
          products: state.products.map((product) => {
            if (product.id === id) {
              return {
                ...product,
                stock: {
                  quantity: data.quantity,
                  locationId: data.locationId || product.stock?.locationId || 'default',
                  available: data.available !== undefined ? data.available : product.stock?.available || true
                }
              };
            }
            return product;
          })
        }));
      }
      
      set({ isLoading: false });
      return data;
    } catch (err) {
      console.error('Failed to sync stock with server:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Failed to sync stock with server', 
        isLoading: false 
      });
      throw err; // Re-throw to allow handling in the UI
    }
  }
}));