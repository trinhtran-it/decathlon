package com.retailstock.retailstockunited.dto.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.stereotype.Component;

/**
 * Validator for the {@link CanBeNegative} annotation.
 * This validator always returns true for non-null values, as it's designed
 * to explicitly allow both positive and negative integer values.
 * It overrides any default validation behavior that might be preventing
 * negative values.
 */
@Component
public class CanBeNegativeValidator implements ConstraintValidator<CanBeNegative, Integer> {

    @Override
    public void initialize(CanBeNegative constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(Integer value, ConstraintValidatorContext context) {
        // We allow any integer value, both positive and negative
        // Only check if it's not null (which should be handled by @NotNull)
        if (value == null) {
            return true; // Let @NotNull handle null validation if it's present
        }
        
        // Explicitly accept both positive and negative values
        return true;
    }
}
