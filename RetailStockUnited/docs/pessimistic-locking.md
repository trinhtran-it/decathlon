# Pessimistic Locking in Stock Update API

This document explains the implementation of pessimistic locking in the RetailStockUnited service to prevent concurrent update issues.

## Problem Statement

When multiple users attempt to update the stock quantity of the same product simultaneously, there's a risk of lost updates or inconsistent data. For example:

1. User A reads stock quantity: 100 units
2. User B reads stock quantity: 100 units
3. User A adds 10 units, saves stock as 110 units
4. User B subtracts 20 units, saves stock as 80 units (overwriting User A's update)

The final stock quantity should be 90 units (100 + 10 - 20), but without proper concurrency control, it would incorrectly be 80 units.

## Solution: Pessimistic Locking

Pessimistic locking is a database concurrency control mechanism that prevents simultaneous updates to the same record by multiple transactions. It works by placing a lock on the record when a transaction begins updating it, forcing other transactions to wait until the lock is released.

### Implementation Details

1. **Repository Methods with Lock**:
   ```java
   // Lock by product ID
   @Lock(LockModeType.PESSIMISTIC_WRITE)
   @Query("SELECT s FROM Stock s WHERE s.productId = :productId")
   Optional<Stock> findByProductIdWithPessimisticLock(@Param("productId") String productId);
   
   // Lock by stock ID
   @Lock(LockModeType.PESSIMISTIC_WRITE)
   @QueryHints({@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000")})
   Optional<Stock> findWithLockingById(Long id);
   ```

2. **Service Implementations**:
   ```java
   // Update by product ID (relative quantity change)
   @Transactional
   public Stock updateStock(String productId, Integer quantityChange) {
       // Acquire pessimistic lock on the stock record
       Stock stock = stockRepository.findByProductIdWithPessimisticLock(productId)
               .orElseThrow(() -> new EntityNotFoundException("Stock not found"));
       
       // Perform update
       int newQuantity = stock.getQuantity() + quantityChange;
       stock.setQuantity(newQuantity);
       
       return stockRepository.save(stock);
   }
   
   // Update by stock ID (absolute quantity value)
   @Transactional
   public void updateStock(Long stockId, int quantity) {
       // Acquire pessimistic lock on the stock record
       Stock stock = stockRepository.findWithLockingById(stockId)
           .orElseThrow(() -> new EntityNotFoundException("Stock not found"));
       
       // Update only after lock is acquired
       stock.setQuantity(quantity);
       stockRepository.save(stock);
   }
   ```

3. **API Endpoints**:
   ```
   // Update stock by product ID (relative change)
   PUT /api/v1/stocks/{productId}
   
   // Update stock by internal ID (absolute value)
   PUT /api/v1/stocks/id/{stockId}/quantity/{quantity}
   ```

4. **Transaction Configuration**:
   ```properties
   spring.transaction.default-timeout=10
   spring.jpa.properties.jakarta.persistence.lock.timeout=5000
   ```

## How It Works

1. When a request comes in to update stock, the service acquires a pessimistic write lock on the database record.
2. If another request tries to update the same record simultaneously, it will be blocked until the first transaction completes.
3. Once the first transaction commits or rolls back, the lock is released, and the waiting transaction can proceed.
4. This ensures that stock updates are processed sequentially for the same product, preventing lost updates.

## Benefits

- **Data Consistency**: Ensures that all stock updates are properly applied without lost updates
- **Simplified Code**: No need for complex optimistic locking version checking or retry logic
- **Reliability**: Works well for high-contention scenarios where the same product might be updated frequently
- **Multiple Access Patterns**: Support for updating by both product ID and internal stock ID

## Considerations

- **Performance Impact**: Pessimistic locking can reduce throughput in high-contention scenarios
- **Deadlock Potential**: Careful ordering of operations is needed to avoid deadlocks
- **Lock Timeout**: Configured to 5 seconds to prevent indefinite waiting

## Testing

A concurrency test has been implemented that verifies the effectiveness of the pessimistic locking mechanism:

```java
@Test
public void testConcurrentStockUpdates() throws InterruptedException {
    // Creates multiple threads to update the same product simultaneously
    // Verifies that all updates are correctly applied
}
```
