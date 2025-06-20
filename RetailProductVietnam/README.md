<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# RetailProductVietnam Service

## Overview
RetailProductVietnam is the primary backend service for the APACWebsite. It provides product information along with real-time stock data by orchestrating between its own product database and the RetailStockUnited service.

## API Documentation
The API documentation is available at: http://localhost:3001/api/docs when running the service locally or http://<host>:3001/api/docs in your deployment environment.

## Features
- Product CRUD operations
- Integration with RetailStockUnited service for real-time stock information
- Resilient error handling for dependency failures
- RESTful API for frontend consumption

## Tech Stack
- NestJS - Progressive Node.js framework
- MongoDB - NoSQL database
- Mongoose - MongoDB object modeling
- Axios - HTTP client for API calls

## API Endpoints

### Products
- `GET /api/v1/products` - List all products
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create new product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

## Service Architecture

This service follows a microservice architecture pattern where:

1. **RetailProductVietnam** (this service) - Manages product information and orchestrates data
2. **RetailStockUnited** - Provides real-time stock information

## Resilience Strategy

### Error Handling Approach

The service implements several resilience patterns to ensure high availability even when the RetailStockUnited service experiences issues:

1. **Circuit Breaking**: The service implements timeouts on external API calls to prevent cascading failures.

2. **Graceful Degradation**: When the RetailStockUnited service is unavailable, the product service will:
   - Return product information without stock data
   - Include a `null` value for the `stock` property, indicating that stock information is temporarily unavailable
   - Log errors for monitoring but not crash the application

3. **Comprehensive Logging**: All failures are logged with appropriate context to help with debugging and monitoring.

4. **Configurable Timeouts**: API calls to RetailStockUnited have configurable timeouts to prevent hanging requests.

5. **Error Standardization**: All API responses follow a consistent format, including when errors occur.

### Example Scenario

When a client requests product details with stock:
- Successful scenario: Product is returned with stock information
- Degraded scenario: Product is returned without stock information (stock: null)
- Error scenario: Appropriate HTTP status code with error message

## Environment Variables

```
# For local development
MONGODB_URI=mongodb://localhost:27017/retail-product-vietnam
RETAIL_STOCK_UNITED_API_URL=http://localhost:8080/api/v1
RETAIL_STOCK_UNITED_API_KEY=your-api-key
PORT=3001

# For Docker environment
MONGODB_URI=mongodb://root:rootpassword@decathlon-mongodb:27017/retail-product-vietnam?authSource=admin
RETAIL_STOCK_UNITED_API_URL=http://decathlon-retail-stock-united:8080/api/v1
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- RetailStockUnited service (for full functionality)

### Installation

1. Clone the repository
2. Install dependencies
```
npm install
```
3. Set up environment variables (create a `.env` file based on the example above)
4. Start the development server
```
npm run start:dev
```

## Testing

```
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Production Deployment

For production deployment, use:

```
npm run build
npm run start:prod
```

Alternatively, you can use Docker:

```
docker build -t retail-product-vietnam .
docker run -p 3001:3001 --env-file .env retail-product-vietnam
```
