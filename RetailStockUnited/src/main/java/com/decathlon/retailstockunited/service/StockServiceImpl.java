package com.decathlon.retailstockunited.service;

import com.decathlon.retailstockunited.model.Stock;
import com.decathlon.retailstockunited.repository.StockRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;

@Service
public class StockServiceImpl implements StockService {

    private static final Logger logger = LoggerFactory.getLogger(StockServiceImpl.class);
    private final StockRepository stockRepository;

    @Autowired
    public StockServiceImpl(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    @Override
    public Stock getStockByProductId(String productId) {
        return stockRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException("Stock not found for product ID: " + productId));
    }

    @Override
    @Transactional
    public Stock updateStock(String productId, Integer quantityChange) {
        logger.info("Processing stock update for productId: {} with quantity change: {}", productId, quantityChange);
        
        // Use pessimistic locking to prevent concurrent updates to the same product
        Stock stock = stockRepository.findByProductIdWithPessimisticLock(productId)
                .orElseThrow(() -> new EntityNotFoundException("Stock not found for product ID: " + productId));
        
        int originalQuantity = stock.getQuantity();
        
        // If quantityChange is positive, add to stock
        // If quantityChange is negative, subtract from stock
        int newQuantity = originalQuantity + quantityChange;
        
        // Prevent negative stock quantities
        if (newQuantity < 0) {
            logger.warn("Attempted to set negative stock for productId: {}. Original: {}, Change: {}", 
                      productId, originalQuantity, quantityChange);
            newQuantity = 0;
        }
        
        logger.info("Updating stock for productId: {} from {} to {} units", productId, originalQuantity, newQuantity);
        
        stock.setQuantity(newQuantity);
        stock.setLastUpdated(LocalDateTime.now());
        return stockRepository.save(stock);
    }
}