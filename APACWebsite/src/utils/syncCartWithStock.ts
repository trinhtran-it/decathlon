import { useEffect } from 'react';
import { useCartStore } from '../store/cartStore';
import { useProductStore } from '../store/productStore';
import { notifications } from '@mantine/notifications';

/**
 * A React hook to synchronize cart items with the current product stock levels.
 * This ensures that cart quantities don't exceed available stock and removes products
 * that are no longer available.
 */
export function useSyncCartWithStock() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const { products, isLoading } = useProductStore();
  
  useEffect(() => {
    if (isLoading || !products.length) {
      return; // Skip sync if products are still loading
    }
    // Validate cart items against current stock
    items.forEach(item => {
      const product = products.find(p => p.id === item.id);
      
      // If product doesn't exist anymore or is out of stock, remove from cart
      if (!product) {
        removeItem(item.id);
        notifications.show({
          title: 'Item Removed',
          message: `${item.name} has been removed from your cart (no longer available)`,
          color: 'yellow',
        });
        return;
      }
      
      // If quantity exceeds available stock, adjust it
      if (!product.stock?.quantity || item.quantity > product.stock.quantity) {
        if (product.stock?.quantity && product.stock.quantity > 0) {
          updateQuantity(item.id, product.stock.quantity);
          notifications.show({
            title: 'Quantity Adjusted',
            message: `${item.name} quantity was adjusted to ${product.stock.quantity} (maximum available)`,
            color: 'yellow',
          });
        } else {
          removeItem(item.id);
          notifications.show({
            title: 'Item Removed',
            message: `${item.name} has been removed from your cart (out of stock)`,
            color: 'yellow',
          });
        }
      }
    });
  }, [products, items, isLoading, removeItem, updateQuantity]);
}

/**
 * Helper function to sync a specific product quantity with the server
 * @param productId - The ID of the product
 * @param quantity - The quantity change (negative to decrease stock, positive to increase)
 * @returns A Promise that resolves when stock is synced with the server
 */
export async function syncProductWithServer(productId: string, quantity: number): Promise<void> {
  const syncStockWithServer = useProductStore.getState().syncStockWithServer;
  try {
    await syncStockWithServer(productId, quantity);
  } catch (error) {
    console.error(`Failed to sync product ${productId} with server:`, error);
    notifications.show({
      title: 'Sync Error',
      message: 'Failed to update inventory. Please refresh and try again.',
      color: 'red',
    });
    throw error; // Re-throw to allow handling in the UI
  }
}