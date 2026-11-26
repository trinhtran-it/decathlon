#!/bin/sh

# Enable verbose output for debugging
set -x

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
until nc -z mongodb 27017; do
  echo "MongoDB is unavailable - sleeping"
  sleep 5
done
echo "MongoDB is up - executing command"

# Add a delay to ensure MongoDB is fully initialized
sleep 5

# Run the seed command through the CLI entry point
echo "Running product seeds..."
node dist/cli.js seed:products || echo "Seeding may have failed but continuing startup"

# Create compound index on carts collection
echo "Creating compound unique index on carts collection..."
mongosh ${MONGODB_URI:-"mongodb://root:rootpassword@mongodb:27017/retail-product-vietnam?authSource=admin"} --eval '
  db.carts.createIndex(
    { userId: 1, productId: 1 },
    { unique: true, background: true }
  )
' || echo "Index creation may have failed but continuing startup"

# Start the application
echo "Starting the application..."
exec node dist/main