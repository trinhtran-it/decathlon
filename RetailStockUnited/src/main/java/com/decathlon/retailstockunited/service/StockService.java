package com.decathlon.retailstockunited.service;

import com.decathlon.retailstockunited.model.Stock;

public interface StockService {
    
    Stock getStockByProductId(String productId);
    
    Stock updateStock(String productId, Integer quantityChange);
}