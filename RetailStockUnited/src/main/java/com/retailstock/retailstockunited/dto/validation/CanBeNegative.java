package com.retailstock.retailstockunited.dto.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Custom validation annotation that allows a field to be negative or positive.
 * This is specifically useful for values like stock changes, where negative
 * numbers represent decrements and positive numbers represent increments.
 */
@Documented
@Constraint(validatedBy = CanBeNegativeValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface CanBeNegative {
    String message() default "Value can be negative or positive";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
