/**
 * Test utility to verify the stock synchronization between 
 * the APACWebsite frontend and RetailProductVietnam backend
 */

import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';

interface TestResult {
  action: string;
  productId: string;
  stockBefore: number;
  stockAfter: number;
  cartBefore: number;
  cartAfter: number;
  success: boolean;
}

/**
 * Tests adding a product to cart and verifies stock is updated
 */
export async function testAddToCart(productId: string): Promise<TestResult> {
  // Get initial state
  const productStore = useProductStore.getState();
  const cartStore = useCartStore.getState();
  
  const product = productStore.products.find(p => p.id === productId);
  if (!product) {
    throw new Error(`Product ${productId} not found`);
  }
  
  const stockBefore = product.stock?.quantity || 0;
  const cartItemBefore = cartStore.items.find(item => item.id === productId);
  const cartBefore = cartItemBefore?.quantity || 0;
  
  // Perform action
  try {
    // Add to cart - this will call our syncStockWithServer function
    const syncStockWithServer = productStore.syncStockWithServer;
    await syncStockWithServer(productId, -1);
    
    // Update cart
    if (cartItemBefore) {
      cartStore.updateQuantity(productId, cartBefore + 1);
    } else {
      cartStore.addItem({
        id: productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      });
    }
    
    // Get updated values
    const updatedProduct = useProductStore.getState().products.find(p => p.id === productId);
    const stockAfter = updatedProduct?.stock?.quantity || 0;
    const cartItemAfter = useCartStore.getState().items.find(item => item.id === productId);
    const cartAfter = cartItemAfter?.quantity || 0;
    
    return {
      action: 'addToCart',
      productId,
      stockBefore, 
      stockAfter,
      cartBefore,
      cartAfter,
      success: stockAfter === stockBefore - 1 && cartAfter === cartBefore + 1
    };
  } catch (error) {
    console.error("Test failed:", error);
    return {
      action: 'addToCart',
      productId,
      stockBefore, 
      stockAfter: stockBefore, // Same as before since it failed
      cartBefore,
      cartAfter: cartBefore, // Same as before since it failed
      success: false
    };
  }
}

/**
 * Tests removing a product from cart and verifies stock is updated
 */
export async function testRemoveFromCart(productId: string): Promise<TestResult> {
  // Get initial state
  const productStore = useProductStore.getState();
  const cartStore = useCartStore.getState();
  
  const product = productStore.products.find(p => p.id === productId);
  if (!product) {
    throw new Error(`Product ${productId} not found`);
  }
  
  const stockBefore = product.stock?.quantity || 0;
  const cartItemBefore = cartStore.items.find(item => item.id === productId);
  const cartBefore = cartItemBefore?.quantity || 0;
  
  if (cartBefore === 0) {
    throw new Error(`Product ${productId} is not in cart`);
  }
  
  // Perform action
  try {
    // Remove from cart - this will call our syncStockWithServer function
    const syncStockWithServer = productStore.syncStockWithServer;
    await syncStockWithServer(productId, 1); // Add back to stock
    
    // Update cart
    if (cartBefore > 1) {
      cartStore.updateQuantity(productId, cartBefore - 1);
    } else {
      cartStore.removeItem(productId);
    }
    
    // Get updated values
    const updatedProduct = useProductStore.getState().products.find(p => p.id === productId);
    const stockAfter = updatedProduct?.stock?.quantity || 0;
    const cartItemAfter = useCartStore.getState().items.find(item => item.id === productId);
    const cartAfter = cartItemAfter?.quantity || 0;
    
    return {
      action: 'removeFromCart',
      productId,
      stockBefore, 
      stockAfter,
      cartBefore,
      cartAfter,
      success: stockAfter === stockBefore + 1 && cartAfter === cartBefore - 1
    };
  } catch (error) {
    console.error("Test failed:", error);
    return {
      action: 'removeFromCart',
      productId,
      stockBefore, 
      stockAfter: stockBefore, // Same as before since it failed
      cartBefore,
      cartAfter: cartBefore, // Same as before since it failed
      success: false
    };
  }
}

/**
 * Tests the full flow: add to cart, update quantity, remove from cart
 */
export async function runFullTest(productId: string): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  // Test adding to cart
  results.push(await testAddToCart(productId));
  
  // Test removing from cart
  results.push(await testRemoveFromCart(productId));
  
  return results;
}
