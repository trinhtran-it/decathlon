package com.retailstock.retailstockunited.controller;

import com.retailstock.retailstockunited.dto.StockDTO;
import com.retailstock.retailstockunited.dto.StockUpdateRequest;
import com.retailstock.retailstockunited.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Tag(name = "Stock", description = "Stock management API")
@RestController
@RequestMapping("/api/v1/stocks")
public class StockController {
    
    private static final Logger logger = LoggerFactory.getLogger(StockController.class);
    private final StockService stockService;

    @Autowired
    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @Operation(
        summary = "Get stock information for a product",
        description = "Retrieves current stock information for a specific product by its product ID"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved stock information", 
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = StockDTO.class))),
        @ApiResponse(responseCode = "404", description = "Product stock not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid API key"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/{productId}")
    public ResponseEntity<StockDTO> getStockByProductId(
            @Parameter(description = "ID of the product to retrieve stock for", example = "PROD-1234")
            @PathVariable String productId) {        
        return ResponseEntity.ok(StockDTO.fromEntity(stockService.getStockByProductId(productId)));
    }

    @Operation(
        summary = "Update stock quantity",
        description = "Updates the quantity of an existing stock record for a product. Send positive values to add to inventory, negative values to subtract from inventory."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Stock quantity updated successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = StockDTO.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid API key"),
        @ApiResponse(responseCode = "404", description = "Product stock not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PutMapping("/{productId}")
    public ResponseEntity<StockDTO> updateStock(
            @Parameter(description = "ID of the product to update stock for", example = "PROD-1234")
            @PathVariable String productId,
            @Parameter(description = "Quantity change (positive to add, negative to subtract)", required = true)
            @Valid @RequestBody StockUpdateRequest request) {        
        return ResponseEntity.ok(
                StockDTO.fromEntity(stockService.updateStock(productId, request.getQuantity()))
        );
    }
}