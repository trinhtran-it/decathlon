# APAC Retail System

## Architecture Overview

This project implements a microservice-based architecture for APAC retail operations, consisting of three main components:

1. **APAC Website** - A Next.js-based frontend application that provides the user interface for customers to browse products and manage their shopping cart.

2. **Retail Product Vietnam** - A NestJS API service that manages product information, inventory updates, and serves as an intermediary between the frontend and stock management system.

3. **Retail Stock United** - A Java Spring Boot service responsible for core inventory operations with robust transaction management to ensure data consistency across the platform.

### Design Choices

- **Microservices Architecture**: Each component is containerized and can be scaled independently based on demand.
- **Docker Containerization**: All services are dockerized for consistent development, testing, and deployment environments.
- **Data Consistency**: Stock changes are managed with pessimistic locking to prevent inventory conflicts.
- **Real-time Stock Updates**: The frontend synchronizes with backend stock information to provide accurate availability data.
- **Database Separation**: MongoDB for product data and PostgreSQL for transactional stock management to optimize for each use case.

## Local Development Setup

### Prerequisites

- Docker and Docker Compose
- Git

### Setup Instructions

1. **Clone the repository**

```bash
git clone git@github.com:trinhtran-it/retail-stock-microservices.git
cd retail-stock-microservices
```

2. **Configure local secrets**

```bash
cp .env.example .env
# Edit .env and replace every "change-me" value
```

`.env` is git-ignored and holds all credentials (database users/passwords and the inter-service API key). `docker-compose` refuses to start if any required value is missing.

3. **Pull required Docker images and start the services**

```bash
# Pull the required JRE image for RetailStockUnited
docker pull --platform linux/amd64 eclipse-temurin:17-jre-alpine 

# Build and start all services
docker-compose up --build
```

4. **Alternative: Force a clean rebuild of all containers**

```bash
docker-compose up --build --force-recreate
```

5. **Rebuild a specific service (e.g., after code changes)**

```bash
# Example: Rebuild the APAC Website container
docker-compose build --no-cache apac-website
docker-compose up
```

6. **Access the applications**

- APAC Website: http://localhost:3000
- Retail Product Vietnam API: http://localhost:3001
- Retail Stock United API: http://localhost:8080

## Database Access

Credentials come from your local `.env` file (see `.env.example`); none are stored in the repository.

- **MongoDB** (for product data):
  - URL: mongodb://localhost:27017
  - Credentials: `MONGO_ROOT_USERNAME` / `MONGO_ROOT_PASSWORD`
  - Database: retail-product-vietnam

- **PostgreSQL** (for stock data):
  - URL: postgresql://localhost:5432
  - Credentials: `POSTGRES_USER` / `POSTGRES_PASSWORD`
  - Database: retailstockunited

> Databases are initialised with these credentials on first start only. If you change them in `.env`, reset the volumes with `docker-compose down -v`.

## API Documentation

### Retail Product Vietnam API

- **Swagger UI**: http://localhost:3001/api/docs
- **API Base URL**: http://localhost:3001/api/v1

Key endpoints:
- `GET /products` - List all products
- `GET /products/:id` - Get product by ID
- `PUT /products/:id/stock` - Update product stock

### Retail Stock United API

- **Swagger UI**: http://localhost:8080/swagger-ui/swagger-ui/index.html
- **API Docs**: http://localhost:8080/api-docs
- **API Base URL**: http://localhost:8080/api/v1/stocks

Key endpoints:
- `GET /api/v1/stocks/{locationId}` - Get stock by location
- `PUT /api/v1/stocks/{locationId}/{productId}` - Update stock for a product

## Testing

You can test the stock API using the provided test scripts:

```bash
# Test RetailProductVietnam stock API
cd RetailProductVietnam
./test-stock-api.sh

# Load testing the stock API
node src/product/load-test-stock-api.js
```

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                 │     │                     │     │                     │
│  APAC Website   ├─────►  RetailProduct      ├─────►  RetailStock        │
│  (Next.js)      │     │  Vietnam (NestJS)   │     │  United (Spring)    │
│                 │     │                     │     │                     │
└─────────────────┘     └─────────────────────┘     └─────────────────────┘
         │                        │                           │
         │                        │                           │
         │                        ▼                           ▼
         │              ┌─────────────────┐        ┌─────────────────┐
         │              │                 │        │                 │
         └──────────────►    MongoDB      │        │   PostgreSQL    │
                        │                 │        │                 │
                        └─────────────────┘        └─────────────────┘
```

## Troubleshooting

- If you encounter database connection issues, ensure that the MongoDB and PostgreSQL containers are running:
  ```bash
  docker-compose ps
  ```

- To view logs for a specific service:
  ```bash
  docker-compose logs -f apac-website
  docker-compose logs -f retail-product-vietnam
  docker-compose logs -f retail-stock-united
  ```

- If you need to reset the databases:
  ```bash
  docker-compose down -v
  docker-compose up
  ```

## Additional Documentation

- [Stock Synchronization Documentation](./APACWebsite/docs/stock-sync-documentation.md)
- [Stock API Documentation](./RetailProductVietnam/docs/stock-api-documentation.md)
- [RetailProductVietnam API Documentation](./RetailProductVietnam/docs/api-endpoints-documentation.md)
- [Pessimistic Locking Implementation](./RetailStockUnited/docs/pessimistic-locking.md)
