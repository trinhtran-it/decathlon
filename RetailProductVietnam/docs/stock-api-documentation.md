# Stock Update API Documentation

## Overview
This document provides information about the Stock Update API endpoint in the RetailProductVietnam microservice. This API allows for updating product stock quantities by making calls to the RetailStockUnited service.

## Endpoint Details

### Update Stock

Updates the stock quantity for a specific product.

- **URL**: `/api/v1/products/{productId}/stock`
- **Method**: `PUT`
- **Auth Required**: No (handled by RetailStockUnited service)

#### URL Parameters
| Parameter | Description                   | Required |
|-----------|-------------------------------|----------|
| productId | The ID of the product         | Yes      |

#### Headers
| Header    | Description                                   | Required | Default    |
|-----------|-----------------------------------------------|----------|------------|
| userId    | User ID for cart operations and tracking      | Yes      | user-123   |

#### Request Body
```json
{
  "quantity": number
}
```

| Field    | Type   | Description                                                | Required |
|----------|--------|------------------------------------------------------------|----------|
| quantity | number | Quantity to change (positive to add, negative to subtract) | Yes      |

#### Success Response
- **Code**: 200 OK
- **Content Example**:
```json
{
  "productId": "6329a4b51a076b7654c0",
  "quantity": 15,
  "locationId": "VN-HCM",
  "available": true
}
```

#### Error Responses

- **Code**: 404 Not Found
  - **Content**: `{ "statusCode": 404, "message": "Product with ID 12345 not found" }`
  - **Description**: The product does not exist in the RetailProductVietnam database.

- **Code**: 401 Unauthorized
  - **Content**: `{ "statusCode": 401, "message": "Authentication failed for stock service" }`
  - **Description**: The API key for RetailStockUnited is missing or invalid.

- **Code**: 400 Bad Request
  - **Content**: `{ "statusCode": 400, "message": "Invalid request data" }`
  - **Description**: The request body is malformed or contains invalid data.

- **Code**: 500 Internal Server Error
  - **Content**: `{ "statusCode": 500, "message": "Failed to update stock: Internal server error" }`
  - **Description**: An unexpected error occurred in the server.

## Integration Flow
1. The client sends a PUT request to update product stock.
2. RetailProductVietnam verifies that the product exists in its database.
3. RetailProductVietnam calls the RetailStockUnited API to update the stock.
   - If the call fails due to network or server issues, the system will retry up to 3 times with increasing delay intervals.
   - Authentication errors, not found errors, and bad request errors are not retried.
4. The stock update result is returned to the client.

## Resilience Features
- **Retry Logic**: Automatically retries failed API calls to RetailStockUnited up to 3 times with an exponential backoff delay.
- **Error Handling**: Provides specific error responses based on the type of failure.
- **Timeout Management**: Sets a 5-second timeout for API calls to prevent hanging connections.

## Example Usage

### Using cURL
```bash
curl -X PUT \
  http://localhost:3001/api/v1/products/6329a4b51a076b7654c0/stock \
  -H 'Content-Type: application/json' \
  -H 'userId: user-123' \
  -d '{"quantity": 5}'
```

### Using JavaScript (Axios)
```javascript
const axios = require('axios');

const data = { quantity: 5 };
const config = {
  headers: {
    'Content-Type': 'application/json',
    'userId': 'user-123'
  }
};

axios.put('http://localhost:3001/api/v1/products/6329a4b51a076b7654c0/stock', data, config)
  .then(response => {
    console.log('Stock updated:', response.data);
  })
  .catch(error => {
    console.error('Error updating stock:', error.response.data);
  });
```

## Notes
- Positive quantity values add to inventory
- Negative quantity values subtract from inventory
- The RetailStockUnited service performs validation to ensure stock levels don't go below zero
