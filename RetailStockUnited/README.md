# RetailStockUnited Service

This service is the global master for stock data for Decathlon. It provides a RESTful API to manage product stock levels.

## API Documentation
The API documentation is available at: http://localhost:8080/swagger-ui/index.html when running the service locally or http://<host>:8080/swagger-ui/index.html in your deployment environment.

## Features

- Get current stock for a product
- Update stock levels for products
- Create new stock entries

- API Key authentication

## Tech Stack

- Java 17
- Spring Boot 3.2.0
- PostgreSQL
- Spring Data JPA
- Spring Security
- Lombok

## Setup

### Prerequisites

- JDK 17+
- Maven
- PostgreSQL

### Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE retailstockunited;
```

2. The application will automatically create the required tables on startup.

### Configuration

Application properties are configured in `src/main/resources/application.properties`. Adjust the following settings as needed:

- Database connection details
- API key for authentication

### Build and Run

Build and run the application using Maven:

```bash
mvn clean install
mvn spring-boot:run
```

## API Documentation

### Authentication

All API endpoints require an API key to be sent in the `X-API-KEY` request header:

```
X-API-KEY: decathlon-retail-stock-united-key-2025
```

### Endpoints

#### Get Stock for a Product

```
GET /api/v1/stocks/{productId}
```

#### Create New Stock

```
POST /api/v1/stocks
Content-Type: application/json

{
  "productId": "string",
  "quantity": integer,
  "location": "string"
}
```

#### Update Stock Quantity

```
PUT /api/v1/stocks/{productId}
Content-Type: application/json

{
  "quantity": integer
}
```



## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid API key
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error