package com.retailstock.retailstockunited.service;

import com.retailstock.retailstockunited.model.Stock;

public interface StockService {
    
    Stock getStockByProductId(String productId);
    
    Stock updateStock(String productId, Integer quantityChange);
}