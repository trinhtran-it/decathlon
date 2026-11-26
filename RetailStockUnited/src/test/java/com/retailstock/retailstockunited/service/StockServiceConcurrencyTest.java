package com.retailstock.retailstockunited.service;

import com.retailstock.retailstockunited.model.Stock;
import com.retailstock.retailstockunited.repository.StockRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
public class StockServiceConcurrencyTest {

    @Autowired
    private StockService stockService;

    @Autowired
    private StockRepository stockRepository;

    private static final String TEST_PRODUCT_ID = "TEST-CONCURRENCY-PRODUCT";
    private static final int INITIAL_QUANTITY = 100;
    private static final int NUM_THREADS = 10;
    private static final int QUANTITY_CHANGE = 5; // Each thread adds 5 units
    
    @BeforeEach
    @Transactional
    public void setup() {
        // Delete the test product if it exists
        Optional<Stock> existingStock = stockRepository.findByProductId(TEST_PRODUCT_ID);
        existingStock.ifPresent(stock -> stockRepository.delete(stock));
        
        // Create a new test stock with known quantity
        Stock testStock = new Stock();
        testStock.setProductId(TEST_PRODUCT_ID);
        testStock.setQuantity(INITIAL_QUANTITY);
        testStock.setLocation("TEST-LOCATION");
        testStock.setLastUpdated(LocalDateTime.now());
        stockRepository.save(testStock);
    }

    @Test
    public void testConcurrentStockUpdates() throws InterruptedException {
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(NUM_THREADS);
        
        ExecutorService executorService = Executors.newFixedThreadPool(NUM_THREADS);
        List<Exception> exceptions = new ArrayList<>();
        
        // Create multiple threads that will try to update the stock simultaneously
        for (int i = 0; i < NUM_THREADS; i++) {
            executorService.submit(() -> {
                try {
                    // Wait for all threads to be ready
                    startLatch.await();
                    
                    // Call the service method that uses pessimistic locking
                    stockService.updateStock(TEST_PRODUCT_ID, QUANTITY_CHANGE);
                    
                } catch (Exception e) {
                    exceptions.add(e);
                } finally {
                    endLatch.countDown();
                }
            });
        }
        
        // Start all threads at once
        startLatch.countDown();
        
        // Wait for all threads to finish
        boolean allDone = endLatch.await(30, TimeUnit.SECONDS);
        executorService.shutdown();
        
        // Verify results
        assertTrue(allDone, "Not all threads completed in time");
        assertTrue(exceptions.isEmpty(), "Exceptions occurred during concurrent updates: " + exceptions);
        
        // Refresh stock data
        Stock updatedStock = stockService.getStockByProductId(TEST_PRODUCT_ID);
        
        // With correct pessimistic locking, we expect the final quantity to be:
        // initialQuantity + (numThreads * quantityChange)
        int expectedQuantity = INITIAL_QUANTITY + (NUM_THREADS * QUANTITY_CHANGE);
        assertEquals(expectedQuantity, updatedStock.getQuantity(),
                "Final quantity should reflect all updates with pessimistic locking");
    }
}
