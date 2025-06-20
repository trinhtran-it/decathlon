package com.decathlon.retailstockunited.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Schema(description = "Stock information for a specific product at a specific location")
@Entity
@Table(name = "stock")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Stock {

    @Schema(description = "Unique identifier for the stock record", example = "1")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Schema(description = "Product identifier", example = "PROD-1234", requiredMode = Schema.RequiredMode.REQUIRED)
    @Column(name = "product_id", nullable = false, unique = true)
    private String productId;
    
    @Schema(description = "Available quantity of the product", example = "42", requiredMode = Schema.RequiredMode.REQUIRED)
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @Schema(description = "Location ID where the stock is stored", example = "VN-HCM-1", requiredMode = Schema.RequiredMode.REQUIRED)
    @Column(name = "location", nullable = false)
    private String location;
    
    @Schema(description = "Timestamp when the stock information was last updated", example = "2025-06-16T14:30:00")
    @Column(name = "last_updated")
    private java.time.LocalDateTime lastUpdated;
    
    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        lastUpdated = java.time.LocalDateTime.now();
    }
}