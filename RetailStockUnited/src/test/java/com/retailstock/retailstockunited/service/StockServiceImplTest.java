package com.retailstock.retailstockunited.service;

import com.retailstock.retailstockunited.model.Stock;
import com.retailstock.retailstockunited.repository.StockRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class StockServiceImplTest {

    @Mock
    private StockRepository stockRepository;

    @InjectMocks
    private StockServiceImpl stockService;

    private Stock testStock;

    @BeforeEach
    void setUp() {
        testStock = new Stock();
        testStock.setId(1L);
        testStock.setProductId("PROD001");
        testStock.setQuantity(100);
        testStock.setLocation("CENTRAL_WAREHOUSE");
        testStock.setLastUpdated(LocalDateTime.now());
    }

    @Test
    void getStockByProductId_ExistingProduct_ReturnsStock() {
        when(stockRepository.findByProductId("PROD001")).thenReturn(Optional.of(testStock));

        Stock result = stockService.getStockByProductId("PROD001");

        assertNotNull(result);
        assertEquals("PROD001", result.getProductId());
        assertEquals(100, result.getQuantity());
        verify(stockRepository, times(1)).findByProductId("PROD001");
    }

    @Test
    void getStockByProductId_NonExistingProduct_ThrowsEntityNotFoundException() {
        when(stockRepository.findByProductId("UNKNOWN")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> {
            stockService.getStockByProductId("UNKNOWN");
        });
        
        verify(stockRepository, times(1)).findByProductId("UNKNOWN");
    }

    @Test
    void updateStock_AddingQuantity_ReturnsUpdatedStock() {
        testStock.setQuantity(100);
        when(stockRepository.findByProductIdWithPessimisticLock("PROD001")).thenReturn(Optional.of(testStock));
        when(stockRepository.save(any(Stock.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Stock result = stockService.updateStock("PROD001", 50);

        assertNotNull(result);
        assertEquals(150, result.getQuantity());
        verify(stockRepository, times(1)).findByProductIdWithPessimisticLock("PROD001");
        verify(stockRepository, times(1)).save(any(Stock.class));
    }

    @Test
    void updateStock_SubtractingQuantity_ReturnsUpdatedStock() {
        testStock.setQuantity(100);
        when(stockRepository.findByProductIdWithPessimisticLock("PROD001")).thenReturn(Optional.of(testStock));
        when(stockRepository.save(any(Stock.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Stock result = stockService.updateStock("PROD001", -30);

        assertNotNull(result);
        assertEquals(70, result.getQuantity());
        verify(stockRepository, times(1)).findByProductIdWithPessimisticLock("PROD001");
        verify(stockRepository, times(1)).save(any(Stock.class));
    }
    
    @Test
    void updateStock_SubtractingMoreThanAvailable_SetsQuantityToZero() {
        testStock.setQuantity(100);
        when(stockRepository.findByProductIdWithPessimisticLock("PROD001")).thenReturn(Optional.of(testStock));
        when(stockRepository.save(any(Stock.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Stock result = stockService.updateStock("PROD001", -150);

        assertNotNull(result);
        assertEquals(0, result.getQuantity());
        verify(stockRepository, times(1)).findByProductIdWithPessimisticLock("PROD001");
        verify(stockRepository, times(1)).save(any(Stock.class));
    }

    @Test
    void updateStock_SubtractingToNegative_SetsQuantityToZero() {
        testStock.setQuantity(50);
        when(stockRepository.findByProductIdWithPessimisticLock("PROD001")).thenReturn(Optional.of(testStock));
        when(stockRepository.save(any(Stock.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Subtracting 100 from 50 would result in -50, but our implementation prevents negative quantities
        Stock result = stockService.updateStock("PROD001", -100);

        assertNotNull(result);
        assertEquals(0, result.getQuantity(), "Stock quantity should be set to 0 instead of going negative");
        verify(stockRepository, times(1)).findByProductIdWithPessimisticLock("PROD001");
        verify(stockRepository, times(1)).save(any(Stock.class));
    }
}