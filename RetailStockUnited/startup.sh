#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD=$SPRING_DATASOURCE_PASSWORD psql -h postgres -U $SPRING_DATASOURCE_USERNAME -d retailstockunited -c "SELECT 1" > /dev/null 2>&1; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "PostgreSQL is up - starting application"

# Start the application in the background
echo "Starting Spring Boot application..."
java -jar app.jar &
APP_PID=$!

# Wait for Spring Boot to initialize the database schema (wait for a while)
echo "Waiting for Spring Boot to initialize the database schema..."
sleep 30

# Check if the stock table exists
echo "Checking if the stock table exists..."
until PGPASSWORD=$SPRING_DATASOURCE_PASSWORD psql -h postgres -U $SPRING_DATASOURCE_USERNAME -d retailstockunited -c "SELECT count(*) FROM information_schema.tables WHERE table_name = 'stock'" | grep -q '1'; do
  echo "Stock table doesn't exist yet - waiting..."
  sleep 5
done
echo "Stock table exists - executing seed data"

# Load seed data from SQL file
echo "Running stock data seed script..."
PGPASSWORD=$SPRING_DATASOURCE_PASSWORD psql -h postgres -U $SPRING_DATASOURCE_USERNAME -d retailstockunited -f /app/seed/stock_data.sql

# Continue with the application (by waiting for it to finish)
echo "Seed data loaded - application is now running"
wait $APP_PID