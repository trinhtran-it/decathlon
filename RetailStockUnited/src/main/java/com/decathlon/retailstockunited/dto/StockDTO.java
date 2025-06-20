package com.decathlon.retailstockunited.dto;

import com.decathlon.retailstockunited.model.Stock;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Schema(description = "Data transfer object for stock information")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockDTO {
    @Schema(description = "Product identifier", example = "PROD-1234", requiredMode = Schema.RequiredMode.REQUIRED)
    private String productId;
    
    @Schema(description = "Available quantity of the product", example = "42", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer quantity;
    
    @Schema(description = "Location ID where the stock is stored", example = "VN-HCM-1", requiredMode = Schema.RequiredMode.REQUIRED)
    private String location;
    
    @Schema(description = "Timestamp when the stock information was last updated", example = "2025-06-16T14:30:00")
    private LocalDateTime lastUpdated;
    
    public static StockDTO fromEntity(Stock stock) {
        StockDTO dto = new StockDTO();
        dto.setProductId(stock.getProductId());
        dto.setQuantity(stock.getQuantity());
        dto.setLocation(stock.getLocation());
        dto.setLastUpdated(stock.getLastUpdated());
        return dto;
    }
}