# Stock Update API

This module integrates RetailProductVietnam with RetailStockUnited to provide stock update capabilities.

## Overview

The Stock Update API enables updating product inventory levels through a simple API endpoint. The API acts as a bridge between client applications and the RetailStockUnited backend service, handling authentication, error situations, and data translation.

## Features

- Update stock levels for products (add or subtract inventory)
- Automatic retries for network failures
- Comprehensive error handling
- Swagger documentation
- Load testing capabilities

## API Endpoints

### Update Stock

```
PUT /api/v1/products/{productId}/stock
```

**Request Body:**
```json
{
  "quantity": 5  // Positive to add, negative to subtract
}
```

**Success Response:**
```json
{
  "productId": "121721252883996",
  "quantity": 57,  // Updated quantity
  "locationId": "VN-HN-01",
  "available": true
}
```

## Testing

A comprehensive test suite is available to verify the functionality and performance of the Stock Update API.

### Basic Functionality Test

```bash
./test-stock-api.sh basic
```

This test verifies the basic functionality of the API by:
1. Checking the current stock level
2. Adding units to inventory
3. Verifying the update was successful
4. Subtracting units from inventory
5. Verifying the final stock level

### Load Test

```bash
./test-stock-api.sh load
```

This test verifies how the API performs under load by:
1. Sending multiple concurrent requests
2. Alternating between adding and subtracting inventory
3. Reporting on success rate and response times

### Run All Tests

```bash
./test-stock-api.sh all
```

## Implementation Details

The stock update functionality is implemented across several components:

- **ProductController**: Provides the HTTP endpoint and initial validation
- **StockService**: Handles the API communication with RetailStockUnited
- **UpdateStockDto**: Defines the data structure for stock updates

### Resilience Features

- Automatic retry with exponential backoff
- Proper error handling and status code mapping
- Request timeouts to prevent hanging connections

## Integration

The Stock Update API integrates with RetailStockUnited using API keys for authentication. Make sure the following environment variable is set:

```
RETAIL_STOCK_UNITED_API_URL=http://retail-stock-united:8080/api/v1
RETAIL_STOCK_UNITED_API_KEY=your-api-key-here
```

## Swagger UI

API documentation is available through Swagger UI at `/api/docs`.
