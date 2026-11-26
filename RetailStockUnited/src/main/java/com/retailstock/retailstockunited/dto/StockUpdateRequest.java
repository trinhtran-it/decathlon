package com.retailstock.retailstockunited.dto;

import com.retailstock.retailstockunited.dto.validation.CanBeNegative;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request object for updating stock quantity.
 * This class supports both positive values (to add to inventory)
 * and negative values (to subtract from inventory).
 */
@Schema(description = "Request object for updating stock quantity")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockUpdateRequest {
    
    @Schema(
        description = "Quantity to change (positive to add, negative to subtract)",
        example = "-5",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotNull(message = "Quantity cannot be null")
    @CanBeNegative // Allows negative values
    private Integer quantity;
}