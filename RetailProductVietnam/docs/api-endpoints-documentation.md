# RetailProductVietnam API Endpoints Documentation

## Overview
This document provides detailed information about the API endpoints available in the RetailProductVietnam microservice, including the userId header functionality.

## Endpoints

### GET All Products

Retrieves a list of all products with their stock information.

- **URL**: `/api/v1/products`
- **Method**: `GET`
- **Auth Required**: No

#### Headers
| Header    | Description                                   | Required | Default    |
|-----------|-----------------------------------------------|----------|------------|
| userId    | User ID for personalized stock availability   | No       | user-123   |

#### Success Response
- **Code**: 200 OK
- **Content Example**:
```json
[
  {
    "id": "6329a4b51a076b7654c0",
    "name": "Tennis Racket Pro",
    "description": "Professional grade tennis racket",
    "price": 149.99,
    "category": "Tennis",
    "stock": {
      "quantity": 15,
      "locationId": "VN-HCM",
      "available": true
    }
  },
  ...
]
```

#### Error Response
- **Code**: 500 Internal Server Error
  - **Content**: `{ "statusCode": 500, "message": "Failed to retrieve products" }`
  - **Description**: An unexpected error occurred in the server.

### GET Product by ID

Retrieves a specific product with its stock information.

- **URL**: `/api/v1/products/{productId}`
- **Method**: `GET`
- **Auth Required**: No

#### URL Parameters
| Parameter | Description            | Required |
|-----------|------------------------|----------|
| productId | The ID of the product  | Yes      |

#### Headers
| Header    | Description                                   | Required | Default    |
|-----------|-----------------------------------------------|----------|------------|
| userId    | User ID for personalized stock availability   | No       | user-123   |

#### Success Response
- **Code**: 200 OK
- **Content Example**:
```json
{
  "id": "6329a4b51a076b7654c0",
  "name": "Tennis Racket Pro",
  "description": "Professional grade tennis racket",
  "price": 149.99,
  "category": "Tennis",
  "stock": {
    "quantity": 15,
    "locationId": "VN-HCM",
    "available": true
  }
}
```

#### Error Responses
- **Code**: 404 Not Found
  - **Content**: `{ "statusCode": 404, "message": "Product with ID 12345 not found" }`
  - **Description**: The product was not found in the database.

- **Code**: 500 Internal Server Error
  - **Content**: `{ "statusCode": 500, "message": "Failed to retrieve product" }`
  - **Description**: An unexpected error occurred in the server.

### Update Stock

See the [Stock API Documentation](./stock-api-documentation.md) for detailed information about this endpoint.

## Using userId Header

The userId header is used throughout the API for:

1. **Personalized Stock Information**: When retrieving products, the system may adjust stock availability based on the user's current cart contents
2. **Cart Management**: When updating stock, the userId is required to maintain the user's cart
3. **Operation Tracking**: For analytics and debugging purposes

### Default Value

If not provided, the API uses `user-123` as the default userId for demonstration purposes. In production environments, a real user ID should be provided.

## Example Usage with userId Header

### Using cURL
```bash
curl -X GET \
  http://localhost:3001/api/v1/products \
  -H 'userId: user-456'
```

### Using JavaScript (Axios)
```javascript
const axios = require('axios');

const config = {
  headers: {
    'userId': 'user-456'
  }
};

axios.get('http://localhost:3001/api/v1/products', config)
  .then(response => {
    console.log('Products:', response.data);
  })
  .catch(error => {
    console.error('Error fetching products:', error.response.data);
  });
```
