package com.decathlon.retailstockunited.controller;

import com.decathlon.retailstockunited.dto.StockUpdateRequest;
import com.decathlon.retailstockunited.model.Stock;
import com.decathlon.retailstockunited.service.StockService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StockController.class)
@WithMockUser(roles = "API")
public class StockControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StockService stockService;

    @Autowired
    private ObjectMapper objectMapper;

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
    void getStockByProductId_ExistingProduct_ReturnsStock() throws Exception {
        when(stockService.getStockByProductId("PROD001")).thenReturn(testStock);

        mockMvc.perform(get("/api/v1/stocks/PROD001")
                .header("X-API-KEY", "test-api-key"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value("PROD001"))
                .andExpect(jsonPath("$.quantity").value(100))
                .andExpect(jsonPath("$.location").value("CENTRAL_WAREHOUSE"));
    }

    @Test
    void getStockByProductId_NonExistingProduct_Returns404() throws Exception {
        when(stockService.getStockByProductId("UNKNOWN")).thenThrow(new EntityNotFoundException("Stock not found"));

        mockMvc.perform(get("/api/v1/stocks/UNKNOWN")
                .header("X-API-KEY", "test-api-key"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateStock_PositiveQuantity_ReturnsUpdatedStock() throws Exception {
        StockUpdateRequest request = new StockUpdateRequest(50);
        
        when(stockService.updateStock(eq("PROD001"), eq(50))).thenReturn(testStock);

        mockMvc.perform(put("/api/v1/stocks/PROD001")
                .header("X-API-KEY", "test-api-key")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value("PROD001"));
    }

    @Test
    void updateStock_NegativeQuantity_ReturnsUpdatedStock() throws Exception {
        StockUpdateRequest request = new StockUpdateRequest(-30);
        
        when(stockService.updateStock(eq("PROD001"), eq(-30))).thenReturn(testStock);

        mockMvc.perform(put("/api/v1/stocks/PROD001")
                .header("X-API-KEY", "test-api-key")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value("PROD001"));
    }
}