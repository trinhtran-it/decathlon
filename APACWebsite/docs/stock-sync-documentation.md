# Stock Synchronization Documentation

## Overview
This document outlines the implementation of stock synchronization between the APACWebsite frontend and RetailProductVietnam backend. The goal is to keep product inventory in sync across the system when customers perform cart actions like adding or removing products.

## Key Components

### 1. RetailProductVietnam API
The RetailProductVietnam API provides endpoints for managing product inventory:

- **GET /api/v1/products** - Get all products with stock information
- **GET /api/v1/products/:id** - Get product details by ID with stock information
- **PUT /api/v1/products/:id/stock** - Update stock quantity for a product

The `UpdateStockDTO` is used to update stock quantities:
```typescript
export class UpdateStockDto {
  @ApiProperty({
    description: 'Quantity to change (positive to add, negative to subtract)',
    example: -5,
  })
  @IsNotEmpty()
  @IsInt()
  quantity: number;
}
```

### 2. Stock Synchronization in APACWebsite

#### ProductStore Implementation
The `syncStockWithServer` function in `productStore.ts` is responsible for communicating with the RetailProductVietnam API to update stock quantities:

```typescript
syncStockWithServer: async (id, quantity) => {
  try {
    // Send request to update stock
    const response = await fetch(`${API_URL}/products/${id}/stock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ quantity }),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating stock: ${response.statusText}`);
    }
    
    // Update local state with server response
    const data = await response.json();
    console.log('Stock updated on server:', data);
    
    // Update our local state with the returned stock data
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
    
    return data;
  } catch (err) {
    console.error('Failed to sync stock with server:', err);
    throw err; // Re-throw to allow handling in the UI
  }
}
```

### 3. Integration with Cart Actions

Stock synchronization is triggered on the following cart actions:

#### Adding Items to Cart
When a product is added to cart (in ProductCard.tsx, product/[id].tsx, and index.tsx):

1. Call `syncStockWithServer(productId, -1)` to decrease stock
2. Add the item to the cart if the API call is successful
3. Display notification to the user

#### Removing Items from Cart
When a product is removed from cart (in cart.tsx):

1. Call `syncStockWithServer(productId, quantity)` to increase stock (add items back)
2. Remove the item from the cart if the API call is successful
3. Display notification to the user

#### Changing Item Quantities
When a product quantity is changed in cart:

1. Calculate quantity change
2. Call `syncStockWithServer(productId, -change)` to update stock accordingly
3. Update cart quantity if the API call is successful

#### Clearing the Cart
When the entire cart is cleared:

1. For each item in cart, call `syncStockWithServer(item.id, item.quantity)` to add all items back to stock
2. Clear the cart if all API calls are successful

### 4. Error Handling

Error handling is implemented throughout the stock synchronization process:

- Server errors are caught and displayed to the user with notifications
- Local cart/stock state is only updated if the server sync is successful
- In case of sync failure, appropriate error messages are shown to guide the user
- Products are automatically refreshed from the API after cart actions, even if stock synchronization fails

### 5. Utilities

A utility hook `useSyncCartWithStock()` ensures cart items stay in sync with available stock:

- Automatically validates cart items against current stock levels
- Adjusts cart quantities if they exceed available stock
- Removes items from cart if they become unavailable
- Provides notifications when cart items are automatically adjusted

## Testing

A test utility is available to verify stock synchronization functionality:

- Navigate to `/test` in the APACWebsite
- Use the provided interface to test adding/removing products
- View detailed results showing stock and cart states before and after each operation

## Best Practices

1. **Server-First Approach**: Always update server stock first, then update local state only if successful
2. **Consistent Quantity Convention**: Use negative values to decrease stock, positive values to increase
3. **Error Handling**: Provide clear error messages to users when sync fails
4. **Notifications**: Inform users of important stock-related events
5. **Transaction Safety**: Handle edge cases like network errors to maintain data integrity
