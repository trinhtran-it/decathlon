# API User Identification Feature

## Overview

All API endpoints in the APAC Retail ecosystem now support user identification via the `userId` header. This feature allows for tracking user interactions across the system, logging operations, and providing user-specific analytics.

## Implementation Details

### Client-Side (APACWebsite)

The APACWebsite automatically generates and stores a unique userId in the browser's localStorage when a user first visits the site. This ID is then included as a header in all API requests to RetailProductVietnam.

```typescript
// Sample of how the userId is generated and stored
function getUserId(): string {
  if (typeof window === 'undefined') {
    // Handle server-side rendering case
    return '';
  }
  
  // Check if userId already exists in localStorage
  let userId = localStorage.getItem('retail_user_id');
  
  if (!userId) {
    // Generate a new userId if one doesn't exist
    userId = generateUserId();
    
    // Store in localStorage for future sessions
    localStorage.setItem('retail_user_id', userId);
  }
  
  return userId;
}
```

### API Usage

All API requests from the frontend include the `userId` header:

```typescript
// Example API request with userId
const userId = getUserId();
const response = await fetch(`${API_URL}/products`, {
  headers: {
    'userId': userId
  }
});
```

### Middle-Tier (RetailProductVietnam)

RetailProductVietnam receives the `userId` header and:
1. Logs the user activity 
2. Passes the userId to RetailStockUnited when making stock-related API calls

### Backend (RetailStockUnited)

RetailStockUnited logs the userId for all operations, allowing for:
- Tracking which users are modifying stock
- Identifying patterns in stock operations
- Attribution of stock changes to specific user sessions

## Benefits

- **User Behavior Analysis**: Track how users interact with the product inventory
- **Debugging**: Easily trace stock updates to specific user sessions
- **Audit Trail**: Maintain a record of which user sessions performed what stock operations
- **Personalization**: Foundation for future personalization features

## Data Privacy

The userId is a randomly generated identifier and does not contain any personal information. It is only used for system operations tracking and is not tied to user accounts or personal data.

## Future Enhancements

In future versions, we plan to:
1. Add analytics based on userId
2. Implement rate limiting per userId
3. Add user-specific stock reservation features
