/**
 * Utility for performing batch stock operations with the RetailProductVietnam API
 */

import { useProductStore } from '../store/productStore';
import { CartItem } from '../types';

/**
 * Interface for batch operation results
 */
export interface BatchOperationResult {
  success: boolean;
  successCount: number;
  failCount: number;
  failedItems: {
    productId: string;
    error: string;
  }[];
}

/**
 * Process a batch of stock updates (e.g., when checking out or clearing cart)
 * This helps reduce the number of API calls when performing multiple operations
 * 
 * @param items - Cart items to process
 * @param operation - 'add' to add back to stock, 'remove' to remove from stock
 * @returns BatchOperationResult with success status and details
 */
export async function processBatchStockUpdates(
  items: CartItem[],
  operation: 'add' | 'remove'
): Promise<BatchOperationResult> {
  const result: BatchOperationResult = {
    success: false,
    successCount: 0,
    failCount: 0,
    failedItems: []
  };
  
  if (items.length === 0) {
    result.success = true;
    return result;
  }
  
  const { syncStockWithServer } = useProductStore.getState();
  
  // Process each item sequentially to avoid race conditions
  for (const item of items) {
    try {
      // For 'add' operation, use positive quantity (adding back to stock)
      // For 'remove' operation, use negative quantity (removing from stock)
      const quantityChange = operation === 'add' ? item.quantity : -item.quantity;
      
      await syncStockWithServer(item.id, quantityChange);
      result.successCount++;
    } catch (error) {
      console.error(`Failed to update stock for product ${item.id}:`, error);
      result.failCount++;
      result.failedItems.push({
        productId: item.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  result.success = result.failCount === 0;
  return result;
}

/**
 * Retry a failed stock operation with exponential backoff
 * 
 * @param productId - ID of the product to update
 * @param quantity - Quantity to change (positive to add, negative to subtract)
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param initialDelay - Initial delay in ms before first retry (default: 1000)
 * @returns The result of the stock update operation
 */
export async function retryStockOperation(
  productId: string,
  quantity: number,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<any> {
  const { syncStockWithServer } = useProductStore.getState();
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // If this is a retry attempt, wait before trying again
      if (attempt > 0) {
        // Exponential backoff: 1s, 2s, 4s, ...
        const delay = initialDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`Retry attempt ${attempt}/${maxRetries} for product ${productId}`);
      }
      
      // Attempt the stock update
      const result = await syncStockWithServer(productId, quantity);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1}/${maxRetries + 1} failed:`, error);
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new Error(`Failed to update stock after ${maxRetries + 1} attempts: ${lastError?.message}`);
      }
    }
  }
}

/**
 * Check if the cart items are still available in stock
 * and adjust quantities if necessary
 * 
 * @param cartItems - Current cart items
 * @returns Updated cart items with adjusted quantities based on current stock
 */
export async function validateCartAgainstStock(cartItems: CartItem[]): Promise<{
  updatedItems: CartItem[];
  removedItems: string[];
  reducedItems: { id: string; oldQuantity: number; newQuantity: number }[];
}> {
  const { products, fetchProducts } = useProductStore.getState();
  
  // Refresh product data to ensure we have the latest stock information
  await fetchProducts();
  
  // Get fresh product data
  const currentProducts = useProductStore.getState().products;
  
  const updatedItems: CartItem[] = [];
  const removedItems: string[] = [];
  const reducedItems: { id: string; oldQuantity: number; newQuantity: number }[] = [];
  
  for (const cartItem of cartItems) {
    const product = currentProducts.find(p => p.id === cartItem.id);
    
    // If product doesn't exist or is out of stock, mark for removal
    if (!product || !product.stock || product.stock.quantity <= 0) {
      removedItems.push(cartItem.id);
      continue;
    }
    
    // If requested quantity exceeds available stock, adjust quantity
    if (cartItem.quantity > product.stock.quantity) {
      reducedItems.push({
        id: cartItem.id,
        oldQuantity: cartItem.quantity,
        newQuantity: product.stock.quantity
      });
      
      updatedItems.push({
        ...cartItem,
        quantity: product.stock.quantity
      });
    } else {
      // Item is available with requested quantity
      updatedItems.push({ ...cartItem });
    }
  }
  
  return {
    updatedItems,
    removedItems,
    reducedItems
  };
}
