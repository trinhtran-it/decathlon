package com.decathlon.retailstockunited.validation;

import com.decathlon.retailstockunited.dto.StockUpdateRequest;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * This test focuses specifically on validating the {@code StockUpdateRequest} class
 * and the behavior of the {@code @CanBeNegative} annotation.
 * It uses direct validation without loading the Spring application context.
 */
public class StockUpdateRequestValidationTest {

    private static Validator validator;
    
    @BeforeAll
    public static void setupValidatorInstance() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void whenQuantityIsNull_thenValidationFails() {
        // Given
        StockUpdateRequest request = new StockUpdateRequest(null);

        // When
        Set<ConstraintViolation<StockUpdateRequest>> violations = validator.validate(request);

        // Then
        assertThat(violations).isNotEmpty();
        assertThat(violations.iterator().next().getMessage()).contains("cannot be null");
    }

    @Test
    void whenQuantityIsPositive_thenValidationSucceeds() {
        // Given
        StockUpdateRequest request = new StockUpdateRequest(10);

        // When
        Set<ConstraintViolation<StockUpdateRequest>> violations = validator.validate(request);

        // Then
        assertThat(violations).isEmpty();
    }

    @Test
    void whenQuantityIsZero_thenValidationSucceeds() {
        // Given
        StockUpdateRequest request = new StockUpdateRequest(0);

        // When
        Set<ConstraintViolation<StockUpdateRequest>> violations = validator.validate(request);

        // Then
        assertThat(violations).isEmpty();
    }

    @Test
    void whenQuantityIsNegative_thenValidationSucceeds() {
        // Given
        StockUpdateRequest request = new StockUpdateRequest(-10);

        // When
        Set<ConstraintViolation<StockUpdateRequest>> violations = validator.validate(request);

        // Then
        assertThat(violations).isEmpty();
    }
}
